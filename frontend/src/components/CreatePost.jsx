import React, { useRef, useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from './ui/dialog'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
    const imageRef = useRef();
    const [file, setFile] = useState('');
    const [caption, setCaption] = useState("")
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoadin] = useState(false)
    const {user} = useSelector(store => store.auth)
    const {posts} = useSelector(store=>store.post);
    const dispatch = useDispatch()


    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const dataURL = await readFileAsDataURL(file);
            setImagePreview(dataURL);
        }

    }
    const createPostHandler = async (e) => {
        const formData = new FormData();
        formData.append("caption", caption);
        if (imagePreview) formData.append("image", file);

        try {
            setLoadin(true)
            const res = await axios.post("https://instaclone-ilgd.onrender.com/api/v1/post/addpost", formData,{
                headers:{
                    'Content-Type': 'mutipart/form-data'
                },
                withCredentials:true
            });
            if(res.data.success){
                dispatch(setPosts([res.data.post, ...posts]))
                toast.success(res.data.message)
                setOpen(false)
            }

        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            setLoadin(false)
        }
    }
    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)}>
                <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>

                <div className='flex gap-3 items-center'>
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt='profile' />
                        <AvatarFallback>
                            CN
                        </AvatarFallback>

                    </Avatar>
                    <div>
                        <h1 className='font-semibold text-xs'>{user?.username}</h1>
                        <span className='text-gray-600 text-xs'>Bio here...</span>
                    </div>
                </div>
                <Textarea value={caption} onChange={(e)=>setCaption(e.target.value)} className='focus-visible:ring-transparent border-none' placeholder="Write a caption" />
                {
                    imagePreview && (
                        <div className='w-full h-64 flex items-center justify-center'>
                            <img src={imagePreview} alt='preview_img' className='object-cover h-full w-full rounded-md' />
                        </div>
                    )
                }
                <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
                <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095f6] hover:bg-[#258bcf]'>
                    Select from computer
                </Button>
                {
                    imagePreview && (
                        loading ? (
                            <Button>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait...
                            </Button>) : (
                                <Button onClick={createPostHandler} type="submit" className='w-full'>
                                    Post
                                </Button>
                            )
                    )
                }

            </DialogContent>

        </Dialog>
    )
}

export default CreatePost;