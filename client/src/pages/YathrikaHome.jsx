import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useCart } from '../CartContext';
import '../index.css';

const T = {
  en: {
    search:        'Search products...',
    food:          'Food',
    groceries:     'Groceries',
    medicines:     'Medicines',
    essentials:    'Essentials',
    yourStop:      'YOUR DELIVERY STOP',
    changeStop:    'Change',
    nextBus:       'Next Bus Arrival',
    toGetDelivery: 'to get delivery at this stop',
    orderBy:       'Order within',
    featuredOffers:'Featured Offers',
    noStop:        'No stop selected',
    home:          'Home',
    orders:        'Orders',
    profile:       'Profile',
    notifications: 'Notifications',
    mins:          'mins',
    secs:          'secs',
  },
  ml: {
    search:        'ഉൽപ്പന്നങ്ങൾ തിരയുക...',
    food:          'ഭക്ഷണം',
    groceries:     'പലചരക്ക്',
    medicines:     'മരുന്നുകൾ',
    essentials:    'അത്യാവശ്യങ്ങൾ',
    yourStop:      'നിങ്ങളുടെ ഡെലിവറി സ്റ്റോപ്പ്',
    changeStop:    'മാറ്റുക',
    nextBus:       'അടുത്ത ബസ്',
    toGetDelivery: 'ഈ സ്റ്റോപ്പിൽ ഡെലിവറി ലഭിക്കാൻ',
    orderBy:       'ഓർഡർ ചെയ്യൂ',
    featuredOffers:'ഓഫറുകൾ',
    noStop:        'സ്റ്റോപ്പ് തിരഞ്ഞെടുത്തിട്ടില്ല',
    home:          'ഹോം',
    orders:        'ഓർഡറുകൾ',
    profile:       'പ്രൊഫൈൽ',
    notifications: 'അറിയിപ്പുകൾ',
    mins:          'മിനിറ്റ്',
    secs:          'സെക്കൻഡ്',
  },
};

const getNextBusSeconds = () => {
  const now = new Date();
  const secsInto20 = (now.getMinutes() % 20) * 60 + now.getSeconds();
  return Math.max(20 * 60 - secsInto20, 5);
};

