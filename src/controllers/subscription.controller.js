import mongoose,{isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res, next) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return new ApiError(400, "Invalid channel id");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        return new ApiError(404, "Channel not found");
    }

    try {

        const subscriberId = req.user._id;
        
        const subscription = await Subscription.findOne({subscriber: subscriberId});
        
        if (subscription) {
            await Subscription.deleteOne({ _id: subscription._id });
            return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
        }

        const updatedSubscription =  await Subscription.create({
            subscriber: subscriberId,
            channel: channel._id
        });

        return res
        .status(200)
        .json(new ApiResponse(200, updatedSubscription , "Subscribed successfully"));

    } catch (error) {
        return next(new ApiError(500, "Internal server error"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(404,"Channel not found")
    }

    try {
        const subscribers = await Subscription.find({
            channel:channel._id
        }).populate("subscriber")
    
        const subscriberList = subscribers.map(subscription => subscription.subscriber)
    
        return res
        .status(200)
        .json(new ApiResponse(200,{subscribers:subscriberList},"Subscribers fetched successfully"));
    } catch (error) {
        throw new ApiError(500,"Internal server error")
    }
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id")
    }

    const subscriber = await User.findById(subscriberId);

    if(!subscriber){
        throw new ApiError(404,"Subscriber not found")
    }

    try {
        const subscriptions = await Subscription.find({
            subscriber
        }).populate("channel")
    
        const channelList = subscriptions.map(subscription => subscription.channel)
    
        return res
        .status(200)
        .json(new ApiResponse(200,{channels:channelList},"Channels fetched successfully"));
    } catch (error) {
        throw new ApiError(500,"Internal server error")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}