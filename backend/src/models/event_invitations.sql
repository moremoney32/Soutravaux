-- ✅ Table pour gérer les invitations et rappels des collaborateurs

CREATE TABLE IF NOT EXISTS `event_invitations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `event_id` INT(11) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reminded_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by_system` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  PRIMARY KEY (`id`),
  FOREIGN KEY (`event_id`) REFERENCES `calendar_events`(`id`) ON DELETE CASCADE,
  KEY `idx_event_id` (`event_id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  UNIQUE KEY `unique_event_email` (`event_id`, `email`)  -- Une seule invitation par event/email
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Exemple de données de test
-- INSERT INTO event_invitations (event_id, email, status, created_at, reminded_at)
-- VALUES 
--   (1, 'john@example.com', 'sent', NOW(), NULL),
--   (1, 'jane@example.com', 'sent', NOW(), NULL),
--   (2, 'bob@example.com', 'sent', NOW(), NULL);
