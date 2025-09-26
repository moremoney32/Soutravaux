
CREATE DATABASE IF NOT EXISTS u839546084_solutravo;
USE u839546084_solutravo;

CREATE TABLE `membres` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,          -- Identifiant unique du membre
  `ref` VARCHAR(36) DEFAULT NULL,                -- Identifiant externe (UUID optionnel)
  `email` VARCHAR(100) NOT NULL,                 -- Email unique
  `nom` VARCHAR(50) DEFAULT NULL,                -- Nom de famille (optionnel)
  `prenom` VARCHAR(50) NOT NULL,                 -- Prénom (obligatoire)
  `passe` VARCHAR(255) NOT NULL,                 -- Mot de passe hashé
  `statut` ENUM('actif','bloque') NOT NULL DEFAULT 'actif',  -- État du compte
  `isVerified` TINYINT(1) DEFAULT 0,             -- Compte vérifié (0 = non, 1 = oui)
  `verificationCode` VARCHAR(10) DEFAULT NULL,   -- Code de vérification
  `verificationExpiry` DATETIME DEFAULT NULL,    -- Expiration du code de vérification
  `type` ENUM('admin','membre') DEFAULT 'membre',-- Type de compte
  `date_creation` TIMESTAMP NOT NULL DEFAULT current_timestamp(), -- Date d'inscription
  `date_modification` TIMESTAMP NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), -- Dernière maj
  `reset_token` VARCHAR(64) DEFAULT NULL,        -- Token pour reset mot de passe
  `reset_expiry` DATETIME DEFAULT NULL,          -- Expiration du reset
  `date_suspension` DATETIME DEFAULT NULL,       -- Date éventuelle de suspension
  `seen_modal_version` VARCHAR(10) DEFAULT NULL, -- Version du modal vu par l'utilisateur
  
  -- Contraintes
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),                  -- Email unique
  UNIQUE KEY `ref` (`ref`)                       -- UUID unique si présent
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE `presocietes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `size` VARCHAR(50) DEFAULT NULL,   -- taille de l'entreprise (ex: "2 à 5 personnes")
  `legal_form` ENUM(
      'EI',
      'EIRL',
      'EURL',
      'SARL',
      'SAS',
      'SASU',
      'SA',
      'SNC',
      'SELARL'
  ) NOT NULL DEFAULT 'EI',           -- forme juridique
  `siret` VARCHAR(50) DEFAULT NULL,  -- numéro de SIRET (peut être NULL si pas encore attribué)
  `role` ENUM('artisan','fournisseur','annonceur') NOT NULL DEFAULT 'artisan',
  `address` VARCHAR(255) DEFAULT NULL,
  `phonenumber` VARCHAR(20) DEFAULT NULL,
  `createdAt` TIMESTAMP NULL DEFAULT current_timestamp(),
  `membre_id` INT(11) DEFAULT NULL,  -- référence vers la table membres
  PRIMARY KEY (`id`),
  UNIQUE KEY `siret` (`siret`),
  KEY `idx_presocietes_membre_id` (`membre_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;