import mongoose, { Aggregate, isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "Channel Id is required");
  }
  if (!isValidObjectId(channelId)) {
    return new ApiError(400, "Valid Channel Id is required");
  }

  const userId = req.user._id;
  const subscription = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(userId),
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);
  if (!subscription[0]) {
    const subscription = await Subscription.create({
      subscriber: new mongoose.Types.ObjectId(userId),
      channel: new mongoose.Types.ObjectId(channelId),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, subscription, "Subscription added successfully")
      );
  } else {
    await Subscription.findByIdAndDelete(subscription[0]._id);
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Subscription removed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // console.log(channelId);
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        _id: 0,
        subscriber: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: { $first: "$subscriber" },
      },
    },
    {
      $group: {
        _id: null,
        subscribers: { $addToSet: "$subscriber" },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
      },
    },
  ]);
  // console.log(subscriptions);
  if (!subscriptions[0]) {
    throw new ApiError(400, "This channel has no subscriber");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptions[0], "subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscriptions = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $project: {
        _id: 0,
        channel: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: { $first: "$channel" },
      },
    },
    {
      $group: {
        _id: null,
        channels: { $addToSet: "$channel" },
      },
    },
    {
      $project: {
        _id: 0,
        channels: 1,
      },
    },
  ]);
  // console.log(subscriptions);
  if (!subscriptions[0]) {
    throw new ApiError(400, "This channel has no subscriber");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptions[0], "Channels fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
