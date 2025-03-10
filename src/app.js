import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) //config for json data
app.use(express.urlencoded({extended:true,limit:"16kb"})) //config for url data
app.use(express.static("public"))
app.use(cookieParser());

//routes import 
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import healthCheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

//routes declaration
app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);

export { app }