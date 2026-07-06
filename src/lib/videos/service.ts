import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import Video, { type VideoDocument } from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";
import { getAssignedSchoolVideoIds } from "@/lib/schools/service";
import School from "@/models/School";
import ContentCategory from "@/models/ContentCategory";
import { getLatestSubscriptionByUserId } from "@/lib/subscriptions/service";

const REQUIRED_COMPLETION_PERCENTAGE = 95;
const SUBSCRIPTION_VIDEO_ROLES = new Set(["subscriber", "parent", "child"]);

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

  return [...new Set([...(aliases[ageTrack] ?? [ageTrack]), "all"])];
}

function schoolLicenseIsActive(school: {
  licenseStatus?: string;
  licenseExpiresAt?: Date | null;
} | null) {
  if (!school || school.licenseStatus !== "active") {
    return false;
  }

  return !school.licenseExpiresAt || school.licenseExpiresAt > new Date();
}

function schoolAllowsStudentTrack(schoolTracks: string[] | undefined, userAgeTrack: string) {
  if (!schoolTracks?.length) {
    return true;
  }

  if (schoolTracks.includes("all")) {
    return true;
  }

  const userTrackAliases = getAgeTrackAliases(userAgeTrack);
  return schoolTracks.some((track) => userTrackAliases.includes(track));
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
  const parentTracks =
    user.role === "parent"
      ? await getPurchasedParentTracks(user._id.toString(), user.ageTrack)
      : [];
  const ageTrackValues =
    user.role === "parent"
      ? [...new Set(parentTracks.flatMap(getAgeTrackAliases))]
      : getAgeTrackAliases(user.ageTrack);

  const query =
    audience === "teacher"
      ? {
          audience,
          releaseDate: { $not: { $gt: new Date() } },
        }
      : {
          audience,
          ageTrack: { $in: ageTrackValues },
          releaseDate: { $not: { $gt: new Date() } },
          ...(user.role === "mentee" ? { isFreePreview: true } : {}),
        };

  return Video.find(query).sort({ order: 1, createdAt: 1 });
}

async function getPurchasedParentTracks(userId: string, fallbackTrack: string) {
  const subscription = await getLatestSubscriptionByUserId(userId);
  const tracks = (subscription?.seats ?? [])
    .map((seat) => seat.ageTrack)
    .filter(Boolean);

  if (subscription?.ageTrack) {
    tracks.push(subscription.ageTrack);
  }

  return tracks.length ? tracks : [fallbackTrack];
}

