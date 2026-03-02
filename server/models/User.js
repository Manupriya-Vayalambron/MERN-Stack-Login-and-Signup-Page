const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        required: true
    },
    paymentId: String,
    paymentMethod: String,
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const UserSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\+91\d{10}$/, 'Phone number must be in format +91xxxxxxxxxx']
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
    orderCount: {
        type: Number,
        default: 0
    },
    orders: [OrderSchema],
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Method to generate next order ID
UserSchema.methods.generateOrderId = function() {
    this.orderCount += 1;
    const phoneDigits = this.phoneNumber.replace('+91', '');
    return phoneDigits + this.orderCount;
};

// Method to add new order
UserSchema.methods.addOrder = function(orderData) {
    const orderId = this.generateOrderId();
    
    const newOrder = {
        orderId: orderId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentId: orderData.paymentId,
        paymentMethod: orderData.paymentMethod
    };
    
    this.orders.push(newOrder);
    this.updatedAt = new Date();
    
    return orderId;
};

// Update user's last activity
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;