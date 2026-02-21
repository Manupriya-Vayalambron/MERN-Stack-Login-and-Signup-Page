const mongoose = require('mongoose');

const DeliveryPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    assignedBusStop: {
        type: String,
        required: true,
        enum: [
            'Kochi Bus Stop',
            'Ernakulam Junction',
            'Kakkanad', 
            'Aluva',
            'Fort Kochi',
            'Vyttila Junction',
            'Edappally',
            'University Gate',
            'Central Station',
            'Main Street Stop'
        ]
    },
    licenseNumber: {
        type: String,
        required: true,
        trim: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['Bike', 'Scooter', 'Bicycle'],
        default: 'Bike'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lastLoginDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
DeliveryPartnerSchema.index({ assignedBusStop: 1, isActive: 1, isOnline: 1 });
DeliveryPartnerSchema.index({ email: 1 });

const DeliveryPartnerModel = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);

module.exports = DeliveryPartnerModel;