const CATEGORIES = [
  { key: 'food',       img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvPcTsasbxb7K-aOsx4oRU93OzFQBf_X2Y4CiMCmbNI8fsgvCnOhbXmTJ8gnl3rwVO9Ev2zDjKQTN7CkrU2GQU5rdn_U44DMVLU7N5kLS0AUuxksxWEc0qGoWg0sTIVfWjESaAUsp5Mrjh0J6O5XgdgW6PZwW4ZJHqM-HkTQCRRnws6KnCPwTSIm9bhdfMzKMmNawS40_5zjbOrz934M94rUpoIJcHbQdEqX2yw1YPni59Tjj5E9kEzC_imqvU2NcH1iguOoKwZUI' },
  { key: 'groceries',  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUPrHmRoGtO7fynA-DZvmC907wa-A9nbeR11d9jnkQHMOScl0GYy1qvVEXold2DVNPBk4XhBPcr1amU810_QQpxlniMmAEaeS17F8UVnvnTgtkvnlNz-A9tud1TPnbhd1d3e1huTubW0dtMbcH8AvkTYtr7aGvgaWtJmCeahypDlmN2VGLbevTBDr1fKBFLxADwrahIrXcIFwLVAHLTtBdLNONKIyzJFToIML6gDb9McQxeezJ9F0uje1T02CCMkCJJHEHR_QyizU' },
  { key: 'medicines',  img: 'https://media.istockphoto.com/id/1778918997/photo/background-of-a-large-group-of-assorted-capsules-pills-and-blisters.jpg?s=612x612&w=0&k=20&c=G6aeWKN1kHyaTxiNdToVW8_xGY0hcenWYIjjG_xwF_Q=' },
  { key: 'essentials', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAhRl5lJ64TTi7H9MLKSiyQ2bR0c5Sh-n5eUTHffpig8vQjF18w0geUoZrRB_O3Mhj6DxcWxgXTeT54N1HjdMbbyfUiCbU6VYwHXi9ZlnYWS8Kd9rZS7nBIzdA61ncSpa1RNDmuxkIaWBlZjOBY5M51SB7AtU6THGwyQaiBxeL42cTTlIQpspAQ6k-GUeYgv-0vZuApEyNzjHVxoJkmREZMKyZgC-_dgakVPGY0425F_47uL5YAIidFAEOKsWo02kFlAccoY3Zl9Q' },
];

const OFFERS = [
  { en: '20% off on first order',       ml: 'ആദ്യ ഓർഡറിന് 20% കിഴിവ്',           color: '#68f91a', icon: 'percent',        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1NFGnA1FHE26NnEQavduwTJKDB9iinjAtXFiNv-GoeDXRVwb7pJDbS7B7ljoJ5Mlo9azE2TCV5c4H3ooE4Kg6yTXTWXzZOdEHEh2x_2l6g7yImFsbmimsAcBKTPR4x0aWpFiBs-6H0DZPCWKuqE71PN5YV1rNG_-Qb1Qnt9HtlNo_LZM_IFrXPekTPlt7KThZtpChWpTg-nlrsg6zK-MCy8BZ8nUwkPgg4nLt5YNhVpdFWrJ8b5i7k3_cLDkQfDSq0c7Hn2tcLqk' },
  { en: 'Free delivery on groceries',   ml: 'പലചരക്കിന് സൗജന്യ ഡെലിവറി',        color: '#4da6ff', icon: 'local_shipping',  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkXgZ_nn6jOWMX4GhlgDmPg5aAWCflq_1bCO3qyuRfoNxkzxVLhGYXQ490SiR53JVkU9nvn8B4WwsgZ4aaxWqCBfTo8PY8VDt47ZwQK93tM5tZReLDqWk7cNHCANmXBIT6M578i1mk2Z1J-6z7iBCDKzsv507PdAFuNnw_4PBYm8Dyi76hY1_905Rv77a1RClmzDLS4fUVNJ5JzGGabgKycVk1a2p0KiXCJptpH7Rbs8CPCumGIWiOeuHe53_JE7dxTb48qUWJUKg' },
  { en: 'Special deals on medicines',   ml: 'മരുന്നുകൾക്ക് പ്രത്യേക ഓഫർ',        color: '#ff6b8a', icon: 'medication',       img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ-10uKsH2euqyt1LA0gh0TJQP-C4lxSTGrHVQxZpeNk_msuzFP3bW0lUWxDt0pK361pIeQdbYrjY1n46m3FuSgXfDteWpL9YmSmYgFAdPNtbpTTbK6cT6MvzKxxFY2LUzTdGHWWiert3-cx5Vm_xtV5DPIBMR1NpMvdtQ3AvRNf5_yMewK2qd6YGc_-Qo_i85YfEfkfi8uEUIoNhW5JBXyEND3ea9h5srQpHVjKedvS7BcZmP2e841XA-b8Deo0G2ZMEwSKIS1oc' },
];

const YathrikaHome = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = T[language] || T.en;

  let cartCount = 0;
  try { const { getTotalCount } = useCart(); cartCount = getTotalCount?.() || 0; } catch(_) {}

  const [busStop,     setBusStop]     = useState(null);
  const [countdown,   setCountdown]   = useState(getNextBusSeconds);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yathrika_bus_stop');
      if (saved) setBusStop(JSON.parse(saved));
    } catch(_) {}
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(prev => prev <= 1 ? getNextBusSeconds() : prev - 1);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div style={S.page}>

      {/* HEADER */}
      <header style={S.header}>
        <button style={S.cartBtn} onClick={() => navigate('/cart')}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#fff' }}>shopping_cart</span>
          {cartCount > 0 && <span style={S.cartBadge}>{cartCount}</span>}
        </button>
        <h1 style={S.brand}>Yathrika</h1>
        <div style={{ width: 44 }} />
      </header>

      {/* DELIVERY STOP BANNER */}
      <div style={S.stopBanner}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#68f91a', flexShrink: 0 }}>directions_bus</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={S.stopLabel}>{t.yourStop}</p>
          <p style={S.stopName}>{busStop ? busStop.name : t.noStop}</p>
        </div>
        <Link to="/routes" style={S.changeBtn}>{t.changeStop}</Link>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} style={{ padding: '8px 16px 0' }}>
        <div style={S.searchBox}>
          <span className="material-symbols-outlined" style={{ color: '#555', fontSize: 20, flexShrink: 0 }}>search</span>
          <input
            style={S.searchInput}
            placeholder={t.search}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <main style={{ flex: 1, paddingBottom: 16 }}>

        {/* CATEGORIES */}
        <div style={S.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Link key={cat.key} to={`/products?category=${cat.key}`} style={S.catCard}>
              <div style={S.catImgWrap}>
                <img src={cat.img} alt={t[cat.key]} style={S.catImg} />
              </div>
              <p style={S.catLabel}>{t[cat.key]}</p>
            </Link>
          ))}
        </div>

        {/* COUNTDOWN CARD */}
        <div style={S.countdownCard}>
          <div style={S.countdownTop}>
            <div>
              <p style={S.countdownTitle}>{t.nextBus}</p>
              {busStop && <p style={S.countdownStop}>{busStop.name}</p>}
            </div>
            <div style={S.livePill}>
              <span style={S.liveDot} />
              LIVE
            </div>
          </div>
          <div style={S.timerRow}>
            <div style={S.timerBlock}>
              <span style={S.timerNum}>{String(mins).padStart(2,'0')}</span>
              <span style={S.timerUnit}>{t.mins}</span>
            </div>
            <span style={S.timerColon}>:</span>
            <div style={S.timerBlock}>
              <span style={S.timerNum}>{String(secs).padStart(2,'0')}</span>
              <span style={S.timerUnit}>{t.secs}</span>
            </div>
          </div>
          <p style={S.countdownHint}>
            {t.orderBy} {mins > 0 ? `${mins} ${t.mins}` : `${secs} ${t.secs}`} {t.toGetDelivery}
          </p>
        </div>

        {/* OFFERS */}
        <p style={S.sectionTitle}>{t.featuredOffers}</p>
        <div style={S.offersRow}>
          {OFFERS.map((o, i) => (
            <div key={i} style={{ ...S.offerCard, borderColor: o.color + '44' }}>
              <img src={o.img} alt="" style={S.offerImg} />
              <div style={S.offerOverlay} />
              <div style={S.offerContent}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: o.color }}>{o.icon}</span>
                <p style={{ ...S.offerText, color: o.color }}>{language === 'ml' ? o.ml : o.en}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* FOOTER */}
      <footer style={S.footer}>
        {[
          { to: '/yathrika-home', icon: 'home',           label: t.home,          active: true  },
          { to: '/order-history', icon: 'receipt_long',   label: t.orders,        active: false },
          { to: '/user-profile',  icon: 'person',         label: t.profile,       active: false },
          { to: '/notifications', icon: 'notifications',  label: t.notifications, active: false },
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

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.4)} }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
};

