import app from "./app";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
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
