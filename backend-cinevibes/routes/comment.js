const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");

router.post("/:id/comments", authMiddleware, movieController.addComment);
router.get("/:id/comments", commentController.getComments);

module.exports = router;