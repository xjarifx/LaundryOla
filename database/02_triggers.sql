-- This script creates the necessary components for automatic public ID generation.

-- 1. The helper table to store the next available ID number for each type.
CREATE TABLE sequences (
    name VARCHAR(20) PRIMARY KEY,
    next_value INT NOT NULL DEFAULT 1001
);

-- 2. Initialize the sequences for users and orders. We start at 1001 for a more professional look.
INSERT INTO sequences (name) VALUES ('user'), ('order');


-- 3. Trigger for the 'users' table
DELIMITER //
CREATE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT next_value INTO next_id FROM sequences WHERE name = 'user';
    SET NEW.public_id = CONCAT('USR-', next_id);
    UPDATE sequences SET next_value = next_value + 1 WHERE name = 'user';
END//
DELIMITER ;


-- 4. Trigger for the 'orders' table
DELIMITER //
CREATE TRIGGER orders_before_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT next_value INTO next_id FROM sequences WHERE name = 'order';
    SET NEW.public_id = CONCAT('ORD-', next_id);
    UPDATE sequences SET next_value = next_value + 1 WHERE name = 'order';
END//
DELIMITER ;