const S = {
  page:          { minHeight: '100vh', backgroundColor: '#16230f', fontFamily: "'Space Grotesk', sans-serif", display: 'flex', flexDirection: 'column', paddingBottom: 72 },
  header:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(104,249,26,0.08)' },
  brand:         { color: '#68f91a', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' },
  cartBtn:       { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' },
  cartBadge:     { position: 'absolute', top: -6, right: -6, backgroundColor: '#68f91a', color: '#16230f', fontSize: '0.6rem', fontWeight: 800, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stopBanner:    { display: 'flex', alignItems: 'center', gap: 10, margin: '12px 16px', backgroundColor: 'rgba(104,249,26,0.06)', border: '1px solid rgba(104,249,26,0.15)', borderRadius: 14, padding: '11px 14px' },
  stopLabel:     { color: '#68f91a', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 },
  stopName:      { color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 },
  changeBtn:     { color: '#68f91a', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, opacity: 0.8, textDecoration: 'underline' },
  searchBox:     { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '0 14px', gap: 8 },
  searchInput:   { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.88rem', padding: '12px 0', fontFamily: "'Space Grotesk', sans-serif" },
  categoryGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '16px 16px 8px' },
  catCard:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' },
  catImgWrap:    { width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  catImg:        { width: '100%', height: '100%', objectFit: 'cover' },
  catLabel:      { color: '#ccc', fontSize: '0.7rem', fontWeight: 600, margin: 0, textAlign: 'center' },
  countdownCard: { margin: '8px 16px', backgroundColor: 'rgba(104,249,26,0.05)', border: '1px solid rgba(104,249,26,0.18)', borderRadius: 18, padding: '16px 18px' },
  countdownTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  countdownTitle:{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: 0 },
  countdownStop: { color: '#777', fontSize: '0.75rem', margin: '2px 0 0' },
  livePill:      { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(104,249,26,0.12)', borderRadius: 20, padding: '3px 10px', color: '#68f91a', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' },
  liveDot:       { width: 7, height: 7, borderRadius: '50%', backgroundColor: '#68f91a', display: 'block', animation: 'livePulse 1.5s infinite' },
  timerRow:      { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  timerBlock:    { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timerNum:      { color: '#68f91a', fontSize: '2.6rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  timerUnit:     { color: '#555', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 },
  timerColon:    { color: '#68f91a', fontSize: '2rem', fontWeight: 800, paddingBottom: 14 },
  countdownHint: { color: '#666', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 },
  sectionTitle:  { color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: '16px 16px 8px' },
  offersRow:     { display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto', scrollbarWidth: 'none' },
  offerCard:     { minWidth: 155, height: 105, borderRadius: 14, border: '1px solid', overflow: 'hidden', position: 'relative', flexShrink: 0 },
  offerImg:      { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 },
  offerOverlay:  { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,35,15,0.92) 0%, rgba(22,35,15,0.2) 100%)' },
  offerContent:  { position: 'absolute', bottom: 8, left: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5 },
  offerText:     { fontSize: '0.72rem', fontWeight: 700, margin: 0, lineHeight: 1.3 },
  footer:        { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#0d1808', borderTop: '1px solid rgba(104,249,26,0.08)', padding: '8px 0 10px', zIndex: 100 },
  navItem:       { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '4px 0' },
};

export default YathrikaHome;