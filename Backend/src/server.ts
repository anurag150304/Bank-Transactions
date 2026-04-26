import "dotenv/config";
import { createServer, Server } from "http";
import app from "./app.js";
import { connectDB } from "./lib/db.lib.js";

try {
    await connectDB();
} catch (err) {
    console.log('Error connecting with db ', err);
    process.exit(1);
}

const server: Server = createServer(app);
const PORT = process.env.PORT;
/**
 * Starts the HTTP server.
 * @param {number} PORT - Port number to listen on.
 */
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
