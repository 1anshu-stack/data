import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';



import Post from '../models/post.mjs';
import User from '../models/user.mjs';

 

export const getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
  .countDocuments()
  .then(count => {
    totalItems = count;

    return Post.find()
    .skip((currentPage - 1) * perPage)
    .limit(perPage  )
  })
  .then(posts => {
    res
      .status(200)
      .json({ 
        message: 'Fetched posts successfully.', 
        posts: posts, 
        totalItems: totalItems
      });
  }) 
  .catch(error => {
    if(!error.statusCode){
      error.statusCode = 500;
    }
    next(error)
  })

};



export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    const savedUser = await user.save();
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });
    return savedUser
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



export const getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};



export const updatePost = (req,res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if(req.file){
    imageUrl = req.file.path;
  }

  if(!imageUrl){
    const error = new Error('No file picked');
    error.statusCode = 421
    throw error;
  }

  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 402;
      throw error;
    }

    if (post.creator.toString() !== req.userId){
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    if(imageUrl !== post.imageUrl){
      clearImage(post.imageUrl);
    }

    post.title = title
    post.imageUrl = imageUrl
    post.content = content
    return post.save()
  })
  .then(result => {
    res.status(200).json({
      message: 'Post updated!',
      post: result
    })
  })
  .catch(error => {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  })
}



export const deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 402;
      throw error;
    }


    if (post.creator.toString() !== req.userId){
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }


    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId);
  })
  .then(result => {
    return User.findById(req.userId)
  })
  .then(user => {
    user.posts.pull(postId)
    return user.save();
  })
  .then(result => {
    res.status(200).json({
      message: 'Delete post.'
    })
  })
  .catch(error => {
    if(!error.statusCode){
      error.statusCode = 500;
    }
    next(error);
  });
}



const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, error=>console.log(error));
}