# User Management System Implementation

This implementation adds a comprehensive user management system with MongoDB integration for the Yathrika application.

## Features Implemented

### 1. User Database Schema (MongoDB)
- **Phone Number**: Unique identifier with +91 country code validation
- **Name**: Optional user display name
- **Order Count**: Incrementing counter for each user's orders
- **Orders Array**: Complete order history with the following structure:
  - `orderId`: Custom format (phone digits + order count)  
  - `items`: Array of ordered products
  - `totalAmount`: Order total
  - `paymentStatus`: success/failed/pending
  - `paymentId`: Razorpay payment ID
  - `paymentMethod`: Payment method used
  - `orderDate`: Timestamp of order

### 2. Custom Order ID System
The system generates unique order IDs using the format: `{phoneDigits}{orderCount}`

**Examples:**
- First order by +919876543210 → Order ID: `98765432101`
- Second order by +919876543210 → Order ID: `98765432102` 
- Third order by +919876543210 → Order ID: `98765432103`

### 3. User Authentication Flow
1. **OTP Verification**: User enters phone number and receives Firebase OTP
2. **Database Integration**: After OTP verification, user data is saved/updated in MongoDB
3. **Session Management**: User context maintains authentication state across app
4. **Persistence**: User session is preserved in localStorage

### 4. Order Tracking Integration
- All successful and failed payments are automatically saved to user's order history
- Payment verification includes user data and creates order records
- Order history displays real user data instead of hardcoded examples

## Backend API Endpoints

### User Management
- `POST /api/user/verify-phone` - Create or verify user after OTP
- `GET /api/user/:phoneNumber` - Get user details and order history  
- `PATCH /api/user/update-name` - Update user's display name

### Enhanced Payment APIs
- `POST /api/payment/create-order` - Create Razorpay order with user context
- `POST /api/payment/verify` - Verify payment and save order to user record
- `POST /api/payment/failed` - Handle failed payments and save to user record

## Frontend Components Updated

### 1. UserContext (`src/UserContext.jsx`)
- Manages user authentication state
- Provides user data across components
- Handles sign-in, sign-out, and user updates
- Integrates with backend APIs for user management

### 2. YathrikaSignin (`src/pages/YathrikaSignin.jsx`)  
- Enhanced OTP verification with database integration
- Automatically creates/updates user records after successful OTP
- Seamless transition from Firebase auth to app authentication

### 3. Payment (`src/pages/Payment.jsx`)
- Integrated with UserContext for order tracking
- Passes user phone number and details to backend
- Pre-fills user information in payment forms
- Enhanced order confirmation with user data

### 4. UserProfile (`src/pages/UserProfile.jsx`)
- Displays actual user information (name, phone number)
- Shows order count and user statistics  
- Personalized avatar system
- Sign-out functionality

### 5. OrderHistory (`src/pages/OrderHistory.jsx`)
- Displays real user orders from database
- Shows order status, amounts, and dates
- Handles empty states for new users
- Real-time order data loading

## Database Schema Details

```javascript
// User Schema
{
  phoneNumber: String (required, unique, +91xxxxxxxxxx format)
  name: String (optional)
  orderCount: Number (default: 0)
  orders: [OrderSchema]
  isVerified: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}

// Order Schema (embedded in User)
{
  orderId: String (phoneDigits + orderCount)
  items: [{
    id: String,
    name: String, 
    price: Number,
    quantity: Number,
    image: String
  }]
  totalAmount: Number
  paymentStatus: String (success/failed/pending)
  paymentId: String (Razorpay payment ID)
  paymentMethod: String
  orderDate: Date (default: now)
}
```

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
MONGO_URI=mongodb://localhost:27017/yathrika
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173
PORT=3001
```

### 2. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- The application will automatically create the database and collections
- No manual database setup required

### 3. Dependencies
Server dependencies are already included:
- `mongoose` for MongoDB ODM
- `razorpay` for payment processing
- `crypto` for payment verification

### 4. Running the Application
1. Start MongoDB service
2. Run backend: `cd server && npm start`
3. Run frontend: `cd client && npm run dev`

## User Flow Examples

### New User Journey
1. User enters phone number on signin page
2. Receives and enters OTP code
3. System creates new user record in MongoDB
4. User is redirected to main app with authenticated status
5. User places orders which are tracked against their phone number
6. Order history shows their actual purchase data

### Existing User Journey  
1. Verified user enters phone number
2. System recognizes existing user after OTP verification
3. Updates user's verification status and last login
4. User can see their previous order history
5. New orders continue incrementing their order count

### Order Tracking
- Each order gets unique ID based on user's phone + order count
- All order details stored in user's record
- Payment success/failure status tracked
- Order history shows real data from database
- Failed payments also recorded for analytics

## Security Considerations
- Phone numbers validated with regex pattern
- OTP verification through Firebase Auth
- Payment signature verification with Razorpay
- User sessions managed securely in localStorage
- Backend validates all user operations

This implementation provides a complete user management system that scales with the application's needs while maintaining data integrity and user experience.