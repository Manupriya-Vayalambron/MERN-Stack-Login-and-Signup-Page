/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');

const app = express()
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/employee')
    .then(() => {
        console.log('Connected to MongoDB successfully');
        console.log('Database: employee');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// -------------------- Original Authentication Routes --------------------
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email})
        .then(user => {
            if (user){
                if(user.password === password) {
                res.json("Successfully Logged In");
            } else {
                res.json('Invalid email or password');
            }
        }
        else {
            res.json('No records found');
        }
        })
        .catch(err => res.status(500).json('Error: ' + err)); 
});

app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
        .then(employees => res.json(employees))
        .catch(err => res.json('Error: ' + err));
});

// -------------------- Delivery Partner Authentication Routes --------------------

// Delivery Partner Registration
app.post('/api/delivery-partner/register', async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            assignedBusStop,
            assignedBusStopCoords,
            licenseNumber,
            vehicleType
        } = req.body;

        console.log('📝 Delivery Partner Registration Request:', {
            name,
            email,
            phone: phone ? phone.substring(0, 6) + 'xxxxx' : undefined,
            assignedBusStop,
            assignedBusStopCoords,
            licenseNumber,
            vehicleType
        });

        // Check if partner already exists
        const existingPartner = await DeliveryPartnerModel.findOne({ email });
        if (existingPartner) {
            console.log('❌ Registration failed: Email already exists:', email);
            return res.status(400).json({ message: 'Partner with this email already exists' });
        }

        // Create new delivery partner
        const newPartner = new DeliveryPartnerModel({
            name,
            email,
            phone,
            password, // In production, this should be hashed
            assignedBusStop,
            assignedBusStopCoords: assignedBusStopCoords || null,
            licenseNumber,
            vehicleType
        });

        const savedPartner = await newPartner.save();
        console.log('✅ Delivery Partner saved to MongoDB:', {
            id: savedPartner._id,
            email: savedPartner.email,
            name: savedPartner.name,
            assignedBusStop: savedPartner.assignedBusStop,
            approvalStatus: savedPartner.approvalStatus
        });

        // Generate simple token (in production, use JWT)
        const token = `partner_${savedPartner._id}_${Date.now()}`;
        
        // Remove password from response
        const partnerResponse = savedPartner.toObject();
        delete partnerResponse.password;

        res.status(201).json({
            message: 'Partner registered successfully',
            partner: partnerResponse,
            token
        });

    } catch (error) {
        console.error('❌ Partner registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Delivery Partner Login
app.post('/api/delivery-partner/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find partner by email
        const partner = await DeliveryPartnerModel.findOne({ email });
        if (!partner) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password (in production, use bcrypt)
        if (partner.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if partner is active
        if (!partner.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
        }

        // Update last login date
        partner.lastLoginDate = new Date();
        await partner.save();

        // Generate simple token (in production, use JWT)
        const token = `partner_${partner._id}_${Date.now()}`;
        
        // Remove password from response
        const partnerResponse = partner.toObject();
        delete partnerResponse.password;

        res.json({
            message: 'Login successful',
            partner: partnerResponse,
            token
        });

    } catch (error) {
        console.error('Partner login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Get partners by bus stop
app.get('/api/delivery-partner/by-bus-stop/:busStop', async (req, res) => {
    try {
        const { busStop } = req.params;
        const partners = await DeliveryPartnerModel.find({
            assignedBusStop: busStop,
            isActive: true
        }).select('-password');

        res.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ message: 'Failed to fetch partners', error: error.message });
    }
});

// Update partner availability
app.patch('/api/delivery-partner/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { isOnline } = req.body;

        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            id,
            { isOnline },
            { new: true }
        ).select('-password');

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        res.json({
            message: `Partner is now ${isOnline ? 'online' : 'offline'}`,
            partner
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ message: 'Failed to update availability', error: error.message });
    }
});

// -------------------- Admin Routes for Delivery Partners --------------------

// Get all delivery partners (for admin)
app.get('/api/admin/delivery-partners', async (req, res) => {
    try {
        const partners = await DeliveryPartnerModel.find({}).select('-password');
        console.log(`📊 Admin fetching ${partners.length} delivery partners from database`);
        res.json(partners);
    } catch (error) {
        console.error('Error fetching all partners:', error);
        res.status(500).json({ message: 'Failed to fetch partners', error: error.message });
    }
});

// DEBUG: Get database stats and collections info
app.get('/api/debug/database-info', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        
        // Get collection stats
        const deliveryPartnerCount = await DeliveryPartnerModel.countDocuments();
        const userCount = await UserModel.countDocuments();
        
        // Get recent records
        const recentPartners = await DeliveryPartnerModel.find({})
            .select('name email assignedBusStop approvalStatus createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
            
        const recentUsers = await UserModel.find({})
            .select('phoneNumber name orderCount isVerified createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            database: {
                name: db.databaseName,
                status: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'
            },
            collections: {
                deliveryPartners: {
                    count: deliveryPartnerCount,
                    recentRecords: recentPartners
                },
                users: {
                    count: userCount,
                    recentRecords: recentUsers
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Database info error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get pending delivery partners (for admin approval)
app.get('/api/admin/delivery-partners/pending', async (req, res) => {
    try {
        const pendingPartners = await DeliveryPartnerModel.find({
            approvalStatus: 'pending'
        }).select('-password');
        res.json(pendingPartners);
    } catch (error) {
        console.error('Error fetching pending partners:', error);
        res.status(500).json({ message: 'Failed to fetch pending partners', error: error.message });
    }
});

// Approve delivery partner
app.patch('/api/admin/delivery-partners/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            id,
            {
                approvalStatus: 'approved',
                isActive: true,
                approvedAt: new Date(),
                approvedBy: 'admin' // In production, get this from JWT token
            },
            { new: true }
        ).select('-password');

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        // Emit real-time approval event so pending screen updates instantly
        io.to(`partner_approval_${id}`).emit('approval_status_changed', {
            partnerId: id,
            approvalStatus: 'approved',
            partner
        });

        res.json({
            message: 'Partner approved successfully',
            partner
        });
    } catch (error) {
        console.error('Error approving partner:', error);
        res.status(500).json({ message: 'Failed to approve partner', error: error.message });
    }
});

// Reject delivery partner
app.patch('/api/admin/delivery-partners/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectReason } = req.body;
        
        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            id,
            {
                approvalStatus: 'rejected',
                isActive: false,
                rejectedAt: new Date(),
                rejectReason: rejectReason || 'No reason provided'
            },
            { new: true }
        ).select('-password');

        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        res.json({
            message: 'Partner rejected successfully',
            partner
        });
    } catch (error) {
        console.error('Error rejecting partner:', error);
        res.status(500).json({ message: 'Failed to reject partner', error: error.message });
    }
});

app.listen(3001, () => {
    console.log("Server Started on port 3001");
});*/

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const EmployeeModel = require('./models/Employee');
const DeliveryPartnerModel = require('./models/DeliveryPartner');
const UserModel = require('./models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ["GET", "POST", "PATCH"] }
});

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));

const uploadsRoot = path.join(__dirname, 'uploads');
const aadharUploadDir = path.join(uploadsRoot, 'aadhar');
const handoverUploadDir = path.join(uploadsRoot, 'handover');
const creditProofUploadDir = path.join(uploadsRoot, 'credit-proof');
[uploadsRoot, aadharUploadDir, handoverUploadDir, creditProofUploadDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
app.use('/uploads', express.static(uploadsRoot));

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
]);

const safeFileName = (value) => String(value || 'file').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'file';
const phoneDigits = (value) => String(value || '').replace(/\D/g, '');
const phonesMatch = (a, b) => {
    const first = phoneDigits(a);
    const second = phoneDigits(b);
    if (!first || !second) return false;
    if (first === second) return true;
    return first.slice(-10) === second.slice(-10);
};
const createUploader = (destination, namePrefix) => multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, destination),
        filename: (req, file, cb) => {
            const idPart = safeFileName(req.body.partnerId || req.body.phone || req.params.orderId || 'partner');
            const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
            cb(null, `${namePrefix}_${idPart}_${Date.now()}${ext}`);
        },
    }),
    limits: { fileSize: 7 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
        cb(new Error('Only JPG, PNG, WEBP, or PDF files are allowed'));
    },
});

