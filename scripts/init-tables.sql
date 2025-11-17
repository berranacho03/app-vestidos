-- Create Categories table
CREATE TABLE IF NOT EXISTS Categories (
  name VARCHAR(31) PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Categories if not exists
INSERT IGNORE INTO Categories (name) VALUES 
('dress'),
('shoes'),
('bag'),
('jacket'),
('uncategorized');

-- Create Items table
CREATE TABLE IF NOT EXISTS Items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pricePerDay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sizes DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  category VARCHAR(16) NOT NULL,
  style VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) NOT NULL,
  color VARCHAR(32) NOT NULL,
  alt VARCHAR(128) NOT NULL,
  images JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category) REFERENCES Categories(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample Items if table is empty
INSERT INTO Items (name, pricePerDay, sizes, category, style, description, color, alt, images)
SELECT * FROM (
  SELECT 'Vestido de prueba' as name, 49.90 as pricePerDay, 0.0 as sizes, 'dress' as category, 'elegant' as style, 'Vestido largo para eventos' as description, 'red' as color, 'Vestido rojo largo' as alt, '["img1.jpg", "img2.jpg"]' as images
  UNION ALL SELECT 'Zapatos de cuero', 29.50, 41.0, 'shoes', 'formal', 'Zapatos negros de cuero', 'black', 'Zapatos formales negros', '["shoe1.jpg", "shoe2.jpg"]'
  UNION ALL SELECT 'Bolso de mano', 19.99, 0.0, 'bag', 'casual', 'Bolso pequeño para uso diario', 'beige', 'Bolso beige con correa', '["bag1.jpg"]'
  UNION ALL SELECT 'Chaqueta de invierno', 39.00, 0.0, 'jacket', 'warm', 'Chaqueta acolchada para frío extremo', 'blue', 'Chaqueta azul acolchada', '["jacket1.jpg", "jacket2.jpg"]'
  UNION ALL SELECT 'Vestido corto', 35.00, 0.0, 'dress', 'summer', 'Vestido corto para clima cálido', 'yellow', 'Vestido amarillo corto', '["dress2.jpg"]'
  UNION ALL SELECT 'Zapatillas deportivas', 25.00, 38.0, 'shoes', 'sport', 'Zapatillas cómodas para correr', 'white', 'Zapatillas blancas deportivas', '["sneaker1.jpg", "sneaker2.jpg"]'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM Items);

-- Create Rentals table
CREATE TABLE IF NOT EXISTS Rentals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  start DATE NOT NULL,
  end DATE NOT NULL,
  customer JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'canceled') DEFAULT 'active',
  FOREIGN KEY (itemId) REFERENCES Items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