async function filterSchoolScopedVideos(user: UserDocument, videos: VideoDocument[]) {
  if (!["teacher", "student"].includes(user.role)) {
    return videos;
  }

  if (!user.schoolId) {
    return [];
  }

  const [school, assignedVideoIds] = await Promise.all([
    School.findById(user.schoolId).select("district assignedTracks licenseStatus licenseExpiresAt").lean(),
    user.role === "student" ? getAssignedSchoolVideoIds(user.schoolId) : Promise.resolve(new Set<string>()),
  ]);

  if (!school || !schoolLicenseIsActive(school)) {
    return [];
  }

  if (user.role === "student" && !schoolAllowsStudentTrack(school.assignedTracks, user.ageTrack)) {
    return videos.filter((video) => assignedVideoIds.has(video._id.toString()));
  }

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

async function sortVideosForProgression(videos: VideoDocument[]) {
  if (!videos.length) {
    return videos;
  }

  const categories = await ContentCategory.find({
    $or: videos.map((video) => ({
      audience: video.audience,
      ageTrack: video.ageTrack,
      name: video.category ?? "General",
      playlist: video.playlist ?? "General",
    })),
  })
    .select("name playlist ageTrack audience order")
    .lean();

  const playlistOrderByKey = new Map(
    categories.map((category) => [
      `${category.audience}::${category.ageTrack}::${category.name}::${category.playlist ?? "General"}`,
      category.order ?? 1,
    ]),
  );

  const createdAtTime = (video: VideoDocument) => {
    const createdAt = (video as unknown as { createdAt?: Date }).createdAt;
    return createdAt instanceof Date ? createdAt.getTime() : 0;
  };

  return [...videos].sort((first, second) => {
    const firstCategory = first.category ?? "General";
    const secondCategory = second.category ?? "General";
    const categoryCompare = firstCategory.localeCompare(secondCategory);

    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    const firstPlaylist = first.playlist ?? "General";
    const secondPlaylist = second.playlist ?? "General";
    const firstPlaylistOrder =
      playlistOrderByKey.get(`${first.audience}::${first.ageTrack}::${firstCategory}::${firstPlaylist}`) ?? 1;
    const secondPlaylistOrder =
      playlistOrderByKey.get(`${second.audience}::${second.ageTrack}::${secondCategory}::${secondPlaylist}`) ?? 1;

    if (firstPlaylistOrder !== secondPlaylistOrder) {
      return firstPlaylistOrder - secondPlaylistOrder;
    }

    const playlistCompare = firstPlaylist.localeCompare(secondPlaylist);

    if (playlistCompare !== 0) {
      return playlistCompare;
    }

    return first.order - second.order || createdAtTime(first) - createdAtTime(second);
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
  }).select("videoId completedAt updatedAt createdAt");

  return new Set(progress.map((entry) => entry.videoId));
}

async function getCompletedVideoProgress(userId: string) {
  await connectToDatabase();

  const progress = await VideoProgress.find({
    userId,
    completed: true,
  }).select("videoId completedAt updatedAt createdAt");

  return new Map(
    progress.map((entry) => [
      entry.videoId,
      {
        completedAt:
          entry.completedAt ??
          (entry as unknown as { updatedAt?: Date }).updatedAt ??
          (entry as unknown as { createdAt?: Date }).createdAt ??
          null,
      },
    ]),
  );
}

function getUnlockTime(completedAt: Date | null, delayMinutes: number) {
  if (!completedAt || delayMinutes <= 0) {
    return completedAt;
  }

  return new Date(completedAt.getTime() + delayMinutes * 60 * 1000);
}

export async function buildVideoAvailability(user: UserDocument) {
  let videos = await getCandidateVideosForUser(user);
  const completedProgress = await getCompletedVideoProgress(user._id.toString());
  videos = await filterSchoolScopedVideos(user, videos);
  videos = await sortVideosForProgression(videos);

  return videos.map((video, index) => {
    const completed = completedProgress.has(video._id.toString());
    const previousVideo = index > 0 ? videos[index - 1] : null;
    const previousProgress = previousVideo
      ? completedProgress.get(previousVideo._id.toString())
      : null;
    const dripDelayMinutes = video.dripDelayMinutes ?? 0;
    const unlocksAt = previousProgress
      ? getUnlockTime(previousProgress.completedAt, dripDelayMinutes)
      : null;
    const isLocked =
      !completed &&
      Boolean(video.dripEnabled) &&
      index > 0 &&
      (!previousProgress || (unlocksAt ? unlocksAt > new Date() : false));

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      url: isLocked ? null : video.url,
      ageTrack: video.ageTrack,
      audience: video.audience,
      category: video.category ?? "General",
      playlist: video.playlist ?? "General",
      schoolScope: video.schoolScope ?? (["teacher", "student"].includes(video.audience) ? "all-schools" : "global"),
      schoolIds: video.schoolIds ?? [],
      district: video.district ?? null,
      order: video.order,
      releaseDate: video.releaseDate,
      dripEnabled: video.dripEnabled,
      dripDelayMinutes,
      dripUnlocksAt: isLocked ? unlocksAt : null,
      isFreePreview: video.isFreePreview,
      isMissionVideo: video.isMissionVideo,
      attachmentUrl: isLocked ? null : video.attachmentUrl ?? null,
      attachmentFileName: isLocked ? null : video.attachmentFileName ?? null,
      attachmentMimeType: isLocked ? null : video.attachmentMimeType ?? null,
      completed,
      locked: isLocked,
    };
  });
}

