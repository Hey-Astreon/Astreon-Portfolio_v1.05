import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory cache for GitHub data
let githubCache = {
  data: null as any,
  lastFetched: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function startServer() {
  const app = express();
  const server = createServer(app);

  // GitHub Activity API
  app.get("/api/github/activity", async (_req, res) => {
    try {
      const now = Date.now();
      if (githubCache.data && (now - githubCache.lastFetched < CACHE_DURATION)) {
        return res.json(githubCache.data);
      }

      const response = await axios.get("https://api.github.com/users/Hey-Astreon/events", {
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "Astreon-Portfolio-v4"
        }
      });

      githubCache.data = response.data.slice(0, 10); // Keep only latest 10 events
      githubCache.lastFetched = now;
      res.json(githubCache.data);
    } catch (error: any) {
      console.error("GitHub API Error:", error.message);
      res.status(500).json({ error: "Failed to fetch GitHub activity" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
