// Environment-aware API configuration
const isDevelopment = import.meta.env.MODE === "development";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isDevelopment ? "http://localhost:5000" : "https://laundryola.onrender.com");

// Log current configuration in development
if (isDevelopment) {
  console.log("🔧 Development Mode");
  console.log("📡 API Base URL:", API_BASE_URL);
}

export default API_BASE_URL;
