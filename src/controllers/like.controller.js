import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "VideoId is required");
  }

  const like = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  //   console.log(like[0]);
  if (!like[0]) {
    await Like.create({
      video: videoId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video added to likes"));
  } else {
    await Like.deleteOne({ _id: like[0]._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video removed from likes"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }

  const like = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  //   console.log(like[0]);
  if (!like[0]) {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment added to likes"));
  } else {
    await Like.deleteOne({ _id: like[0]._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment removed from likes"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }

  const like = await Like.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  //   console.log(like[0]);
  if (!like[0]) {
    await Like.create({
      tweet: tweetId,
      likedBy: userId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet added to likes"));
  } else {
    await Like.deleteOne({ _id: like[0]._id });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet removed from likes"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  const likes = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true, $ne: null, $ne: "" },
      },
    },
  ]);

  if (!likes[0]) {
    throw new ApiError("No liked videos found");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        _id: likes[0].video,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
