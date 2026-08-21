-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 21.08.2026 klo 17:57
-- Palvelimen versio: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `subtracker_db`
--

-- --------------------------------------------------------

--
-- Rakenne taululle `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `palvelun_nimi` varchar(100) NOT NULL COMMENT 'Palvelun nimi / Service Name (e.g. Netflix, Spotify)',
  `hinta` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Hinta euroina / Price in EUR',
  `laskutusjakso` enum('Kuukausittain','Vuosittain') NOT NULL DEFAULT 'Kuukausittain' COMMENT 'Laskutusjakso / Billing Cycle (Monthly/Yearly)',
  `seuraava_era` date NOT NULL COMMENT 'Seuraava er├ñp├ñiv├ñ / Next Due Date (YYYY-MM-DD)',
  `maksutapa` varchar(50) DEFAULT 'Maksukortti' COMMENT 'Maksutapa / Payment Method (e.g. Visa, Apple Pay)',
  `kategoria` enum('Suoratoisto','Ty├Âkalut','Vapaa-aika','Muut') NOT NULL DEFAULT 'Muut' COMMENT 'Kategoria / Category',
  `tila` enum('Aktiivinen','Tauolla') NOT NULL DEFAULT 'Aktiivinen' COMMENT 'Tila / Status (Active/Paused)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
