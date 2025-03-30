import http from "http";
import { appConfig } from "./config/config.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const { port } = appConfig;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
  }
};

startServer();
