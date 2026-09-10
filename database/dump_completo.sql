-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: biblioteca
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `biblioteca`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `biblioteca` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `biblioteca`;

--
-- Table structure for table `detalle_prestamo`
--

DROP TABLE IF EXISTS `detalle_prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_prestamo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prestamo_id` int NOT NULL,
  `libro_id` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `prestamo_id` (`prestamo_id`),
  KEY `libro_id` (`libro_id`),
  CONSTRAINT `detalle_prestamo_ibfk_1` FOREIGN KEY (`prestamo_id`) REFERENCES `prestamo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `detalle_prestamo_ibfk_2` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_prestamo`
--

LOCK TABLES `detalle_prestamo` WRITE;
/*!40000 ALTER TABLE `detalle_prestamo` DISABLE KEYS */;
INSERT INTO `detalle_prestamo` VALUES (1,1,4,1),(2,6,4,1),(4,4,4,2),(5,2,4,1),(6,3,4,1),(7,5,4,1);
/*!40000 ALTER TABLE `detalle_prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libros`
--

DROP TABLE IF EXISTS `libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isbn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `editorial` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anio_publicacion` smallint DEFAULT NULL,
  `genero` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad_disponible` int NOT NULL DEFAULT '1',
  `portada` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libros`
--

LOCK TABLES `libros` WRITE;
/*!40000 ALTER TABLE `libros` DISABLE KEYS */;
INSERT INTO `libros` VALUES (1,'Cien Años de Soledad','Gabriel García Márquez','978-0060883287','Sudamericana',1967,'Realismo mágico',5,'https://covers.openlibrary.org/b/isbn/978-0060883287-L.jpg'),(2,'Don Quijote de la Mancha','Miguel de Cervantes','978-8420412146','Juan de la Cuesta',1605,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-8420412146-L.jpg'),(3,'El Principito','Antoine de Saint-Exupéry','978-0156012195','Reynal & Hitchcock',1943,'Fábula',7,'https://covers.openlibrary.org/b/isbn/978-0156012195-L.jpg'),(4,'1984','George Orwell','978-0451524935','Signet Classic',1949,'Distopia',6,'https://covers.openlibrary.org/b/isbn/978-0451524935-L.jpg'),(5,'Crimen y castigo','Fiodor Dostoievski','978-0143058144','Penguin Classics',1866,'Clasico',4,'https://covers.openlibrary.org/b/isbn/978-0143058144-L.jpg'),(6,'Orgullo y prejuicio','Jane Austen','978-0141439518','Penguin Classics',1813,'Romance',5,'https://covers.openlibrary.org/b/isbn/978-0141439518-L.jpg'),(7,'El Hobbit','J.R.R. Tolkien','978-0547928227','Mariner Books',1937,'Fantasia',3,'https://covers.openlibrary.org/b/isbn/978-0547928227-L.jpg'),(8,'La Metamorfosis','Franz Kafka','978-0553213690','Bantam Classics',1915,'Realismo',4,'https://covers.openlibrary.org/b/isbn/978-0553213690-L.jpg'),(9,'Rayuela','Julio Cortazar','978-8437604573','Catedra',1963,'Novela',4,'https://covers.openlibrary.org/b/isbn/978-8437604573-L.jpg'),(10,'Libro de prueba','Autor X','978-0-00-000001-1','Prueba',2024,'Prueba',3,NULL),(11,'El gran Gatsby','F. Scott Fitzgerald','978-0743273565','Biblioteca',1925,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-0743273565-L.jpg'),(12,'Matar a un ruiseñor','Harper Lee','978-0446310789','Biblioteca',1960,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-0446310789-L.jpg'),(13,'El viejo y el mar','Ernest Hemingway','978-0684801223','Biblioteca',1952,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-0684801223-L.jpg'),(14,'La insoportable levedad del ser','Milan Kundera','978-0060932138','Biblioteca',1984,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-0060932138-L.jpg'),(15,'Guerra y paz','León Tolstói','978-1400079988','Biblioteca',1869,'Novela',3,'https://covers.openlibrary.org/b/isbn/978-1400079988-L.jpg'),(16,'Fahrenheit 451','Ray Bradbury','978-1451673319','Biblioteca',1953,'Distopía',3,'https://covers.openlibrary.org/b/isbn/978-1451673319-L.jpg'),(17,'El cuento de la criada','Margaret Atwood','978-0385490818','Biblioteca',1985,'Distopía',3,'https://covers.openlibrary.org/b/isbn/978-0385490818-L.jpg'),(18,'Matadero cinco','Kurt Vonnegut','978-0385333849','Biblioteca',1969,'Distopía',3,'https://covers.openlibrary.org/b/isbn/978-0385333849-L.jpg'),(19,'La Comunidad del Anillo','J.R.R. Tolkien','978-0618640157','Biblioteca',1954,'Fantasía',3,'https://covers.openlibrary.org/b/isbn/978-0618640157-L.jpg'),(20,'Harry Potter y la piedra filosofal','J.K. Rowling','978-0439064873','Biblioteca',1997,'Fantasía',3,'https://covers.openlibrary.org/b/isbn/978-0439064873-L.jpg'),(21,'Los juegos del hambre','Suzanne Collins','978-0439023481','Biblioteca',2008,'Fantasía',3,'https://covers.openlibrary.org/b/isbn/978-0439023481-L.jpg'),(22,'El león, la bruja y el armario','C.S. Lewis','978-0060764890','Biblioteca',1950,'Fantasía',3,'https://covers.openlibrary.org/b/isbn/978-0060764890-L.jpg'),(23,'Fábulas de Esopo','Esopo','978-0140446494','Biblioteca',-560,'Fábula',3,'https://covers.openlibrary.org/b/isbn/978-0140446494-L.jpg'),(24,'Alicia en el país de las maravillas','Lewis Carroll','978-0141439761','Biblioteca',1865,'Fábula',3,'https://covers.openlibrary.org/b/isbn/978-0141439761-L.jpg'),(25,'El maravilloso mago de Oz','L. Frank Baum','978-0142417515','Biblioteca',1900,'Fábula',3,'https://covers.openlibrary.org/b/isbn/978-0142417515-L.jpg'),(26,'Peter Pan','J.M. Barrie','978-0142400982','Biblioteca',1911,'Fábula',3,'https://covers.openlibrary.org/b/isbn/978-0142400982-L.jpg'),(27,'Cumbres borrascosas','Emily Brontë','978-0141439556','Biblioteca',1847,'Romance',3,'https://covers.openlibrary.org/b/isbn/978-0141439556-L.jpg'),(28,'Romeo y Julieta','William Shakespeare','978-0743477116','Biblioteca',1597,'Romance',3,'https://covers.openlibrary.org/b/isbn/978-0743477116-L.jpg'),(29,'Persuasión','Jane Austen','978-0141439686','Biblioteca',1817,'Romance',3,'https://covers.openlibrary.org/b/isbn/978-0141439686-L.jpg'),(30,'Sentido y sensibilidad','Jane Austen','978-0141439662','Biblioteca',1811,'Romance',3,'https://covers.openlibrary.org/b/isbn/978-0141439662-L.jpg'),(31,'El retrato de Dorian Gray','Oscar Wilde','978-0141439570','Biblioteca',1890,'Clásico',3,'https://covers.openlibrary.org/b/isbn/978-0141439570-L.jpg'),(32,'Anna Karenina','León Tolstói','978-0143035008','Biblioteca',1878,'Clásico',3,'https://covers.openlibrary.org/b/isbn/978-0143035008-L.jpg'),(33,'Los hermanos Karamazov','Fiódor Dostoievski','978-0374528379','Biblioteca',1880,'Clásico',3,'https://covers.openlibrary.org/b/isbn/978-0374528379-L.jpg'),(34,'Middlemarch','George Eliot','978-0141439549','Biblioteca',1871,'Clásico',3,'https://covers.openlibrary.org/b/isbn/978-0141439549-L.jpg'),(35,'El lobo estepario','Hermann Hesse','978-0312278670','Biblioteca',1927,'Realismo',3,'https://covers.openlibrary.org/b/isbn/978-0312278670-L.jpg'),(36,'Madame Bovary','Gustave Flaubert','978-0199535651','Biblioteca',1856,'Realismo',3,'https://covers.openlibrary.org/b/isbn/978-0199535651-L.jpg'),(37,'Fiesta (El sol también se levanta)','Ernest Hemingway','978-0143059165','Biblioteca',1926,'Realismo',3,'https://covers.openlibrary.org/b/isbn/978-0143059165-L.jpg'),(38,'Al faro','Virginia Woolf','978-0141187761','Biblioteca',1927,'Realismo',3,'https://covers.openlibrary.org/b/isbn/978-0141187761-L.jpg'),(39,'El amor en los tiempos del cólera','Gabriel García Márquez','978-0679783268','Biblioteca',1985,'Realismo Mágico',3,'https://covers.openlibrary.org/b/isbn/978-0679783268-L.jpg'),(40,'Crónica de una muerte anunciada','Gabriel García Márquez','978-1400034956','Biblioteca',1981,'Realismo Mágico',3,'https://covers.openlibrary.org/b/isbn/978-1400034956-L.jpg'),(41,'Como agua para chocolate','Laura Esquivel','978-0307474520','Biblioteca',1989,'Realismo Mágico',3,'https://covers.openlibrary.org/b/isbn/978-0307474520-L.jpg'),(42,'La casa de los espíritus','Isabel Allende','978-0060914110','Biblioteca',1982,'Realismo Mágico',3,'https://covers.openlibrary.org/b/isbn/978-0060914110-L.jpg'),(43,'El código Da Vinci','Dan Brown','978-0307474278','Biblioteca',2003,'Misterio',3,'https://covers.openlibrary.org/b/isbn/978-0307474278-L.jpg'),(44,'Las aventuras de Sherlock Holmes','Arthur Conan Doyle','978-0140439083','Biblioteca',1892,'Misterio',3,'https://covers.openlibrary.org/b/isbn/978-0140439083-L.jpg'),(45,'Y no quedó ninguno','Agatha Christie','978-0062073488','Biblioteca',1939,'Misterio',3,'https://covers.openlibrary.org/b/isbn/978-0062073488-L.jpg'),(46,'Asesinato en el Orient Express','Agatha Christie','978-0062073495','Biblioteca',1934,'Misterio',3,'https://covers.openlibrary.org/b/isbn/978-0062073495-L.jpg'),(47,'La isla del tesoro','Robert L. Stevenson','978-0141321004','Biblioteca',1883,'Aventura',3,'https://covers.openlibrary.org/b/isbn/978-0141321004-L.jpg'),(48,'Viaje al centro de la Tierra','Jules Verne','978-0141439914','Biblioteca',1864,'Aventura',3,'https://covers.openlibrary.org/b/isbn/978-0141439914-L.jpg'),(49,'El corazón de las tinieblas','Joseph Conrad','978-0141441672','Biblioteca',1899,'Aventura',3,'https://covers.openlibrary.org/b/isbn/978-0141441672-L.jpg'),(50,'La vuelta al mundo en 80 días','Jules Verne','978-0141439990','Biblioteca',1873,'Aventura',3,'https://covers.openlibrary.org/b/isbn/978-0141439990-L.jpg'),(51,'La Ilíada','Homero','978-0140275360','Biblioteca',-750,'Épica',3,'https://covers.openlibrary.org/b/isbn/978-0140275360-L.jpg'),(52,'Beowulf','Anónimo','978-0140449310','Biblioteca',700,'Épica',3,'https://covers.openlibrary.org/b/isbn/978-0140449310-L.jpg'),(53,'La Eneida','Virgilio','978-0140449525','Biblioteca',-19,'Épica',3,'https://covers.openlibrary.org/b/isbn/978-0140449525-L.jpg'),(54,'Gargantúa y Pantagruel','François Rabelais','978-0140440263','Biblioteca',1534,'Épica',3,'https://covers.openlibrary.org/b/isbn/978-0140440263-L.jpg'),(55,'Dune','Frank Herbert','978-0441172719','Biblioteca',1965,'Ciencia Ficción',3,'https://covers.openlibrary.org/b/isbn/978-0441172719-L.jpg'),(56,'Fundación','Isaac Asimov','978-0553293357','Biblioteca',1951,'Ciencia Ficción',3,'https://covers.openlibrary.org/b/isbn/978-0553293357-L.jpg'),(57,'Neuromante','William Gibson','978-0441569595','Biblioteca',1984,'Ciencia Ficción',3,'https://covers.openlibrary.org/b/isbn/978-0441569595-L.jpg'),(58,'Hyperion','Dan Simmons','978-0345453747','Biblioteca',1989,'Ciencia Ficción',3,'https://covers.openlibrary.org/b/isbn/978-0345453747-L.jpg'),(59,'Drácula','Bram Stoker','978-0141439846','Biblioteca',1897,'Terror',3,'https://covers.openlibrary.org/b/isbn/978-0141439846-L.jpg'),(60,'Frankenstein','Mary Shelley','978-0141439471','Biblioteca',1818,'Terror',3,'https://covers.openlibrary.org/b/isbn/978-0141439471-L.jpg'),(61,'El resplandor','Stephen King','978-1501142970','Biblioteca',1977,'Terror',3,'https://covers.openlibrary.org/b/isbn/978-1501142970-L.jpg'),(62,'Carrie','Stephen King','978-0307743664','Biblioteca',1974,'Terror',3,'https://covers.openlibrary.org/b/isbn/978-0307743664-L.jpg'),(63,'La chica del tren','Paula Hawkins','978-1594634024','Biblioteca',2015,'Thriller',3,'https://covers.openlibrary.org/b/isbn/978-1594634024-L.jpg'),(64,'El silencio de los corderos','Thomas Harris','978-0312924584','Biblioteca',1988,'Thriller',3,'https://covers.openlibrary.org/b/isbn/978-0312924584-L.jpg'),(65,'La verdad sobre el caso Harry Quebert','Joël Dicker','978-1250067050','Biblioteca',2012,'Thriller',3,'https://covers.openlibrary.org/b/isbn/978-1250067050-L.jpg'),(66,'Perdida','Gillian Flynn','978-0307588364','Biblioteca',2012,'Thriller',3,'https://covers.openlibrary.org/b/isbn/978-0307588364-L.jpg');
/*!40000 ALTER TABLE `libros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamo`
--

DROP TABLE IF EXISTS `prestamo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `fecha_prestamo` date NOT NULL,
  `fecha_devolucion` date NOT NULL,
  `estado` enum('activo','devuelto','vencido','pendiente') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `prestamo_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamo`
--

LOCK TABLES `prestamo` WRITE;
/*!40000 ALTER TABLE `prestamo` DISABLE KEYS */;
INSERT INTO `prestamo` VALUES (1,1,'2026-08-20','2026-09-03','devuelto'),(2,1,'2026-09-01','2026-07-31','activo'),(3,1,'2026-09-07','2026-09-21','activo'),(4,2,'2026-09-09','2026-09-23','pendiente'),(5,2,'2026-09-04','2026-09-18','activo'),(6,3,'2026-08-10','2026-08-24','devuelto');
/*!40000 ALTER TABLE `prestamo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resena`
--

DROP TABLE IF EXISTS `resena`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resena` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libro_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `calificacion` tinyint NOT NULL DEFAULT '5',
  `comentario` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `publico_recomendado` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'todo',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_resena_libro` (`libro_id`),
  KEY `idx_resena_recientes` (`fecha_creacion`),
  CONSTRAINT `resena_ibfk_1` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `resena_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_resena_calificacion` CHECK ((`calificacion` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resena`
--

LOCK TABLES `resena` WRITE;
/*!40000 ALTER TABLE `resena` DISABLE KEYS */;
INSERT INTO `resena` VALUES (1,1,1,5,'Una obra maestra que todos deberían leer al menos una vez. La prosa es hermosa y las historias te acompañan mucho después de cerrar el libro.','todo','2026-08-28 03:47:05'),(2,3,2,4,'Perfecto para leer en voz alta con niños pequeños. Las ilustraciones que imaginé en mi cabeza fueron maravillosas.','ninos','2026-08-31 03:47:05'),(3,4,3,5,'Distopía imprescindible. Da mucho que pensar sobre la vigilancia y la libertad. Ideal para jóvenes que se inician en la ciencia ficción.','jovenes','2026-09-03 03:47:05'),(4,7,1,5,'Una aventura fascinante que despierta la imaginación de chicos y grandes. Lectura ligera y muy entretenida.','todo','2026-09-06 03:47:05');
/*!40000 ALTER TABLE `resena` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resena_like`
--

DROP TABLE IF EXISTS `resena_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resena_like` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resena_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resena_like` (`resena_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `resena_like_ibfk_1` FOREIGN KEY (`resena_id`) REFERENCES `resena` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `resena_like_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resena_like`
--

LOCK TABLES `resena_like` WRITE;
/*!40000 ALTER TABLE `resena_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `resena_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugerencia`
--

DROP TABLE IF EXISTS `sugerencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugerencia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('revision','aprobado','en_biblioteca') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'revision',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_sugerencia_recientes` (`fecha_creacion`),
  CONSTRAINT `sugerencia_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugerencia`
--

LOCK TABLES `sugerencia` WRITE;
/*!40000 ALTER TABLE `sugerencia` DISABLE KEYS */;
INSERT INTO `sugerencia` VALUES (1,1,'La casa de los espíritus','Isabel Allende','Realismo mágico','Mi abuela lo leía siempre y me encantaría poder compartirlo con ella en la biblioteca.','aprobado','2026-08-25 03:47:05'),(2,2,'Dune','Frank Herbert','Ciencia ficción','A mis hijos les encantaría descubrir esta saga clásica en papel.','revision','2026-09-01 03:47:05'),(3,3,'El principito explicado a los abuelos','Anónimo','Juvenil','Seria una gran idea tener una edición de lectura fácil para el club de adultos mayores.','en_biblioteca','2026-09-07 03:47:05');
/*!40000 ALTER TABLE `sugerencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugerencia_voto`
--

DROP TABLE IF EXISTS `sugerencia_voto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugerencia_voto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sugerencia_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sugerencia_voto` (`sugerencia_id`,`usuario_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `sugerencia_voto_ibfk_1` FOREIGN KEY (`sugerencia_id`) REFERENCES `sugerencia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sugerencia_voto_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugerencia_voto`
--

LOCK TABLES `sugerencia_voto` WRITE;
/*!40000 ALTER TABLE `sugerencia_voto` DISABLE KEYS */;
INSERT INTO `sugerencia_voto` VALUES (1,1,2,'2026-09-09 03:47:05'),(2,1,3,'2026-09-09 03:47:05'),(3,2,1,'2026-09-09 03:47:05');
/*!40000 ALTER TABLE `sugerencia_voto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','user','bibliotecario') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Juan Pérez','juan@email.com','555-0101','Calle Mayor 1','$2b$10$0sutxwioMpQwi4UvqoqrfeZh9NbNGn6/x5SUypbLwZNMCIBNKBYCu','user','2026-08-29 21:14:51'),(2,'María García','maria@email.com','555-0102','Avenida Libertad 22','$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO','user','2026-08-29 21:14:51'),(3,'Carlos López','carlos@email.com','555-0103','Plaza España 5','$2b$10$guYrDLvqpcTlRryiaJywK.JTxrFozPJPJkSSMuwPBjvr6rXVHI3bO','user','2026-08-29 21:14:51'),(4,'Administrador','admin@biblioteca.com',NULL,NULL,'$2b$10$qUv0RxdlD6gpt/MjZA.kjuCUTxmN0Cnv7msSPyQnCcqHLo2VeD35S','admin','2026-08-29 21:14:57');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'biblioteca'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-09  6:03:11
