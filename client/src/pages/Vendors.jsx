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
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="flex items-center justify-between p-4">
          <Link to="/admin" className="rounded-full p-2 text-white/80 transition-colors hover:text-white">
            <svg className="h-6 w-6" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Vendor Management</h1>
          <div className="w-8"></div>
        </header>
        
        <main className="px-4 pb-24">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Add New Vendor</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input 
                className="glow-input w-full rounded-lg border-none bg-primary/20 p-4 text-white placeholder-white/50 focus:bg-primary/30 focus:ring-2 focus:ring-primary" 
                placeholder="Vendor Name" 
                type="text"
                name="name"
                value={vendorForm.name}
                onChange={handleInputChange}
              />
              <input 
                className="glow-input w-full rounded-lg border-none bg-primary/20 p-4 text-white placeholder-white/50 focus:bg-primary/30 focus:ring-2 focus:ring-primary" 
                placeholder="Contact Number" 
                type="tel"
                name="contact"
                value={vendorForm.contact}
                onChange={handleInputChange}
              />
              <input 
                className="glow-input w-full rounded-lg border-none bg-primary/20 p-4 text-white placeholder-white/50 focus:bg-primary/30 focus:ring-2 focus:ring-primary" 
                placeholder="Email Address" 
                type="email"
                name="email"
                value={vendorForm.email}
                onChange={handleInputChange}
              />
              <input 
                className="glow-input w-full rounded-lg border-none bg-primary/20 p-4 text-white placeholder-white/50 focus:bg-primary/30 focus:ring-2 focus:ring-primary" 
                placeholder="Address" 
                type="text"
                name="address"
                value={vendorForm.address}
                onChange={handleInputChange}
              />
              <button 
                className="w-full rounded-lg bg-primary py-4 font-bold text-background-dark transition-transform hover:scale-105 glow-effect" 
                type="submit"
              >
                Add Vendor
              </button>
            </form>
          </section>
          
          <section>
            <h2 className="mb-4 text-2xl font-bold">Existing Vendors</h2>
            <div className="space-y-3">
              {existingVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-4 rounded-lg bg-primary/10 p-3 glow-shadow">
                  <div 
                    className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center" 
                    style={{backgroundImage: `url("${vendor.image}")`}}
                  ></div>
                  <div className="flex-grow">
                    <p className="font-semibold text-white">{vendor.name}</p>
                    <p className="text-sm text-white/60">Contact: {vendor.contact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      
      <div className="fixed bottom-4 right-4">
        <button className="glow-effect flex h-16 w-16 items-center justify-center rounded-full bg-primary text-background-dark shadow-lg transition-transform hover:scale-110">
          <svg className="h-8 w-8" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Vendors;