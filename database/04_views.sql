-- This script creates views to simplify data retrieval for the application.

-- 1. view_user_details
-- Combines user information with their role-specific profile details.
CREATE OR REPLACE VIEW view_user_details AS
SELECT
    u.id AS user_id,
    u.public_id,
    u.email,
    u.full_name,
    u.phone_number,
    u.address,
    u.role,
    u.account_status,
    u.created_at,
    u.last_login_at,
    -- Customer-specific attributes
    c.loyalty_points,
    c.preferred_communication,
    c.default_instructions,
    -- Operations Staff-specific attributes
    os.permission_level,
    os.department,
    os.internal_notes,
    -- Courier-specific attributes
    cr.vehicle_id,
    cr.transport_mode,
    cr.availability_status,
    cr.average_rating
FROM
    users u
LEFT JOIN
    customers c ON u.id = c.user_id AND u.role = 'customer'
LEFT JOIN
    operations_staff os ON u.id = os.user_id AND u.role = 'operations_staff'
LEFT JOIN
    couriers cr ON u.id = cr.user_id AND u.role = 'courier';


-- 2. view_order_summary
-- Provides a summary of each order with customer details.
CREATE OR REPLACE VIEW view_order_summary AS
SELECT
    o.id AS order_id,
    o.public_id AS order_public_id,
    o.status AS order_status,
    o.total_amount,
    o.pickup_address,
    o.delivery_address,
    o.special_instructions,
    o.created_at AS order_created_at,
    o.pickup_scheduled_for,
    o.delivery_scheduled_for,
    o.completed_at,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone_number AS customer_phone
FROM
    orders o
JOIN
    users u ON o.customer_id = u.id;


-- 3. view_order_details_full
-- Provides a comprehensive view of each order, including all line items and service details.
CREATE OR REPLACE VIEW view_order_details_full AS
SELECT
    o.id AS order_id,
    o.public_id AS order_public_id,
    o.status AS order_status,
    o.total_amount,
    o.pickup_address,
    o.delivery_address,
    o.special_instructions,
    o.created_at AS order_created_at,
    o.pickup_scheduled_for,
    o.delivery_scheduled_for,
    o.completed_at,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone_number AS customer_phone,
    od.id AS order_detail_id,
    od.quantity,
    od.price_per_unit,
    od.sub_total AS item_sub_total,
    s.name AS service_name,
    s.description AS service_description,
    s.unit AS service_unit,
    s.category AS service_category
FROM
    orders o
JOIN
    users u ON o.customer_id = u.id
JOIN
    order_details od ON o.id = od.order_id
JOIN
    services s ON od.service_id = s.id;