const uploadAadhar = createUploader(aadharUploadDir, 'aadhar');
const uploadHandoverProof = createUploader(handoverUploadDir, 'handover');
const uploadCreditProof = createUploader(creditProofUploadDir, 'creditproof');

// In-memory store: orders pending partner acceptance
// Key: busStop string  ->  Value: array of order objects
const pendingOrdersByStop = new Map();

// Key: orderId -> { userId, busStop }
const orderOwnerById = new Map();

// Key: orderId -> { status, partner }
const orderRuntimeStateById = new Map();
// Key: orderId -> handover proof image URL
const orderHandoverProofById = new Map();

// Admin auth (no DB): token sessions stored in memory.
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '').trim();
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const adminSessions = new Map(); // token -> { expiresAt }

const hasWhitespace = (v) => /\s/.test(String(v || ''));
const createAdminToken = () => crypto.randomBytes(24).toString('hex');

if (!ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is required in environment variables');
}
if (hasWhitespace(ADMIN_PASSWORD)) {
    throw new Error('ADMIN_PASSWORD must not contain spaces');
}

const requireAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return res.status(401).json({ message: 'Admin authentication required' });

    const session = adminSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        adminSessions.delete(token);
        return res.status(401).json({ message: 'Admin session expired. Please login again.' });
    }

    // Sliding expiry while active.
    session.expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    adminSessions.set(token, session);
    next();
};

const ACTIVE_ORDER_STATUSES = new Set(['confirmed', 'packed', 'partner_at_stop']);

const normalizePartnerInfo = (partnerInfo = {}, fallbackBusStop = '') => ({
    partnerId: partnerInfo?.partnerId || null,
    name: partnerInfo?.name || partnerInfo?.partnerName || 'Delivery Partner',
    phone: partnerInfo?.phone || '',
    vehicleType: partnerInfo?.vehicleType || 'Bike',
    busStop: partnerInfo?.busStop || fallbackBusStop || '',
});

const hydratePendingOrdersFromDb = async (busStop) => {
    const normalizedBusStop = String(busStop || '').trim();
    if (!normalizedBusStop) return [];

    const rows = await UserModel.aggregate([
        { $unwind: '$orders' },
        {
            $match: {
                'orders.paymentStatus': 'success',
                'orders.busStop': normalizedBusStop,
                $or: [
                    { 'orders.orderStatus': { $exists: false } },
                    { 'orders.orderStatus': 'pending' },
                ],
            },
        },
        {
            $project: {
                _id: 0,
                phoneNumber: 1,
                name: 1,
                order: '$orders',
            },
        },
    ]);

    const hydrated = rows.map((row) => ({
        orderId: row.order.orderId,
        razorpayOrderId: row.order.razorpayOrderId,
        userId: row.phoneNumber || 'guest',
        userName: row.name || 'Customer',
        userPhone: row.phoneNumber || '',
        items: row.order.items || [],
        total: row.order.totalAmount || 0,
        busStop: row.order.busStop || normalizedBusStop,
        status: 'pending',
        pickupReward: Number(row.order.pickupReward || Math.round((row.order.totalAmount || 0) * 0.1)),
        createdAt: row.order.orderDate ? new Date(row.order.orderDate).toISOString() : new Date().toISOString(),
    }));

    hydrated.forEach((order) => {
        orderOwnerById.set(order.orderId, { userId: order.userPhone || null, busStop: normalizedBusStop });
        if (!orderRuntimeStateById.has(order.orderId)) {
            orderRuntimeStateById.set(order.orderId, { status: 'pending', partner: null });
        }
    });

    pendingOrdersByStop.set(normalizedBusStop, hydrated);
    return hydrated;
};

const getRuntimeStateFromDb = async (orderId) => {
    const doc = await UserModel.findOne(
        { 'orders.orderId': orderId },
        { phoneNumber: 1, name: 1, orders: { $elemMatch: { orderId } } }
    ).lean();

    const order = doc?.orders?.[0];
    if (!order) return null;

    const status = order.orderStatus || 'pending';
    const partner = order.partnerInfo || null;
    const reward = Number(order.pickupReward || 0);
    const handoverProofImageUrl = order.handoverProofImageUrl || '';

    orderOwnerById.set(orderId, { userId: doc.phoneNumber || null, busStop: order.busStop || '' });
    orderRuntimeStateById.set(orderId, { status, partner, reward, handoverProofImageUrl });
    if (handoverProofImageUrl) {
        orderHandoverProofById.set(orderId, handoverProofImageUrl);
    }

    return {
        status,
        partner,
        reward,
        handoverProofImageUrl,
        userPhone: doc.phoneNumber || '',
        userName: doc.name || 'Customer',
        busStop: order.busStop || '',
        total: order.totalAmount || 0,
        items: order.items || [],
        paymentId: order.paymentId || null,
    };
};

// In-memory push subscription registry
// Key: userId (phone number) -> Map(endpoint, subscription)
const pushSubscriptionsByUser = new Map();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@yathrika.local';
const PUSH_ENABLED = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (PUSH_ENABLED) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('✅ Web Push notifications enabled');
} else {
    console.warn('⚠️  Web Push disabled: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in server .env');
}

const sendPushToUser = async (userId, payload) => {
    if (!PUSH_ENABLED || !userId) return;

    const subscriptionsMap = pushSubscriptionsByUser.get(userId);
    if (!subscriptionsMap || subscriptionsMap.size === 0) return;

    const removeEndpoints = [];
    await Promise.all(
        [...subscriptionsMap.entries()].map(async ([endpoint, subscription]) => {
            try {
                await webpush.sendNotification(subscription, JSON.stringify(payload));
            } catch (err) {
                // 404/410 means subscription is no longer valid.
                if (err.statusCode === 404 || err.statusCode === 410) {
                    removeEndpoints.push(endpoint);
                } else {
                    console.error('Push send error:', err.message);
                }
            }
        })
    );

    if (removeEndpoints.length > 0) {
        removeEndpoints.forEach((endpoint) => subscriptionsMap.delete(endpoint));
        if (subscriptionsMap.size === 0) {
            pushSubscriptionsByUser.delete(userId);
        }
    }
};

// -------------------- Razorpay Instance --------------------
const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Store active tracking sessions
const trackingSessions = new Map();
// Store user locations
const userLocations = new Map();

// -------------------- MongoDB Setup --------------------
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('🗄️  Database URI:', mongoURI);
    console.log('📊 Database Name:', mongoose.connection.name);
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});

mongoose.connection.on('connected', () => console.log('Mongoose connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected from MongoDB'));

// -------------------- Delivery Partner Auth Routes --------------------

