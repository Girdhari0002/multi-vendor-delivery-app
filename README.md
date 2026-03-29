# Multi-Vendor Delivery App

A complete, production-ready MERN stack application with real-time order tracking and Tailwind CSS styling.

## Features Implemented:
1. **Roles:** Customer, Seller, and Admin access levels.
2. **Auth:** JWT-based user registration and login, with role-based protected routes.
3. **Products:** CRUD operations for sellers, along with customer-side searching and filtering.
4. **Checkout:** Cart system and Razorpay payment gateway integration.
5. **Orders:** Real-time order system utilizing Socket.io, with seller tracking capabilities. 
6. **Reviews:** Customers can leave ratings and reviews on items they've ordered.
7. **Admin Panel:** Complete overview dashboard, user blocking functionality, and global control over products.

## How to Run:
Make sure you have MongoDB running locally, or replace the `MONGO_URI` in `server/.env` with an Atlas connection string.

### 1. Backend Server
```bash
cd server
npm start # or npm run dev
```
The backend API server will start on `http://localhost:5000`.

### 2. Frontend Client
```bash
cd client
npm run dev
```
The React frontend will be available at `http://localhost:5173`
