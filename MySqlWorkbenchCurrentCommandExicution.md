# MySQL Workbench Command Execution

This file contains a series of SQL commands for setting up and managing the LaundryOla database.

## Database Initialization

```sql
-- Switch to the target database
SHOW DATABASES;
USE defaultdb;
```

## Table Creation

### 1. Users Table

This table serves as the base for all user roles in the system.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('customer','admin','delivery','employee') NOT NULL,
    address TEXT NOT NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Customer IDs Table

```sql
CREATE TABLE customer_ids (
    user_id INT PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE NOT NULL,
    membership_level ENUM('basic','premium','vip') DEFAULT 'basic',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Employee IDs Table

```sql
CREATE TABLE employee_ids (
    user_id INT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Agent IDs Table

```sql
CREATE TABLE agent_ids (
    user_id INT PRIMARY KEY,
    agent_id VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    license_number VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Services Table

```sql
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    min_order_quantity DECIMAL(8,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6. Orders Table

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    special_instructions TEXT,
    status ENUM('Pending','Confirmed','In Progress','Ready for Delivery','Out for Delivery','Delivered','Canceled') DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_agent_id INT,
    payment_status ENUM('Pending','Paid','Refunded') DEFAULT 'Pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    canceled_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_ids(user_id),
    FOREIGN KEY (delivery_agent_id) REFERENCES agent_ids(user_id)
);
```

### 7. Order Items Table

```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    unit_price DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    item_total DECIMAL(10,2) NOT NULL,
    status ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);
```

## ID Generation

### Sequence Table

```sql
CREATE TABLE IF NOT EXISTS id_sequences (
    prefix VARCHAR(10) PRIMARY KEY,
    next_val INT NOT NULL DEFAULT 1,
    last_reset_date DATE DEFAULT CURRENT_DATE
);
```

### Sequence Initialization

```sql
INSERT IGNORE INTO id_sequences (prefix) VALUES
('CUST'), ('EMP'), ('AGNT'), ('ORD');
```

## Triggers

### Customer ID Trigger

```sql
DELIMITER //
CREATE TRIGGER before_customer_insert
BEFORE INSERT ON customer_ids
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    SELECT next_val INTO next_num FROM id_sequences WHERE prefix = 'CUST';
    SET NEW.customer_id = CONCAT('CUST-', LPAD(next_num, 6, '0'));
    UPDATE id_sequences SET next_val = next_val + 1 WHERE prefix = 'CUST';
END//
DELIMITER ;
```

### Employee ID Trigger

```sql
DELIMITER //
CREATE TRIGGER before_employee_insert
BEFORE INSERT ON employee_ids
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    SELECT next_val INTO next_num FROM id_sequences WHERE prefix = 'EMP';
    SET NEW.employee_id = CONCAT('EMP-', LPAD(next_num, 4, '0'));
    UPDATE id_sequences SET next_val = next_val + 1 WHERE prefix = 'EMP';
END//
DELIMITER ;
```

### Delivery Agent ID Trigger

```sql
DELIMITER //
CREATE TRIGGER before_agent_insert
BEFORE INSERT ON agent_ids
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    SELECT next_val INTO next_num FROM id_sequences WHERE prefix = 'AGNT';
    SET NEW.agent_id = CONCAT('AGNT-', LPAD(next_num, 4, '0'));
    UPDATE id_sequences SET next_val = next_val + 1 WHERE prefix = 'AGNT';
END//
DELIMITER ;
```

### Order ID Trigger

```sql
DELIMITER //
CREATE TRIGGER before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    DECLARE date_part VARCHAR(8);
    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d');
    SELECT next_val INTO next_num FROM id_sequences WHERE prefix = 'ORD';
    SET NEW.order_id = CONCAT('ORD-', date_part, '-', LPAD(next_num, 4, '0'));
    UPDATE id_sequences SET next_val = next_val + 1 WHERE prefix = 'ORD';
END//
DELIMITER ;
```

## Data Insertion and Verification

### Sample Services

```sql
INSERT INTO services (service_code, name, description, price, unit, duration, category, is_active) VALUES
('WASH-01', 'Regular Wash', 'Basic washing with standard detergent', 3.50, 'kg', '24h', 'Washing', 1),
('WASH-02', 'Delicate Wash', 'Gentle cycle for delicate fabrics', 5.00, 'kg', '24h', 'Washing', 1),
('DRY-01', 'Tumble Dry', 'Standard machine drying', 2.50, 'kg', '12h', 'Drying', 1),
('DRY-02', 'Air Dry', 'Natural drying on racks', 1.50, 'kg', '48h', 'Drying', 1),
('PRESS-01', 'Shirt Pressing', 'Professional ironing of shirts', 2.00, 'piece', '24h', 'Pressing', 1),
('PRESS-02', 'Pants Pressing', 'Professional ironing of trousers', 2.50, 'piece', '24h', 'Pressing', 1),
('SPEC-01', 'Dry Cleaning - Suit', 'Professional dry cleaning for suits', 12.00, 'piece', '48h', 'Dry Cleaning', 1),
('SPEC-02', 'Dry Cleaning - Dress', 'Professional dry cleaning for dresses', 10.00, 'piece', '48h', 'Dry Cleaning', 1),
('ADD-01', 'Stain Removal', 'Special treatment for tough stains', 4.00, 'item', '24h', 'Additional', 1),
('ADD-02', 'Fabric Softener', 'Premium fabric softener treatment', 1.50, 'load', '24h', 'Additional', 1);
```

### Table Inspection

```sql
-- Show all tables
SHOW TABLES;

-- Describe table structures
DESCRIBE users;
DESCRIBE customer_ids;
DESCRIBE employee_ids;
DESCRIBE agent_ids;
DESCRIBE services;
DESCRIBE orders;
DESCRIBE order_items;
```

### Data Verification

```sql
-- Check current data in ID tables
SELECT * FROM agent_ids;
SELECT * FROM customer_ids;
SELECT * FROM employee_ids;
SELECT * FROM users;
```