import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Signup from './Signup';
import Login from './Login';
import Home from './Home';

import YathrikaHome from './pages/YathrikaHome';
import YathrikaSignin from './pages/YathrikaSignin';
import Cart from './pages/Cart';
import Payment from './pages/Payment'; 
import Products from './pages/Products';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import OrderHistory from './pages/OrderHistory';
import OrderSummary from './pages/OrderSummary';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import Support from './pages/Support';
import Tracking from './pages/Tracking';
import Vendors from './pages/Vendors';
import RoutesPage from './pages/Routes';
import Splash from './pages/Splash';
import UserTypeSelection from './pages/UserTypeSelection';
import DeliveryPartner from './pages/DeliveryPartner';
import DeliveryPartnerAuth from './pages/DeliveryPartnerAuth';
import DeliveryPartnerDashboard from './pages/DeliveryPartnerDashboard';
import LiveTrackingDemo from './pages/LiveTrackingDemo';

import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { LanguageProvider } from './LanguageContext';
import LanguageToggle from './LanguageToggle';

const FloatingLanguageToggle = () => {
  const location = useLocation();
  const hiddenRoutes = ['/splash'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="floating-language-toggle">
      <LanguageToggle />
    </div>
  );
};

function App() {
  return (
    <div className="dark">
      <LanguageProvider>
        <CartProvider>
        <BrowserRouter>
          <FloatingLanguageToggle />
          <Routes>
            <Route path="/" element={<Navigate to="/splash" />} />

            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />

            <Route path="/yathrika" element={<Navigate to="/yathrika-home" />} />
            <Route path="/yathrika-home" element={<YathrikaHome />} />
            <Route path="/yathrika-signin" element={<YathrikaSignin />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products" element={<Products />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/payment" element={<Payment />} />

            <Route path="/tracking" element={<Tracking />} />
            <Route path="/support" element={<Support />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/splash" element={<Splash />} />

            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/delivery-partner" element={<DeliveryPartner />} />
            <Route path="/delivery-partner-auth" element={<DeliveryPartnerAuth />} />
            <Route path="/delivery-partner-dashboard" element={<DeliveryPartnerDashboard />} />
            <Route path="/live-tracking-demo" element={<LiveTrackingDemo />} />
          </Routes>
        </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;