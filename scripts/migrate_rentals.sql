-- Migración para actualizar la tabla Rentals : Si ya lo tenemos levantado, correr: 

-- docker cp scripts/migrate_rentals.sql appvestidos-db:/tmp/migrate_rentals.sql
-- docker exec appvestidos-db mysql -u appuser -psecretpassword rentalDB -e "source /tmp/migrate_rentals.sql"

USE rentalDB;

-- Primero, renombrar la tabla actual si existe
DROP TABLE IF EXISTS Rentals_old;
CREATE TABLE Rentals_old AS SELECT * FROM Rentals;

-- Eliminar la tabla antigua
DROP TABLE IF EXISTS Rentals;

-- Crear la nueva estructura de la tabla Rentals
CREATE TABLE Rentals (
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

-- Insertar datos de ejemplo
INSERT INTO Rentals (
  id, itemId, start, end, customerName, customerEmail, customerPhone, status
) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, '2025-11-20', '2025-11-22', 'María García', 'maria@example.com', '099111111', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 2, '2025-11-25', '2025-11-27', 'Juan Pérez', 'juan@example.com', '099222222', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 3, '2025-12-01', '2025-12-03', 'Ana López', 'ana@example.com', '099333333', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 1, '2025-12-10', '2025-12-12', 'Carlos Silva', 'carlos@example.com', '099444444', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 4, '2025-12-15', '2025-12-18', 'Laura Torres', 'laura@example.com', '099555555', 'canceled');