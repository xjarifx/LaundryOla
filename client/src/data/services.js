export const services = [
  {
    id: "wash-fold",
    name: "Wash & Fold",
    description: "Basic washing and folding of clothes",
    price: 40,
    unit: "per kg",
    duration: "24 hours",
    type: "weight",
  },
  {
    id: "wash-iron",
    name: "Wash & Iron",
    description: "Clothes will be washed and neatly ironed",
    price: 60,
    unit: "per kg",
    duration: "36 hours",
    type: "weight",
  },
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    description: "Gentle dry cleaning for delicate fabrics",
    price: 100,
    unit: "per item",
    duration: "48 hours",
    type: "item",
  },
  {
    id: "ironing-only",
    name: "Ironing Only",
    description: "Neatly press and fold only",
    price: 20,
    unit: "per item",
    duration: "12 hours",
    type: "item",
  },
  {
    id: "premium-dry-clean",
    name: "Premium Dry Clean (Blazer/Suit)",
    description: "Premium quality dry cleaning for suits",
    price: 200,
    unit: "per item",
    duration: "72 hours",
    type: "item",
  },
  {
    id: "bedsheet-cleaning",
    name: "Bedsheet Cleaning",
    description: "Large-size machine wash and fold for bedsheets",
    price: 80,
    unit: "per sheet",
    duration: "24 hours",
    type: "item",
  },
  {
    id: "curtain-cleaning",
    name: "Curtain Cleaning",
    description: "Deep cleaning for heavy curtains",
    price: 150,
    unit: "per kg",
    duration: "48 hours",
    type: "weight",
  },
  {
    id: "shoe-cleaning",
    name: "Shoe Cleaning",
    description: "Hand and machine cleaning of sneakers and shoes",
    price: 120,
    unit: "per pair",
    duration: "48 hours",
    type: "item",
  },
];

// Mock orders data
export const mockOrders = [
  {
    id: "ORD001",
    status: "In Progress",
    services: [
      { name: "Wash & Fold", quantity: "3 kg", price: 120 },
      { name: "Ironing Only", quantity: "5 items", price: 100 },
    ],
    pickupDate: "2025-07-05",
    deliveryDate: "2025-07-07",
    total: 220,
    trackingStage: "Washing",
  },
  {
    id: "ORD002",
    status: "Ready for Delivery",
    services: [
      { name: "Premium Dry Clean", quantity: "2 items", price: 400 },
      { name: "Wash & Iron", quantity: "1 kg", price: 60 },
    ],
    pickupDate: "2025-07-03",
    deliveryDate: "2025-07-06",
    total: 460,
    trackingStage: "Ready",
  },
  {
    id: "ORD003",
    status: "Completed",
    services: [
      { name: "Wash & Fold", quantity: "5 kg", price: 200 },
      { name: "Bedsheet Cleaning", quantity: "3 sheets", price: 240 },
    ],
    pickupDate: "2025-06-28",
    deliveryDate: "2025-06-30",
    total: 440,
    trackingStage: "Delivered",
  },
];

// Mock user data
export const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+8801234567890",
  totalOrders: 24,
  activeOrders: 2,
};
