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
            licenseNumber,
            vehicleType
        } = req.body;

        // Check if partner already exists
        const existingPartner = await DeliveryPartnerModel.findOne({ email });
        if (existingPartner) {
            return res.status(400).json({ message: 'Partner with this email already exists' });
        }

        // Create new delivery partner
        const newPartner = new DeliveryPartnerModel({
            name,
            email,
            phone,
            password, // In production, this should be hashed
            assignedBusStop,
            licenseNumber,
            vehicleType
        });

        await newPartner.save();

        // Generate simple token (in production, use JWT)
        const token = `partner_${newPartner._id}_${Date.now()}`;
        
        // Remove password from response
        const partnerResponse = newPartner.toObject();
        delete partnerResponse.password;

        res.status(201).json({
            message: 'Partner registered successfully',
            partner: partnerResponse,
            token
        });

    } catch (error) {
        console.error('Partner registration error:', error);
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

app.listen(3001, () => {
    console.log("Server Started on port 3001");
});*/

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const EmployeeModel = require('./models/Employee');
const DeliveryPartnerModel = require('./models/DeliveryPartner');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

// Store active tracking sessions
const trackingSessions = new Map();
// Store user locations
const userLocations = new Map();

// -------------------- MongoDB Setup --------------------
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});

mongoose.connection.on('connected', () => console.log('Mongoose connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected from MongoDB'));

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
    socket.on('join_tracking', (data) => {
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

    // Handle order acceptance by delivery partners
    socket.on('order_accepted', (data) => {
        const { orderId, busStop } = data;
        const partnerRoomName = `partners_${busStop}`;
        const orderRoomName = `order_${orderId}`;
        
        // Notify other partners that order was accepted
        socket.to(partnerRoomName).emit('order_update', {
            type: 'order_accepted',
            orderId,
            acceptedBy: socket.partnerId
        });

        // Notify the user that a partner was assigned
        io.to(orderRoomName).emit('partner_status_update', {
            orderId,
            partner: {
                id: socket.partnerId,
                name: socket.userData?.name || 'Delivery Partner',
                phone: socket.userData?.phone || '+91 9876543210',
                vehicleType: socket.userData?.vehicleType || 'Bike'
            }
        });

        console.log(`Order ${orderId} accepted by partner ${socket.partnerId}`);
    });

    // Handle order status updates from delivery partners
    socket.on('order_status_update', (data) => {
        const { orderId, status } = data;
        const orderRoomName = `order_${orderId}`;
        
        // Broadcast status update to all tracking the order
        io.to(orderRoomName).emit('order_status_updated', {
            orderId,
            status,
            partnerId: socket.partnerId,
            ...data,
            timestamp: new Date()
        });

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
