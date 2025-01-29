import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: new mongoose.Types.ObjectId(req.user._id),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }
  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Both playlistId and videoId is required");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Both playlistId and videoId is required");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  //   console.log(deletedPlaylist);
  if (!deletedPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiError(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: { name, description },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(400, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
