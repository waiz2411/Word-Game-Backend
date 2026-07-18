-- Active: 1718000000000@@sql313.infinityfree.com@3306@if0_40465698_word_game_db
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `device` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `coins` int NOT NULL DEFAULT '200',
  `level_reached` int NOT NULL DEFAULT '1',
  `ads_watched` int NOT NULL DEFAULT '0',
  `smartlink_clicks` int NOT NULL DEFAULT '0',
  `status` varchar(255) NOT NULL DEFAULT 'Live',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `telemetry_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `telemetry_events_user_id_foreign` (`user_id`),
  CONSTRAINT `telemetry_events_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cpm_rates` (
  `ad_type` varchar(255) NOT NULL,
  `rate` decimal(8,4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ad_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `cpm_rates` (`ad_type`, `rate`, `created_at`, `updated_at`) VALUES
('banner', 0.0050, NOW(), NOW()),
('interstitial', 0.0400, NOW(), NOW()),
('rewarded', 0.0700, NOW(), NOW()),
('smartlink', 0.1800, NOW(), NOW());
