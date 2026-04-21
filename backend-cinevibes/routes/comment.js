const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment");

router.post("/comments", commentController.addComment);
router.get("/:id/comments", commentController.getComments);

module.exports = router;