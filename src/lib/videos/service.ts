import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import Video, { type VideoDocument } from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";
import { getAssignedSchoolVideoIds } from "@/lib/schools/service";
import School from "@/models/School";

const REQUIRED_COMPLETION_PERCENTAGE = 95;
const SUBSCRIPTION_VIDEO_ROLES = new Set(["mentee", "subscriber", "child"]);

export function requiresSubscriptionForVideos(user: UserDocument) {
  return SUBSCRIPTION_VIDEO_ROLES.has(user.role);
}

function getAgeTrackAliases(ageTrack: string) {
  const aliases: Record<string, string[]> = {
    child: ["child", "Children"],
    teen: ["teen", "Teens"],
    "young-adult": ["young-adult", "Young Adults"],
    adult: ["adult", "Adults"],
    Children: ["child", "Children"],
    Teens: ["teen", "Teens"],
    "Young Adults": ["young-adult", "Young Adults"],
    Adults: ["adult", "Adults"],
  };

  return aliases[ageTrack] ?? [ageTrack];
}

export async function getAgeTrackVideos(ageTrack: string) {
  await connectToDatabase();

  return Video.find({
    ageTrack: { $in: getAgeTrackAliases(ageTrack) },
    releaseDate: { $not: { $gt: new Date() } },
  }).sort({ order: 1, createdAt: 1 });
}

async function getCandidateVideosForUser(user: UserDocument) {
  await connectToDatabase();

  const audience = resolveVideoAudienceForUser(user);

  const query =
    audience === "teacher"
      ? {
          audience,
          releaseDate: { $not: { $gt: new Date() } },
        }
      : {
          audience,
          ageTrack: { $in: getAgeTrackAliases(user.ageTrack) },
          releaseDate: { $not: { $gt: new Date() } },
        };

  return Video.find(query).sort({ order: 1, createdAt: 1 });
}

async function filterSchoolScopedVideos(user: UserDocument, videos: VideoDocument[]) {
  if (!["teacher", "student"].includes(user.role)) {
    return videos.filter((video) => video.schoolScope === "global" || !video.schoolScope);
  }

  if (!user.schoolId) {
    return [];
  }

  const [school, assignedVideoIds] = await Promise.all([
    School.findById(user.schoolId).select("district").lean(),
    user.role === "student" ? getAssignedSchoolVideoIds(user.schoolId) : Promise.resolve(new Set<string>()),
  ]);

  return videos.filter((video) => {
    const scope = video.schoolScope ?? "all-schools";

    if (assignedVideoIds.has(video._id.toString())) {
      return true;
    }

    if (scope === "all-schools") {
      return true;
    }

    if (scope === "specific-schools") {
      return video.schoolIds?.includes(user.schoolId ?? "") ?? false;
    }

    if (scope === "district") {
      return Boolean(school?.district && video.district === school.district);
    }

    return false;
  });
}

function resolveVideoAudienceForUser(user: UserDocument) {
  if (user.role === "teacher") {
    return "teacher";
  }

  if (user.role === "student") {
    return "student";
  }

  return "subscriber";
}

export async function getCompletedVideoIds(userId: string) {
  await connectToDatabase();

  const progress = await VideoProgress.find({
    userId,
    completed: true,
  }).select("videoId");

  return new Set(progress.map((entry) => entry.videoId));
}

export async function buildVideoAvailability(user: UserDocument) {
  let videos = await getCandidateVideosForUser(user);
  const completedVideoIds = await getCompletedVideoIds(user._id.toString());
  videos = await filterSchoolScopedVideos(user, videos);

  let unlocked = true;

  return videos.map((video) => {
    const completed = completedVideoIds.has(video._id.toString());
    const isLocked = video.dripEnabled ? !unlocked : false;

    if (video.dripEnabled && !completed) {
      unlocked = false;
    }

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      url: isLocked ? null : video.url,
      ageTrack: video.ageTrack,
      audience: video.audience,
      category: video.category ?? "General",
      playlist: video.playlist ?? "General",
      order: video.order,
      releaseDate: video.releaseDate,
      dripEnabled: video.dripEnabled,
      isFreePreview: video.isFreePreview,
      isMissionVideo: video.isMissionVideo,
      completed,
      locked: isLocked,
    };
  });
}

export async function resolveCompletableVideo(params: {
  user: UserDocument;
  videoId: string;
}) {
  const { user, videoId } = params;

  await connectToDatabase();

  const video = await Video.findById(videoId);

  const audience = resolveVideoAudienceForUser(user);

  if (
    !video ||
    (audience !== "teacher" && !getAgeTrackAliases(user.ageTrack).includes(video.ageTrack)) ||
    video.audience !== audience
  ) {
    throw new ApiError(404, "Video not found for this user.");
  }

  let videos = await getCandidateVideosForUser(user);
  videos = await filterSchoolScopedVideos(user, videos);

  if (!videos.some((entry) => entry._id.toString() === video._id.toString())) {
    throw new ApiError(404, "Video not found for this user.");
  }

  const targetIndex = videos.findIndex(
    (entry) => entry._id.toString() === video._id.toString(),
  );

  if (targetIndex === -1) {
    throw new ApiError(404, "Video not found for this user.");
  }

  if (targetIndex === 0 || !video.dripEnabled) {
    return video;
  }

  const previousVideo = videos[targetIndex - 1];
  const previousProgress = await VideoProgress.findOne({
    userId: user._id.toString(),
    videoId: previousVideo._id.toString(),
    completed: true,
  });

  if (!previousProgress) {
    throw new ApiError(
      403,
      "This video is locked until the previous video is completed.",
    );
  }

  return video;
}

export async function markVideoAsCompleted(params: {
  user: UserDocument;
  video: VideoDocument;
  watchedPercentage: number;
}) {
  const { user, video, watchedPercentage } = params;

  if (watchedPercentage < REQUIRED_COMPLETION_PERCENTAGE) {
    throw new ApiError(
      422,
      `You must watch at least ${REQUIRED_COMPLETION_PERCENTAGE}% to unlock the next video.`,
    );
  }

  await connectToDatabase();

  return VideoProgress.findOneAndUpdate(
    {
      userId: user._id.toString(),
      videoId: video._id.toString(),
    },
    {
      $set: {
        completed: true,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}
