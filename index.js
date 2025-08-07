const express = require("express");
const cors = require("cors");

// Dynamic import for fetch in Node.js (ESM workaround)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Your Pixabay API Key
const API_KEY = "YOUR_API_KEY";

// Allow frontend to access API
app.use(cors());

// Image Search Route
app.get("/api/images", async (req, res) => {
  const query = req.query.q || "nature"; // default search
  const page = req.query.page || Math.floor(Math.random() * 10) + 1; // random fallback page

  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
    query,
  )}&image_type=photo&per_page=50&page=${page}&safesearch=true`;

  console.log(`🔍 Fetching: ${url}`);

  try {
    const response = await fetch(url);
    const text = await response.text();

    try {
      const data = JSON.parse(text);

      if (!Array.isArray(data.hits)) {
        console.warn("⚠️ No image results from Pixabay");
        return res.status(200).json({ hits: [] });
      }

      res.json(data);
    } catch (jsonErr) {
      console.error("❌ JSON Parse Error:", jsonErr.message);
      return res.status(500).json({
        error: "Pixabay returned invalid JSON",
        raw: text,
      });
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch images",
      details: error.message,
    });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("PixelNest 🌱 Backend is running.");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});