-- 1. Créer la base si elle n’existe pas
-- CREATE DATABASE IF NOT EXISTS lca;
-- USE lca;

-- -- 2. Table des sociétés
-- DROP TABLE IF EXISTS companies;
-- CREATE TABLE companies (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(150) NOT NULL,
--     size VARCHAR(50),              -- ex: "2-5", "6-10"
--     legal_form VARCHAR(50),        -- ex: "SARL", "SASU"
--     siret VARCHAR(50) UNIQUE,      -- peut être NULL si nouvelle société
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 3. Table des utilisateurs
-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     role ENUM('artisan','fournisseur','annonceur') NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(255),
--     firstName VARCHAR(100),
--     lastName VARCHAR(100),
--     company_id INT,
--     isVerified BOOLEAN DEFAULT FALSE,
--     verificationCode VARCHAR(10),
--     verificationExpiry DATETIME,
--     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
-- );


-- 1. Créer la base si elle n’existe pas (⚠️ à n’utiliser qu’en local, pas en prod)
-- CREATE DATABASE IF NOT EXISTS lca;
-- USE lca;
CREATE DATABASE IF NOT EXISTS u839546084_solutravo;
USE u839546084_solutravo;

-- 2. Table des sociétés (presociete)
DROP TABLE IF EXISTS presociete;
CREATE TABLE presociete (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    size VARCHAR(50),               -- ex: "2-5", "6-10"
    legal_form VARCHAR(50),         -- ex: "SARL", "SASU"
    siret VARCHAR(50) UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour accélérer les recherches
    INDEX (siret),
    INDEX (name)
);

-- 3. Table des membres
DROP TABLE IF EXISTS membres;
CREATE TABLE membres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref VARCHAR(36) DEFAULT NULL,   -- identifiant externe (UUID si besoin)
    email VARCHAR(100) NOT NULL UNIQUE,
    passe VARCHAR(255),    -- mot de passe hashé
    prenom VARCHAR(50) NOT NULL,
    role ENUM('artisan','fournisseur','annonceur','admin','membre') DEFAULT 'membre',
    presociete_id INT DEFAULT NULL,
    statut ENUM('actif','bloque') NOT NULL DEFAULT 'actif',
    isVerified BOOLEAN DEFAULT FALSE,
    verificationCode VARCHAR(10),
    verificationExpiry DATETIME,
    reset_token VARCHAR(64) DEFAULT NULL,
    reset_expiry DATETIME DEFAULT NULL,
    date_suspension DATETIME DEFAULT NULL,
    seen_modal_version VARCHAR(10) DEFAULT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Clé étrangère : lien vers presociete
    FOREIGN KEY (presociete_id) REFERENCES presociete(id) ON DELETE SET NULL,

    -- Index pour les recherches fréquentes
    INDEX (email),
    INDEX (role),
    INDEX (statut),
    INDEX (presociete_id)
);
