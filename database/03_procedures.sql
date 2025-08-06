-- This script contains stored procedures for database operations.

-- Stored Procedure: sp_register_user
-- Handles the registration of a new user, including their role-specific profile.
-- Ensures atomicity using a transaction.
DELIMITER //

CREATE PROCEDURE sp_register_user(
    IN p_full_name VARCHAR(150),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_phone_number VARCHAR(25),
    IN p_address TEXT,
    IN p_role ENUM('customer', 'operations_staff', 'courier', 'admin'),
    -- Optional parameters for role-specific attributes
    IN p_loyalty_points INT DEFAULT 0,
    IN p_preferred_communication ENUM('email', 'sms') DEFAULT 'email',
    IN p_default_instructions TEXT,
    IN p_permission_level INT DEFAULT 1,
    IN p_department VARCHAR(100),
    IN p_internal_notes TEXT,
    IN p_vehicle_id VARCHAR(50),
    IN p_transport_mode ENUM('motorcycle', 'van', 'bicycle'),
    IN p_availability_status ENUM('available', 'on_delivery', 'offline'),
    IN p_average_rating DECIMAL(3, 2)
)
BEGIN
    DECLARE new_user_id INT;

    -- Start a transaction to ensure atomicity
    START TRANSACTION;

    -- 1. Insert into the main users table
    INSERT INTO users (full_name, email, password_hash, phone_number, address, role)
    VALUES (p_full_name, p_email, p_password_hash, p_phone_number, p_address, p_role);

    -- Get the ID of the newly inserted user
    SET new_user_id = LAST_INSERT_ID();

    -- 2. Insert into the appropriate role-specific table
    IF p_role = 'customer' THEN
        INSERT INTO customers (user_id, loyalty_points, preferred_communication, default_instructions)
        VALUES (new_user_id, p_loyalty_points, p_preferred_communication, p_default_instructions);
    ELSEIF p_role = 'operations_staff' THEN
        INSERT INTO operations_staff (user_id, permission_level, department, internal_notes)
        VALUES (new_user_id, p_permission_level, p_department, p_internal_notes);
    ELSEIF p_role = 'courier' THEN
        INSERT INTO couriers (user_id, vehicle_id, transport_mode, availability_status, average_rating)
        VALUES (new_user_id, p_vehicle_id, p_transport_mode, p_availability_status, p_average_rating);
    -- No specific profile table for 'admin' in our current schema, so no action needed here.
    END IF;

    -- Commit the transaction if all inserts are successful
    COMMIT;

END //

DELIMITER ;

-- Stored Procedure: sp_create_order
-- Handles the creation of a new order and its line items within a single transaction.
DELIMITER //

CREATE PROCEDURE sp_create_order(
    IN p_customer_id INT,
    IN p_pickup_address TEXT,
    IN p_delivery_address TEXT,
    IN p_special_instructions TEXT,
    IN p_pickup_scheduled_for TIMESTAMP,
    IN p_delivery_scheduled_for TIMESTAMP,
    IN p_order_items_json JSON -- A JSON array of objects, e.g., [{"service_id": 1, "quantity": 2}, {"service_id": 3, "quantity": 1}]
)
BEGIN
    DECLARE new_order_id INT;
    DECLARE total_order_amount DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE item_count INT DEFAULT 0;
    DECLARE i INT DEFAULT 0;

    -- Variables for parsing JSON items
    DECLARE v_service_id INT;
    DECLARE v_quantity INT;
    DECLARE v_service_price DECIMAL(10, 2);
    DECLARE v_service_name VARCHAR(255);
    DECLARE v_service_unit ENUM('piece', 'kg', 'load', 'item');
    DECLARE v_sub_total DECIMAL(10, 2);

    -- Start a transaction to ensure atomicity
    START TRANSACTION;

    -- 1. Insert the main order record
    INSERT INTO orders (customer_id, pickup_address, delivery_address, special_instructions, status, total_amount, pickup_scheduled_for, delivery_scheduled_for)
    VALUES (p_customer_id, p_pickup_address, p_delivery_address, p_special_instructions, 'Pending', 0.00, p_pickup_scheduled_for, p_delivery_scheduled_for);

    -- Get the ID of the newly inserted order
    SET new_order_id = LAST_INSERT_ID();

    -- 2. Process each item in the JSON array and insert into order_details
    SET item_count = JSON_LENGTH(p_order_items_json);
    WHILE i < item_count DO
        SET v_service_id = JSON_UNQUOTE(JSON_EXTRACT(p_order_items_json, CONCAT('$[', i, '].service_id')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_order_items_json, CONCAT('$[', i, '].quantity')));

        -- Retrieve service details (name, price, unit) from the services table
        SELECT name, price, unit INTO v_service_name, v_service_price, v_service_unit
        FROM services
        WHERE id = v_service_id;

        -- Calculate sub_total for the current item
        SET v_sub_total = v_quantity * v_service_price;

        -- Insert into order_details
        INSERT INTO order_details (order_id, service_id, quantity, price_per_unit, sub_total)
        VALUES (new_order_id, v_service_id, v_quantity, v_service_price, v_sub_total);

        -- Add to the total order amount
        SET total_order_amount = total_order_amount + v_sub_total;

        SET i = i + 1;
    END WHILE;

    -- 3. Update the total_amount in the main orders record
    UPDATE orders
    SET total_amount = total_order_amount
    WHERE id = new_order_id;

    -- Commit the transaction if all operations are successful
    COMMIT;

END //

DELIMITER ;