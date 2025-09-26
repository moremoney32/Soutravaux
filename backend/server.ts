import app from "./app";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=root1993
// DB_NAME=u839546084_solutravo
// DB_PORT=3306
// secretKey=franckmanu18@
// expiresIn=15d
// expiresInn=15d
// COOKIE_MAX_AGE=1296000000
// PORT=3000
// INSEE_API_KEY=09d6f36e-48f3-42be-96f3-6e48f3b2be06