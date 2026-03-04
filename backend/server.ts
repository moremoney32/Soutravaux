import app from "./app";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config({ path: "./.env" });

/* ===== LOG FILE DEBUG (à ajouter) ===== */
const logFile = path.join(process.cwd(), "app.log");

function log(...messages: any[]) {
  const time = new Date().toISOString();

  const text = messages
    .map(m => (typeof m === "object" ? JSON.stringify(m, null, 2) : String(m)))
    .join(" ");

  fs.appendFileSync(logFile, `[${time}] ${text}\n`);
}

console.log = log;
console.error = log;
import { cleanupSseService, initSseService } from "./src/services/SseServices";
import { demarrerCronNotifications } from "./src/services/notificationCron";
import  "./src/services/RelanceCron";


const PORT = process.env.PORT || 3000;
initSseService();
const server = app.listen(PORT, () => {
  demarrerCronNotifications();
  

  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  cleanupSseService(); 
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  cleanupSseService(); 
  server.close(() => process.exit(0));
});
