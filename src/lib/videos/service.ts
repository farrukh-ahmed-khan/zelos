import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import Video, { type VideoDocument } from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";

const REQUIRED_COMPLETION_PERCENTAGE = 95;

export async function getAgeTrackVideos(ageTrack: string) {
  await connectToDatabase();

  return Video.find({ ageTrack }).sort({ order: 1, createdAt: 1 });
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
  const videos = await getAgeTrackVideos(user.ageTrack);
  const completedVideoIds = await getCompletedVideoIds(user._id.toString());

  let unlocked = true;

  return videos.map((video) => {
    const completed = completedVideoIds.has(video._id.toString());
    const isLocked = !unlocked;

    if (!completed) {
      unlocked = false;
    }

    return {
      id: video._id.toString(),
      title: video.title,
      description: video.description,
      url: isLocked ? null : video.url,
      ageTrack: video.ageTrack,
      order: video.order,
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

  if (!video || video.ageTrack !== user.ageTrack) {
    throw new ApiError(404, "Video not found for this user.");
  }

  const videos = await getAgeTrackVideos(user.ageTrack);
  const targetIndex = videos.findIndex(
    (entry) => entry._id.toString() === video._id.toString(),
  );

  if (targetIndex === -1) {
    throw new ApiError(404, "Video not found for this user.");
  }

  if (targetIndex === 0) {
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
