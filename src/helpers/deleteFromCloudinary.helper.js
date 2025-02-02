import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/apiError.js";

const deleteCloudinaryFile = async (publicId) => {
    try {
        if(!publicId){
            throw new ApiError(400,"Please provide public id");
        }
    
        const parts =  publicId.split("/");
        const filename = parts.pop().split(".")[0];
        const publicID = `${filename}`;
    
        const result = await cloudinary.uploader.destroy(publicID);
    
        return result;
    } catch (error) {
        throw new ApiError(500,"Error deleting file from cloudinary");
    }
}

export { deleteCloudinaryFile };