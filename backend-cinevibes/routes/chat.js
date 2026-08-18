const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const chatController = require("../controllers/chat");

const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many chat requests, please try again later." },
});

router.post("/", chatLimiter, chatController.sendMessage);

module.exports = router;
