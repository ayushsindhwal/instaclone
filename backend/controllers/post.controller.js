import sharp from "sharp";
import cloudinary from 'cloudinary';
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js";

console.log(Comment, 'comment is pringtinggg')
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: "image required" });

        //image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ with: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
        //buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        console.log(fileUri)
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })
        const user = await User.findById(authorId);
        if (user) {
            console.log(post._id, "post._id hai yha")
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({ path: 'author', select: '-password' });

        return res.status(200).json({
            message: 'new post added',
            post,
            success: true,
        })
    } catch (error) {
        console.log(error)
    }
}
export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ creatdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const likePost = async (req, res) => {
    try {
        const likeKrneWaleUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({
            message: 'post not found, post controller',
            success: false
        })
        // like logic,
        await post.updateOne({ $addToSet: { likes: likeKrneWaleUserKiId } });
        await post.save();
        // implement socket io for the real time notificatio/
         const user = await User.findById(likeKrneWaleUserKiId).select('username profile')
         const postOwnerId = post.author.toString();
         if(postOwnerId !== likeKrneWaleUserKiId){
            //emit a notification event
            const notification = {
                type:'like',
                userId:likeKrneWaleUserKiId,
                userDetails:user,
                postId,
                message:'Your Post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
         }

        return res.status(200).json({
            message: 'Post liked',
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWaleUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({
            message: 'post not found, post controller',
            success: false
        })
        // like logic,
        await post.updateOne({ $pull: { likes: likeKrneWaleUserKiId } });
        await post.save();
        // socket io dislike 
         const user = await User.findById(likeKrneWaleUserKiId).select('username profile')
         const postOwnerId = post.author.toString();
         if(postOwnerId !== likeKrneWaleUserKiId){
            //emit a notification event
            const notification = {
                type:'dislike',
                userId:likeKrneWaleUserKiId,
                userDetails:user,
                postId,
                message:'Your Post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
         }
        return res.status(200).json({
            message: 'Post disliked',
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}
export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKaneWaleKiId = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);
        if (!text) return res.status(400).json({ messsage: 'text is required', successs: false });
        const comment = await Comment.create({
            text,
            author: commentKaneWaleKiId,
            post: postId
        })
        await comment.populate({
            path: 'author',
            select: "userName profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();
        return res.status(201).json({
            message: 'comment added',
            comment,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}
export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
    }
}
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'post not found', success: false });

        //check if the logged in user is the owner of the post;
        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'unauthorised user' });

        //delete post 
        await Post.findByIdAndDelete(postId);

        // remove the post if from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save()
        //delete associated comments
        await Comment.deleteMany({ post: postId });
        return res.status(200).json({
            message: 'post deleted',
            message: "post deleted"
        })
    } catch (error) {
        console.log(error)
    }
}
export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'post not found', success: false });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post._id)) {
            // alredy bookmarked => remove from the book mark
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'post removed from bookmakre', success: true })

        } else {
            // bookmak karna padega
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'post bookmakred', success: true })
        }
    } catch (error) {
        console.log(error)
    }
}