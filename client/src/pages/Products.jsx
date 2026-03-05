import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useCart } from '../CartContext';
import '../index.css';

/* ─── Full product catalogue ─────────────────────────────────────────────── */
const ALL_PRODUCTS = [
  // FOOD
  { id: 1,  category: 'food',       price: 120, name: 'Fresh Mangoes (1kg)',       malayalamName: 'പച്ച മാങ്ങ',           image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEKTFnOFahdp4MEIF6tvk1AQar29GFzItRPmYFTSkKp9CWXeaL94YqIpZKyVNa9uJItLfqYVavLIyfgUk4NGici-46S3TXVcvfJpSSPKQ1UrYVxqzEENEIh2YPbS0ELGgV_dUN8BAKwCZD1Z1guwLGRB67cimRcJ680ayuNUocNGFgqnbqGxaSQFHx61OdlweoHttrK608E1ASy48CNViaalG7KB7jCtNqsJNBZ5poGo2Yql7gI6YKVpET8Pc9iEB877IrtjZbNkM' },
  { id: 2,  category: 'food',       price: 20,  name: "Lay's Chips",         malayalamName: 'ലേയ്സ് ചിപ്സ്',        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXgZ9vu0A3VYbyHUbZBL0U-H4s0DkNzxaW0Q&s' },
  { id: 3,  category: 'food',       price: 30,  name: 'Mirinda',             malayalamName: 'മിരിൻഡ',               image: 'https://5.imimg.com/data5/SELLER/Default/2024/11/462892936/UB/IY/LJ/112583242/marinda-500x500.jpg' },
  { id: 4,  category: 'food',       price: 50,  name: 'Bread',               malayalamName: 'ബ്രെഡ്',               image: 'https://rukminim2.flixcart.com/image/480/480/xif0q/ready-meal/b/r/g/420-traditional-white-loaf-bread-pack-of-1-1-only-gluten-free-original-imaghgj6unjxgvaz.jpeg?q=90' },
  { id: 5,  category: 'food',       price: 45,  name: 'Banana Chips',        malayalamName: 'ബനാന ചിപ്സ്',          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ELjzk6-duEf-6SvJAMnBMktCkc2XHAKuaA&s' },
  { id: 6,  category: 'food',       price: 60,  name: 'Samosa (2 pcs)',      malayalamName: 'സമോസ (2 എണ്ണം)',       image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/12/samosa-recipe-500x375.jpg' },
  { id: 7,  category: 'food',       price: 25,  name: 'Mineral Water',       malayalamName: 'മിനറൽ വാട്ടർ',         image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcnZ_pogYeY9lR3UoEupPfxisp1MvBH8V3aw&s' },
  { id: 8,  category: 'food',       price: 80,  name: 'Veg Sandwich',        malayalamName: 'വെജ് സാൻഡ്വിച്ച്',     image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2024/05/vegetarian-club-sandwich-recipe.jpg' },

  // GROCERIES
  { id: 9,  category: 'groceries',  price: 95,  name: 'Basmati Rice (1 kg)', malayalamName: 'ബാസ്മതി അരി (1 കി.ഗ്രാ)', image: 'https://5.imimg.com/data5/SELLER/Default/2022/8/GV/MW/WS/46819356/supreme-traditional-basmati-rice-500x500.jpg' },
  { id: 10, category: 'groceries',  price: 110, name: 'Sunflower Oil (1 L)', malayalamName: 'സൂര്യകാന്തി എണ്ണ (1 ലി)',image: 'https://muktifresh.in/assets/frontEnd/images/product/sunflower-oil.jpg' },
  { id: 11, category: 'groceries',  price: 42,  name: 'Tomatoes (500 g)',    malayalamName: 'തക്കാളി (500 ഗ്രാ)',      image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg' },
  { id: 12, category: 'groceries',  price: 35,  name: 'Onions (500 g)',      malayalamName: 'സവോള (500 ഗ്രാ)',         image: 'https://samsgardenstore.com/cdn/shop/files/OnionRedSeeds_Desi_b8496f89-a62d-44e5-9481-5c60b24ca696.webp?v=1726217577' },
  { id: 13, category: 'groceries',  price: 75,  name: 'Coconut Oil (500 ml)',malayalamName: 'വെളിച്ചെണ്ണ (500 മി.ലി)', image: 'https://images.apollo247.in/pub/media/catalog/product/p/a/par0804-1-apr.jpg' },
  { id: 14, category: 'groceries',  price: 28,  name: 'Eggs (6 pcs)',        malayalamName: 'മുട്ട (6 എണ്ണം)',         image: 'https://media.istockphoto.com/id/1698895776/photo/organic-brown-eggs.jpg?s=612x612&w=0&k=20&c=wQ_BwWfa7VCbI1hi_OShrCNuD89Erj7TtxAJgSJLGrc=' },

  // MEDICINES
  { id: 15, category: 'medicines',  price: 18,  name: 'Paracetamol 500mg',   malayalamName: 'പാരസെറ്റമോൾ 500mg',     image: 'https://www.doctrislifesciences.com/wp-content/uploads/2024/01/DSC00181.png' },
  { id: 16, category: 'medicines',  price: 35,  name: 'Antacid Tablets',     malayalamName: 'ആന്റാസിഡ് ഗുളിക',       image: 'https://cdn01.pharmeasy.in/dam/products_otc/Z63893/liveasy-wellness-antacid-mint-flavour-sugar-free-bottle-of-200ml-oral-liquid-2-1695207631.jpg' },
  { id: 17, category: 'medicines',  price: 85,  name: 'Vitamin C 500mg',     malayalamName: 'വിറ്റമിൻ സി 500mg',      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxeGz5kgwd5gqeYTnr5n6EG1rsXlKYwrYo1Q&s' },
  { id: 18, category: 'medicines',  price: 40,  name: 'ORS Sachets (5 pcs)', malayalamName: 'ORS സഷേ (5 എണ്ണം)',       image: 'https://5.imimg.com/data5/SELLER/Default/2024/2/385188402/XU/LE/VE/24119759/ors-powder-sachet.jpg' },
  { id: 19, category: 'medicines',  price: 22,  name: 'Vics Cough Drops',         malayalamName: 'ചുമ ഗുളിക',              image: 'https://m.media-amazon.com/images/I/61CqKFJv8OL.jpg' },

  // ESSENTIALS
  { id: 20, category: 'essentials', price: 65,  name: 'Hand Sanitizer',      malayalamName: 'ഹാൻഡ് സാനിറ്റൈസർ',     image: 'https://media.istockphoto.com/id/1372350278/photo/hand-sanitizer.jpg?s=612x612&w=0&k=20&c=WVG34qN3_Rxd5jborLJR7mPL9_DaYlL-nhDoGp8_An4=' },
  { id: 21, category: 'essentials', price: 30,  name: 'Sanitary Pads',   malayalamName: 'സാനിറ്ററി പാഡ്സ്',  image: 'https://images.ctfassets.net/aub2fvcyp2t8/1ppOEQvxzLDBGVY6S6FXin/e439206219055c86fe81b89486e8a853/cottonyxl18ssizechanged-en-in?fm=webp&w=3840' },
  { id: 22, category: 'essentials', price: 30,  name: 'Face Mask (5 pcs)',   malayalamName: 'ഫേസ് മാസ്ക് (5 എണ്ണം)',  image: 'https://www.eourmart.com/cdn/shop/products/FaceMask4PLY.png?v=1654255252' },
  { id: 23, category: 'essentials', price: 20,  name: 'Tissue Paper Pack',   malayalamName: 'ടിഷ്യൂ പേപ്പർ',          image: 'https://sc04.alicdn.com/kf/Hb2e98c9c5f43440389d683acb9dc8fa0i.jpg_350x350.jpg' },
  { id: 24, category: 'essentials', price: 15,  name: 'Ballpoint Pen',       malayalamName: 'ബോൾ‌പോയിന്റ് പേന',      image: 'https://m.media-amazon.com/images/I/71RVj1XNisL.jpg' },
];

const CATEGORY_TABS = [
  { key: 'all',        en: 'All',        ml: 'എല്ലാം' },
  { key: 'food',       en: 'Food',       ml: 'ഭക്ഷണം' },
  { key: 'groceries',  en: 'Groceries',  ml: 'പലചരക്ക്' },
  { key: 'medicines',  en: 'Medicines',  ml: 'മരുന്നുകൾ' },
  { key: 'essentials', en: 'Essentials', ml: 'ആവശ്യസാധനങ്ങൾ' },
];

const SORT_OPTIONS = [
  { key: 'default',  en: 'Default',        ml: 'ഡിഫോൾട്ട്' },
  { key: 'low-high', en: 'Price: Low → High', ml: 'വില: കുറഞ്ഞത് → കൂടിയത്' },
  { key: 'high-low', en: 'Price: High → Low', ml: 'വില: കൂടിയത് → കുറഞ്ഞത്' },
  { key: 'a-z',      en: 'Name: A → Z',    ml: 'പേര്: A → Z' },
  { key: 'z-a',      en: 'Name: Z → A',    ml: 'പേര്: Z → A' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const useQuery = () => new URLSearchParams(useLocation().search);

/* ─── Component ───────────────────────────────────────────────────────────── */
const Products = () => {
  const navigate  = useNavigate();
  const query     = useQuery();
  const { language } = useLanguage();
  const { addToCart, updateQuantity, getItemQuantity, getTotalCount } = useCart();

  const initCategory = query.get('category') || 'all';
  const initSearch   = query.get('search')   || '';

  const [activeCategory, setActiveCategory] = useState(initCategory);
  const [searchText,     setSearchText]     = useState(initSearch);
  const [sortKey,        setSortKey]        = useState('default');
  const [showSort,       setShowSort]       = useState(false);

  /* Sync URL → state when link changes */
  useEffect(() => {
    const cat = query.get('category') || 'all';
    const srch = query.get('search')  || '';
    setActiveCategory(cat);
    setSearchText(srch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useLocation().search]);

  /* Derived filtered + sorted products */
  const visibleProducts = useMemo(() => {
    let list = ALL_PRODUCTS;

    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.malayalamName.includes(q)
      );
    }
    switch (sortKey) {
      case 'low-high': list = [...list].sort((a, b) => a.price - b.price);   break;
      case 'high-low': list = [...list].sort((a, b) => b.price - a.price);   break;
      case 'a-z':      list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'z-a':      list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break;
    }
    return list;
  }, [activeCategory, searchText, sortKey]);

  const totalCount = getTotalCount();
  const activeSortLabel = SORT_OPTIONS.find(s => s.key === sortKey)?.[language === 'ml' ? 'ml' : 'en'] || 'Sort';

  return (
    <div style={S.page}>

      <header style={S.header}>

  {/* LEFT BUTTON GROUP */}
  <div style={S.leftGroup}>
    <button style={S.iconBtn} onClick={() => navigate(-1)}>
      <span className="material-symbols-outlined">arrow_back</span>
    </button>

    <button style={S.iconBtn} onClick={() => navigate('/cart')}>
      <span className="material-symbols-outlined">shopping_cart</span>
      {totalCount > 0 && <span style={S.badge}>{totalCount}</span>}
    </button>
  </div>

  {/* CENTER BRAND */}
  <h1 style={S.brand}>Yathrika</h1>

</header>

      {/* ── SEARCH BAR ─────────────────────────────────────────────────── */}
      <div style={S.searchWrap}>
        <div style={S.searchBox}>
          <span className="material-symbols-outlined" style={{ color: '#68f91a', fontSize: 20, flexShrink: 0 }}>search</span>
          <input
            style={S.searchInput}
            placeholder={language === 'ml' ? 'ഉൽപ്പന്നങ്ങൾ തിരയുക...' : 'Search products...'}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {searchText && (
            <button style={S.clearBtn} onClick={() => setSearchText('')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#777' }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY TABS ──────────────────────────────────────────────── */}
      <div style={S.tabsRow}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            style={{ ...S.tab, ...(activeCategory === tab.key ? S.tabActive : {}) }}
            onClick={() => setActiveCategory(tab.key)}
          >
            {language === 'ml' ? tab.ml : tab.en}
          </button>
        ))}
      </div>

      {/* ── SORT + RESULTS COUNT ───────────────────────────────────────── */}
      <div style={S.toolbar}>
        <span style={S.countText}>
          {visibleProducts.length} {language === 'ml' ? 'ഉൽപ്പന്നങ്ങൾ' : 'products'}
        </span>
        <div style={{ position: 'relative' }}>
          <button style={S.sortBtn} onClick={() => setShowSort(v => !v)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sort</span>
            <span style={{ fontSize: '0.78rem', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeSortLabel}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {showSort ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {showSort && (
            <div style={S.dropdown}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  style={{ ...S.dropItem, ...(sortKey === opt.key ? S.dropItemActive : {}) }}
                  onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                >
                  {language === 'ml' ? opt.ml : opt.en}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCT GRID ───────────────────────────────────────────────── */}
      <main style={S.main}>
        {visibleProducts.length === 0 ? (
          <div style={S.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#333', marginBottom: 12 }}>search_off</span>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>
              {language === 'ml' ? 'ഒന്നും കണ്ടെത്തിയില്ല' : 'No products found'}
            </p>
          </div>
        ) : (
          <div style={S.grid}>
            {visibleProducts.map(product => {
              const qty = getItemQuantity(product.id);
              return (
                <div key={product.id} style={S.card}>
                  <div style={{ ...S.cardImg, backgroundImage: `url("${product.image}")` }} />
                  <div style={S.cardBody}>
                    <p style={S.categoryTag}>{product.category}</p>
                    <h3 style={S.productName}>
                      {language === 'ml' ? product.malayalamName : product.name}
                    </h3>
                    <div style={S.cardFooter}>
                      <span style={S.price}>₹{product.price}</span>
                      {qty === 0 ? (
                        <button style={S.addBtn} onClick={() => addToCart(product)}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                        </button>
                      ) : (
                        <div style={S.stepper}>
                          <button style={S.stepBtn} onClick={() => updateQuantity(product.id, qty - 1)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                          </button>
                          <span style={S.qtyNum}>{qty}</span>
                          <button style={S.stepBtn} onClick={() => addToCart(product)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── FOOTER NAV ─────────────────────────────────────────────────── */}
      <footer style={S.footer}>
        {[
          { to: '/yathrika-home', icon: 'home',          label: language === 'ml' ? 'ഹോം'          : 'Home',    active: true  },
          { to: '/order-history', icon: 'receipt_long',  label: language === 'ml' ? 'ഓർഡറുകൾ'     : 'Orders',  active: false },
          { to: '/user-profile',  icon: 'person',        label: language === 'ml' ? 'പ്രൊഫൈൽ'     : 'Profile', active: false },
        ].map(item => (
          <Link key={item.to} to={item.to} style={S.navItem}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: item.active ? '#68f91a' : '#555' }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.63rem', fontWeight: 600, color: item.active ? '#68f91a' : '#555' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </footer>

      {/* close sort dropdown on outside click */}
      {showSort && <div style={S.overlay} onClick={() => setShowSort(false)} />}
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const S = {
  page:       { minHeight: '100vh', backgroundColor: '#16230f', fontFamily: "'Space Grotesk', sans-serif", display: 'flex', flexDirection: 'column', paddingBottom: 72 },

  /* header */
  header: {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid rgba(104,249,26,0.08)'
},

leftGroup: {
  display: 'flex',
  gap: 10
},

brand: {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#68f91a',
  fontSize: '1.4rem',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em'
},
  iconBtn:    { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge:      { position: 'absolute', top: -6, right: -6, backgroundColor: '#68f91a', color: '#16230f', fontSize: '0.6rem', fontWeight: 800, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  /* search */
  searchWrap: { padding: '10px 16px 0' },
  searchBox:  { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(104,249,26,0.18)', borderRadius: 14, padding: '0 14px', gap: 8 },
  searchInput:{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.88rem', padding: '12px 0', fontFamily: "'Space Grotesk', sans-serif" },
  clearBtn:   { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },

  /* category tabs */
  tabsRow:    { display: 'flex', gap: 8, padding: '12px 16px 0', overflowX: 'auto', scrollbarWidth: 'none' },
  tab:        { flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '7px 14px', color: '#aaa', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap' },
  tabActive:  { background: 'rgba(104,249,26,0.12)', border: '1px solid rgba(104,249,26,0.5)', color: '#68f91a' },

  /* toolbar */
  toolbar:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 4px' },
  countText:  { color: '#555', fontSize: '0.78rem', fontWeight: 600 },
  sortBtn:    { display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 10px', color: '#ccc', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif' " },

  /* sort dropdown */
  dropdown:   { position: 'absolute', right: 0, top: 'calc(100% + 6px)', backgroundColor: '#1e2f14', border: '1px solid rgba(104,249,26,0.2)', borderRadius: 12, zIndex: 200, minWidth: 190, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  dropItem:   { display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#ccc', fontSize: '0.82rem', padding: '11px 16px', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" },
  dropItemActive: { color: '#68f91a', backgroundColor: 'rgba(104,249,26,0.08)' },
  overlay:    { position: 'fixed', inset: 0, zIndex: 150 },

  /* grid */
  main:       { flex: 1, padding: '8px 16px' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },

  /* card */
  card:       { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  cardImg:    { width: '100%', aspectRatio: '1 / 0.85', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1a2c10' },
  cardBody:   { padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  categoryTag:{ fontSize: '0.62rem', fontWeight: 700, color: '#68f91a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, opacity: 0.7 },
  productName:{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', margin: '2px 0 6px', lineHeight: 1.3 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  price:      { color: '#68f91a', fontSize: '0.95rem', fontWeight: 800 },

  /* add button */
  addBtn:     { width: 32, height: 32, borderRadius: 10, backgroundColor: '#68f91a', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#16230f', flexShrink: 0 },

  /* stepper */
  stepper:    { display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(104,249,26,0.1)', borderRadius: 10, padding: '2px 4px', border: '1px solid rgba(104,249,26,0.3)' },
  stepBtn:    { width: 26, height: 26, borderRadius: 8, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#68f91a', flexShrink: 0 },
  qtyNum:     { color: '#fff', fontSize: '0.82rem', fontWeight: 700, minWidth: 18, textAlign: 'center' },

  /* empty state */
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' },

  /* footer nav */
  footer:     { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#0d1808', borderTop: '1px solid rgba(104,249,26,0.08)', padding: '8px 0 10px', zIndex: 100 },
  navItem:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '4px 0' },
};

export default Products;