app.post('/api/delivery-partner/register', uploadAadhar.single('aadharCard'), async (req, res) => {
    try {
        const { name, email, phone, password, assignedBusStop, assignedBusStopLat, assignedBusStopLng, licenseNumber, vehicleType } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Aadhaar upload is required for verification' });
        }
        const existing = await DeliveryPartnerModel.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Partner with this email already exists' });
        const coords = (assignedBusStopLat != null) && (assignedBusStopLng != null)
            ? { lat: Number(assignedBusStopLat), lng: Number(assignedBusStopLng) }
            : { lat: null, lng: null };
        const aadharCardImageUrl = `/uploads/aadhar/${req.file.filename}`;

        const partner = await new DeliveryPartnerModel({
            name: name?.trim(),
            email: email?.trim().toLowerCase(),
            phone: phone?.trim(),
            password,
            assignedBusStop: assignedBusStop?.trim(),
            assignedBusStopCoords: coords,
            licenseNumber: licenseNumber?.trim(),
            vehicleType: vehicleType || 'Bike',
            aadharCardImageUrl,
        }).save();
        const token = `partner_${partner._id}_${Date.now()}`;
        const resp = partner.toObject(); delete resp.password;
        console.log('✅ Partner registered:', partner.email);
        res.status(201).json({ message: 'Partner registered successfully', partner: resp, token });
    } catch (err) {
        console.error('❌ Partner registration error:', err.message, err.errors ? JSON.stringify(err.errors) : '');
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

app.post('/api/orders/:orderId/handover-proof', uploadHandoverProof.single('busPhoto'), (req, res) => {
    try {
        const { orderId } = req.params;
        const { partnerId } = req.body;
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'partnerId is required' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Bus photo proof is required' });
        }

        const handoverProofImageUrl = `/uploads/handover/${req.file.filename}`;
        orderHandoverProofById.set(orderId, handoverProofImageUrl);

        const runtime = orderRuntimeStateById.get(orderId) || { status: 'confirmed', partner: null, reward: 0 };
        orderRuntimeStateById.set(orderId, {
            ...runtime,
            handoverProofImageUrl,
        });

        res.json({ success: true, orderId, handoverProofImageUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to upload handover proof', error: err.message });
    }
});

app.post('/api/delivery-partner/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const partner = await DeliveryPartnerModel.findOne({ email });
        if (!partner || partner.password !== password)
            return res.status(401).json({ message: 'Invalid email or password' });
        if (!partner.isActive)
            return res.status(403).json({ message: 'Account deactivated. Contact support.' });
        partner.lastLoginDate = new Date();
        await partner.save();
        const token = `partner_${partner._id}_${Date.now()}`;
        const resp = partner.toObject(); delete resp.password;
        res.json({ message: 'Login successful', partner: resp, token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// Single partner status check (pending screen polls this)
app.get('/api/delivery-partner/:id/status', async (req, res) => {
    try {
        const partner = await DeliveryPartnerModel.findById(req.params.id).select('-password');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.json({ approvalStatus: partner.approvalStatus, rejectReason: partner.rejectReason, partner });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get status', error: err.message });
    }
});

app.patch('/api/delivery-partner/:id/availability', async (req, res) => {
    try {
        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            req.params.id, { isOnline: req.body.isOnline }, { new: true }
        ).select('-password');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.json({ message: `Partner is now ${req.body.isOnline ? 'online' : 'offline'}`, partner });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update availability', error: err.message });
    }
});

// -------------------- Admin Delivery Partner Routes --------------------

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    if (typeof password !== 'string' || !password.length) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if (hasWhitespace(password)) {
        return res.status(400).json({ message: 'Password must not contain spaces' });
    }
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin password' });
    }

    const token = createAdminToken();
    adminSessions.set(token, { expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });
    res.json({ success: true, token, expiresInMs: ADMIN_SESSION_TTL_MS });
});

app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (token) adminSessions.delete(token);
    res.json({ success: true });
});

app.get('/api/admin/delivery-partners', requireAdminAuth, async (req, res) => {
    try {
        const partners = await DeliveryPartnerModel.find({}).select('-password');
        res.json(partners);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch partners', error: err.message });
    }
});

app.get('/api/admin/delivery-partners/pending', requireAdminAuth, async (req, res) => {
    try {
        const partners = await DeliveryPartnerModel.find({ approvalStatus: 'pending' }).select('-password');
        res.json(partners);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch pending partners', error: err.message });
    }
});

app.get('/api/admin/overview', requireAdminAuth, async (req, res) => {
    try {
        const [partners, users] = await Promise.all([
            DeliveryPartnerModel.find({}).select('-password').lean(),
            UserModel.find({}).select('phoneNumber name orderCount isVerified createdAt orders').lean(),
        ]);

        const orders = [];
        for (const user of users) {
            const userOrders = user.orders || [];
            for (const order of userOrders) {
                orders.push({
                    orderId: order.orderId,
                    totalAmount: order.totalAmount || 0,
                    paymentStatus: order.paymentStatus || 'pending',
                    orderStatus: order.orderStatus || 'pending',
                    paymentId: order.paymentId || null,
                    paymentMethod: order.paymentMethod || null,
                    cancellationReason: order.cancellationReason || '',
                    cancelledAt: order.cancelledAt || null,
                    refundStatus: order.refundStatus || 'not_required',
                    refundRequestedAt: order.refundRequestedAt || null,
                    orderDate: order.orderDate,
                    itemCount: Array.isArray(order.items) ? order.items.length : 0,
                    userPhoneNumber: user.phoneNumber,
                    userName: user.name || '',
                });
            }
        }

        orders.sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));

        const pendingPoolOrders = [];
        for (const [busStop, queue] of pendingOrdersByStop.entries()) {
            for (const order of queue) {
                pendingPoolOrders.push({
                    orderId: order.orderId,
                    busStop,
                    totalAmount: order.total || 0,
                    createdAt: order.createdAt || null,
                });
            }
        }
        pendingPoolOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const totalOrders = orders.length;
        const successOrders = orders.filter(o => o.paymentStatus === 'success').length;
        const failedOrders = orders.filter(o => o.paymentStatus === 'failed').length;
        const pendingOrders = orders.filter(o => o.paymentStatus === 'pending').length;
        const successRevenue = orders
            .filter(o => o.paymentStatus === 'success')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const refundRequests = orders.filter((o) => o.orderStatus === 'cancelled' && o.refundStatus === 'pending').length;

        res.json({
            partners,
            users,
            orders,
            overview: {
                totalUsers: users.length,
                verifiedUsers: users.filter(u => u.isVerified).length,
                totalOrders,
                successOrders,
                failedOrders,
                pendingOrders,
                refundRequests,
                successRevenue,
                pendingPoolCount: pendingPoolOrders.length,
                pendingPoolOrders,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch admin overview', error: err.message });
    }
});

app.patch('/api/admin/delivery-partners/:id/approve', requireAdminAuth, async (req, res) => {
    try {
        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'approved', isActive: true, approvedAt: new Date(), approvedBy: 'admin' },
            { new: true }
        ).select('-password');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        // Real-time: notify partner's pending screen instantly
        io.to(`partner_approval_${req.params.id}`).emit('approval_status_changed', {
            partnerId: req.params.id, approvalStatus: 'approved', partner
        });
        res.json({ message: 'Partner approved successfully', partner });
    } catch (err) {
        res.status(500).json({ message: 'Failed to approve partner', error: err.message });
    }
});

app.patch('/api/admin/delivery-partners/:id/reject', requireAdminAuth, async (req, res) => {
    try {
        const { rejectReason } = req.body;
        const partner = await DeliveryPartnerModel.findByIdAndUpdate(
            req.params.id,
            { approvalStatus: 'rejected', isActive: false, rejectedAt: new Date(), rejectReason: rejectReason || 'No reason provided' },
            { new: true }
        ).select('-password');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        // Real-time: notify partner's pending screen instantly
        io.to(`partner_approval_${req.params.id}`).emit('approval_status_changed', {
            partnerId: req.params.id, approvalStatus: 'rejected',
            rejectReason: rejectReason || 'No reason provided', partner
        });
        res.json({ message: 'Partner rejected successfully', partner });
    } catch (err) {
        res.status(500).json({ message: 'Failed to reject partner', error: err.message });
    }
});

app.patch('/api/admin/delivery-partners/:id/credit-proof', requireAdminAuth, uploadCreditProof.single('paymentProof'), async (req, res) => {
    try {
        const { id } = req.params;
        const amount = Number(req.body?.amount || 0);
        const note = String(req.body?.note || '').trim();
        const paidToPhone = String(req.body?.paidToPhone || '').trim();

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid credit amount is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'UPI payment screenshot is required' });
        }

        const partner = await DeliveryPartnerModel.findById(id);
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        if (!phonesMatch(paidToPhone, partner.phone)) {
            return res.status(400).json({
                message: 'Paid-to phone must match the delivery partner phone number',
                expectedPhone: partner.phone,
            });
        }

        const paymentProofImageUrl = `/uploads/credit-proof/${req.file.filename}`;
        await partner.creditAmount(amount, note || 'UPI payout credited by admin', 'admin', {
            paidToPhone,
            paymentProofImageUrl,
        });

        const updatedPartner = await DeliveryPartnerModel.findById(id).select('-password');
        return res.json({
            message: 'Credit added after proof verification',
            partner: updatedPartner,
            credit: {
                amount,
                paidToPhone,
                paymentProofImageUrl,
                note,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to credit partner with proof', error: err.message });
    }
});

