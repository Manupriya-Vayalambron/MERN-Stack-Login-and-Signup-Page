import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Products = () => {
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
    <div className="main-wrapper">
      <div className="pb-28">
        <header className="header">
          <div className="flex items-center p-4">
            <h1 className="header-title">Yathrika</h1>
            <button className="relative rounded-full p-2">
              <span className="material-symbols-outlined text-white">
                shopping_cart
              </span>
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">3</span>
            </button>
          </div>
          <div className="search-container">
            <div className="search-wrapper">
              <span className="material-symbols-outlined search-icon">
                search
              </span>
              <input 
                className="search-input" 
                placeholder="Search for products" 
                type="text"
              />
            </div>
          </div>
        </header>
        
        <main className="px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Shop By Category</h2>
            <div className="flex gap-2">
              <button className="rounded-full bg-primary/20 p-2 text-white">
                <span className="material-symbols-outlined">
                  grid_view
                </span>
              </button>
              <button className="rounded-full bg-primary/20 p-2 text-white/50">
                <span className="material-symbols-outlined">
                  view_list
                </span>
              </button>
            </div>
          </div>
          
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button className="whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-bold text-black">All</button>
            <button className="whitespace-nowrap rounded-full border border-primary/50 bg-transparent px-4 py-2 text-sm font-medium text-white/80">Veg/Non-Veg</button>
            <button className="whitespace-nowrap rounded-full border border-primary/50 bg-transparent px-4 py-2 text-sm font-medium text-white/80">Snacks</button>
            <button className="whitespace-nowrap rounded-full border border-primary/50 bg-transparent px-4 py-2 text-sm font-medium text-white/80">Essentials</button>
            <button className="whitespace-nowrap rounded-full border border-primary/50 bg-transparent px-4 py-2 text-sm font-medium text-white/80">Pharmacy</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 rounded-xl bg-background-light/5 dark:bg-background-dark/50 p-3">
                <div 
                  className="aspect-square w-full rounded-lg bg-cover bg-center" 
                  style={{backgroundImage: `url("${product.image}")`}}
                ></div>
                <h3 className="font-bold text-white">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">₹{product.price}</p>
                  <button className="flex items-center justify-center rounded-full bg-primary p-2 text-black glow-shadow">
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="footer-nav">
        <div className="nav-container">
          <Link className="nav-item" to="/yathrika-home">
            <span className="material-symbols-outlined nav-icon">home</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link className="nav-item" to="/order-history">
            <span className="material-symbols-outlined nav-icon">receipt_long</span>
            <span className="nav-text">Orders</span>
          </Link>
          <Link className="nav-item" to="/user-profile">
            <span className="material-symbols-outlined nav-icon">person</span>
            <span className="nav-text">Profile</span>
          </Link>
          <Link className="nav-item" to="/notifications">
            <span className="material-symbols-outlined nav-icon">notifications</span>
            <span className="nav-text">Alerts</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Products;