-- 1. Créer la base si elle n’existe pas
CREATE DATABASE IF NOT EXISTS lca;
USE lca;

-- 2. Table des sociétés
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    size VARCHAR(50),              -- ex: "2-5", "6-10"
    legal_form VARCHAR(50),        -- ex: "SARL", "SASU"
    siret VARCHAR(50) UNIQUE,      -- peut être NULL si nouvelle société
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des utilisateurs
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('artisan','fournisseur','annonceur') NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    company_id INT,
    isVerified BOOLEAN DEFAULT FALSE,
    verificationCode VARCHAR(10),
    verificationExpiry DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
