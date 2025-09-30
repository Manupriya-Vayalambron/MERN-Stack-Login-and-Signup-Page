import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const YathrikaHome = () => {
  return (
    <div className="main-wrapper bg-background-light dark:bg-background-dark text-black dark:text-white">
      <div className="flex-grow">
          <header className="header">
          <div className="w-12"></div>
          <h1 className="header-title">Yathrika</h1>
          <div className="flex w-12 items-center justify-end">
            <button className="cart-button">
              <span className="material-symbols-outlined cart-icon">shopping_cart</span>
            </button>
          </div>
        </header>

        <main>
          <div className="search-container">
            <div className="search-wrapper">
              <input 
                className="search-input" 
                placeholder="പദാർത്ഥങ്ങൾക്കായി തിരയുക" 
                type="text"
              />
              <span className="material-symbols-outlined search-icon">search</span>
            </div>
          </div>

          <div className="category-grid">
            <Link to="/products?category=food" className="category-item">
              <img alt="Food" className="category-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvPcTsasbxb7K-aOsx4oRU93OzFQBf_X2Y4CiMCmbNI8fsgvCnOhbXmTJ8gnl3rwVO9Ev2zDjKQTN7CkrU2GQU5rdn_U44DMVLU7N5kLS0AUuxksxWEc0qGoWg0sTIVfWjESaAUsp5Mrjh0J6O5XgdgW6PZwW4ZJHqM-HkTQCRRnws6KnCPwTSIm9bhdfMzKMmNawS40_5zjbOrz934M94rUpoIJcHbQdEqX2yw1YPni59Tjj5E9kEzC_imqvU2NcH1iguOoKwZUI"/>
              <h2 className="category-title">ഭക്ഷണം</h2>
            </Link>
            
            <Link to="/products?category=groceries" className="category-item">
              <img alt="Groceries" className="category-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUPrHmRoGtO7fynA-DZvmC907wa-A9nbeR11d9jnkQHMOScl0GYy1qvVEXold2DVNPBk4XhBPcr1amU810_QQpxlniMmAEaeS17F8UVnvnTgtkvnlNz-A9tud1TPnbhd1d3e1huTubW0dtMbcH8AvkTYtr7aGvgaWtJmCeahypDlmN2VGLbevTBDr1fKBFLxADwrahIrXcIFwLVAHLTtBdLNONKIyzJFToIML6gDb9McQxeezJ9F0uje1T02CCMkCJJHEHR_QyizU"/>
              <h2 className="category-title">പലചരക്ക്</h2>
            </Link>
            
            <Link to="/products?category=medicines" className="category-item">
              <img alt="Medicines" className="category-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT4_ELFYYqikkM8QaZbgSYgMv2FTsJdorK3tSHf7LDC57fozKpDTTKhORfSRfhMkr0ZU-9rbnJ711tc1KTSVVv0wSYwKivjsUTyl0XOEdnbR4lS56M_HrNFSn7ecxcs-984tmzA4bQ3il_PdBfJE3_m6bS3gabmIgqgl19EhNRMN4g0V8-CBsme4IXSMf4td9AmfJmjX-TrNYEwTACIyfG8UCfREuXD88fRxbpexhT1PmCP6Pp_h5HFD7ra_HlUlMSbJsyWGEwcNc"/>
              <h2 className="category-title">മരുന്നുകൾ</h2>
            </Link>
            
            <Link to="/products?category=essentials" className="category-item">
              <img alt="Essentials" className="category-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAhRl5lJ64TTi7H9MLKSiyQ2bR0c5Sh-n5eUTHffpig8vQjF18w0geUoZrRB_O3Mhj6DxcWxgXTeT54N1HjdMbbyfUiCbU6VYwHXi9ZlnYWS8Kd9rZS7nBIzdA61ncSpa1RNDmuxkIaWBlZjOBY5M51SB7AtU6THGwyQaiBxeL42cTTlIQpspAQ6k-GUeYgv-0vZuApEyNzjHVxoJkmREZMKyZgC-_dgakVPGY0425F_47uL5YAIidFAEOKsWo02kFlAccoY3Zl9Q"/>
              <h2 className="category-title">അത്യാവശ്യങ്ങൾ</h2>
            </Link>
          </div>

          <div className="section-header">
            <h2 className="section-title">Next Bus Stop & Halt Countdown</h2>
          </div>

          <div className="bus-countdown">
            <div className="bus-info">
              <div className="bus-details">
                <p className="bus-stop-number">Stop 3</p>
                <p className="bus-stop-name">Kochi Metro Station</p>
                <p className="bus-halt-time">Halt Time: 2 minutes</p>
              </div>
              <img alt="Bus Stop Image" className="bus-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDJRpgxVZPVvflIEC-xQIPk9OA16L4jqguLiTcTuqE-KRdksBLCH_TXyxuZUgXl9OHWMbArvpGYV3BHWYtO_dW5lVovHPR2DnBGgQwFmT4250LXi_oksDYbrwL4_VuFX4XHvgTPutDB2uesx_GK2c7MzZs1n6WP0Coq8A-Viuo-T9uvaJwhqU2en23aGWYXoFZATqqhtsGYw3LkQp6VBiMTPi-dX4o7KTC-BL65pTjz6kiCrQSj4MD_0wt9JU5ZEv9dQMHQESCA2Y"/>
            </div>
          </div>

          <div className="countdown-timer">
            <div className="timer-item">
              <div className="timer-value">01</div>
              <p className="timer-label">Minutes</p>
            </div>
            <div className="timer-item">
              <div className="timer-value">30</div>
              <p className="timer-label">Seconds</p>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">Featured Offers</h2>
          </div>

          <div className="featured-offers">
            <div className="offers-container">
              <div className="offer-card">
                <img alt="Offer 1" className="offer-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1NFGnA1FHE26NnEQavduwTJKDB9iInjAtXFiNv-GoeDXRVwb7pJDbS7B7ljoJ5Mlo9azE2TCV5c4H3ooE4Kg6yTXTWXzZOdEHEh2x_2l6g7yImFsbmimsAcBKTPR4x0aWpFiBs-6H0DZPCWKuqE71PN5YV1rNG_-Qb1Qnt9HtlNo_LZM_IFrXPekTPlt7KThZtpChWpTg-nlrsg6zK-MCy8BZ8nUwkPgg4nLt5YNhVpdFWrJ8b5i7k3_cLDkQfDSq0c7Hn2tcLqk"/>
                <p className="offer-text">20% off on first order</p>
              </div>
              <div className="offer-card">
                <img alt="Offer 2" className="offer-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkXgZ_nn6jOWMX4GhlgDmPg5aAWCflq_1bCO3qyuRfoNxkzxVLhGYXQ490SiR53JVkU9nvn8B4WwsgZ4aaxWqCBfTo8PY8VDt47ZwQK93tM5tZReLDqWk7cNHCANmXBIT6M578i1mk2Z1J-6z7iBCDKzsv507PdAFuNnw_4PBYm8Dyi76hY1_905Rv77a1RClmzDLS4fUVNJ5JzGGabgKycVk1a2p0KiXCJptpH7Rbs8CPCumGIWiOeuHe53_JE7dxTb48qUWJUKg"/>
                <p className="offer-text">Free delivery on groceries</p>
              </div>
              <div className="offer-card">
                <img alt="Offer 3" className="offer-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-10uKsH2euqyt1LA0gh0TJQP-C4lxSTGrHVQxZpeNk_msuzFP3bW0lUWxDt0pK361pIeQdbYrjY1n46m3FuSgXfDteWpL9YmSmYgFAdPNtbpTTbK6cT6MvzKxxFY2LUzTdGHWWiert3-cx5Vm_xtV5DPIBMR1NpMvdtQ3AvRNf5_yMewK2qd6YGc_-Qo_i85YfEfkfi8uEUIoNhW5JBXyEND3ea9h5srQpHVjKedvS7BcZmP2e841XA-b8Deo0G2ZMEwSKIS1oc"/>
                <p className="offer-text">Special discounts on medicines</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer-nav">
        <div className="nav-container">
          <Link className="nav-item active" to="/yathrika-home">
            <span className="material-symbols-outlined nav-icon">home</span>
            <p className="nav-text">Home</p>
          </Link>
          <Link className="nav-item" to="/order-history">
            <span className="material-symbols-outlined nav-icon">receipt_long</span>
            <p className="nav-text">Orders</p>
          </Link>
          <Link className="nav-item" to="/user-profile">
            <span className="material-symbols-outlined nav-icon">person</span>
            <p className="nav-text">Profile</p>
          </Link>
          <Link className="nav-item" to="/notifications">
            <span className="material-symbols-outlined nav-icon">notifications</span>
            <p className="nav-text">Notifications</p>
          </Link>
        </div>
        <div className="footer-safe"></div>
      </footer>
    </div>
  );
};

export default YathrikaHome;