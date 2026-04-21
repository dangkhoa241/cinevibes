const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie");

router.get("/trending", movieController.getTrending);
router.get("/:id", movieController.getMovieDetail);

module.exports = router;