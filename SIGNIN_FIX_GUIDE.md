# 🔧 **OTP Signin Issue - Quick Fix Guide**

## The Problem
You're experiencing an "unable to fetch" error during OTP verification. This indicates the frontend can't connect to the backend server.

## ✅ **Quick Fix Steps**

### 1. **Check if Backend Server is Running**
```bash
cd server
npm start
```

You should see:
```
Server Started on port 3001
Connected to MongoDB successfully
Socket.IO enabled for real-time tracking
```

### 2. **Verify MongoDB is Running**
- **Windows**: Check if MongoDB service is running in Services
- **Mac/Linux**: Run `sudo systemctl status mongod` or `brew services list | grep mongodb`

### 3. **Create Environment File**
Create `server/.env` file with:
```bash
MONGO_URI=mongodb://localhost:27017/yathrika
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
CLIENT_URL=http://localhost:5173
PORT=3001
```

### 4. **Test Server Connection**
Open browser console on your signin page and run:
```javascript
fetch('http://localhost:3001/api/user/verify-phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '+911234567890', name: 'Test' })
}).then(res => res.json()).then(data => console.log(data));
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "Failed to fetch" / "Network Error"
**Solution**: Backend server is not running
```bash
cd server
npm install  # If first time
npm start
```

### Issue 2: "Server error: 500"
**Solution**: MongoDB connection issue
- Start MongoDB service
- Check MONGO_URI in `.env` file
- Verify MongoDB is accessible on port 27017

### Issue 3: "CORS Error"  
**Solution**: Already configured, but if you see this:
```javascript
// In server/index.js, this should be present:
app.use(cors());
```

### Issue 4: Port Already in Use
**Solution**: Kill the process using port 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux  
lsof -ti:3001 | xargs kill -9
```

## 🧪 **Debug Steps**

1. **Check Server Status**:
   ```bash
   curl http://localhost:3001/api/user/verify-phone -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"+911234567890","name":"test"}'
   ```

2. **Check Network Tab** in browser dev tools during signin

3. **Check Server Logs** in terminal running the server

## 💡 **The Fix Applied**

I've already fixed the port inconsistency issue:
- ✅ All API calls now use `localhost:3001` (was mixing 3001 and 5000)
- ✅ Added better error handling and debugging logs
- ✅ Server is configured to run on port 3001

## 🎯 **Next Steps**

1. **Start the server**: `cd server && npm start`
2. **Start the client**: `cd client && npm run dev`  
3. **Try signin again** - you should see detailed logs in browser console
4. **If still fails**: Check the server terminal for error messages

The issue should be resolved once the backend server is running properly!