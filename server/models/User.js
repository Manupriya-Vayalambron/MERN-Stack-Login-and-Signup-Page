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
    razorpayOrderId: String,
    paymentMethod: String,
    busStop: String,
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'packed', 'partner_at_stop', 'handover', 'cancelled'],
        default: 'pending'
    },
    partnerInfo: {
        partnerId: { type: String, default: null },
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        vehicleType: { type: String, default: 'Bike' },
        busStop: { type: String, default: '' }
    },
    pickupReward: {
        type: Number,
        default: 0
    },
    handoverProofImageUrl: {
        type: String,
        default: ''
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    refundStatus: {
        type: String,
        enum: ['not_required', 'pending', 'processing', 'completed'],
        default: 'not_required'
    },
    refundRequestedAt: {
        type: Date,
        default: null
    },
    lastStatusUpdatedAt: {
        type: Date,
        default: Date.now
    },
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

// Method to generate next order ID (fallback only — addOrder increments orderCount)
UserSchema.methods.generateOrderId = function() {
    const phoneDigits = this.phoneNumber.replace('+91', '');
    return phoneDigits + (this.orderCount + 1);
};

// Method to add new order.
// If orderData.orderId is provided (pre-generated in payment/verify so that
// Tracking.jsx and the partner dashboard share the exact same ID), use it.
// Otherwise fall back to the old phone+count generated format.
UserSchema.methods.addOrder = function(orderData) {
    const orderId = orderData.orderId || this.generateOrderId();

    const newOrder = {
        orderId,
        items:         orderData.items,
        totalAmount:   orderData.totalAmount,
        paymentStatus: orderData.paymentStatus,
        paymentId:     orderData.paymentId,
        razorpayOrderId: orderData.razorpayOrderId,
        paymentMethod: orderData.paymentMethod,
        busStop:       orderData.busStop,
        orderStatus:   orderData.orderStatus || 'pending',
        partnerInfo:   orderData.partnerInfo || null,
        pickupReward:  Number(orderData.pickupReward || 0),
        handoverProofImageUrl: orderData.handoverProofImageUrl || '',
        cancellationReason: orderData.cancellationReason || '',
        cancelledAt: orderData.cancelledAt || null,
        refundStatus: orderData.refundStatus || 'not_required',
        refundRequestedAt: orderData.refundRequestedAt || null,
        lastStatusUpdatedAt: orderData.lastStatusUpdatedAt || new Date(),
    };

    this.orders.push(newOrder);
    this.orderCount += 1;
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