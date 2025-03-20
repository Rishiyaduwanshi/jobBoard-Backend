import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logDir, "app.log"), { flags: "a" });

morgan.token("ist-date", () => {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
});

const customMorganFormat = '[:ist-date] :method :url :status :response-time ms - :res[content-length]';

const appLogger = morgan(customMorganFormat, { stream: accessLogStream });

export default appLogger;