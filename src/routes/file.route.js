import express from "express";
import upload from "../config/upload.config.js";
const router = express.Router();

router.post("/upload", upload.single("profileImage"), (req, res) => {
  try {
    const imageUrl = req.file.path; // URL of the uploaded image
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
