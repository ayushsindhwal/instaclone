import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from'dotenv';
import connectDB from './utils/db.js';
import userRoute from "./routes/user.route.js"
import postRoute from './routes/post.route.js';
import messageRoute from './routes/message.route.js';
import { app, server } from './socket/socket.js';
import path from 'path'
dotenv.config({});

const PORT = process.env.PORT || 3000;


const __dirname = path.resolve();
app.get('/', (_,res)=>{
    return res.status(200).json({
        message:"I'm coming from backend",
        success:true
    })
})
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended: true}));
const corseOptions={
    origin: process.env.URL,
    credentials:true
}
app.use(cors(corseOptions));

// api ayengi yha pr
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);


app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req,res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
})


server.listen(PORT,()=>{
    connectDB();
    console.log(`server live at port ${PORT}`);
}
)
