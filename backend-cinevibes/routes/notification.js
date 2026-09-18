const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const notificationController = require("../controllers/notification");

router.get("/", authMiddleware, notificationController.getNotifications);
router.post("/read", authMiddleware, notificationController.markAllRead);

module.exports = router;
