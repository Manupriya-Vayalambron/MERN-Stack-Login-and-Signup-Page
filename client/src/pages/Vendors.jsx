import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Vendors = () => {
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  const existingVendors = [
    {
      id: 1,
      name: 'Green Leaf Organics',
      contact: '987-654-3210',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7pT3IfPvo9nmOUL60kySlrYyTGXRJLlW87dsqKLkF-5EgoBDlk53aiAJliTnnUJJtUGH8npZWCFv7c6z92aMFeqpEqia82FI2sgAYMg8w3yhdz2-l-txmHyJ8_z6lwNRJZMWy6h1r7IffD60oS0TfMpvcqTYxH_Fu7xWACb2dzAY3HzXAeDlmWWxcgsVhmZMWc9lPZxpZAXvZAo_pW03n17gvqkzP1O7PB3ggF4uhKg-WiajmXrbKHvpWT9U1_NvrC-a3rm7uHGY'
    },
    {
      id: 2,
      name: 'Fresh Foods Market',
      contact: '123-456-7890',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuHrnKzz9sSAkkBEBJT1NLu-acho7Wi2FBiUreD0tZuycOFW7X-IBnwZ3J3mr_3Y671HgwGDkgVXRHaT0gq3PIoHZwHBA9x6Gos3rjcneHQKXlQE9iuipH9dITV0o2EAz4bPBWrPYwpOk6_aWt3BqxAKW4y4c3nJwTO4owW8RVOI5vY4Uvptd9yU3lb8_YRhkOGLDwFbkBqGQ-4GzpPv86UyiPbdoD-WKCPsnxqruLNInb6xVFvhZ8aL5tfin1TA8xeuXm5MtnZe4'
    },
    {
      id: 3,
      name: 'Healthy Harvest',
      contact: '456-789-0123',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrY3JZ1nHms37Wtp3Ktc09updOqdCerZqM58POa6Oa0Su85v8HwUMDW7M-gcxiILlKAFdFvc1zqgZOm2sTOp8aitIOc9VzYx9RzTSIruD6aBK0Vvek-7G7BGiw0uMLsjMvsSv4IulA7lam8ebP6sgEqab2lRkg28WoOpYbWFtsUFMigRfFeaUrAvFNPVMiwB5Or4BmCIvaYOb7mKQV10YawNM8gqCO_CCxMDK6F42z7OK9366tZ8s8ILL-Mw6wOSody2khJBISIHw'
    }
  ];

  const handleInputChange = (e) => {
    setVendorForm({
      ...vendorForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Adding vendor:', vendorForm);
    // Reset form
    setVendorForm({
      name: '',
      contact: '',
      email: '',
      address: ''
    });
  };

  return (
    <div className="vendors-page-container">
      <div className="vendors-content-wrapper">
        <header className="vendors-header">
          <Link to="/admin" className="vendors-back-button">
            <svg className="vendors-back-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="vendors-page-title">Vendor Management</h1>
          <div className="vendors-header-spacer"></div>
        </header>
        
        <main className="vendors-main-content">
          <section className="vendors-add-section">
            <h2 className="vendors-section-title">Add New Vendor</h2>
            <form className="vendors-form" onSubmit={handleSubmit}>
              <input 
                className="vendors-form-input" 
                placeholder="Vendor Name" 
                type="text"
                name="name"
                value={vendorForm.name}
                onChange={handleInputChange}
              />
              <input 
                className="vendors-form-input" 
                placeholder="Contact Number" 
                type="tel"
                name="contact"
                value={vendorForm.contact}
                onChange={handleInputChange}
              />
              <input 
                className="vendors-form-input" 
                placeholder="Email Address" 
                type="email"
                name="email"
                value={vendorForm.email}
                onChange={handleInputChange}
              />
              <input 
                className="vendors-form-input" 
                placeholder="Address" 
                type="text"
                name="address"
                value={vendorForm.address}
                onChange={handleInputChange}
              />
              <button 
                className="vendors-submit-button" 
                type="submit"
              >
                Add Vendor
              </button>
            </form>
          </section>
          
          <section className="vendors-list-section">
            <h2 className="vendors-section-title">Existing Vendors</h2>
            <div className="vendors-list">
              {existingVendors.map((vendor) => (
                <div key={vendor.id} className="vendors-card">
                  <div 
                    className="vendors-card-image" 
                    style={{backgroundImage: `url("${vendor.image}")`}}
                  ></div>
                  <div className="vendors-card-info">
                    <p className="vendors-card-name">{vendor.name}</p>
                    <p className="vendors-card-contact">Contact: {vendor.contact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      
      <div className="vendors-floating-button-container">
        <button className="vendors-floating-button">
          <svg className="vendors-plus-icon" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Vendors;