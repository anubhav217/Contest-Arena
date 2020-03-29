-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2020 at 05:12 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `contest_arena`
--

-- --------------------------------------------------------

--
-- Table structure for table `code`
--

CREATE TABLE `code` (
  `id` int(11) NOT NULL,
  `problem_code` varchar(100) NOT NULL,
  `contest_code` varchar(100) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `code_content` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `code`
--

INSERT INTO `code` (`id`, `problem_code`, `contest_code`, `user_id`, `code_content`) VALUES
(1, 'PRACTICE', 'SALARY', '\'puny_coder\'', 'lol'),
(2, 'XC202', 'XCPT2015', 'puny_coder', 'editing this file'),
(3, 'PRACTICE', 'SALARY', 'puny_coder', '\"LOL3\"'),
(7, 'CHCBOX', 'COOK116A', 'puny_coder', '//Code your heart out here!\r\nvjvj\r\nvhjvjh\r\nlll\r\nbjkbk\r\njkjk\r\nxxx\r\nvbv\r\nhj\r\njhbj'),
(329, 'ESCTRE', 'COOK116A', 'puny_coder', '//Code your heart out here!\r\nsdcds\r\ndasds\r\nzdggdsz\r\ndfdff\r\ngfg\r\nfgfggggggggggggg'),
(348, 'CARR', 'LTIME80A', 'puny_coder', '//Code your heart out here!'),
(349, 'MXCH', 'CNMP2019', 'puny_coder', '//Code your heart out here!\r\nghjg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `code`
--
ALTER TABLE `code`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `problem_code` (`problem_code`,`contest_code`,`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `code`
--
ALTER TABLE `code`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=353;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