app.patch('/api/admin/orders/:orderId/refund-status', requireAdminAuth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { refundStatus } = req.body || {};
        const allowedStatuses = new Set(['pending', 'processing', 'completed']);
        if (!allowedStatuses.has(refundStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid refund status' });
        }

        const orderDoc = await UserModel.findOne(
            { 'orders.orderId': orderId },
            { phoneNumber: 1, orders: { $elemMatch: { orderId } } }
        ).lean();
        const order = orderDoc?.orders?.[0];
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.orderStatus !== 'cancelled') {
            return res.status(400).json({ success: false, message: 'Refund status can only be updated for cancelled orders' });
        }

        await UserModel.updateOne(
            { 'orders.orderId': orderId },
            {
                $set: {
                    'orders.$.refundStatus': refundStatus,
                    'orders.$.lastStatusUpdatedAt': new Date(),
                },
            }
        );

        io.to(`order_${orderId}`).emit('tracking_alert_received', {
            orderId,
            alertType: 'refund_status',
            message: `Refund status updated to ${refundStatus.toUpperCase()}`,
            from: 'admin',
            timestamp: new Date(),
        });

        return res.json({ success: true, orderId, refundStatus });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update refund status', error: err.message });
    }
});

// -------------------- Order Routes for Partners --------------------

// Get pending (unaccepted) orders at a bus stop
// ── FIX 2: Returns in-memory pool (fast) ──
// In-memory is populated on payment/verify. If server restarts, orders are lost.
// For production, persist orders to MongoDB and query here instead.
app.get('/api/orders/pending/:busStop', async (req, res) => {
    try {
        const busStop = decodeURIComponent(req.params.busStop);
        let orders = pendingOrdersByStop.get(busStop) || [];
        if (orders.length === 0) {
            orders = await hydratePendingOrdersFromDb(busStop);
        }
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load pending orders', error: err.message });
    }
});

app.get('/api/orders/partner/:partnerId/active', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const rows = await UserModel.aggregate([
            { $unwind: '$orders' },
            {
                $match: {
                    'orders.paymentStatus': 'success',
                    'orders.partnerInfo.partnerId': partnerId,
                    'orders.orderStatus': { $in: [...ACTIVE_ORDER_STATUSES] },
                },
            },
            {
                $project: {
                    _id: 0,
                    phoneNumber: 1,
                    name: 1,
                    order: '$orders',
                },
            },
        ]);

        const orders = rows
            .map((row) => ({
                id: row.order.orderId,
                orderId: row.order.orderId,
                userId: row.phoneNumber || 'guest',
                userPhone: row.phoneNumber || '',
                userName: row.name || 'Customer',
                items: row.order.items || [],
                total: row.order.totalAmount || 0,
                pickupReward: Number(row.order.pickupReward || 0),
                busStop: row.order.busStop || row.order.partnerInfo?.busStop || '',
                paymentId: row.order.paymentId || null,
                status: row.order.orderStatus || 'confirmed',
                acceptedAt: row.order.lastStatusUpdatedAt || row.order.orderDate || new Date().toISOString(),
                partnerId: row.order.partnerInfo?.partnerId || partnerId,
                partnerName: row.order.partnerInfo?.name || 'Delivery Partner',
                partnerPhone: row.order.partnerInfo?.phone || '',
                handoverProofImageUrl: row.order.handoverProofImageUrl || '',
            }))
            .sort((a, b) => new Date(b.acceptedAt || 0) - new Date(a.acceptedAt || 0));

        orders.forEach((order) => {
            orderOwnerById.set(order.orderId, { userId: order.userPhone || null, busStop: order.busStop || '' });
            orderRuntimeStateById.set(order.orderId, {
                status: order.status,
                partner: normalizePartnerInfo({
                    partnerId: order.partnerId,
                    name: order.partnerName,
                    phone: order.partnerPhone,
                    busStop: order.busStop,
                }, order.busStop),
                reward: Number(order.pickupReward || 0),
                handoverProofImageUrl: order.handoverProofImageUrl || '',
            });
        });

        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to load active partner orders', error: err.message });
    }
});

// Partner accepts an order
app.post('/api/orders/:orderId/accept', async (req, res) => {
    const { orderId } = req.params;
    const { busStop, partnerInfo } = req.body;
    try {
        let orders = pendingOrdersByStop.get(busStop) || [];
        if (orders.length === 0 && busStop) {
            orders = await hydratePendingOrdersFromDb(busStop);
        }
        const pendingOrder = orders.find((o) => o.orderId === orderId);

        const dbDoc = await UserModel.findOne(
            { 'orders.orderId': orderId },
            { phoneNumber: 1, name: 1, orders: { $elemMatch: { orderId } } }
        ).lean();
        const persistedOrder = dbDoc?.orders?.[0];

        if (!pendingOrder && !persistedOrder) {
            return res.status(404).json({ message: 'Order not found or already accepted' });
        }

        const resolvedBusStop = busStop || pendingOrder?.busStop || persistedOrder?.busStop || '';
        const resolvedPartner = normalizePartnerInfo(partnerInfo, resolvedBusStop);
        const reward = Number(
            pendingOrder?.pickupReward ||
            persistedOrder?.pickupReward ||
            Math.round((pendingOrder?.total || persistedOrder?.totalAmount || 0) * 0.1)
        );

        await UserModel.updateOne(
            { 'orders.orderId': orderId },
            {
                $set: {
                    'orders.$.orderStatus': 'confirmed',
                    'orders.$.partnerInfo': resolvedPartner,
                    'orders.$.pickupReward': reward,
                    'orders.$.lastStatusUpdatedAt': new Date(),
                },
            }
        );

        orderRuntimeStateById.set(orderId, {
            status: 'confirmed',
            partner: resolvedPartner,
            reward,
        });

        if (resolvedBusStop) {
            pendingOrdersByStop.set(resolvedBusStop, orders.filter((o) => o.orderId !== orderId));
            io.to(`partners_${resolvedBusStop}`).emit('order_update', { type: 'order_accepted', orderId, acceptedBy: resolvedPartner.partnerId });
        }

        orderOwnerById.set(orderId, { userId: dbDoc?.phoneNumber || pendingOrder?.userPhone || null, busStop: resolvedBusStop });

        io.to(`order_${orderId}`).emit('partner_status_update', { orderId, partner: resolvedPartner });
        io.to(`order_${orderId}`).emit('order_status_updated', { orderId, status: 'confirmed', partner: resolvedPartner });

        sendPushToUser(dbDoc?.phoneNumber || pendingOrder?.userPhone, {
            title: 'Delivery Partner Assigned',
            body: `${resolvedPartner.name || 'A delivery partner'} accepted your order.`,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: `partner_assigned_${orderId}`,
            data: {
                url: '/tracking',
                orderId,
                status: 'confirmed',
                type: 'partner_assigned'
            }
        }).catch((err) => console.error('Push notify error:', err.message));

        const responseOrder = pendingOrder || {
            orderId,
            userId: dbDoc?.phoneNumber || 'guest',
            userName: dbDoc?.name || 'Customer',
            userPhone: dbDoc?.phoneNumber || '',
            items: persistedOrder?.items || [],
            total: persistedOrder?.totalAmount || 0,
            busStop: resolvedBusStop,
            pickupReward: reward,
            status: 'confirmed',
            createdAt: persistedOrder?.orderDate ? new Date(persistedOrder.orderDate).toISOString() : new Date().toISOString(),
        };

        console.log(`✅ Order ${orderId} accepted by partner ${resolvedPartner.partnerId} — emitted to room order_${orderId}`);
        res.json({ success: true, order: responseOrder });
    } catch (err) {
        res.status(500).json({ message: 'Failed to accept order', error: err.message });
    }
});

