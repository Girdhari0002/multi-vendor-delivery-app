import dotenv from "dotenv";
import { app, httpServer } from "./app.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import { runStartupMigrations } from "./config/migrations.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
    .then(runStartupMigrations)
    .then(() => {
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    });
