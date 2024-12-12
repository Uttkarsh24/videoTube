import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {

    const {fullName , email, username ,password} = req.body;
    //console.log("email:", email);

    //checking if all fields have values in them
    if (
        [fullName,email,username,password].some((field)=>
            field?.trim()===""
        )
    ) {
        throw new ApiError(400,"all fields are required")
    }

    //checking if user already exists
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //uploading on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //all checks done 

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Internal Sever error")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User creation success")
    )
} )

const  loginUser = asyncHandler( async (req,res)=>{
    //req.bddy se data lao
    //username and email based checking
    //find kro user ki hi exist kr rha hai ki nhi
    //password check kro ki sahi hai ki nhi
    //access aur refresh token generate krke user ko bhejo
    //bhejna via secure cookies se hai
})

export {registerUser}