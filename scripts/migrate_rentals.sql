-- Migración para actualizar la tabla Rentals con el nuevo estado 'pending'

-- Para aplicar esta migración, ejecuta:
-- docker cp scripts/migrate_rentals.sql appvestidos-db:/tmp/migrate_rentals.sql
-- docker exec appvestidos-db mysql -u appuser -psecretpassword rentalDB -e "source /tmp/migrate_rentals.sql"

USE rentalDB;

-- Modificar la columna status para incluir 'pending'
ALTER TABLE Rentals 
MODIFY COLUMN status ENUM('pending', 'active', 'canceled') DEFAULT 'pending';