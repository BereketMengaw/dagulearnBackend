const Video = require("../models/Video");
const Chapter = require("../models/Chapter");

const { Op } = require("sequelize");

// Create a new video
exports.createVideo = async (req, res) => {
  try {
    const { title, url, chapterId, order } = req.body;
    const { courseId } = req.params;

    if (!title || !url || !chapterId) {
      return res
        .status(400)
        .json({ error: "Title, URL, and Chapter ID are required." });
    }

    const chapter = await Chapter.findOne({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return res.status(404).json({
        error: "Chapter not found or does not belong to this course.",
      });
    }

    const video = await Video.create({
      title,
      url,
      chapterId,
      courseId,
      order,
    });

    res.status(201).json(video);
  } catch (error) {
    console.error("Error creating video:", error.message);
    res
      .status(500)
      .json({ error: "Error creating video", details: error.message });
  }
};

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.findAll();
    if (!videos.length) {
      return res.status(404).json({ message: "No videos found" });
    }
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching videos", details: error.message });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (video) {
      res.status(200).json(video);
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    console.error("Error fetching video:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching video", details: error.message });
  }
};

// Update video by ID
exports.updateVideo = async (req, res) => {
  try {
    const { title, url, chapterId, order } = req.body;
    const videoId = req.params.id;

    if (!title && !url && !chapterId && !order) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update." });
    }

    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    video.title = title || video.title;
    video.url = url || video.url;
    video.chapterId = chapterId || video.chapterId;
    video.order = order || video.order;

    await video.save();
    res.status(200).json(video);
  } catch (error) {
    console.error("Error updating video:", error.message);
    res
      .status(500)
      .json({ error: "Error updating video", details: error.message });
  }
};

// Delete video by ID
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await video.destroy();
    res
      .status(200)
      .json({ message: `Video with ID ${req.params.id} has been deleted.` });
  } catch (error) {
    console.error("Error deleting video:", error.message);
    res
      .status(500)
      .json({ error: "Error deleting video", details: error.message });
  }
};

// Process YouTube URL to generate an embed link
const processYouTubeUrl = (originalUrl) => {
  if (originalUrl.includes("youtu.be")) {
    const videoId = originalUrl.split("/").pop().split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (originalUrl.includes("watch?v=")) {
    const videoId = originalUrl.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return originalUrl;
};

// Get videos by chapterId
exports.getVideosByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const videos = await Video.findAll({ where: { chapterId } });

    if (!videos.length) {
      return res
        .status(404)
        .json({ message: "No videos found for this chapter." });
    }

    const processedVideos = videos.map((video) => ({
      ...video.toJSON(),
      url: processYouTubeUrl(video.url),
    }));

    res.status(200).json(processedVideos);
  } catch (error) {
    console.error("Error fetching videos by chapter:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch videos", details: error.message });
  }
};

// Get videos by courseId and optionally filter by chapterId
exports.getVideosByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterId } = req.query; // Get chapterId from query params

    const whereCondition = { courseId };

    // If chapterId is provided, add it to the filter
    if (chapterId) {
      whereCondition.chapterId = chapterId;
    }

    const videos = await Video.findAll({ where: whereCondition });

    if (!videos.length) {
      return res
        .status(404)
        .json({ message: "No videos found for this course and chapter." });
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error(
      "Error fetching videos by course and chapter:",
      error.message
    );
    res.status(500).json({
      error: "Failed to fetch videos",
      details: error.message,
    });
  }
};

// Get videos by courseId and order
exports.getVideosByCourseAndOrder = async (req, res) => {
  try {
    const { courseId, order } = req.params;

    // Fetch videos by exact courseId and order
    const videos = await Video.findAll({
      where: {
        courseId: courseId,
        order: order, // Match the exact order
      },
      order: [["order", "ASC"]], // Ensure videos are sorted by their order
    });

    if (!videos || videos.length === 0) {
      return res
        .status(404)
        .json({ message: "No videos found for this course and order" });
    }

    res.status(200).json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
