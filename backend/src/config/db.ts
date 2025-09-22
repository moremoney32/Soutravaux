import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lca",
  port: Number(process.env.DB_PORT) || 3306,
  connectionLimit: 10,
});

pool.getConnection()
  .then(() => console.log("✅ Connexion MySQL établie avec succès"))
  .catch(err => console.error("❌ Erreur connexion MySQL:", err.message));

export default pool;
