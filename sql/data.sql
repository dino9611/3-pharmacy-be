-- MySQL dump 10.13  Distrib 8.0.26, for Win64 (x86_64)
--
-- Host: localhost    Database: 3_pharmacy
-- ------------------------------------------------------
-- Server version	8.0.26

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (3,'Rhinos SR 10 Kapsul',290,20000,5,'/products/PROD1642417749031.jpg','Meredakan gejala yang berhubungan dengan rinitis alergi misalnya bersin, hidung tersumbat, rinore, pruritus & lakrimasi.',0,'2022-01-17 18:09:09','2022-01-17 14:27:16'),(4,'Tremenza Sirup 60 ml',126,10000,10,'/products/PROD1642418069349.jpg','Obat ini digunakan untuk mengatasi gejala-gejala flu seperti: bersin-bersin, hidung tersumbat, yang disertai batuk tidak berdahak.',0,'2022-01-17 18:14:29','2022-01-17 11:14:29'),(5,'Astria',32,12000,8,'/products/PROD1642418253006.jpg','untuk memelihara kesehatan',0,'2022-01-17 18:17:33','2022-01-17 11:17:49'),(6,'Tremenza 10 Tablet',250,20000,10,'/products/PROD1642418393641.jpg','Tremenza',0,'2022-01-17 18:19:53','2022-01-17 11:19:53'),(7,'Folavit 400 mcg 30 Tablet',9,23000,9,'/products/PROD1642418968673.jpg','untuk pertumbuhan janin',0,'2022-01-17 18:29:28','2022-01-17 11:30:16'),(8,'Topcort Cream 10 g',1500,22000,8,'/products/PROD1642419338394.jpg','meredakan inflamasi',0,'2022-01-17 18:35:38','2022-01-17 11:35:38'),(9,'Paracetamol 500 mg 10 Kaplet',1000,10000,13,'/products/PROD1642426694519.jpg','buat demam',0,'2022-01-17 20:38:14','2022-01-17 13:38:14');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `product_composition` VALUES (17,50,3),(18,600,3),(18,300,4),(18,600,6),(19,15,4),(19,25,6),(20,16,5),(21,0.45,7),(22,25,8),(23,500,9);
/*!40000 ALTER TABLE `product_composition` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `product_has_category` VALUES (3,1),(4,1),(6,1),(9,1),(3,2),(9,2),(5,3),(7,4),(9,4),(3,5),(9,5),(8,6),(4,7),(5,7),(8,7),(7,9);
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_material`
--

LOCK TABLES `raw_material` WRITE;
/*!40000 ALTER TABLE `raw_material` DISABLE KEYS */;
INSERT INTO `raw_material` VALUES (17,'Loratadine',1999750,200000,1,'mg'),(18,'Pseudoephedrine HCL',988000,100000,0.4,'mg'),(19,'Tripolidine HCL',3599600,300000,0.4,'mg'),(20,'Astaxanthin',299872,100000,2,'mg'),(21,'Folic Acid',179996,45000,20,'mg'),(22,'Desoxymetasone',399800,100000,60,'mg'),(23,'Paracetamol',3393500,340000,2,'mg');
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
INSERT INTO `raw_material_record` VALUES (17,2000000,'2022-01-17 18:01:15',2),(18,1000000,'2022-01-17 18:03:47',2),(17,-0,'2022-01-17 18:09:09',2),(18,-0,'2022-01-17 18:09:09',2),(17,-250,'2022-01-17 18:09:09',2),(18,-3000,'2022-01-17 18:09:09',2),(19,3600000,'2022-01-17 18:11:46',2),(18,-0,'2022-01-17 18:14:29',2),(19,-0,'2022-01-17 18:14:29',2),(18,-3000,'2022-01-17 18:14:29',2),(19,-150,'2022-01-17 18:14:29',2),(20,300000,'2022-01-17 18:15:54',2),(20,-0,'2022-01-17 18:17:33',2),(20,-128,'2022-01-17 18:17:33',2),(18,-0,'2022-01-17 18:19:53',2),(19,-0,'2022-01-17 18:19:53',2),(18,-6000,'2022-01-17 18:19:53',2),(19,-250,'2022-01-17 18:19:53',2),(21,180000,'2022-01-17 18:27:55',2),(21,-0,'2022-01-17 18:29:28',2),(21,-4.05,'2022-01-17 18:29:28',2),(22,400000,'2022-01-17 18:32:39',2),(22,-0,'2022-01-17 18:35:38',2),(22,-200,'2022-01-17 18:35:38',2),(23,3400000,'2022-01-17 20:35:54',2),(23,-0,'2022-01-17 20:38:14',2),(23,-6500,'2022-01-17 20:38:14',2),(17,-82300,'2022-01-17 21:26:56',2),(18,-987600,'2022-01-17 21:26:56',2),(17,82300,'2022-01-17 21:27:16',2),(18,987600,'2022-01-17 21:27:16',2);
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
INSERT INTO `table_length` VALUES (1,'product',7);
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-01-18  1:31:31
