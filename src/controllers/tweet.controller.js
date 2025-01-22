import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const userId = req.user._id;
  const { content } = req.body;
  if (content == null || content === "") {
    throw new ApiError(400, "All fields are required");
  }
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet added successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  // console.log(`yes ${userId}`);
  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  // console.log(tweets);
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!tweetId || !content) {
    throw new ApiError(400, "Tweet Id is required");
  }

  const tweet = await Tweet.findById(new mongoose.Types.ObjectId(tweetId));
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }
  // console.log(userId);
  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "You can only edit your tweet");
  }

  tweet.content = content;
  tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  const tweet = await Tweet.findById(new mongoose.Types.ObjectId(tweetId));
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }
  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "You can only delete your tweet");
  }
  await Tweet.deleteOne({ _id: tweetId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
