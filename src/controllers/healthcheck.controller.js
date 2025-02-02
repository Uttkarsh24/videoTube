import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, "Server is up and running"));
    } catch (error) {
        throw new ApiError(500, "Error checking server status");
    }
});

export { healthCheck };