app.post('/api/orders/:orderId/cancel', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason, cancelledBy } = req.body || {};

        const dbDoc = await UserModel.findOne(
            { 'orders.orderId': orderId },
            { phoneNumber: 1, name: 1, orders: { $elemMatch: { orderId } } }
        ).lean();
        const order = dbDoc?.orders?.[0];
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.orderStatus === 'handover') {
            return res.status(400).json({ success: false, message: 'Delivered order cannot be cancelled' });
        }

        const cancellationReason = String(reason || 'Cancelled by user').trim();
        await UserModel.updateOne(
            { 'orders.orderId': orderId },
            {
                $set: {
                    'orders.$.orderStatus': 'cancelled',
                    'orders.$.cancellationReason': cancellationReason,
                    'orders.$.cancelledAt': new Date(),
                    'orders.$.refundStatus': 'pending',
                    'orders.$.refundRequestedAt': new Date(),
                    'orders.$.lastStatusUpdatedAt': new Date(),
                },
            }
        );

        const runtime = orderRuntimeStateById.get(orderId) || {};
        const resolvedBusStop = order.busStop || runtime?.partner?.busStop || '';
        const resolvedPartner = runtime?.partner || order.partnerInfo || null;

        orderRuntimeStateById.set(orderId, {
            ...runtime,
            status: 'cancelled',
            partner: resolvedPartner,
            reward: Number(runtime?.reward || order.pickupReward || 0),
        });

        if (resolvedBusStop) {
            const queue = pendingOrdersByStop.get(resolvedBusStop) || [];
            pendingOrdersByStop.set(resolvedBusStop, queue.filter((o) => o.orderId !== orderId));
            io.to(`partners_${resolvedBusStop}`).emit('order_update', {
                type: 'order_cancelled',
                orderId,
                reason: cancellationReason,
            });
        }

        io.to(`order_${orderId}`).emit('order_status_updated', {
            orderId,
            status: 'cancelled',
            reason: cancellationReason,
            cancelledBy: cancelledBy || 'user',
            partner: resolvedPartner,
            timestamp: new Date(),
        });

        io.to(`order_${orderId}`).emit('tracking_alert_received', {
            orderId,
            alertType: 'order_cancelled',
            message: `Order cancelled: ${cancellationReason}`,
            from: 'system',
            timestamp: new Date(),
        });

        return res.json({
            success: true,
            message: 'Order cancelled successfully',
            order: {
                orderId,
                orderStatus: 'cancelled',
                paymentId: order.paymentId || null,
                refundStatus: 'pending',
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to cancel order', error: err.message });
    }
});

// Get partner performance + history (for dashboard)
app.get('/api/delivery-partner/:id/performance', async (req, res) => {
    try {
        const partner = await DeliveryPartnerModel.findById(req.params.id).select('-password');
        if (!partner) return res.status(404).json({ message: 'Partner not found' });
        res.json({
            success: true,
            partner,
            performance: {
                completedOrders: partner.completedOrders || 0,
                totalEarnings: partner.totalEarnings || 0,
                pendingEarnings: partner.pendingEarnings || 0,
                totalCredited: partner.totalCredited || 0,
                completedOrderLog: partner.completedOrderLog || [],
                creditHistory: partner.creditHistory || [],
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to get partner performance', error: err.message });
    }
});

// -------------------- Location Tracking API Routes --------------------

// Get active tracking sessions (for admin/debugging)
app.get('/api/tracking/sessions', (req, res) => {
    const sessions = {};
    for (const [orderId, session] of trackingSessions.entries()) {
        sessions[orderId] = {
            users: session.users.size,
            deliveryPartners: session.deliveryPartners.size,
            buses: session.buses.size
        };
    }
    res.json(sessions);
});

// Get locations for a specific order
app.get('/api/tracking/locations/:orderId', (req, res) => {
    const { orderId } = req.params;
    const locations = userLocations.get(orderId) || {};
    res.json(locations);
});

app.get('/api/tracking/runtime/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        let runtime = orderRuntimeStateById.get(orderId);
        if (!runtime) {
            const recovered = await getRuntimeStateFromDb(orderId);
            if (recovered) {
                runtime = {
                    status: recovered.status,
                    partner: recovered.partner,
                    reward: recovered.reward,
                    handoverProofImageUrl: recovered.handoverProofImageUrl,
                };
            }
        }

        if (!runtime) {
            return res.status(404).json({ success: false, message: 'No runtime state found for order' });
        }

        res.json({ success: true, orderId, runtime });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch runtime state', error: err.message });
    }
});

// Emergency stop tracking for an order
app.post('/api/tracking/emergency-stop/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    if (trackingSessions.has(orderId)) {
        // Notify all users in the tracking room
        io.to(`order_${orderId}`).emit('tracking_alert_received', {
            orderId,
            alertType: 'emergency_stop',
            message: 'Tracking has been emergency stopped by admin',
            from: 'system',
            timestamp: new Date()
        });
        
        // Clean up session
        trackingSessions.delete(orderId);
        userLocations.delete(orderId);
        
        res.json({ success: true, message: 'Tracking stopped' });
    } else {
        res.status(404).json({ success: false, message: 'Order not being tracked' });
    }
});

