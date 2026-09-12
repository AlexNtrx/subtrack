-- ==========================================================================
-- SUBTRACKER DATABASE SCHEMA (MySQL / MariaDB)
-- ==========================================================================

-- 1. สร้างฐานข้อมูล (ถ้ายังไม่มี)
CREATE DATABASE IF NOT EXISTS `subtracker_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `subtracker_db`;

-- 2. สร้างตาราง subscriptions
CREATE TABLE IF NOT EXISTS `subscriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `palvelun_nimi` VARCHAR(100) NOT NULL COMMENT 'Service Name (e.g. Netflix, Spotify)',
    `hinta` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Price in EUR',
    `laskutusjakso` ENUM('Kuukausittain', 'Vuosittain') NOT NULL DEFAULT 'Kuukausittain' COMMENT 'Billing Cycle',
    `seuraava_era` DATE NOT NULL COMMENT 'Next Due Date (YYYY-MM-DD)',
    `maksutapa` VARCHAR(50) DEFAULT 'Maksukortti' COMMENT 'Payment Method (e.g. Visa, Apple Pay)',
    `kategoria` ENUM('Suoratoisto', 'Työkalut', 'Vapaa-aika', 'Muut') NOT NULL DEFAULT 'Muut' COMMENT 'Category',
    `tila` ENUM('Aktiivinen', 'Tauolla') NOT NULL DEFAULT 'Aktiivinen' COMMENT 'Status',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. เพิ่มข้อมูลตัวอย่างเริ่มต้น (Seed Data)
INSERT INTO `subscriptions` (`palvelun_nimi`, `hinta`, `laskutusjakso`, `seuraava_era`, `maksutapa`, `kategoria`, `tila`) VALUES
('Netflix', 12.99, 'Kuukausittain', '2026-08-24', 'Visa ****4321', 'Suoratoisto', 'Aktiivinen'),
('Spotify Premium', 10.99, 'Kuukausittain', '2026-09-01', 'Mastercard ****8812', 'Suoratoisto', 'Aktiivinen'),
('Kuntosalikortti', 24.99, 'Kuukausittain', '2026-09-15', 'E-lasku', 'Vapaa-aika', 'Aktiivinen'),
('iCloud+ 200GB', 2.99, 'Kuukausittain', '2026-09-10', 'Apple Pay', 'Työkalut', 'Tauolla');
