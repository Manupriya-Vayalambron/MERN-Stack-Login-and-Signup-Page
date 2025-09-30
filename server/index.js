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

app.listen(3001, () => {
    console.log("Server Started on port 3001");
});*/

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // For serving React build
const EmployeeModel = require('./models/Employee');

const app = express();
app.use(express.json());
app.use(cors());

// -------------------- MongoDB Setup --------------------
// Replace <username>, <password>, and <dbname> with your Atlas credentials and DB name
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
app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
});
