const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const commentController = require("../controllers/comment");

router.post("/:id/comments", authMiddleware, commentController.addComment);
router.get("/:id/comments", commentController.getComments);

module.exports = router;