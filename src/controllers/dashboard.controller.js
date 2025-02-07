import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const totalSubscribers = await Subscription.countDocuments({
    channel: new mongoose.Types.ObjectId(req.user._id),
  });

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
  if (!videos[0]) {
    throw new ApiError(400, "You have not uploaded any video");
  }
  let totalVideoViews = 0;
  let videoIds = [];
  for (let i = 0; i < videos.length; ++i) {
    totalVideoViews += videos[i].views;
    videoIds.push(videos[i]._id);
  }

  const totalLikes = await Like.countDocuments({
    video: {
      $in: videoIds,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalVideos: videos.length,
        totalVideoViews,
        totalLikes,
        channelCreatedOn: req.user.createdAt,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
        isPublished: true,
      },
    },
  ]);
  if (!videos[0]) {
    throw new ApiError(400, "You do not have any published video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
