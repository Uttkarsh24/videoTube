import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteCloudinaryFile } from "../helpers/deleteFromCloudinary.helper.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;

    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Please upload video and thumbnail");
    }

    if(!title || !description){
        throw new ApiError(400, "Please provide title and description");
    }

    const videoFile = req.files.videoFile[0];
    const thumbnail = req.files.thumbnail[0];

    const videoFileUrl = await uploadOnCloudinary(videoFile.path);
    const thumbnailUrl = await uploadOnCloudinary(thumbnail.path);

    if (!videoFileUrl || !thumbnailUrl) {
        throw new ApiError(500, "Error uploading video or thumbnail");
    }

    try {
        const video = await Video.create({
            videoFile: videoFileUrl.url,
            thumbnail: thumbnailUrl.url,
            title,
            description,
            owner: req.user._id,
        });
    
        return res.
        status(201).
        json(new ApiResponse(201,video,"Video published successfully"));
    } catch (error) {
        throw new ApiError(500, "Error publishing video");
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video retrieved successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if(!title || !description){
        throw new ApiError(400,"Please provide title and description");
    }
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    if(!req.file){
        throw new ApiError(400,"Please upload a thumbnail");
    }

    const thumbnail = req.file;
    const thumbnailUrl = await uploadOnCloudinary(thumbnail.path);

    if(!thumbnailUrl){
        throw new ApiError(500,"Error uploading thumbnail");
    }

    try {
        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                thumbnail:thumbnailUrl.url,
                title,
                description
            },
            {
                new:true
            }
        );

        return res
        .status(200)
        .json(new ApiResponse(200,video,"Video updated successfully"));
    } catch (error) {
        throw new ApiError(500,"Error updating video");
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this video");
    }

    const videoUrl = video.videoFile;

    const deleteUrl = await deleteCloudinaryFile(videoUrl);

    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(new ApiResponse(200,null,"Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this video");
    }

    const isPublished = video.isPublished;

    video.isPublished = !isPublished;

    await video.save();

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video publish status updated successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}