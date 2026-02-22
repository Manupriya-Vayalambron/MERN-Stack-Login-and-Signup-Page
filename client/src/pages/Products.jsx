import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import LanguageToggle from '../LanguageToggle';
import { useCart } from '../CartContext';
import '../index.css';

const Products = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { addToCart, updateQuantity, getItemQuantity, getTotalCount } = useCart();

  const products = [
    {
      id: 1,
      name: 'Fresh Mangoes',
      malayalamName: 'പച്ച മാങ്ങ',
      price: 120,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEKTFnOFahdp4MEIF6tvk1AQar29GFzItRPmYFTSkKp9CWXeaL94YqIpZKyVNa9uJItLfqYVavLIyfgUk4NGici-46S3TXVcvfJpSSPKQ1UrYVxqzEENEIh2YPbS0ELGgV_dUN8BAKwCZD1Z1guwLGRB67cimRcJ680ayuNUocNGFgqnbqGxaSQFHx61OdlweoHttrK608E1ASy48CNViaalG7KB7jCtNqsJNBZ5poGo2Yql7gI6YKVpET8Pc9iEB877IrtjZbNkM'
    },
    {
      id: 2,
      name: "Lay's Chips",
      malayalamName: 'ലേയ്സ് ചിപ്സ്',
      price: 20,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXgZ9vu0A3VYbyHUbZBL0U-H4s0DkNzxaW0Q&s'
    },
    {
      id: 3,
      name: 'Mirinda',
      malayalamName: 'മിരിൻഡ',
      price: 30,
      image: 'https://5.imimg.com/data5/SELLER/Default/2024/11/462892936/UB/IY/LJ/112583242/marinda-500x500.jpg'
    },
    {
      id: 4,
      name: 'Bread',
      malayalamName: 'ബ്രെഡ്',
      price: 50,
      image: 'https://rukminim2.flixcart.com/image/480/480/xif0q/ready-meal/b/r/g/420-traditional-white-loaf-bread-pack-of-1-1-only-gluten-free-original-imaghgj6unjxgvaz.jpeg?q=90'
    }
  ];

  const totalCount = getTotalCount();

  return (
    <div className="products-page-container">
      <div className="products-content-wrapper">
        <header className="products-header">
          {/* 3-column: LanguageToggle | Title | Cart */}
          <div className="products-header-inner">
            <div className="products-header-left">
               <button className="products-cart-button" onClick={() => navigate('/cart')}>
                <span className="material-symbols-outlined">shopping_cart</span>
                {totalCount > 0 && (
                  <span className="products-cart-badge">{totalCount}</span>
                )}
              </button>
            </div>
            <h1 className="products-brand-title">Yathrika</h1>
            <div className="products-header-right">
             
            </div>
          </div>

          <div className="products-search-container">
            <div className="products-search-wrapper">
              <span className="material-symbols-outlined products-search-icon">search</span>
              <input
                className="products-search-input"
                placeholder={language === 'en' ? "Search for products" : "ഉൽപ്പന്നങ്ങൾ തിരയുക"}
                type="text"
              />
            </div>
          </div>
        </header>

        <main className="products-main-content">
          <div className="products-category-header">
            <h2 className="products-category-title">
              {language === 'en' ? 'Shop By Category' : 'വിഭാഗം തിരഞ്ഞെടുക്കുക'}
            </h2>
            <div className="products-view-controls">
              <button className="products-view-button products-view-active">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button className="products-view-button products-view-inactive">
                <span className="material-symbols-outlined">view_list</span>
              </button>
            </div>
          </div>

          <div className="products-filter-section">
            <button className="products-filter-button products-filter-active">{language === 'en' ? "Food" : "ഭക്ഷണം"}</button>
            <button className="products-filter-button products-filter-inactive">{language === 'en' ? "Medicines" : "മരുന്നുകൾ"}</button>
            <button className="products-filter-button products-filter-inactive">{language === 'en' ? "Essentials" : "ആവശ്യസാധനങ്ങൾ"}</button>
          </div>

          <div className="products-grid">
            {products.map((product) => {
              const qty = getItemQuantity(product.id);
              return (
                <div key={product.id} className="products-card">
                  <div
                    className="products-image"
                    style={{ backgroundImage: `url("${product.image}")` }}
                  ></div>
                  <div className="products-card-body">
                    <h3 className="products-name">
                      {language === 'en' ? product.name : product.malayalamName}
                    </h3>
                    <div className="products-footer">
                      <p className="products-price">₹{product.price}</p>

                      {qty === 0 ? (
                        /* First tap: show Add button */
                        <button
                          className="products-add-button"
                          onClick={() => addToCart(product)}
                        >
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      ) : (
                        /* Already in cart: show inline +/- stepper */
                        <div className="products-qty-controls">
                          <button
                            className="products-qty-btn"
                            onClick={() => updateQuantity(product.id, qty - 1)}
                          >
                            <span className="material-symbols-outlined">remove</span>
                          </button>
                          <span className="products-qty-count">{qty}</span>
                          <button
                            className="products-qty-btn"
                            onClick={() => addToCart(product)}
                          >
                            <span className="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <footer className="products-footer-nav">
        <div className="products-nav-container">
          <Link className="products-nav-item products-nav-active" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="products-nav-text products-nav-text-active">{language === 'en' ? "Home" : "ഹോം"}</span>
          </Link>
          <Link className="products-nav-item" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="products-nav-text">{language === 'en' ? "Orders" : "ഓർഡറുകൾ"}</span>
          </Link>
          <Link className="products-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="products-nav-text">{language === 'en' ? "Profile" : "പ്രൊഫൈൽ"}</span>
          </Link>
          <Link className="products-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="products-nav-text">{language === 'en' ? "Alerts" : "അറിയിപ്പുകൾ"}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Products;