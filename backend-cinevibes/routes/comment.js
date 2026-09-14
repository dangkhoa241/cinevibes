const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const commentController = require("../controllers/comment");

router.post("/:id/comments", authMiddleware, commentController.addComment);
router.get("/:id/comments", commentController.getComments);
router.put("/:id/comments/:commentId", authMiddleware, commentController.updateComment);
router.delete("/:id/comments/:commentId", authMiddleware, commentController.deleteComment);
router.post("/:id/comments/:commentId/like", authMiddleware, commentController.toggleLike);

module.exports = router;