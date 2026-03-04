// models/DeliveryPartner.js
const mongoose = require('mongoose');

// ─── Sub-schema: one admin credit entry ──────────────────────────────────────
const CreditEntrySchema = new mongoose.Schema({
  amount:     { type: Number, required: true },
  note:       { type: String, default: '' },
  creditedBy: { type: String, default: 'admin' },
  creditedAt: { type: Date,   default: Date.now },
}, { _id: true });

// ─── Sub-schema: one completed order log entry ────────────────────────────────
const CompletedOrderEntrySchema = new mongoose.Schema({
  orderId:     { type: String, required: true },
  reward:      { type: Number, required: true },
  completedAt: { type: Date,   default: Date.now },
}, { _id: true });

// ─── Main schema ──────────────────────────────────────────────────────────────
const DeliveryPartnerSchema = new mongoose.Schema({

  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },

  // Bus stop — no enum, populated from live geo-sorted Kerala stops list
  assignedBusStop: { type: String, required: true },
  assignedBusStopCoords: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },

  licenseNumber: { type: String, required: true, trim: true },
  vehicleType:   { type: String, required: true, enum: ['Bike', 'Scooter', 'Bicycle'], default: 'Bike' },

  // ── Admin approval ────────────────────────────────────────────────────────────
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvedBy:     { type: String, default: null },
  approvedAt:     { type: Date,   default: null },
  rejectedAt:     { type: Date,   default: null },
  rejectReason:   { type: String, default: '' },

  // ── Operational ───────────────────────────────────────────────────────────────
  isActive: { type: Boolean, default: true  },
  isOnline: { type: Boolean, default: false },
  rating:   { type: Number,  default: 5.0, min: 1, max: 5 },

  // ── Performance ───────────────────────────────────────────────────────────────
  completedOrders:   { type: Number, default: 0 },
  completedOrderLog: [CompletedOrderEntrySchema],

  // ── Earnings ──────────────────────────────────────────────────────────────────
  totalEarnings:    { type: Number, default: 0 },  // lifetime earned
  pendingEarnings:  { type: Number, default: 0 },  // earned, not yet paid out
  totalCredited:    { type: Number, default: 0 },  // total paid out to bank
  lastCreditAmount: { type: Number, default: 0 },
  lastCreditDate:   { type: Date,   default: null },
  creditHistory:    [CreditEntrySchema],

  joinedDate:    { type: Date, default: Date.now },
  lastLoginDate: { type: Date, default: Date.now },

}, { timestamps: true });

DeliveryPartnerSchema.index({ assignedBusStop: 1, isActive: 1, isOnline: 1 });
DeliveryPartnerSchema.index({ email: 1 });

// Call when partner completes a delivery (from order-complete API)
DeliveryPartnerSchema.methods.recordCompletedOrder = async function (orderId, reward) {
  this.completedOrders  += 1;
  this.totalEarnings    += reward;
  this.pendingEarnings  += reward;
  this.completedOrderLog.push({ orderId, reward });
  return this.save();
};

// Call when admin credits the partner (from admin credit API)
DeliveryPartnerSchema.methods.creditAmount = async function (amount, note, adminId) {
  this.creditHistory.push({ amount, note: note || '', creditedBy: adminId || 'admin' });
  this.totalCredited    += amount;
  this.pendingEarnings   = Math.max(0, this.pendingEarnings - amount);
  this.lastCreditAmount  = amount;
  this.lastCreditDate    = new Date();
  return this.save();
};

module.exports = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);