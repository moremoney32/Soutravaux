// import mysql from "mysql2/promise";
// import dotenv from "dotenv";

// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: Number(process.env.DB_PORT),
//   connectionLimit: 10,
// });

// pool.getConnection()
//   .then(() => console.log("Connexion MySQL établie avec succès"))
//   .catch(err => console.error("Erreur connexion MySQL:", err.message));

// export default pool;
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  connectionLimit: 10,
  
  // ✅ SOLUTION UNIVERSELLE : Dates comme strings
  dateStrings: [
    'DATE',
    'DATETIME'
  ],
  
  // ❌ NE PAS METTRE timezone (pour être universel)
  // timezone: '+01:00'  // ← ENLEVER CETTE LIGNE
});

pool.getConnection()
  .then(() => console.log("✅ Connexion MySQL établie avec succès"))
  .catch(err => console.error("❌ Erreur connexion MySQL:", err.message));

export default pool;
