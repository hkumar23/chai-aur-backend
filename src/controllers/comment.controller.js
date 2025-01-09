import mongoose, { mongo } from "mongoose";

import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const userId = req.user._id;
  const { content, videoId } = req.body;
  if (
    [content, videoId].some((field) => field == null || field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content, commentId } = req.body;
  const user = req.user;
  if (!content || !commentId) {
    throw new ApiError(400, "All fields are required");
  }

  const comment = await Comment.findByIdAndUpdate(commentId);

  if (user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(
      400,
      "You can only update comments that you have created"
    );
  }

  comment.content = content;
  comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.body;
  const user = req.user;
  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }

  const comment = await Comment.findById(commentId);

  if (user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(
      400,
      "You can only delete comments that you have created"
    );
  }

  await Comment.deleteOne({ _id: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, [], "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
