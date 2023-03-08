const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.js");
const Post = require("../models/Post.js");

// @routes GET api/posts
// @desc Get Post
// @access Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ posts: posts, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// @routes POST api/posts
// @desc create Post
// @access Private

router.post("/create", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }
  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: req.userId,
    });

    await newPost.save();

    res.json({ success: true, message: "Happy learning!", post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// @routes PUT api/posts
// @desc update Post
// @access Private

router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }
  try {
    let updatedPost = {
      title: title,
      description: description || "",
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      status: status || "TO LEARN",
    };
    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    updatedPost = await Post.findOneAndUpdate(
      postUpdateCondition,
      updatedPost,
      { new: true }
    );
    // user not authorised to update post
    if (!updatedPost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Updated successfully!",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// @routes DELETE api/posts
// @desc delete Post
// @access Private
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletePost = await Post.findOneAndDelete(postDeleteCondition);
    if (!deletePost)
      return res.status(401).json({
        success: false,
        message: "Post not found or user not authorised",
      });

    res.json({
      success: true,
      message: "Deleted successfully!",
      post: deletePost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

module.exports = router;
