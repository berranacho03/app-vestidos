CREATE DATABASE IF NOT EXISTS rentalDB;
USE rentalDB;


CREATE TABLE IF NOT EXISTS Categories (
  name VARCHAR(31) PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Categories (name) VALUES 
('dress'),
('shoes'),
('bag'),
('jacket');

CREATE TABLE IF NOT EXISTS Items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pricePerDay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sizes DECIMAL(3,1) NOT NULL DEFAULT 0.0, -- For shoes use "36.0-41.0"
  category VARCHAR(16) NOT NULL,
  style VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) NOT NULL,
  color VARCHAR(32) NOT NULL,
  alt VARCHAR(128) NOT NULL,
  images JSON, -- URLs
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category) REFERENCES Categories(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Items (
  name, pricePerDay, sizes, category, style, description, color, alt, images
) VALUES
('Vestido de prueba', 49.90, DEFAULT, 'dress', 'elegant', 'Vestido largo para eventos', 'red', 'Vestido rojo largo', '["img1.jpg", "img2.jpg"]'),
('Zapatos de cuero', 29.50, 41.0, 'shoes', 'formal', 'Zapatos negros de cuero', 'black', 'Zapatos formales negros', '["shoe1.jpg", "shoe2.jpg"]'),
('Bolso de mano', 19.99, DEFAULT, 'bag', 'casual', 'Bolso pequeño para uso diario', 'beige', 'Bolso beige con correa', '["bag1.jpg"]'),
('Chaqueta de invierno', 39.00, DEFAULT, 'jacket', 'warm', 'Chaqueta acolchada para frío extremo', 'blue', 'Chaqueta azul acolchada', '["jacket1.jpg", "jacket2.jpg"]'),
('Vestido corto', 35.00, DEFAULT, 'dress', 'summer', 'Vestido corto para clima cálido', 'yellow', 'Vestido amarillo corto', '["dress2.jpg"]'),
('Zapatillas deportivas', 25.00, 38.0, 'shoes', 'sport', 'Zapatillas cómodas para correr', 'white', 'Zapatillas blancas deportivas', '["sneaker1.jpg", "sneaker2.jpg"]');


CREATE TABLE IF NOT EXISTS Rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  start DATE NOT NULL,
  end DATE NOT NULL,
  customer JSON NOT NULL, -- { name: string; email: string; phone: string }
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'canceled') DEFAULT 'active',

  FOREIGN KEY (itemId) REFERENCES Items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Rentals (
  itemId, start, end, customer, status
) VALUES
(1, '2025-10-01', '2025-10-05', '{"name":"Ana Torres","email":"ana@example.com","phone":"099123456"}', 'active'),
(2, '2025-10-10', '2025-10-12', '{"name":"Luis Pérez","email":"luis@example.com","phone":"098765432"}', 'active'),
(3, '2025-09-20', '2025-09-22', '{"name":"María Gómez","email":"maria@example.com","phone":"091234567"}', 'canceled'),
(4, '2025-10-15', '2025-10-20', '{"name":"Carlos Ruiz","email":"carlos@example.com","phone":"097654321"}', 'active'),
(5, '2025-10-05', '2025-10-06', '{"name":"Lucía Fernández","email":"lucia@example.com","phone":"096543210"}', 'active'),
(6, '2025-10-25', '2025-10-30', '{"name":"Jorge Silva","email":"jorge@example.com","phone":"095432109"}', 'canceled');
