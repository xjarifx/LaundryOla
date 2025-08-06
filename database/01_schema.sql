-- This script creates the foundational tables for user management.

-- 1. The central 'users' table for common data
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(25) UNIQUE,
    address TEXT,
    role ENUM('customer', 'operations_staff', 'courier', 'admin') NOT NULL,
    account_status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

-- 2. Role-specific table for Customers
CREATE TABLE customers (
    user_id INT PRIMARY KEY,
    loyalty_points INT DEFAULT 0,
    preferred_communication ENUM('email', 'sms') DEFAULT 'email',
    default_instructions TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Role-specific table for Operations Staff
CREATE TABLE operations_staff (
    user_id INT PRIMARY KEY,
    permission_level INT NOT NULL DEFAULT 1,
    department VARCHAR(100),
    internal_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Role-specific table for Couriers
CREATE TABLE couriers (
    user_id INT PRIMARY KEY,
    vehicle_id VARCHAR(50) UNIQUE,
    transport_mode ENUM('motorcycle', 'van', 'bicycle') NOT NULL,
    availability_status ENUM('available', 'on_delivery', 'offline') NOT NULL DEFAULT 'offline',
    average_rating DECIMAL(3, 2) DEFAULT 5.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. The 'orders' table to track all customer orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_id VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    status ENUM('Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_scheduled_for TIMESTAMP,
    delivery_scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- 6. The 'services' table for the master list of available services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit ENUM('piece', 'kg', 'load', 'item') NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. The 'order_details' table for the line items of each order
CREATE TABLE order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    sub_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);
