import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';

const Products = () => {
  const navigate = useNavigate();
  
  const products = [
    {
      id: 1,
      name: 'Fresh Mangoes',
      price: 120,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEKTFnOFahdp4MEIF6tvk1AQar29GFzItRPmYFTSkKp9CWXeaL94YqIpZKyVNa9uJItLfqYVavLIyfgUk4NGici-46S3TXVcvfJpSSPKQ1UrYVxqzEENEIh2YPbS0ELGgV_dUN8BAKwCZD1Z1guwLGRB67cimRcJ680ayuNUocNGFgqnbqGxaSQFHx61OdlweoHttrK608E1ASy48CNViaalG7KB7jCtNqsJNBZ5poGo2Yql7gI6YKVpET8Pc9iEB877IrtjZbNkM'
    },
    {
      id: 2,
      name: 'Organic Veggies',
      price: 250,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYHtCFK4nI6zE_Clavh58ONQAVXBKPFxG0OUPR_QBSMsQj2d6daLPy7n4xJpp2T-Ox32pf_2yxuXB6c8_8yWPIn40LG3TxV5fa8qbwoeNaSkmuokX6aox-al76EBkEKn8dJ0Q77JGYKMgSC18owTx3YtKAqbuOefvmX2PNt51SJlX_GPMg_9589CKlfXFb9vo6DpcAgxJflvkV5exgfayrNHneLoWaj6u34rfi_I8reePE4bzCRGvLMPW6REtpNCNK67-1yHePaBI'
    },
    {
      id: 3,
      name: 'Ayurvedic Meds',
      price: 300,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqlJKl5fAbJocSt7uh22rPDmKDJc8G-M0Ltd3I-Leqrl3IpFkNTZULcl0jthRtX0j4eAVBh1LKokor5LH70x4fYgPfmy8cs9qC305rSDv0zJadqUrgy84WH9tLCWZ_Um-7gv3P1PwqyeurCjPaE1yiWalQ8hzTRqrneGoMkZqP5V3mJN0rjdhcwUya9d0qK5oCRuLsDbQt2HmGu0VIPNYGSiEPVTg1hnZzZfTflssVVFEIYr1bE8OhC1Mxs_PiwOhASTPegSuQE60'
    },
    {
      id: 4,
      name: 'Fresh Bread',
      price: 50,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASQOMgXBgWQa0gPDmLsoM9VhBi7xSqT91217WbFNxxNY1Jk2op7VA1SFmVt4yG906jElGcKCLrOtuHAcF0YGzunwAF9quxWYSdzDFDLQCnPh3ZG4tS9TGNa9aZxNfxXyyAJ03ji7I5TvI1bAQTqeiDSvACCDTeVPoegI4922bYvD7DazfbJkQDvJArcDIaI2BbOugM1dIC6zw6ILgg37mbrjCHq6QBgY5vZh00R22YRKkGLiFHNG8O4-qATx670H-LVhqLFc3j37M'
    }
  ];

  return (
    <div className="products-page-container">
      <div className="products-content-wrapper">
        <header className="products-header">
          <div className="products-header-inner">
            <h1 className="products-brand-title">Yathrika</h1>
            <button className="products-cart-button" onClick={() => navigate('/cart')}>
              <span className="material-symbols-outlined">
                shopping_cart
              </span>
              <span className="products-cart-badge">3</span>
            </button>
          </div>
          <div className="products-search-container">
            <div className="products-search-wrapper">
              <span className="material-symbols-outlined products-search-icon">
                search
              </span>
              <input 
                className="products-search-input" 
                placeholder="Search for products" 
                type="text"
              />
            </div>
          </div>
        </header>
        
        <main className="products-main-content">
          <div className="products-category-header">
            <h2 className="products-category-title">Shop By Category</h2>
            <div className="products-view-controls">
              <button className="products-view-button products-view-active">
                <span className="material-symbols-outlined">
                  grid_view
                </span>
              </button>
              <button className="products-view-button products-view-inactive">
                <span className="material-symbols-outlined">
                  view_list
                </span>
              </button>
            </div>
          </div>
          
          <div className="products-filter-section">
            <button className="products-filter-button products-filter-active">All</button>
            <button className="products-filter-button products-filter-inactive">Veg/Non-Veg</button>
            <button className="products-filter-button products-filter-inactive">Snacks</button>
            <button className="products-filter-button products-filter-inactive">Essentials</button>
            <button className="products-filter-button products-filter-inactive">Pharmacy</button>
          </div>
          
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="products-card">
                <div 
                  className="products-image" 
                  style={{backgroundImage: `url("${product.image}")`}}
                ></div>
                <h3 className="products-name">{product.name}</h3>
                <div className="products-footer">
                  <p className="products-price">₹{product.price}</p>
                  <button className="products-add-button">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="products-footer-nav">
        <div className="products-nav-container">
          <Link className="products-nav-item products-nav-active" to="/yathrika-home">
            <span className="material-symbols-outlined">home</span>
            <span className="products-nav-text products-nav-text-active">Home</span>
          </Link>
          <Link className="products-nav-item" to="/order-history">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="products-nav-text">Orders</span>
          </Link>
          <Link className="products-nav-item" to="/user-profile">
            <span className="material-symbols-outlined">person</span>
            <span className="products-nav-text">Profile</span>
          </Link>
          <Link className="products-nav-item" to="/notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="products-nav-text">Alerts</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Products;