# LaundryOla

> A modern full-stack laundry management web application for customers, delivery agents, and admins.

---

## 🚀 Overview

LaundryOla is a full-featured laundry service platform built with React (Vite) for the frontend and Express/MySQL for the backend. It supports customer order placement, delivery agent task management, and admin service control, all with a beautiful, modern UI.

**Live Demo:** [https://laundry-ola-three.vercel.app] (https://laundry-ola-three.vercel.app)
---

## ✨ Features

### Customer Portal

- Place new laundry orders with service selection
- View order history and track status
- Edit profile and address

### Delivery Agent Portal

- View and accept available delivery tasks
- Manage assigned orders (pickup/delivery)
- Mark orders as completed

### Admin Portal

- Dashboard for service management
- View all orders and users
- Add/edit/remove laundry services

### General

- JWT authentication for all roles
- Responsive, mobile-friendly design
- Toast notifications and error handling
- Modern glassmorphism UI

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Express.js, MySQL (Aiven), JWT
- **Other:** Vercel (deployment), CORS, dotenv

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/xjarifx/LaundryOla.git
cd LaundryOla
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in both `server/` and `client/` folders
- Set your MySQL credentials, JWT secret, and client/server URLs

### 4. Start the development servers

```bash
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm run dev
```

### 5. Access the app

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Main URLs

| URL                   | Description        |
| --------------------- | ------------------ |
| `/`                   | Landing Page       |
| `/signin`             | Sign In            |
| `/signup`             | Sign Up            |
| `/customer/dashboard` | Customer Dashboard |
| `/customer/new-order` | Place New Order    |
| `/customer/orders`    | Order History      |
| `/customer/profile`   | Customer Profile   |
| `/admin/dashboard`    | Admin Dashboard    |
| `/admin/profile`      | Admin Profile      |
| `/delivery/dashboard` | Delivery Dashboard |
| `/delivery/profile`   | Delivery Profile   |

---

## 📦 API Endpoints

### Auth

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT

### Services

- `GET /api/services` - List all laundry services
- `POST /api/services` - Add new service (admin)
- `PATCH /api/services/:id` - Edit service (admin)
- `DELETE /api/services/:id` - Remove service (admin)

### Orders

- `POST /api/orders` - Place new order (customer)
- `GET /api/orders` - Get customer orders
- `GET /api/orders/delivery-available` - Get available orders for delivery agents
- `GET /api/orders/my-deliveries` - Get orders assigned to current delivery agent
- `PATCH /api/orders/:orderId/accept` - Accept order (delivery agent)
- `PATCH /api/orders/:orderId/release` - Release order (delivery agent)
- `PATCH /api/orders/:orderId/complete` - Complete order (delivery agent)
- `PATCH /api/orders/:orderId/status` - Update order status (admin/delivery)

---

## 🧑‍💻 Project Structure

```
LaundryOla/
├── client/         # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── config/
│   │   └── ...
│   ├── public/
│   └── ...
├── server/         # Express backend
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── ...
└── readme.md       # Project documentation
```

---

## 📝 Contribution Guide

1. **Fork the repo** and create your feature branch (`git checkout -b feature/my-feature`)
2. **Commit your changes** (`git commit -am 'Add new feature'`)
3. **Push to your branch** (`git push origin feature/my-feature`)
4. **Create a Pull Request**

### Coding Standards

- Use clear, descriptive commit messages
- Follow existing code style and naming conventions
- Write comments for complex logic
- Test your changes before submitting

---

## 🛡️ Security & Best Practices

- Never commit secrets or passwords
- Use environment variables for sensitive data
- Validate all user input on both frontend and backend
- Use HTTPS in production

---

## 💬 Support & Contact

- For issues, use [GitHub Issues](https://github.com/xjarifx/LaundryOla/issues)
- For feature requests, open a Pull Request
- For direct contact, email: [your-email@example.com]

---

## 📄 License

This project is licensed under the MIT License.

# LaundryOla

> A modern full-stack laundry management web application for customers, delivery agents, and admins.

---

## 🚀 Overview

LaundryOla is a full-featured laundry service platform built with React (Vite) for the frontend and Express/MySQL for the backend. It supports customer order placement, delivery agent task management, and admin service control, all with a beautiful, modern UI.

---

## ✨ Features

- **Customer Portal**

  - Place new laundry orders with service selection
  - View order history and track status
  - Edit profile and address

- **Delivery Agent Portal**

  - View and accept available delivery tasks
  - Manage assigned orders (pickup/delivery)
  - Mark orders as completed

- **Admin Portal**

  - Dashboard for service management
  - View all orders and users
  - Add/edit/remove laundry services

- **General**
  - JWT authentication for all roles
  - Responsive, mobile-friendly design
  - Toast notifications and error handling
  - Modern glassmorphism UI

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Express.js, MySQL (Aiven), JWT
- **Other:** Vercel (optional deployment), CORS, dotenv

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/xjarifx/LaundryOla.git
cd LaundryOla
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in both `server/` and `client/` folders
- Set your MySQL credentials, JWT secret, and client/server URLs

### 4. Start the development servers

```bash
# Backend
cd server
npm run dev

# Frontend
cd ../client
npm run dev
```

### 5. Access the app

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Main URLs

| URL                   | Description        |
| --------------------- | ------------------ |
| `/`                   | Landing Page       |
| `/signin`             | Sign In            |
| `/signup`             | Sign Up            |
| `/customer/dashboard` | Customer Dashboard |
| `/customer/new-order` | Place New Order    |
| `/customer/orders`    | Order History      |
| `/customer/profile`   | Customer Profile   |
| `/admin/dashboard`    | Admin Dashboard    |
| `/admin/profile`      | Admin Profile      |
| `/delivery/dashboard` | Delivery Dashboard |
| `/delivery/profile`   | Delivery Profile   |

---

## 📦 API Endpoints

### Auth

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT

### Services

- `GET /api/services` - List all laundry services
- `POST /api/services` - Add new service (admin)
- `PATCH /api/services/:id` - Edit service (admin)
- `DELETE /api/services/:id` - Remove service (admin)

### Orders

- `POST /api/orders` - Place new order (customer)
- `GET /api/orders` - Get customer orders
- `GET /api/orders/delivery-available` - Get available orders for delivery agents
- `GET /api/orders/my-deliveries` - Get orders assigned to current delivery agent
- `PATCH /api/orders/:orderId/accept` - Accept order (delivery agent)
- `PATCH /api/orders/:orderId/release` - Release order (delivery agent)
- `PATCH /api/orders/:orderId/complete` - Complete order (delivery agent)
- `PATCH /api/orders/:orderId/status` - Update order status (admin/delivery)

---

## 🧑‍💻 Project Structure

```
LaundryOla/
├── client/         # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── config/
│   │   └── ...
│   ├── public/
│   └── ...
├── server/         # Express backend
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── ...
└── readme.md       # Project documentation
```

---

## 📝 Contribution Guide

1. **Fork the repo** and create your feature branch (`git checkout -b feature/my-feature`)
2. **Commit your changes** (`git commit -am 'Add new feature'`)
3. **Push to your branch** (`git push origin feature/my-feature`)
4. **Create a Pull Request**

### Coding Standards

- Use clear, descriptive commit messages
- Follow existing code style and naming conventions
- Write comments for complex logic
- Test your changes before submitting

---

## 🛡️ Security & Best Practices

- Never commit secrets or passwords
- Use environment variables for sensitive data
- Validate all user input on both frontend and backend
- Use HTTPS in production

---

## 💬 Support & Contact

- For issues, use [GitHub Issues](https://github.com/xjarifx/LaundryOla/issues)
- For feature requests, open a Pull Request
- For direct contact, email: [your-email@example.com]

---

## 📄 License

This project is licensed under the MIT License.