// -------------------- Original Socket.IO Real-time Tracking --------------------
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join tracking room for an order
    socket.on('join_tracking', async (data) => {
        const { orderId, userType, userData } = data;
        const roomName = `order_${orderId}`;
        
        socket.join(roomName);
        socket.userType = userType;
        socket.orderId = orderId;
        socket.userData = userData;

        // Store session info
        if (!trackingSessions.has(orderId)) {
            trackingSessions.set(orderId, {
                users: new Map(),
                deliveryPartners: new Map(),
                buses: new Map()
            });
        }

        const session = trackingSessions.get(orderId);
        
        if (userType === 'user') {
            session.users.set(socket.id, { socket, userData });
        } else if (userType === 'delivery_partner') {
            session.deliveryPartners.set(socket.id, { socket, userData });
        } else if (userType === 'bus') {
            session.buses.set(socket.id, { socket, userData });
        }

        console.log(`${userType} joined tracking room for order ${orderId}`);
        
        // Notify others in the room
        socket.to(roomName).emit('user_joined', {
            userType,
            orderId,
            userData
        });

        // Send current locations to the new user
        if (userLocations.has(orderId)) {
            socket.emit('initial_locations', userLocations.get(orderId));
        }

        let runtimeState = orderRuntimeStateById.get(orderId);
        if (!runtimeState) {
            const recovered = await getRuntimeStateFromDb(orderId);
            if (recovered) {
                runtimeState = {
                    status: recovered.status,
                    partner: recovered.partner,
                    reward: recovered.reward,
                    handoverProofImageUrl: recovered.handoverProofImageUrl,
                };
            }
        }
        if (runtimeState) {
            socket.emit('tracking_snapshot', {
                orderId,
                status: runtimeState.status,
                partner: runtimeState.partner,
            });
        }
    });

    // Leave tracking room
    socket.on('leave_tracking', (data) => {
        const { orderId } = data;
        const roomName = `order_${orderId}`;
        
        socket.leave(roomName);
        
        if (trackingSessions.has(orderId)) {
            const session = trackingSessions.get(orderId);
            session.users.delete(socket.id);
            session.deliveryPartners.delete(socket.id);
            session.buses.delete(socket.id);
            
            // Clean up empty sessions
            if (session.users.size === 0 && 
                session.deliveryPartners.size === 0 && 
                session.buses.size === 0) {
                trackingSessions.delete(orderId);
                userLocations.delete(orderId);
            }
        }

        console.log(`${socket.userType} left tracking room for order ${orderId}`);
    });

    // Handle location updates
    socket.on('location_update', (data) => {
        const { orderId, location } = data;
        const roomName = `order_${orderId}`;
        
        // Store location
        if (!userLocations.has(orderId)) {
            userLocations.set(orderId, {});
        }
        
        const orderLocations = userLocations.get(orderId);
        const locationKey = `${socket.userType}_${socket.id}`;
        orderLocations[locationKey] = {
            ...location,
            userType: socket.userType,
            userId: socket.userData?.userId || socket.id,
            lastUpdate: new Date()
        };

        // Broadcast to others in the room
        socket.to(roomName).emit('location_updated', {
            orderId,
            location: orderLocations[locationKey],
            userType: socket.userType,
            userId: socket.userData?.userId || socket.id
        });

        console.log(`Location update from ${socket.userType} for order ${orderId}`);
    });

    // Handle journey status updates
    socket.on('journey_status_update', (data) => {
        const { orderId, status } = data;
        const roomName = `order_${orderId}`;
        
        // Broadcast to others in the room
        socket.to(roomName).emit('journey_status_updated', {
            orderId,
            status,
            userType: socket.userType,
            userId: socket.userData?.userId || socket.id,
            timestamp: new Date()
        });

        console.log(`Journey status update: ${status} for order ${orderId}`);
    });

    // Handle delivery status updates
    socket.on('delivery_status_update', (data) => {
        const { orderId, status, location } = data;
        const roomName = `order_${orderId}`;
        
        // Broadcast to others in the room
        socket.to(roomName).emit('delivery_status_updated', {
            orderId,
            status,
            location,
            partnerId: socket.userData?.partnerId || socket.id,
            timestamp: new Date()
        });

        console.log(`Delivery status update: ${status} for order ${orderId}`);
    });

    // Handle ETA updates
    socket.on('eta_update', (data) => {
        const { orderId, eta, distance } = data;
        const roomName = `order_${orderId}`;
        
        // Broadcast to others in the room
        socket.to(roomName).emit('eta_updated', {
            orderId,
            eta,
            distance,
            from: socket.userType,
            timestamp: new Date()
        });
    });

    // Handle alerts
    socket.on('tracking_alert', (data) => {
        const { orderId, alertType, message } = data;
        const roomName = `order_${orderId}`;
        
        // Broadcast alert to all users in the room
        io.to(roomName).emit('tracking_alert_received', {
            orderId,
            alertType,
            message,
            from: socket.userType,
            timestamp: new Date()
        });

        console.log(`Alert sent for order ${orderId}: ${message}`);
    });

    // Get list of users in tracking room
    socket.on('get_tracking_users', (data) => {
        const { orderId } = data;
        
        if (trackingSessions.has(orderId)) {
            const session = trackingSessions.get(orderId);
            const users = {
                users: Array.from(session.users.values()).map(u => u.userData),
                deliveryPartners: Array.from(session.deliveryPartners.values()).map(u => u.userData),
                buses: Array.from(session.buses.values()).map(u => u.userData)
            };
            
            socket.emit('tracking_users_list', {
                orderId,
                users
            });
        }
    });

    // -------------------- Partner-specific Events --------------------
    
    // Handle partner joining partner room (for order notifications)
    socket.on('join_partner_room', (data) => {
        const { busStop, partnerId } = data;
        const partnerRoomName = `partners_${busStop}`;
        socket.join(partnerRoomName);
        socket.partnerBusStop = busStop;
        socket.partnerId = partnerId;
        console.log(`Partner ${partnerId} joined room: ${busStop}`);
    });

    // Partner pending screen subscribes to their approval room
    socket.on('watch_approval', (data) => {
        const { partnerId } = data;
        socket.join(`partner_approval_${partnerId}`);
        console.log(`Socket ${socket.id} watching approval for partner ${partnerId}`);
    });

    // Handle order acceptance by delivery partners
    socket.on('order_accepted', (data) => {
        const { orderId, busStop, partnerInfo } = data;
        const partnerRoomName = `partners_${busStop}`;
        const orderRoomName = `order_${orderId}`;
        
        // Notify other partners that order is taken
        socket.to(partnerRoomName).emit('order_update', {
            type: 'order_accepted',
            orderId,
            acceptedBy: socket.partnerId
        });

        // Notify the user's tracking room — partner has been assigned
        const partner = partnerInfo || {
            partnerId:   socket.partnerId,
            name:        socket.userData?.name || 'Delivery Partner',
            phone:       socket.userData?.phone || '',
            vehicleType: socket.userData?.vehicleType || 'Bike',
        };
        io.to(orderRoomName).emit('partner_status_update', { orderId, partner });

        console.log(`✅ Order ${orderId} accepted — notified room order_${orderId}`);
    });

    // Handle order status updates from delivery partners
    socket.on('order_status_update', async (data) => {
        const { orderId, status } = data;
        const orderRoomName = `order_${orderId}`;

        const existingState = orderRuntimeStateById.get(orderId) || { status: 'pending', partner: null, reward: 0, handoverProofImageUrl: '' };
        const partnerFromSocket = existingState.partner || {
            partnerId: socket.partnerId,
            name: socket.userData?.partnerName || socket.userData?.name || 'Delivery Partner',
            phone: socket.userData?.phone || '',
            vehicleType: socket.userData?.vehicleType || 'Bike',
            busStop: socket.userData?.busStop || '',
        };
        const resolvedReward = Number(data.reward ?? existingState.reward ?? 0);
        const resolvedHandoverProof = data.handoverProofImageUrl || existingState.handoverProofImageUrl || orderHandoverProofById.get(orderId) || '';

        if (status === 'handover' && !resolvedHandoverProof) {
            socket.emit('order_status_error', {
                orderId,
                status,
                message: 'Bus handover photo proof is required before completing delivery',
            });
            return;
        }

        orderRuntimeStateById.set(orderId, {
            status,
            partner: partnerFromSocket,
            reward: resolvedReward,
            handoverProofImageUrl: resolvedHandoverProof,
        });

        await UserModel.updateOne(
            { 'orders.orderId': orderId },
            {
                $set: {
                    'orders.$.orderStatus': status,
                    'orders.$.partnerInfo': partnerFromSocket,
                    'orders.$.pickupReward': resolvedReward,
                    'orders.$.handoverProofImageUrl': resolvedHandoverProof,
                    'orders.$.lastStatusUpdatedAt': new Date(),
                },
            }
        );
        
        // Broadcast status update to all tracking the order
        io.to(orderRoomName).emit('order_status_updated', {
            orderId,
            status,
            partnerId: socket.partnerId,
            partner: partnerFromSocket,
            ...data,
            timestamp: new Date()
        });

        const owner = orderOwnerById.get(orderId);
        const statusTitleMap = {
            confirmed: 'Order Confirmed',
            packed: 'Order Packed',
            partner_at_stop: 'Partner Waiting at Stop',
            handover: 'Order Delivered'
        };
        const statusBodyMap = {
            confirmed: 'Your order is confirmed and is being prepared.',
            packed: 'Your order has been packed and is ready for pickup.',
            partner_at_stop: 'Your delivery partner is waiting at your selected stop.',
            handover: 'Your order has been handed over successfully.'
        };

        sendPushToUser(owner?.userId, {
            title: statusTitleMap[status] || 'Order Update',
            body: statusBodyMap[status] || `Order status changed to ${status}`,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: `order_status_${orderId}_${status}`,
            data: {
                url: '/tracking',
                orderId,
                status,
                type: 'order_status'
            }
        }).catch((err) => console.error('Push notify error:', err.message));

        if (status === 'handover') {
            try {
                const partnerId = data.partnerId || partnerFromSocket?.partnerId || socket.partnerId;
                if (partnerId) {
                    const partnerDoc = await DeliveryPartnerModel.findById(partnerId);
                    if (partnerDoc) {
                        const alreadyRecorded = (partnerDoc.completedOrderLog || []).some((entry) => entry.orderId === orderId);
                        if (!alreadyRecorded) {
                            await partnerDoc.recordCompletedOrder(orderId, resolvedReward, {
                                handoverProofImageUrl: resolvedHandoverProof,
                            });
                        }
                    }
                }
            } catch (persistErr) {
                console.error('Failed to persist partner earnings:', persistErr.message);
            }
        }

        if (status === 'handover' || status === 'cancelled') {
            orderOwnerById.delete(orderId);
            orderRuntimeStateById.delete(orderId);
            orderHandoverProofById.delete(orderId);
        }

        console.log(`Order ${orderId} status updated to: ${status} by partner ${socket.partnerId}`);
    });

    // Handle partner availability updates
    socket.on('partner_availability_update', (data) => {
        const { partnerId, isAvailable } = data;
        console.log(`Partner ${partnerId} availability: ${isAvailable}`);
        
        // In a real app, you'd update this in the database
        // For now, just log it
    });

    // Broadcast new orders to all partners at a bus stop
    socket.on('broadcast_new_order', (data) => {
        const { busStop, order } = data;
        const partnerRoomName = `partners_${busStop}`;
        
        socket.to(partnerRoomName).emit('order_update', {
            type: 'new_order',
            order
        });
        
        console.log(`New order broadcasted to partners at ${busStop}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Clean up from tracking sessions
        if (socket.orderId && trackingSessions.has(socket.orderId)) {
            const session = trackingSessions.get(socket.orderId);
            session.users.delete(socket.id);
            session.deliveryPartners.delete(socket.id);
            session.buses.delete(socket.id);
            
            // Notify others in the room
            const roomName = `order_${socket.orderId}`;
            socket.to(roomName).emit('user_left', {
                userType: socket.userType,
                orderId: socket.orderId,
                userId: socket.userData?.userId || socket.id
            });
            
            // Clean up empty sessions
            if (session.users.size === 0 && 
                session.deliveryPartners.size === 0 && 
                session.buses.size === 0) {
                trackingSessions.delete(socket.orderId);
                userLocations.delete(socket.orderId);
            }
        }
    });
});

// -------------------- API Routes --------------------
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await EmployeeModel.findOne({ email });
        if (!user) return res.status(404).json('No records found');
        if (user.password !== password) return res.status(401).json('Invalid email or password');
        res.json('Successfully Logged In');
    } catch (err) {
        res.status(500).json('Error: ' + err);
    }
});

app.post('/register', async (req, res) => {
    try {
        const employee = await EmployeeModel.create(req.body);
        res.json(employee);
    } catch (err) {
        res.status(500).json('Error: ' + err);
    }
});

// -------------------- User Management Routes --------------------

// Create or get user by phone number (during OTP verification)
app.post('/api/user/verify-phone', async (req, res) => {
    try {
        const { phoneNumber, name } = req.body;
        
        console.log('📱 User verification request:', { phoneNumber: phoneNumber?.substring(0, 6) + 'xxxxx', name });
        
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        
        let user = await UserModel.findOne({ phoneNumber });
        
        if (!user) {
            // Create new user
            user = new UserModel({
                phoneNumber,
                name: name || '',
                isVerified: true
            });
            const savedUser = await user.save();
            console.log('✅ New user created and saved to MongoDB:', {
                id: savedUser._id,
                phoneNumber: savedUser.phoneNumber?.substring(0, 6) + 'xxxxx',
                name: savedUser.name
            });
        } else {
            // Update existing user verification status
            user.isVerified = true;
            if (name && name.trim()) {
                user.name = name;
            }
            await user.save();
            console.log('✅ Existing user verified and updated:', {
                id: user._id,
                phoneNumber: user.phoneNumber?.substring(0, 6) + 'xxxxx',
                name: user.name
            });
        }
        
        res.json({
            success: true,
            user: {
                phoneNumber: user.phoneNumber,
                name: user.name,
                orderCount: user.orderCount,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('❌ User verification error:', error);
        res.status(500).json({ success: false, message: 'User verification failed', error: error.message });
    }
});

// Get user details by phone number
app.get('/api/user/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        
        const user = await UserModel.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                phoneNumber: user.phoneNumber,
                name: user.name,
                orderCount: user.orderCount,
                isVerified: user.isVerified,
                orders: user.orders
            }
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user details', error: error.message });
    }
});

// Get one specific order for a specific user (Order Summary source of truth)
app.get('/api/user/:phoneNumber/orders/:orderId', async (req, res) => {
    try {
        const { phoneNumber, orderId } = req.params;

        const user = await UserModel.findOne({ phoneNumber }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const order = (user.orders || []).find((o) => String(o.orderId) === String(orderId));
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found for this user' });
        }

        res.json({
            success: true,
            order: {
                orderId: order.orderId,
                items: order.items || [],
                totalAmount: order.totalAmount || 0,
                paymentStatus: order.paymentStatus || 'pending',
                paymentId: order.paymentId || null,
                razorpayOrderId: order.razorpayOrderId || null,
                paymentMethod: order.paymentMethod || null,
                busStop: order.busStop || null,
                orderDate: order.orderDate || null,
            }
        });
    } catch (error) {
        console.error('Get user order error:', error);
        res.status(500).json({ success: false, message: 'Failed to get order details', error: error.message });
    }
});

// Update user name
app.patch('/api/user/update-name', async (req, res) => {
    try {
        const { phoneNumber, name } = req.body;
        
        if (!phoneNumber || !name) {
            return res.status(400).json({ success: false, message: 'Phone number and name are required' });
        }
        
        const user = await UserModel.findOneAndUpdate(
            { phoneNumber },
            { name: name.trim() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            user: {
                phoneNumber: user.phoneNumber,
                name: user.name,
                orderCount: user.orderCount,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('Update user name error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user name', error: error.message });
    }
});

// -------------------- Browser Push Notification Routes --------------------

app.post('/api/notifications/subscribe', (req, res) => {
    try {
        const { userId, subscription } = req.body;

        if (!PUSH_ENABLED) {
            return res.status(503).json({ success: false, message: 'Push notifications are not configured on server' });
        }
        if (!userId || !subscription?.endpoint) {
            return res.status(400).json({ success: false, message: 'userId and subscription are required' });
        }

        if (!pushSubscriptionsByUser.has(userId)) {
            pushSubscriptionsByUser.set(userId, new Map());
        }

        pushSubscriptionsByUser.get(userId).set(subscription.endpoint, subscription);
        return res.json({ success: true, message: 'Subscription registered' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to register subscription', error: error.message });
    }
});

app.post('/api/notifications/unsubscribe', (req, res) => {
    try {
        const { userId, endpoint } = req.body;
        if (!userId || !endpoint) {
            return res.status(400).json({ success: false, message: 'userId and endpoint are required' });
        }

        const map = pushSubscriptionsByUser.get(userId);
        if (!map) return res.json({ success: true, message: 'No active subscription found' });

        map.delete(endpoint);
        if (map.size === 0) {
            pushSubscriptionsByUser.delete(userId);
        }

        return res.json({ success: true, message: 'Subscription removed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to remove subscription', error: error.message });
    }
});

// -------------------- Razorpay Payment Routes --------------------

// 1. Create Order
app.post('/api/payment/create-order', async (req, res) => {
    try {
        const { amount, cartItems, userId } = req.body;

        const options = {
            amount:   Math.round(amount * 100), // paise
            currency: 'INR',
            receipt:  `rcpt_${Date.now()}`,
            notes: {
                userId:       userId || 'guest',
                itemCount:    cartItems?.length || 0,
                merchant_vpa: 'manupriyadhanushvayalambron-1@oksbi',
            },
        };

        const order = await razorpay.orders.create(options);

        console.log('\n✅ [ORDER CREATED]', {
            orderId:   order.id,
            amount:    `₹${amount}`,
            items:     cartItems?.map(i => `${i.name} x${i.quantity}`) || [],
            timestamp: new Date().toISOString(),
        });

        res.json({
            success:  true,
            orderId:  order.id,
            amount:   order.amount,
            currency: order.currency,
            keyId:    process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('\n❌ [ORDER CREATION FAILED]', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Verify Payment (called after Razorpay popup success)
app.post('/api/payment/verify', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cartItems,
            totalAmount,
            userId,
            phoneNumber,
            paymentMethod,
            busStop
        } = req.body;

        // HMAC-SHA256 signature check
        const body              = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // ── FIX 1: Generate customOrderId BEFORE user lookup — never null ──
            // Tracking.jsx joins socket room order_{customOrderId} immediately after
            // payment. If this is null, the user joins room "order_null" and never
            // receives the partner_status_update. Always generate it here.
            const customOrderId = `YATH-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

            // ── Broadcast new order to delivery partners at the bus stop ──
            // Done here (outside user block) so guest users also get delivery service.
            if (!busStop) {
                console.warn('⚠️  No busStop in payment/verify body — order will NOT be visible to partners');
            } else {
                const orderForPartners = {
                    orderId:        customOrderId,
                    razorpayOrderId: razorpay_order_id,
                    userId:         phoneNumber || 'guest',
                    userName:       'Customer',
                    userPhone:      phoneNumber || '',
                    items:          cartItems,
                    total:          totalAmount,
                    busStop,
                    status:         'confirmed',
                    pickupReward:   Math.round(totalAmount * 0.1),
                    createdAt:      new Date().toISOString(),
                };
                // ── FIX 2: Also store in MongoDB so a server restart doesn't wipe it ──
                // (pendingOrdersByStop in-memory store is still used for speed,
                //  but we also persist so partners can still see it after restart)
                if (!pendingOrdersByStop.has(busStop)) pendingOrdersByStop.set(busStop, []);
                pendingOrdersByStop.get(busStop).push(orderForPartners);
                orderOwnerById.set(customOrderId, {
                    userId: phoneNumber || null,
                    busStop,
                });
                orderRuntimeStateById.set(customOrderId, {
                    status: 'pending',
                    partner: null,
                });
                io.to(`partners_${busStop}`).emit('order_update', {
                    type: 'new_order',
                    order: orderForPartners
                });
                console.log(`📦 New order broadcasted to partners at ${busStop} | orderId: ${customOrderId} | room: partners_${busStop}`);
            }

            // Save order to user's MongoDB record (non-blocking — don't await failures)
            if (phoneNumber) {
                try {
                    const user = await UserModel.findOne({ phoneNumber });
                    if (user) {
                        // Pass pre-generated ID so order history matches tracking
                        // addOrder may or may not accept a pre-set orderId depending
                        // on your User model version. Either way customOrderId is already
                        // set above — we do NOT use addOrder's return value.
                        user.addOrder({
                            orderId:       customOrderId,
                            items:         cartItems,
                            totalAmount,
                            paymentStatus: 'success',
                            paymentId:     razorpay_payment_id,
                            razorpayOrderId: razorpay_order_id,
                            paymentMethod: paymentMethod || 'razorpay',
                            busStop,
                            orderStatus:   'pending',
                            pickupReward:  Math.round(totalAmount * 0.1),
                            refundStatus:  'not_required',
                            lastStatusUpdatedAt: new Date(),
                        });
                        await user.save();
                        console.log(`✅ Order ${customOrderId} saved for user ${phoneNumber}`);
                    }
                } catch (userError) {
                    console.error('Error saving order to user:', userError);
                }
            }

            const paymentRecord = {
                status:       'SUCCESS',
                orderId:      razorpay_order_id,
                customOrderId: customOrderId,
                paymentId:    razorpay_payment_id,
                amount:       `₹${totalAmount}`,
                userId:       userId || 'guest',
                phoneNumber:  phoneNumber,
                merchant_vpa: 'manupriyadhanushvayalambron-1@oksbi',
                items:        cartItems?.map(i => ({
                                  name:     i.name,
                                  qty:      i.quantity,
                                  price:    `₹${i.price}`,
                                  subtotal: `₹${i.price * i.quantity}`,
                              })),
                timestamp:    new Date().toISOString(),
            };

            console.log('\n✅ ══════════════════════════════════════');
            console.log('   PAYMENT SUCCESSFUL');
            console.log('══════════════════════════════════════');
            console.log(JSON.stringify(paymentRecord, null, 2));
            console.log('══════════════════════════════════════\n');

            // Browser push alert for payment success.
            sendPushToUser(phoneNumber, {
                title: 'Payment Successful',
                body: `Rs.${totalAmount} paid successfully. Order ${customOrderId} confirmed.`,
                icon: '/vite.svg',
                badge: '/vite.svg',
                tag: `payment_success_${customOrderId}`,
                data: {
                    url: '/order-summary',
                    orderId: customOrderId,
                    paymentId: razorpay_payment_id,
                    type: 'payment_success'
                }
            }).catch((err) => console.error('Push notify error:', err.message));

            res.json({ 
                success: true, 
                paymentId: razorpay_payment_id,
                customOrderId: customOrderId
            });
        } else {
            // Save failed payment to user's record
            if (phoneNumber) {
                try {
                    const user = await UserModel.findOne({ phoneNumber });
                    if (user) {
                        const failedOrderId = user.addOrder({
                            items: cartItems,
                            totalAmount,
                            paymentStatus: 'failed',
                            paymentId: razorpay_payment_id,
                            paymentMethod: paymentMethod || 'razorpay'
                        });
                        await user.save();
                        console.log(`❌ Failed order ${failedOrderId} saved for user ${phoneNumber}`);
                    }
                } catch (userError) {
                    console.error('Error saving failed order to user:', userError);
                }
            }

            const failRecord = {
                status:    'FAILED — SIGNATURE MISMATCH',
                orderId:   razorpay_order_id,
                paymentId: razorpay_payment_id,
                userId:    userId || 'guest',
                phoneNumber: phoneNumber,
                timestamp: new Date().toISOString(),
            };

            console.log('\n❌ ══════════════════════════════════════');
            console.log('   PAYMENT VERIFICATION FAILED');
            console.log('══════════════════════════════════════');
            console.log(JSON.stringify(failRecord, null, 2));
            console.log('══════════════════════════════════════\n');

            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (err) {
        console.error('\n❌ [VERIFY ERROR]', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Payment Failed / Cancelled
app.post('/api/payment/failed', async (req, res) => {
    const { orderId, error, cartItems, totalAmount, userId, phoneNumber, paymentMethod, busStop, razorpay_order_id } = req.body;

    // Save failed payment to user's record
    if (phoneNumber) {
        try {
            const user = await UserModel.findOne({ phoneNumber });
            if (user) {
                const failedOrderId = user.addOrder({
                    items: cartItems,
                    totalAmount,
                    paymentStatus: 'failed',
                    paymentId: null,
                    razorpayOrderId: razorpay_order_id || null,
                    paymentMethod: paymentMethod || 'razorpay',
                    busStop,
                });
                await user.save();
                console.log(`❌ Failed order ${failedOrderId} saved for user ${phoneNumber}`);
            }
        } catch (userError) {
            console.error('Error saving failed order to user:', userError);
        }
    }

    const failRecord = {
        status:    'FAILED',
        orderId:   orderId || 'unknown',
        reason:    error?.description || error?.reason || 'User cancelled or payment declined',
        code:      error?.code || 'N/A',
        amount:    `₹${totalAmount}`,
        userId:    userId || 'guest',
        phoneNumber: phoneNumber,
        items:     cartItems?.map(i => `${i.name} x${i.quantity}`) || [],
        timestamp: new Date().toISOString(),
    };

    console.log('\n❌ ══════════════════════════════════════');
    console.log('   PAYMENT FAILED');
    console.log('══════════════════════════════════════');
    console.log(JSON.stringify(failRecord, null, 2));
    console.log('══════════════════════════════════════\n');

    res.json({ success: true, received: true });
});

// -------------------- Serve React Frontend --------------------
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
    console.log('Socket.IO enabled for real-time tracking');
});