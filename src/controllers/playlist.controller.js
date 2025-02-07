import mongoose,{isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if(!name || !description){
        throw new ApiError(400,"Name and description are required");
    }

    const existingPlaylist = await Playlist.findOne({name,owner:req.user._id});

    if(existingPlaylist){
        throw new ApiError(400,"Playlist with this name already exists");
    }

    try {
        const playlist = await Playlist.create({
            name,
            description,
            owner:req.user._id
        });
    
        return res
        .status(201)
        .json(new ApiResponse(201,playlist,"Playlist created successfullt"));
    } catch (error) {
        throw new ApiError(500,error || "Error creating playlist");
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }

    const playlists = await Playlist.find({owner:userId});

    if(!playlists){
        return res
        .status(200)
        .json(new ApiResponse(200,[],"User has no playlists"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"User playlists retrieved successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist retrieved successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already in playlist");
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist or video id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video not in playlist");
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {$pull:{videos:videoId}},
            {new:true}
        )
    
        return res
        .status(200)
        .json(new ApiResponse(200,updatedPlaylist,"Video removed from playlist successfully"));
    } catch (error) {
        throw new ApiError(500,error || "Error removing video from playlist");
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    try {
        await Playlist.findByIdAndDelete(playlistId);
    
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Playlist deleted successfully"));
    } catch (error) {
        throw new ApiError(500,error || "Error deleting playlist");
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }

    if(!name || !description){
        throw new ApiError(400,"Name and description are required");
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {name,description},
            {new:true}
        )
    
        return res
        .status(200)
        .json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"));
    } catch (error) {
        throw new ApiError(500,error || "Error updating playlist");
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}