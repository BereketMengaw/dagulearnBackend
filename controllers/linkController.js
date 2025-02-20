const Link = require("../models/Link");
const Chapter = require("../models/Chapter"); // Import the Chapter model

// Create a new link
exports.createlink = async (req, res) => {
  try {
    const { title, url, chapterId, order } = req.body;

    // Validate input
    if (!title || !url || !chapterId) {
      return res.status(400).json({
        error: "Title, URL, and Chapter ID are required.",
      });
    }

    // Check if the chapterId exists in the Chapters table
    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(400).json({
        error: "Chapter ID does not exist.",
      });
    }

    // Create the link
    const newLink = await Link.create({ title, url, chapterId, order });
    res.status(201).json(newLink); // Return the newly created link
  } catch (error) {
    console.error("Error creating link:", error.message);
    res.status(500).json({
      error: "Error creating link",
      details: error.message,
    });
  }
};

// Get all links
exports.getAlllinks = async (req, res) => {
  try {
    const links = await Link.findAll();
    if (!links.length) {
      return res.status(404).json({ message: "No links found" });
    }
    res.status(200).json(links);
  } catch (error) {
    console.error("Error fetching links:", error.message);
    res.status(500).json({
      error: "Error fetching links",
      details: error.message,
    });
  }
};

// Get link by ID
exports.getlinkById = async (req, res) => {
  try {
    const linkId = req.params.id;
    const link = await Link.findByPk(linkId);

    if (link) {
      res.status(200).json(link);
    } else {
      res.status(404).json({ error: "Link not found" });
    }
  } catch (error) {
    console.error("Error fetching link:", error.message);
    res.status(500).json({
      error: "Error fetching link",
      details: error.message,
    });
  }
};

// Update link by ID
exports.updatelink = async (req, res) => {
  try {
    const { title, url, chapterId, order } = req.body;
    const linkId = req.params.id;

    // Validate input
    if (!title && !url && !chapterId && !order) {
      return res.status(400).json({
        error: "At least one field is required to update.",
      });
    }

    const link = await Link.findByPk(linkId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Update fields
    link.title = title || link.title;
    link.url = url || link.url;
    link.chapterId = chapterId || link.chapterId;
    link.order = order || link.order;

    await link.save();
    res.status(200).json(link);
  } catch (error) {
    console.error("Error updating link:", error.message);
    res.status(500).json({
      error: "Error updating link",
      details: error.message,
    });
  }
};

// Delete link by ID
exports.deletelink = async (req, res) => {
  try {
    const linkId = req.params.id;
    const link = await Link.findByPk(linkId);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    await link.destroy();
    res
      .status(200)
      .json({ message: `Link with ID ${linkId} has been deleted.` });
  } catch (error) {
    console.error("Error deleting link:", error.message);
    res.status(500).json({
      error: "Error deleting link",
      details: error.message,
    });
  }
};
// Get links for a specific chapter by chapterId
exports.getLinksByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params; // Extract chapterId from params

    // Fetch all links that belong to the given chapterId
    const links = await Link.findAll({
      where: { chapterId: chapterId }, // Filter by chapterId
    });

    // Check if any links were found
    if (links.length === 0) {
      return res
        .status(404)
        .json({ message: "No links found for this chapter." });
    }

    // Return the links found for the chapter
    res.status(200).json(links);
  } catch (error) {
    console.error("Error fetching links by chapterId:", error.message);
    res.status(500).json({
      error: "Error fetching links",
      details: error.message,
    });
  }
};