export async function buildFreePreviewAvailability(user: UserDocument) {
  await connectToDatabase();

  const videos = await sortVideosForProgression(
    await Video.find({
      audience: "subscriber",
      isFreePreview: true,
      ageTrack: { $in: getAgeTrackAliases(user.ageTrack) },
      releaseDate: { $not: { $gt: new Date() } },
    }).sort({ order: 1, createdAt: 1 }),
  );

  return videos.map((video) => ({
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    url: video.url,
    ageTrack: video.ageTrack,
    audience: video.audience,
    category: video.category ?? "General",
    playlist: video.playlist ?? "General",
    schoolScope: video.schoolScope ?? "global",
    schoolIds: video.schoolIds ?? [],
    district: video.district ?? null,
    order: video.order,
    releaseDate: video.releaseDate,
    dripEnabled: false,
    dripDelayMinutes: 0,
    dripUnlocksAt: null,
    isFreePreview: true,
    isMissionVideo: video.isMissionVideo,
    attachmentUrl: video.attachmentUrl ?? null,
    attachmentFileName: video.attachmentFileName ?? null,
    attachmentMimeType: video.attachmentMimeType ?? null,
    completed: false,
    locked: false,
  }));
}

export async function buildPaidIntroVideo(user: UserDocument) {
  await connectToDatabase();

  const video = await Video.findOne({
    audience: "subscriber",
    isMissionVideo: true,
    ageTrack: { $in: getAgeTrackAliases(user.ageTrack) },
    releaseDate: { $not: { $gt: new Date() } },
  }).sort({ order: 1, createdAt: 1 });

  if (!video) {
    return null;
  }

  return {
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    url: video.url,
    ageTrack: video.ageTrack,
    audience: video.audience,
    category: video.category ?? "General",
    playlist: video.playlist ?? "General",
    schoolScope: video.schoolScope ?? "global",
    schoolIds: video.schoolIds ?? [],
    district: video.district ?? null,
    order: video.order,
    releaseDate: video.releaseDate,
    dripEnabled: false,
    dripDelayMinutes: 0,
    dripUnlocksAt: null,
    isFreePreview: false,
    isMissionVideo: true,
    attachmentUrl: video.attachmentUrl ?? null,
    attachmentFileName: video.attachmentFileName ?? null,
    attachmentMimeType: video.attachmentMimeType ?? null,
    completed: false,
    locked: false,
  };
}

export async function getHomepageMissionVideo() {
  await connectToDatabase();

  const video = await Video.findOne({
    isMissionVideo: true,
    releaseDate: { $not: { $gt: new Date() } },
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .select("title description url updatedAt createdAt")
    .lean();

  if (!video) {
    return null;
  }

  return {
    id: video._id.toString(),
    title: video.title,
    description: video.description,
    url: video.url,
  };
}

export async function resolveCompletableVideo(params: {
  user: UserDocument;
  videoId: string;
}) {
  const { user, videoId } = params;

  await connectToDatabase();

  const video = await Video.findById(videoId);

  const audience = resolveVideoAudienceForUser(user);
  const allowedTracks =
    user.role === "parent"
      ? [...new Set((await getPurchasedParentTracks(user._id.toString(), user.ageTrack)).flatMap(getAgeTrackAliases))]
      : getAgeTrackAliases(user.ageTrack);

  if (
    !video ||
    (audience !== "teacher" && !allowedTracks.includes(video.ageTrack)) ||
    video.audience !== audience
  ) {
    throw new ApiError(404, "Video not found for this user.");
  }

  let videos = await getCandidateVideosForUser(user);
  videos = await filterSchoolScopedVideos(user, videos);
  videos = await sortVideosForProgression(videos);

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

  const completedAt =
    previousProgress.completedAt ??
    (previousProgress as unknown as { updatedAt?: Date }).updatedAt ??
    (previousProgress as unknown as { createdAt?: Date }).createdAt ??
    null;
  const unlocksAt = getUnlockTime(completedAt, video.dripDelayMinutes ?? 0);

  if (unlocksAt && unlocksAt > new Date()) {
    throw new ApiError(
      403,
      `This video unlocks at ${unlocksAt.toLocaleString()}.`,
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

  const progress = await VideoProgress.findOne({
    userId: user._id.toString(),
    videoId: video._id.toString(),
  });

  if (progress) {
    progress.completedAt = progress.completedAt ?? new Date();
    progress.completed = true;
    await progress.save();
    return progress;
  }

  return VideoProgress.create({
    userId: user._id.toString(),
    videoId: video._id.toString(),
    completed: true,
    completedAt: new Date(),
  });
}
