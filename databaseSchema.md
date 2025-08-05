# Database design guidelines
[Database Re-Design Reference](https://neon-cut-6bf.notion.site/Database-Re-Design-246e526928ab80f5a373d3c0103191d3)

## New Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer','admin','delivery') NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Customer IDs Table
```sql
CREATE TABLE customer_ids (
    user_id INT PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Employee IDs Table
```sql
CREATE TABLE employee_ids (
    user_id INT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4. Agent IDs Table
```sql
CREATE TABLE agent_ids (
    user_id INT PRIMARY KEY,
    agent_id VARCHAR(20) UNIQUE NOT NULL,
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
    duration VARCHAR(50),
    category VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
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
    pickup_time VARCHAR(20) NOT NULL,
    delivery_date DATE,
    special_instructions TEXT,
    status ENUM('Pending','In Progress','Ready for Delivery','Completed','Canceled') DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_agent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    canceled_at TIMESTAMP,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);
```

### ID Generation and Triggers

#### Sequence Table
```sql
CREATE TABLE IF NOT EXISTS id_sequences (
    prefix VARCHAR(10) PRIMARY KEY,
    next_val INT NOT NULL DEFAULT 1
);

INSERT IGNORE INTO id_sequences (prefix) VALUES 
('CUST'), ('EMP'), ('AGNT'), ('ORD');
```

#### Customer ID Trigger
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

#### Employee ID Trigger
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

#### Agent ID Trigger
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

#### Order ID Trigger
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