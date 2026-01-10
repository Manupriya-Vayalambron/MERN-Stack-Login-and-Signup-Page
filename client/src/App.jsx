import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
// Yathrika App Components
import YathrikaHome from './pages/YathrikaHome';
import YathrikaSignin from './pages/YathrikaSignin';
import Cart from './pages/Cart';
import Products from './pages/Products';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import OrderSummary from './pages/OrderSummary';
import OTP from './pages/OTP';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Support from './pages/Support';
import Tracking from './pages/Tracking';
import Vendors from './pages/Vendors';
import RoutesPage from './pages/Routes';
import Splash from './pages/Splash';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

function App() {

  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <Navigate to="/splash" />
          } />
          
          {/* Original MERN Auth Routes */}
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          
          {/* Yathrika App Routes */}
          <Route path="/yathrika" element={<Navigate to="/yathrika-home" />} />
          <Route path="/yathrika-home" element={<YathrikaHome />} />
          <Route path="/yathrika-signin" element={<YathrikaSignin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/products" element={<Products />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Additional Yathrika App Routes */}
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/otp" element={<OTP />} />
          
          {/* Additional Yathrika App Routes */}
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/support" element={<Support />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/splash" element={<Splash />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
