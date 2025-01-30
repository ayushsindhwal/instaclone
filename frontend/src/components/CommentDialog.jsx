import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
const CommentDialog = ({ open, setOpen }) => {
    const [text, setText] = useState("");
    const { selectedPost, posts } = useSelector(store=>store.post)
    const [comment, setComment] = useState([])
    const dispatch = useDispatch();
    useEffect(()=>{
        if(selectedPost){
            setComment(selectedPost.comments)
        }
    },[selectedPost])
    
    const changeEventHandler = (e)=>{
        const inputText = e.target.value;
        if(inputText.trim()){
            setText(inputText)
        }else{
            setText("")
        }
    }
    const sendMessageHandler = async () => {
    try {

      const res = await axios.post(`https://instaclone-ilgd.onrender.com/api/v1/post/${selectedPost?._id}/comment`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      });
      console.log(res)
      if (res.data.success) {
        console.log(res, 'comment res');
        console.log(res.data.success, 'comments function')
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData)
        const updatedPostData = posts.map(p => {
            console.log(p) 
            return (p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p)
         })
         console.log(updatedPostData)
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        console.log(toast)
        setText("")
      }

    } catch (error) {
      console.log(error);

    }
  }
  const sendMessageHandle = async () => {
    try {
      const res = await axios.post(
        `https://instaclone-ilgd.onrender.com/api/v1/post/${selectedPost?._id}/comment`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
  
      console.log("Response data:", res.data);
  
      if (res.data.success) {
        console.log("Adding new comment...");
  
        const updatedCommentData = [...comment, res.data.comment];
        console.log("Updated comments:", updatedCommentData);
        setComment(updatedCommentData);
  
        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id
            ? { ...p, comments: updatedCommentData }
            : p
        );
        console.log("Updated posts:", updatedPostData);
        dispatch(setPosts(updatedPostData));
  
        toast.success(res.data.message);
        console.log("Toast success called");
  
        setText(""); // Clear the text field
      }
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
    }
  };
  


    return (
        <Dialog open={open}>
            <DialogContent
                onInteractOutside={() => setOpen(false)}
                className="max-w-5xl p-0 flex flex-col"
            >
                <div className="flex flex-1">
                    <div className="w-1/2">
                        <img
                            src={selectedPost?.image}
                            alt="img"
                            className="w-full h-80vh object-cover rounded-l-lg"
                        />
                    </div>
                    <div className="w-1/2 flex flex-col justify-between">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex gap-3 items-center">
                                <Link>
                                    <Avatar>
                                        <AvatarImage src={selectedPost?.author?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </Link>


                                <div>
                                    <Link className="font-semibold text-xs">{selectedPost?.author?.username}</Link>
                                    {/* <span className="text-gray-600 text-sm">Bio here....</span> */}
                                </div>
                        </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <MoreHorizontal className="cursor-pointer" />
                                    </DialogTrigger>
                                    <DialogContent className="flex flex-col items-center text-sm text-center">
                                        <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                                            Unfollow
                                        </div>
                                        <div className="cursor-pointer w-full">
                                            Add to favorites
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <hr />
                            <div className="flex-1 overflow-y-auto max-h-96 p-4">
                                {
                                    comment.map((comment) =>
                                         <Comment key={comment._id} comment={comment} />                                       
                                    )
                                } 
                            </div>
                            <div className="p-4">
                            <div className="flex items-center gap-2">
                                <input type="text" value={text} onChange={changeEventHandler} placeholder="Add a comment..." className="w-fll outline-none text-sm border-gray-300 p-2 rounded" />
                                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant="outline">Send</Button>
                            </div>
                            </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommentDialog;
