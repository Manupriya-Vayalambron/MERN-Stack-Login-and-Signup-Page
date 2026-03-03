import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import LanguageToggle from '../LanguageToggle';
import { useCart } from '../CartContext';
import '../index.css';

const Cart = () => {
  const { language } = useLanguage();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const isEmpty = cartItems.length === 0;

  const [busStop, setBusStop] = React.useState(null);
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('yathrika_bus_stop');
      if (saved) setBusStop(JSON.parse(saved));
    } catch(_) {}
  }, []);

  return (
    <div className="cart-page-container">
      <style>{`
        .cart-delivery-info {
          background: rgba(104,249,26,0.06);
          border: 1px solid rgba(104,249,26,0.2);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .cart-delivery-info-title {
          color: #68f91a;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0;
        }
        .cart-delivery-info-value {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
        }
        .cart-delivery-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #aaa;
          font-size: 0.82rem;
          margin: 0;
        }
        .cart-delivery-info-highlight {
          color: #68f91a;
          font-weight: 700;
          font-size: 0.85rem;
        }
      `}</style>
      <div className="cart-content-wrapper">
        <header className="cart-header">
          <div className="cart-header-inner">
            <div className="cart-header-left">
              <Link to="/products" className="cart-back-button">
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </Link>
            </div>
            <h1 className="cart-page-title">{language === 'en' ? 'My Cart' : 'എന്റെ കാർട്ട്'}</h1>
          </div>
        </header>

        <main className="cart-main-content">

          {/* ── EMPTY STATE ── */}
          {isEmpty ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <h2 className="cart-empty-title">
                {language === 'en' ? 'Your cart is empty' : 'കാർട്ട് ശൂന്യമാണ്'}
              </h2>
              <p className="cart-empty-subtitle">
                {language === 'en'
                  ? 'Add items from the shop to get started'
                  : 'ആരംഭിക്കാൻ കടയിൽ നിന്ന് ഉൽപ്പന്നങ്ങൾ ചേർക്കുക'}
              </p>
              <Link to="/products" className="cart-shop-button">
                {language === 'en' ? 'Browse Products' : 'ഉൽപ്പന്നങ്ങൾ കാണുക'}
              </Link>
            </div>
          ) : (
            <>
              {/* ── CART ITEMS ── */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div
                      className="cart-item-image"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    ></div>

                    <div className="cart-item-details">
                      <p className="cart-item-name">
                        {language === 'en' ? item.name : (item.malayalamName || item.name)}
                      </p>
                      <p className="cart-item-price">₹{item.price} {language === 'en' ? 'each' : 'ഓരോന്നിനും'}</p>
                      <p className="cart-item-subtotal">
                        {language === 'en' ? 'Total' : 'ആകെ'}: ₹{item.price * item.quantity}
                      </p>
                    </div>

                    <div className="cart-item-right">
                      {/* Quantity stepper */}
                      <div className="cart-quantity-controls">
                        <button
                          className="quantity-button quantity-decrease"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          className="quantity-button quantity-increase"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        className="cart-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        title={language === 'en' ? 'Remove item' : 'നീക്കം ചെയ്യുക'}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── COUPON ── */}
              <div className="cart-coupon-section">
                <div className="coupon-input-wrapper">
                  <label className="coupon-input-label" htmlFor="coupon">
                    {language === 'en' ? "Coupon Code" : "കൂപ്പൺ കോഡ്"}
                  </label>
                  <input
                    className="coupon-input-field"
                    id="coupon"
                    placeholder={language === 'en' ? "Enter coupon code" : "കൂപ്പൺ കോഡ് നൽകുക"}
                    type="text"
                  />
                </div>
                <button className="coupon-apply-button">
                  {language === 'en' ? "Apply" : "സമർപ്പിക്കുക"}
                </button>
              </div>

              {/* ── PRICE DETAILS ── */}
              <div className="cart-price-details">
                <h2 className="price-details-title">
                  {language === 'en' ? "Price Details" : "പണമടയ്ക്കൽ വിവരങ്ങൾ"}
                </h2>

                {/* Delivery Info Summary */}
                {busStop && (
                  <div className="cart-delivery-info">
                    <p className="cart-delivery-info-title">
                      {language === 'en' ? '🚏 Delivery Stop' : '🚏 ഡെലിവറി സ്റ്റോപ്പ്'}
                    </p>
                    <p className="cart-delivery-info-value">{busStop.name}</p>
                    {busStop.busNumber && (
                      <p className="cart-delivery-info-row">
                        <span>🚌 {language === 'en' ? 'Bus' : 'ബസ്'}</span>
                        <span className="cart-delivery-info-highlight">{busStop.busNumber}</span>
                      </p>
                    )}
                    {busStop.seatNumber && (
                      <p className="cart-delivery-info-row">
                        <span>💺 {language === 'en' ? 'Seat' : 'സീറ്റ്'}</span>
                        <span className="cart-delivery-info-highlight">{busStop.seatNumber}</span>
                      </p>
                    )}
                  </div>
                )}
                <div className="price-breakdown">
                  <div className="price-line">
                    <p>{language === 'en' ? "Subtotal" : "ഉപതുക"}</p>
                    <p>₹{getTotalPrice()}</p>
                  </div>
                  <div className="price-line">
                    <p>{language === 'en' ? "Delivery Fee" : "ഡെലിവറി ചാർജ്"}</p>
                    <p>₹40</p>
                  </div>
                  <div className="price-line">
                    <p>{language === 'en' ? "Discount" : "കിഴിവ്"}</p>
                    <p className="discount-amount">-₹20</p>
                  </div>
                  <div className="price-divider"></div>
                  <div className="price-total">
                    <p>{language === 'en' ? "Total Amount" : "ആകെ തുക"}</p>
                    <p>₹{getTotalPrice() + 40 - 20}</p>
                  </div>
                </div>
              </div>

              {/* ── CHECKOUT ── */}
              <div className="cart-checkout-section">
                <Link to="/payment" className="cart-checkout-button">
                  <span>{language === 'en' ? "Proceed to Checkout" : "പണമടയ്ക്കുന്നതിലേക്ക് പോകുക"}</span>
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="cart-footer-nav">
        <nav className="cart-nav-container">
          <Link className="cart-nav-item" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
            <span className="cart-nav-text">{language === 'en' ? 'Home' : 'ഹോം'}</span>
          </Link>
          <Link className="cart-nav-item" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
            </svg>
            <span className="cart-nav-text">{language === 'en' ? 'Orders' : 'ഓർഡറുകൾ'}</span>
          </Link>
          <Link className="cart-nav-item" to="/user-profile">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
            <span className="cart-nav-text">{language === 'en' ? 'Profile' : 'പ്രൊഫൈൽ'}</span>
          </Link>
          <Link className="cart-nav-item" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="cart-nav-text">{language === 'en' ? 'Notifications' : 'അറിയിപ്പുകൾ'}</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Cart;