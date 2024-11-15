import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    // app.on("error",(error)=>{ //listening for errors
    //     console.log("ERR:",error);
    //     throw error
    // })
    app.listen(process.env.PORT || 8000,()=>{ //starting the express server
        console.log(`Server is running at PORT ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection Failed!!!",err);  
})
