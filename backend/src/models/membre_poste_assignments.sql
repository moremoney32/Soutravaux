-- Table: membre_poste_assignments
-- Description: Association entre les membres et les postes au sein d'une société
-- Permet de gérer les rôles/positions des collaborateurs

CREATE TABLE IF NOT EXISTS `membre_poste_assignments` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `membre_id` INT(11) NOT NULL,
  `poste_id` BIGINT(20) NOT NULL,
  `societe_id` INT(11) NOT NULL,
  `assigned_by` INT(11) DEFAULT NULL,
  `assigned_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP(),
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_membre_poste_societe` (`membre_id`, `poste_id`, `societe_id`),
  KEY `idx_poste_id` (`poste_id`),
  KEY `idx_societe_id` (`societe_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_membre_societe` (`membre_id`, `societe_id`),
  
  -- Foreign Keys
  CONSTRAINT `fk_mpa_membre_id` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mpa_societe_id` FOREIGN KEY (`societe_id`) REFERENCES `societes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mpa_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `membres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial data
INSERT INTO `membre_poste_assignments` (`membre_id`, `poste_id`, `societe_id`, `assigned_by`, `assigned_at`, `expires_at`) VALUES
(1, 22, 48, NULL, '2026-01-12 14:29:27', NULL),
(12, 16, 37, NULL, '2026-01-12 14:29:27', NULL),
(13, 2, 2, NULL, '2026-01-12 14:29:27', NULL),
(13, 25, 51, NULL, '2026-01-12 14:29:27', NULL),
(13, 30, 71, NULL, '2026-01-12 14:29:27', NULL),
(13, 36, 78, NULL, '2026-01-12 14:29:27', NULL),
(22, 5, 5, NULL, '2026-01-12 14:29:27', NULL),
(23, 4, 4, NULL, '2026-01-12 14:29:27', NULL),
(26, 6, 6, NULL, '2026-01-12 14:29:27', NULL),
(29, 8, 8, NULL, '2026-01-12 14:29:27', NULL),
(31, 9, 9, NULL, '2026-01-12 14:29:27', NULL),
(31, 10, 10, NULL, '2026-01-12 14:29:27', NULL),
(31, 15, 34, NULL, '2026-01-12 14:29:27', NULL),
(32, 11, 11, NULL, '2026-01-12 14:29:27', NULL),
(32, 12, 12, NULL, '2026-01-12 14:29:27', NULL),
(32, 33, 74, NULL, '2026-01-12 14:29:27', NULL),
(35, 13, 13, NULL, '2026-01-12 14:29:27', NULL),
(35, 14, 31, NULL, '2026-01-12 14:29:27', NULL),
(42, 23, 49, NULL, '2026-01-12 14:29:27', NULL),
(57, 28, 57, NULL, '2026-01-12 14:29:27', NULL),
(73, 17, 40, NULL, '2026-01-12 14:29:27', NULL),
(73, 18, 41, NULL, '2026-01-12 14:29:27', NULL),
(73, 19, 42, NULL, '2026-01-12 14:29:27', NULL),
(73, 20, 43, NULL, '2026-01-12 14:29:27', NULL),
(73, 21, 44, NULL, '2026-01-12 14:29:27', NULL),
(153, 24, 50, NULL, '2026-01-12 14:29:27', NULL),
(164, 26, 52, NULL, '2026-01-12 14:29:27', NULL),
(172, 27, 53, NULL, '2026-01-12 14:29:27', NULL),
(179, 29, 61, NULL, '2026-01-12 14:29:27', NULL),
(190, 34, 75, NULL, '2026-01-12 14:29:27', NULL),
(191, 31, 72, NULL, '2026-01-12 14:29:27', NULL),
(192, 32, 73, NULL, '2026-01-12 14:29:27', NULL),
(192, 79, 37, 12, '2026-01-12 15:05:51', NULL),
(193, 35, 76, NULL, '2026-01-12 14:29:27', NULL),
(193, 79, 37, 12, '2026-01-12 15:05:51', NULL),
(196, 37, 79, NULL, '2026-01-12 14:29:27', NULL),
(197, 65, 2, 13, '2026-01-13 00:29:30', NULL);

COMMIT;
