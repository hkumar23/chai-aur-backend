import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteMedia } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const allowedSortFields = ["title", "createdAt", "views", "duration"];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sorting field");
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!pageNumber || pageNumber <= 0) {
    throw new ApiError(400, "Invalid page number");
  }

  if (!limitNumber || limitNumber <= 0) {
    throw new ApiError(400, "Invalid limit");
  }

  if (!sortBy) sortBy = "title";

  let sortingOrder = 1;
  if (sortType === "desc") sortingOrder = -1;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $sort: {
        [sortBy]: sortingOrder,
      },
    },
    {
      $skip: (pageNumber - 1) * limitNumber,
    },
    {
      $limit: limitNumber,
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title.trim()) {
    throw new ApiError(400, "Video title is required");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video File is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Video File is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  //TODO: Write some logic if videofile is uploaded and thumbnail is not then delete videofile also
  if (!videoFile.url || !thumbnail.url) {
    throw new ApiError(400, "Error while uploading video");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: parseInt(videoFile.duration),
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  // console.log("Entered getVideoById controller");
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId.trim()) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId.trim()) {
    throw new ApiError(400, "Video id is required");
  }
  // console.log(req.body);
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // console.log(title, description, thumbnail, videoId);
  const updateFields = {};

  if (title) updateFields.title = title;
  if (thumbnail && thumbnail.url) updateFields.thumbnail = thumbnail.url;
  if (description) updateFields.description = description;
  // console.log(updateFields);
  if (Object.keys(updateFields).length > 0) {
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: updateFields,
      },
      { new: true }
    );
    if (!video) {
      throw new ApiError(400, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video updated successfully"));
  } else {
    throw new ApiError(400, "No fields to update");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId.trim()) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Video not found");
  // console.log(video);

  const thumbnailUrl = video.thumbnail;
  const thumbnailRes = await deleteMedia(thumbnailUrl, "image");
  // console.log(thumbnailRes);
  if (!thumbnailRes)
    throw new ApiError("Something went wrong while deleting Video");

  const videoUrl = video.videoFile;
  const videoRes = await deleteMedia(videoUrl, "video");
  // console.log(videoRes);
  if (!videoRes)
    throw new ApiError("Something went wrong while deleting Video");

  const result = await Video.findByIdAndDelete(videoId);
  // console.log(result);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  let { videoId } = req.params;
  videoId = videoId.trim();
  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }
  const video = await Video.findById(videoId);

  if (video) {
    video.isPublished = !video.isPublished;
    await video.save();
  } else {
    throw new ApiError(400, "Video not found");
  }

  const updatedVideo = await Video.findById(video._id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Publish status changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
