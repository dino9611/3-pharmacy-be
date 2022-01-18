CREATE DATABASE  IF NOT EXISTS `3_pharmacy` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `3_pharmacy`;
-- MySQL dump 10.13  Distrib 8.0.27, for Linux (x86_64)
--
-- Host: localhost    Database: 3_pharmacy
-- ------------------------------------------------------
-- Server version	8.0.27-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bank` varchar(20) NOT NULL,
  `accountNumber` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank`
--

LOCK TABLES `bank` WRITE;
/*!40000 ALTER TABLE `bank` DISABLE KEYS */;
INSERT INTO `bank` VALUES (1,'BCA',1324354657),(2,'BRI',1234567890),(3,'TokobatPay',1987654321);
/*!40000 ALTER TABLE `bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_item`
--

DROP TABLE IF EXISTS `cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_item` (
  `order_id` int NOT NULL,
  `price` int unsigned NOT NULL,
  `profit` int NOT NULL DEFAULT '0',
  `qty` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` tinyint DEFAULT '0',
  `product_id` int NOT NULL,
  PRIMARY KEY (`order_id`,`product_id`),
  KEY `fk_ordered_item_product1_idx` (`product_id`),
  CONSTRAINT `fk_ordered_item_order1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
  CONSTRAINT `fk_ordered_item_product1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_item`
--

LOCK TABLES `cart_item` WRITE;
/*!40000 ALTER TABLE `cart_item` DISABLE KEYS */;
INSERT INTO `cart_item` VALUES (2,9,23000,1,'2022-01-18 01:24:00',1,7);
/*!40000 ALTER TABLE `cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `totalPrice` float DEFAULT NULL,
  `profitRp` float DEFAULT '0',
  `checkedOutAt` datetime DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `paymentProof` varchar(100) DEFAULT NULL,
  `shippingCost` int DEFAULT NULL,
  `status` enum('cart','checkout','paymentAcc','paymentRej','processing','otw','delivered') NOT NULL DEFAULT 'cart',
  `user_id` int NOT NULL,
  `bank_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_order_user2_idx` (`user_id`),
  KEY `fk_order_bank1_idx` (`bank_id`),
  CONSTRAINT `fk_order_bank1` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`),
  CONSTRAINT `fk_order_user2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,NULL,0,NULL,NULL,NULL,NULL,'cart',2,NULL),(2,0,0,NULL,NULL,NULL,NULL,'cart',3,NULL);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescribed_composition`
--

DROP TABLE IF EXISTS `prescribed_composition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescribed_composition` (
  `raw_material_id` int NOT NULL,
  `amountInUnit` float NOT NULL,
  `prescribed_medicine_id` int NOT NULL,
  PRIMARY KEY (`raw_material_id`,`prescribed_medicine_id`),
  KEY `fk_prescribed_composition_raw_material1_idx` (`raw_material_id`),
  KEY `fk_prescribed_composition_prescribed_medicine1` (`prescribed_medicine_id`),
  CONSTRAINT `fk_prescribed_composition_prescribed_medicine1` FOREIGN KEY (`prescribed_medicine_id`) REFERENCES `prescribed_medicine` (`id`),
  CONSTRAINT `fk_prescribed_composition_raw_material1` FOREIGN KEY (`raw_material_id`) REFERENCES `raw_material` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescribed_composition`
--

LOCK TABLES `prescribed_composition` WRITE;
/*!40000 ALTER TABLE `prescribed_composition` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescribed_composition` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prescribed_composition_AFTER_INSERT` AFTER INSERT ON `prescribed_composition` FOR EACH ROW BEGIN

-- update inventory after insert add new composition to product
UPDATE raw_material
SET inventory = inventory - NEW.amountInUnit * (SELECT qty FROM prescribed_medicine WHERE id = NEW.prescribed_medicine_id)
WHERE id = NEW.raw_material_id;

-- update price after insert add new composition to prescribed_medicine
UPDATE prescribed_medicine
SET priceRp = priceRp + NEW.amountInUnit * (SELECT priceRpPerUnit FROM raw_material WHERE id = NEW.raw_material_id)
WHERE id = NEW.prescribed_medicine_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prescribed_composition_AFTER_UPDATE` AFTER UPDATE ON `prescribed_composition` FOR EACH ROW BEGIN

-- update inventory after amount is updated
UPDATE raw_material
SET inventory = inventory - (NEW.amountInUnit - OLD.amountInUnit) * (SELECT qty FROM prescribed_medicine WHERE id = NEW.prescribed_medicine_id)
WHERE id = NEW.raw_material_id;

-- update prescribed_medicine price after amount is updated
UPDATE prescribed_medicine
SET priceRp = priceRp + (NEW.amountInUnit - OLD.amountInUnit) * (SELECT priceRpPerUnit FROM raw_material WHERE id = NEW.raw_material_id)
WHERE id = NEW.prescribed_medicine_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `prescribed_medicine`
--

DROP TABLE IF EXISTS `prescribed_medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescribed_medicine` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicineName` varchar(45) NOT NULL,
  `priceRp` float unsigned NOT NULL DEFAULT '0',
  `qty` int NOT NULL DEFAULT '0',
  `prescription_id` int NOT NULL,
  PRIMARY KEY (`id`,`prescription_id`),
  KEY `fk_prescribed_medicine_prescription1_idx` (`prescription_id`),
  CONSTRAINT `fk_prescribed_medicine_prescription1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescribed_medicine`
--

LOCK TABLES `prescribed_medicine` WRITE;
/*!40000 ALTER TABLE `prescribed_medicine` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescribed_medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescriptionName` varchar(45) DEFAULT NULL,
  `image` varchar(100) NOT NULL,
  `expiredAt` datetime DEFAULT NULL,
  `totalPriceRp` float DEFAULT '0',
  `profitRp` float DEFAULT '0',
  `paymentProof` varchar(100) DEFAULT NULL,
  `status` enum('initial','waitingPayment','waitpaymentApproval','paymentAcc','processing','otw','delivered','imgRej','expired','paymentRej','rejected') NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_prescription_user1_idx` (`user_id`),
  CONSTRAINT `fk_prescription_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(45) NOT NULL,
  `productPriceRp` float unsigned NOT NULL DEFAULT '0',
  `productProfitRp` int NOT NULL DEFAULT '0',
  `stock` int unsigned NOT NULL DEFAULT '0',
  `imagePath` varchar(65) NOT NULL,
  `description` varchar(150) NOT NULL,
  `isDeleted` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productName_UNIQUE` (`productName`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (3,'Rhinos SR 10 Kapsul',290,20000,5,'/products/PROD1642417749031.jpg','Meredakan gejala yang berhubungan dengan rinitis alergi misalnya bersin, hidung tersumbat, rinore, pruritus & lakrimasi.',0,'2022-01-17 18:09:09','2022-01-17 14:27:16'),(4,'Tremenza Sirup 60 ml',126,10000,10,'/products/PROD1642418069349.jpg','Obat ini digunakan untuk mengatasi gejala-gejala flu seperti: bersin-bersin, hidung tersumbat, yang disertai batuk tidak berdahak.',0,'2022-01-17 18:14:29','2022-01-17 11:14:29'),(5,'Astria',32,12000,8,'/products/PROD1642418253006.jpg','untuk memelihara kesehatan',0,'2022-01-17 18:17:33','2022-01-17 11:17:49'),(6,'Tremenza 10 Tablet',250,20000,10,'/products/PROD1642418393641.jpg','Tremenza',0,'2022-01-17 18:19:53','2022-01-17 11:19:53'),(7,'Folavit',20,23000,9,'/products/PROD1642418968673.jpg','untuk pertumbuhan janin',0,'2022-01-17 18:29:28','2022-01-18 03:12:51'),(8,'Topcort Cream 10 g',1500,22000,8,'/products/PROD1642419338394.jpg','meredakan inflamasi',0,'2022-01-17 18:35:38','2022-01-17 11:35:38'),(9,'Paracetamol 500 mg 10 Kaplet',1000,10000,13,'/products/PROD1642426694519.jpg','buat demam',0,'2022-01-17 20:38:14','2022-01-17 13:38:14'),(10,'Tempra Forte Sirup 60 ml',6000,1000,10,'/products/PROD1642474813940.jpg','TEMPRA FORTE merupakan obat penurun demam yang mengandung Paracetamol 250 mg tiap 5 ml sirup.\n',0,'2022-01-18 10:00:13','2022-01-18 03:00:13'),(11,'Praxion Sirup 60 ml',1200,1500,10,'/products/PROD1642474940843.jpg','PRAXION SIRUP merupakan obat yang mengandung Paracetamol yang berfungsi sebagai analgesik dan antipiretik.',0,'2022-01-18 10:02:20','2022-01-18 03:02:20'),(12,'Cefixime Sirup 30 ml',6000,2000,9,'/products/PROD1642475738832.jpg','cefixime merupakan antibiotik yang memiliki spektrum luas',0,'2022-01-18 10:15:38','2022-01-18 03:21:20'),(13,'Lostacef 500 mg 10 Kapsul',2600,1000,15,'/products/PROD1642476403730.jpg','Lostacef merupakan antibiotik yang mengandung cefadroxil. cefadroxil merupakan antibiotika golongan cefalosporin',0,'2022-01-18 10:26:43','2022-01-18 03:28:21'),(14,'Alloris 10 mg 10 Tablet',10,2000,20,'/products/PROD1642477454126.jpg','ALLORIS TABLET merupakan obat dengan kandungan Loratadine dalam bentuk tablet. ',0,'2022-01-18 10:44:14','2022-01-18 03:44:14'),(15,'Thrombo Aspilets 80 mg 30 Tablet',400,2000,24,'/products/PROD1642492613818.jpg','memiliki manfaat sebagai anti-platelet dengan cara menghambat pembentukan trombus pada sirkulasi arteri.',0,'2022-01-18 14:56:53','2022-01-18 07:56:53'),(16,'Ascardia 80 mg 10 Tablet',400,2000,25,'/products/PROD1642493073682.jpg','memiliki manfaat sebagai anti-platelet dengan cara menghambat pembentukan trombus pada sirkulasi arteri.',0,'2022-01-18 15:04:33','2022-01-18 08:04:33'),(17,'Atorvastatin 20 mg 10 Tablet',200,1500,25,'/products/PROD1642493201897.jpg','Obat ini digunakan sebagai tambahan diet untuk menurunkan peningkatan kolesterol total, kolesterol LDL, apo-B & trigliserida pada pasien \n',0,'2022-01-18 15:06:41','2022-01-18 08:06:41'),(18,'Neurobion 10 Tablet',2800,2000,20,'/products/PROD1642493833002.jpg','NEUROBION merupakan vitamin neurotropik dengan kandungan Vitamin B1, Vitamin B6, Vitamin B12, yang penting untuk kesehatan fungsi saraf.',0,'2022-01-18 15:17:13','2022-01-18 08:17:13');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `product_AFTER_INSERT` AFTER INSERT ON `product` FOR EACH ROW BEGIN

DECLARE _tableName VARCHAR(7) DEFAULT 'product';
DECLARE _length INT DEFAULT (SELECT COUNT(id) FROM product);

IF EXISTS(SELECT id FROM table_length WHERE tableName = _tableName) THEN
	-- UPDATE table_length
	-- SET length = length + 1
	-- WHERE tableName = _tableName;
    UPDATE table_length
    SET length = _length
    WHERE tableName = _tableName;
ELSE
	INSERT INTO table_length(tableName, length)
    VALUES(_tableName, _length);
END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `product_category`
--

DROP TABLE IF EXISTS `product_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_category`
--

LOCK TABLES `product_category` WRITE;
/*!40000 ALTER TABLE `product_category` DISABLE KEYS */;
INSERT INTO `product_category` VALUES (1,'Batuk dan Flu'),(2,'COVID-19'),(3,'Vitamin dan Suplemen'),(4,'Ibu dan Anak'),(5,'Demam'),(6,'Kulit'),(7,'Alergi'),(8,'Mata'),(9,'Jantung');
/*!40000 ALTER TABLE `product_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_composition`
--

DROP TABLE IF EXISTS `product_composition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_composition` (
  `raw_material_id` int NOT NULL,
  `amountInUnit` float unsigned NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`raw_material_id`,`product_id`),
  KEY `fk_product_composition_raw_material1_idx` (`raw_material_id`),
  KEY `fk_product_composition_product1` (`product_id`),
  CONSTRAINT `fk_product_composition_product1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `fk_product_composition_raw_material1` FOREIGN KEY (`raw_material_id`) REFERENCES `raw_material` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_composition`
--

LOCK TABLES `product_composition` WRITE;
/*!40000 ALTER TABLE `product_composition` DISABLE KEYS */;
INSERT INTO `product_composition` VALUES (17,50,3),(17,10,14),(18,600,3),(18,300,4),(18,600,6),(19,15,4),(19,25,6),(20,16,5),(21,1,7),(22,25,8),(23,500,9),(23,3000,10),(23,600,11),(24,3000,12),(25,500,13),(26,80,15),(26,80,16),(27,20,17),(28,100,18),(29,200,18),(30,200,18);
/*!40000 ALTER TABLE `product_composition` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `product_composition_AFTER_INSERT` AFTER INSERT ON `product_composition` FOR EACH ROW BEGIN

-- update inventory after insert add new composition to product
UPDATE raw_material
SET inventory = inventory - NEW.amountInUnit * (SELECT stock FROM product WHERE id = NEW.product_id)
WHERE id = NEW.raw_material_id;

-- update price after insert add new composition to product
UPDATE product
SET productPriceRp = productPriceRp + NEW.amountInUnit * (SELECT priceRpPerUnit FROM raw_material WHERE id = NEW.raw_material_id)
WHERE id = NEW.product_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `product_composition_AFTER_UPDATE` AFTER UPDATE ON `product_composition` FOR EACH ROW BEGIN
-- AFTER_UPDATE trigger is used to execute actions based on change

-- update inventory after amount is updated
UPDATE raw_material
SET inventory = inventory - (NEW.amountInUnit - OLD.amountInUnit) * (SELECT stock FROM product WHERE id = NEW.product_id)
WHERE id = NEW.raw_material_id;

-- update product price after amount is updated
UPDATE product
SET productPriceRp = productPriceRp + (NEW.amountInUnit - OLD.amountInUnit) * (SELECT priceRpPerUnit FROM raw_material WHERE id = NEW.raw_material_id)
WHERE id = NEW.product_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `product_composition_AFTER_DELETE` AFTER DELETE ON `product_composition` FOR EACH ROW BEGIN

-- update inventory after deleted
UPDATE raw_material
SET inventory = inventory + OLD.amountInUnit * (SELECT stock FROM product WHERE id = OLD.product_id)
WHERE id = OLD.raw_material_id;

-- update product price after deleted
UPDATE product
SET productPriceRp = productPriceRp - OLD.amountInUnit * (SELECT priceRpPerUnit FROM raw_material WHERE id = OLD.raw_material_id)
WHERE id = OLD.product_id;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `product_has_category`
--

DROP TABLE IF EXISTS `product_has_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_has_category` (
  `product_id` int NOT NULL,
  `product_category_id` int NOT NULL,
  PRIMARY KEY (`product_id`,`product_category_id`),
  KEY `fk_product_has_product_category_product_category1_idx` (`product_category_id`),
  KEY `fk_product_has_product_category_product1_idx` (`product_id`),
  CONSTRAINT `fk_product_has_product_category_product1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_product_has_product_category_product_category1` FOREIGN KEY (`product_category_id`) REFERENCES `product_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_has_category`
--

LOCK TABLES `product_has_category` WRITE;
/*!40000 ALTER TABLE `product_has_category` DISABLE KEYS */;
INSERT INTO `product_has_category` VALUES (3,1),(4,1),(6,1),(9,1),(3,2),(9,2),(5,3),(12,3),(13,3),(18,3),(7,4),(9,4),(3,5),(9,5),(10,5),(11,5),(8,6),(4,7),(5,7),(8,7),(14,7),(7,9),(15,9),(16,9),(17,9);
/*!40000 ALTER TABLE `product_has_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raw_material`
--

DROP TABLE IF EXISTS `raw_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raw_material` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materialName` varchar(45) NOT NULL,
  `inventory` float unsigned NOT NULL DEFAULT '0',
  `unitPerBottle` float unsigned NOT NULL,
  `priceRpPerUnit` float unsigned NOT NULL,
  `unit` enum('mg','ml') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `materialName_UNIQUE` (`materialName`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_material`
--

LOCK TABLES `raw_material` WRITE;
/*!40000 ALTER TABLE `raw_material` DISABLE KEYS */;
INSERT INTO `raw_material` VALUES (17,'Loratadine',1999550,200000,1,'mg'),(18,'Pseudoephedrine HCL',988000,100000,0.4,'mg'),(19,'Tripolidine HCL',3599600,300000,0.4,'mg'),(20,'Astaxanthin',299872,100000,2,'mg'),(21,'Folic Acid',179991,45000,20,'mg'),(22,'Desoxymetasone',399800,100000,60,'mg'),(23,'Paracetamol',3357500,340000,2,'mg'),(24,'Cefixime',362978000,300000,2,'mg'),(25,'Cefadroxil',119992000,300000,5,'mg'),(26,'Acetylsalicylic',15996100,400000,5,'mg'),(27,'Atorvastatin calcium',175000000,500000,10,'mg'),(28,'Thiamine mononitrate',2998000,300000,2,'mg'),(29,'Pyridoxine hydrochloride',39996000,200000,3,'mg'),(30,'Cyanocobalamin',3996000,100000,10,'mg');
/*!40000 ALTER TABLE `raw_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raw_material_record`
--

DROP TABLE IF EXISTS `raw_material_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raw_material_record` (
  `raw_material_id` int NOT NULL,
  `inventoryChange` float NOT NULL COMMENT 'negative change is by user\\npositive change is by admin',
  `datetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `admin_id` int DEFAULT NULL,
  KEY `fk_raw_material_record_user1_idx` (`admin_id`),
  KEY `fk_raw_material_record_raw_material1_idx` (`raw_material_id`),
  CONSTRAINT `fk_raw_material_record_raw_material1` FOREIGN KEY (`raw_material_id`) REFERENCES `raw_material` (`id`),
  CONSTRAINT `fk_raw_material_record_user1` FOREIGN KEY (`admin_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_material_record`
--

LOCK TABLES `raw_material_record` WRITE;
/*!40000 ALTER TABLE `raw_material_record` DISABLE KEYS */;
INSERT INTO `raw_material_record` VALUES (17,2000000,'2022-01-17 18:01:15',2),(18,1000000,'2022-01-17 18:03:47',2),(17,0,'2022-01-17 18:09:09',2),(18,0,'2022-01-17 18:09:09',2),(17,-250,'2022-01-17 18:09:09',2),(18,-3000,'2022-01-17 18:09:09',2),(19,3600000,'2022-01-17 18:11:46',2),(18,0,'2022-01-17 18:14:29',2),(19,0,'2022-01-17 18:14:29',2),(18,-3000,'2022-01-17 18:14:29',2),(19,-150,'2022-01-17 18:14:29',2),(20,300000,'2022-01-17 18:15:54',2),(20,0,'2022-01-17 18:17:33',2),(20,-128,'2022-01-17 18:17:33',2),(18,0,'2022-01-17 18:19:53',2),(19,0,'2022-01-17 18:19:53',2),(18,-6000,'2022-01-17 18:19:53',2),(19,-250,'2022-01-17 18:19:53',2),(21,180000,'2022-01-17 18:27:55',2),(21,0,'2022-01-17 18:29:28',2),(21,-4.05,'2022-01-17 18:29:28',2),(22,400000,'2022-01-17 18:32:39',2),(22,0,'2022-01-17 18:35:38',2),(22,-200,'2022-01-17 18:35:38',2),(23,3400000,'2022-01-17 20:35:54',2),(23,0,'2022-01-17 20:38:14',2),(23,-6500,'2022-01-17 20:38:14',2),(17,-82300,'2022-01-17 21:26:56',2),(18,-987600,'2022-01-17 21:26:56',2),(17,82300,'2022-01-17 21:27:16',2),(18,987600,'2022-01-17 21:27:16',2),(23,0,'2022-01-18 10:00:13',2),(23,-30000,'2022-01-18 10:00:13',2),(23,0,'2022-01-18 10:02:20',2),(23,-6000,'2022-01-18 10:02:20',2),(24,4500,'2022-01-18 10:10:23',2),(21,-4.95,'2022-01-18 10:12:51',2),(24,0,'2022-01-18 10:15:38',2),(24,-4500,'2022-01-18 10:15:38',2),(24,9,'2022-01-18 10:17:43',2),(24,-9,'2022-01-18 10:18:28',2),(24,300000000,'2022-01-18 10:20:17',2),(24,60000000,'2022-01-18 10:20:28',2),(24,3000000,'2022-01-18 10:20:35',2),(24,-22500,'2022-01-18 10:21:20',2),(25,120000000,'2022-01-18 10:23:48',2),(25,0,'2022-01-18 10:26:43',2),(25,-7500,'2022-01-18 10:26:43',2),(17,0,'2022-01-18 10:44:14',2),(17,-200,'2022-01-18 10:44:14',2),(26,16000000,'2022-01-18 14:55:09',2),(26,-0,'2022-01-18 14:56:53',2),(26,-1920,'2022-01-18 14:56:53',2),(27,175000000,'2022-01-18 15:01:52',2),(26,-0,'2022-01-18 15:04:33',2),(26,-2000,'2022-01-18 15:04:33',2),(27,-0,'2022-01-18 15:06:41',2),(27,-500,'2022-01-18 15:06:41',2),(28,3000000,'2022-01-18 15:12:00',2),(29,40000000,'2022-01-18 15:13:04',2),(30,4000000,'2022-01-18 15:14:00',2),(28,-0,'2022-01-18 15:17:13',2),(29,-0,'2022-01-18 15:17:13',2),(30,-0,'2022-01-18 15:17:13',2),(28,-2000,'2022-01-18 15:17:13',2),(29,-4000,'2022-01-18 15:17:13',2),(30,-4000,'2022-01-18 15:17:13',2);
/*!40000 ALTER TABLE `raw_material_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_length`
--

DROP TABLE IF EXISTS `table_length`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_length` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tableName` varchar(45) NOT NULL,
  `length` int unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tableName_UNIQUE` (`tableName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_length`
--

LOCK TABLES `table_length` WRITE;
/*!40000 ALTER TABLE `table_length` DISABLE KEYS */;
INSERT INTO `table_length` VALUES (1,'product',16);
/*!40000 ALTER TABLE `table_length` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `email` varchar(65) NOT NULL,
  `password` varchar(60) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `isVerified` tinyint NOT NULL DEFAULT '0',
  `birthdate` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `avatar` varchar(65) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2,'admin','admin@gmail.com','$2b$10$PlNf3pNHzuT0LrNuseMMqeyXsiNyjL.LAKYEy4dHjWZKFtXe3lCLC','admin',NULL,'admin',0,NULL,NULL,NULL,NULL,'2022-01-17 17:29:53','2022-01-17 10:29:53'),(3,'user','user@gmail.com','$2b$10$mOy03Wiw6lqHFHvMybNpwO4mnVd3jLcCsTZoraMYy/twwlnUND.9e','user',NULL,'user',1,NULL,NULL,NULL,NULL,'2022-01-18 01:23:09','2022-01-17 18:23:09');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `user_AFTER_INSERT` AFTER INSERT ON `user` FOR EACH ROW BEGIN

-- insert user's first cart
INSERT INTO 3_pharmacy.order(user_id)
values(NEW.id);

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database '3_pharmacy'
--

--
-- Dumping routines for database '3_pharmacy'
--
/*!50003 DROP PROCEDURE IF EXISTS `handle_create_composition` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_create_composition`(_product_id INT, _raw_material_id INT, _amountInUnit FLOAT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';
DECLARE _amountInUnit_change FLOAT DEFAULT _amountInUnit - (SELECT amountInUnit FROM product_composition WHERE product_id = _product_id AND raw_material_id = _raw_material_id);
DECLARE _stock INT DEFAULT (SELECT stock FROM product WHERE id = _product_id);

-- dissalow null parameter
IF (_product_id IS NULL OR _raw_material_id IS NULL OR _amountInUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change amountInUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _amountInUnit = 0 THEN
	leave this_proc;
END IF;

-- create amountInUnit (inventory and price change are handled in trigger)
INSERT INTO product_composition(raw_material_id, amountInUnit, product_id)
VALUES(_raw_material_id, _amountInUnit, _product_id);

-- insert inventory change into record
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
VALUES(_raw_material_id, -1 * _amountInUnit * _stock, _admin_id);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_create_medicine_comp` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_create_medicine_comp`(_prescribed_medicine_id INT, _raw_material_id INT, _amountInUnit FLOAT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';
DECLARE _amountInUnit_change FLOAT DEFAULT _amountInUnit - (SELECT amountInUnit FROM prescribed_composition WHERE prescribed_medicine_id = _prescribed_medicine_id AND raw_material_id = _raw_material_id);
DECLARE _qty INT DEFAULT (SELECT qty FROM prescribed_medicine WHERE id = _prescribed_medicine_id);

-- dissalow null parameter
IF (_prescribed_medicine_id IS NULL OR _raw_material_id IS NULL OR _amountInUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change amountInUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _amountInUnit = 0 THEN
	leave this_proc;
END IF;

-- create amountInUnit (inventory and price change are handled in trigger)
INSERT INTO prescribed_composition(raw_material_id, amountInUnit, prescribed_medicine_id)
VALUES(_raw_material_id, _amountInUnit, _prescribed_medicine_id);

-- insert inventory change into record
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
VALUES(_raw_material_id, -1 * _amountInUnit * _qty, _admin_id);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_delete_composition` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_delete_composition`(_product_id INT, _raw_material_id INT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';
DECLARE _amountInUnit FLOAT DEFAULT (SELECT amountInUnit FROM product_composition WHERE product_id = _product_id AND raw_material_id = _raw_material_id);
DECLARE _stock INT DEFAULT (SELECT stock FROM product WHERE id = _product_id);

-- dissalow null parameter
IF (_product_id IS NULL OR _raw_material_id IS NULL OR _amountInUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to delete product composition';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

-- delete product composition (inventory and price change are handled in trigger)
DELETE FROM product_composition
WHERE product_id = _product_id
AND raw_material_id = _raw_material_id;

-- insert inventory change into record
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
VALUES(_raw_material_id, _amountInUnit * _stock, _admin_id);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_prescription_payment_fail` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_prescription_payment_fail`(_prescription_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _medicine_id INT;
DECLARE _qty INT;

DECLARE finished BOOLEAN DEFAULT FALSE;
-- declare cursor for employee email
DECLARE currRow
	CURSOR FOR 
		SELECT id, qty FROM prescribed_medicine
		WHERE prescription_id = _prescription_id;
-- declare NOT FOUND handler
DECLARE CONTINUE HANDLER 
			FOR NOT FOUND SET finished = TRUE;

-- dissalow null parameter
IF (_prescription_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

OPEN currRow;

	forEach: LOOP
		FETCH currRow INTO _medicine_id, _qty;
		IF finished THEN 
			LEAVE forEach;
		END IF;

			-- update inventory
			UPDATE raw_material
			JOIN prescribed_composition ON id = raw_material_id
			SET inventory = inventory + amountInUnit * _qty
			WHERE prescribed_medicine_id = _medicine_id;

			-- insert inventory change to record
			INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
			SELECT raw_material_id, amountInUnit * _qty, NULL
			FROM prescribed_composition
			WHERE prescribed_medicine_id = _medicine_id;

	END LOOP forEach;

CLOSE currRow;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_composition` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_composition`(_product_id INT, _raw_material_id INT, _amountInUnit FLOAT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';
DECLARE _amountInUnit_change FLOAT DEFAULT _amountInUnit - (SELECT amountInUnit FROM product_composition WHERE product_id = _product_id AND raw_material_id = _raw_material_id);
DECLARE _stock INT DEFAULT (SELECT stock FROM product WHERE id = _product_id);

-- dissalow null parameter
IF (_product_id IS NULL OR _raw_material_id IS NULL OR _amountInUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change amountInUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _amountInUnit_change = 0 THEN
-- query final result of changed values (except there are no changes)
		SELECT productPriceRp FROM product WHERE id = _product_id;

    leave this_proc;
END IF;

-- update amountInUnit (changes to inventory and price are handled in trigger)
UPDATE product_composition
SET amountInUnit = _amountInUnit
WHERE product_id = _product_id
AND raw_material_id = _raw_material_id;

-- insert inventory change into record
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
VALUES(_raw_material_id, -1 * _amountInUnit_change  * _stock, _admin_id);

-- query final result of changed values
SELECT productPriceRp FROM product WHERE id = _product_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_inventory` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_inventory`(_raw_material_id INT, _bottle_change INT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';

-- dissalow null parameter
IF (_raw_material_id IS NULL OR _bottle_change IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;
-- dissalow non admin to update stock directly without buying product
IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change stock';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _bottle_change = 0 THEN
		-- query final result of changed values
		SELECT (inventory DIV unitPerBottle) AS bottle, MOD(inventory, unitPerBottle) AS remainderInUnit
		FROM raw_material WHERE id = _raw_material_id;
    
    leave this_proc;
END IF;

-- update inventory
UPDATE raw_material
SET inventory = inventory + unitPerBottle * _bottle_change
WHERE id = _raw_material_id;

-- log inventory changes in record with admin_id (id of admin who made the inventory change)
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
SELECT id, _bottle_change * unitPerBottle, _admin_id
FROM raw_material
WHERE id = _raw_material_id;

-- query final result of changed values
SELECT (inventory DIV unitPerBottle) AS bottle, MOD(inventory, unitPerBottle) AS remainderInUnit
FROM raw_material WHERE id = _raw_material_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_medicine_comp` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_medicine_comp`(_prescribed_medicine_id INT, _raw_material_id INT, _amountInUnit FLOAT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';
DECLARE _amountInUnit_change FLOAT DEFAULT _amountInUnit - (SELECT amountInUnit FROM prescribed_composition WHERE prescribed_medicine_id = _prescribed_medicine_id AND raw_material_id = _raw_material_id);
DECLARE _qty INT DEFAULT (SELECT qty FROM prescribed_medicine WHERE id = _prescribed_medicine_id);

-- dissalow null parameter
IF (_prescribed_medicine_id IS NULL OR _raw_material_id IS NULL OR _amountInUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change amountInUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _amountInUnit = 0 THEN
	leave this_proc;
END IF;

-- update amountInUnit (changes to inventory and price are handled in trigger)
UPDATE prescribed_composition
SET amountInUnit = _amountInUnit
WHERE prescribed_medicine_id = _prescribed_medicine_id
AND raw_material_id = _raw_material_id;

-- insert inventory change into record
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
VALUES(_raw_material_id, -1 * _amountInUnit * _qty, _admin_id);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_priceRpPerUnit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_priceRpPerUnit`(_raw_material_id INT, _priceRpPerUnit FLOAT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';

DECLARE _priceRpPerUnit_change FLOAT DEFAULT _priceRpPerUnit - CAST((SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id) AS SIGNED);

-- dissalow null parameter
IF (_raw_material_id IS NULL OR _priceRpPerUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;
-- is admin
IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change priceRpPerUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _priceRpPerUnit_change = 0 THEN
-- query final result of changed values (except there are no changes)
		SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id;

    leave this_proc;
END IF;

-- update priceRpPerUnit
UPDATE raw_material
SET priceRpPerUnit = _priceRpPerUnit
WHERE id = _raw_material_id;

-- update productPriceRp
UPDATE product A
JOIN product_composition B On A.id = B.product_id
SET A.productPriceRp = productPriceRp + amountInUnit * _priceRpPerUnit_change
WHERE A.id IN (SELECT product_id FROM product_composition WHERE raw_material_id = _raw_material_id)
AND A.id > 0; -- add redundant condition so SQL_SAFE_UPDATES doesn't trigger (id is never negative since it is an auto incrementing primary key)

-- query final result of changed values
SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_qty` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_qty`(_prescribed_medicine_id INT, _qty INT, _admin_id INT)
this_proc:BEGIN

DECLARE _error_message VARCHAR(60);
DECLARE _qty_change INT DEFAULT _qty - CAST((SELECT qty FROM prescribed_medicine WHERE id = _prescribed_medicine_id) AS SIGNED);
DECLARE _max_qty_change INT;
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id) = 'admin';

-- dissalow null parameter
IF (_prescribed_medicine_id IS NULL OR _qty IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;
-- dissalow non admin to update qty directly without buying product
IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change qty';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

-- get _max_qty_change
SET _max_qty_change = (SELECT MIN(inventory DIV amountInUnit)
						 FROM prescribed_composition A
						 JOIN raw_material B ON A.raw_material_id = B.id
						 WHERE A.prescribed_medicine_id = _prescribed_medicine_id
						 GROUP BY raw_material_id
						 ORDER BY MIN(inventory DIV amountInUnit) ASC LIMIT 1);

-- clamp _qty_change
IF _qty_change >= _max_qty_change THEN
	SET _qty_change = _max_qty_change;
END IF;

-- if _qty_change is 0 query the final result and exit the stored procedure
IF _qty_change = 0 THEN
		SELECT qty FROM prescribed_medicine WHERE id = _prescribed_medicine_id;
    leave this_proc;
END IF;

-- update qty
UPDATE prescribed_medicine
SET qty = qty + _qty_change
WHERE id = _prescribed_medicine_id;

-- update inventory
UPDATE raw_material A
JOIN prescribed_composition B On A.id = B.raw_material_id
SET A.inventory = inventory - amountInUnit * _qty_change
WHERE A.id IN (SELECT raw_material_id FROM prescribed_composition WHERE prescribed_medicine_id = _prescribed_medicine_id)
AND B.prescribed_medicine_id = _prescribed_medicine_id
AND A.id > 0; -- add redundant condition so SQL_SAFE_UPDATES doesn't trigger (id is never negative since it is an auto incrementing primary key)

-- log inventory changes in record with admin_id (id of admin who made the inventory change)
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
SELECT raw_material_id, -1 * amountInUnit *_qty_change, _admin_id -- if qty increase inventory decrease and vice versa
FROM prescribed_composition
WHERE prescribed_medicine_id= _prescribed_medicine_id;

SELECT qty FROM prescribed_medicine WHERE id = _prescribed_medicine_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `handle_update_stock` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_stock`(_product_id INT, _stock INT, _admin_id INT)
this_proc:BEGIN
-- _stock_change is stock increase
DECLARE _error_message VARCHAR(60);
DECLARE _stock_change INT DEFAULT _stock - CAST((SELECT stock FROM product WHERE id = _product_id) AS SIGNED);
DECLARE _max_stock_change INT;
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id) = 'admin';

-- dissalow null parameter
IF (_product_id IS NULL OR _stock IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;
-- dissalow non admin to update stock directly without buying product
IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change stock';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

-- get _max_stock_change
SET _max_stock_change = (SELECT MIN(inventory DIV amountInUnit)
						 FROM product_composition A
						 JOIN raw_material B ON A.raw_material_id = B.id
						 WHERE A.product_id = _product_id
						 GROUP BY raw_material_id
						 ORDER BY MIN(inventory DIV amountInUnit) ASC LIMIT 1);

-- clamp _stock_change
IF _stock_change >= _max_stock_change THEN
	SET _stock_change = _max_stock_change;
END IF;

-- if _stock_change is 0 query the final result and exit the stored procedure
IF _stock_change = 0 THEN
    -- query product composition and inventory
		-- select amountInUnit, materialName, inventory
		-- from product_composition A
		-- join raw_material B on A.raw_material_id = B.id;
		SELECT stock FROM product WHERE id = _product_id;
    
    leave this_proc;
END IF;

-- update stock
UPDATE product
SET stock = stock + _stock_change
WHERE id = _product_id;

-- update inventory
UPDATE raw_material A
JOIN product_composition B On A.id = B.raw_material_id
SET A.inventory = inventory - amountInUnit * _stock_change
WHERE A.id IN (SELECT raw_material_id FROM product_composition WHERE product_id = _product_id)
AND B.product_id = _product_id
AND A.id > 0; -- add redundant condition so SQL_SAFE_UPDATES doesn't trigger (id is never negative since it is an auto incrementing primary key)

-- log inventory changes in record with admin_id (id of admin who made the inventory change)
INSERT INTO raw_material_record(raw_material_id, inventoryChange, admin_id)
SELECT raw_material_id, -1 * amountInUnit *_stock_change, _admin_id -- if stock increase inventory decrease and vice versa
FROM product_composition
WHERE product_id = _product_id;

-- query final result of changed values
-- select amountInUnit, materialName, inventory
-- from product_composition A
-- join raw_material B on A.raw_material_id = B.id;
SELECT stock FROM product WHERE id = _product_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-01-18 15:19:43
