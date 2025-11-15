CREATE DATABASE IF NOT EXISTS rentalDB;
USE rentalDB;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  sizes JSON, -- ["S", "M", "L"] or ["36", "37", "38"]
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
('Vestido de prueba', 49.90, '["S", "M", "L"]', 'dress', 'elegant', 'Vestido largo para eventos', 'red', 'Vestido rojo largo', '["img1.jpg", "img2.jpg"]'),
('Zapatos de cuero', 29.50, '["39", "40", "41"]', 'shoes', 'formal', 'Zapatos negros de cuero', 'black', 'Zapatos formales negros', '["shoe1.jpg", "shoe2.jpg"]'),
('Bolso de mano', 19.99, '["Único"]', 'bag', 'casual', 'Bolso pequeño para uso diario', 'beige', 'Bolso beige con correa', '["bag1.jpg"]'),
('Chaqueta de invierno', 39.00, '["S", "M", "L", "XL"]', 'jacket', 'warm', 'Chaqueta acolchada para frío extremo', 'blue', 'Chaqueta azul acolchada', '["jacket1.jpg", "jacket2.jpg"]'),
('Vestido corto', 35.00, '["XS", "S", "M"]', 'dress', 'summer', 'Vestido corto para clima cálido', 'yellow', 'Vestido amarillo corto', '["dress2.jpg"]'),
('Zapatillas deportivas', 25.00, '["36", "37", "38", "39"]', 'shoes', 'sport', 'Zapatillas cómodas para correr', 'white', 'Zapatillas blancas deportivas', '["sneaker1.jpg", "sneaker2.jpg"]');


CREATE TABLE IF NOT EXISTS Rentals (
  id VARCHAR(36) PRIMARY KEY, -- UUID
  itemId INT NOT NULL,
  start DATE NOT NULL,
  end DATE NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerEmail VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(32) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'canceled') DEFAULT 'active',

  FOREIGN KEY (itemId) REFERENCES Items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear usuario de ejemplo para pruebas
-- Contraseña: "password123" (hash bcrypt)
INSERT INTO Users (email, password_hash, name, phone) VALUES
('user@example.com', '$2a$10$K8gYz8QwZJ8qZ5Zj0ZJ0ZeZJ0ZJ0ZJ0ZJ0ZJ0ZJ0ZJ0ZJ0ZJ0ZJ0Z', 'Usuario Demo', '099123456');

INSERT INTO Rentals (
  id, itemId, start, end, customerName, customerEmail, customerPhone, status
) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, '2025-11-20', '2025-11-22', 'María García', 'maria@example.com', '099111111', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 2, '2025-11-25', '2025-11-27', 'Juan Pérez', 'juan@example.com', '099222222', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 3, '2025-12-01', '2025-12-03', 'Ana López', 'ana@example.com', '099333333', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 1, '2025-12-10', '2025-12-12', 'Carlos Silva', 'carlos@example.com', '099444444', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 4, '2025-12-15', '2025-12-18', 'Laura Torres', 'laura@example.com', '099555555', 'canceled');
