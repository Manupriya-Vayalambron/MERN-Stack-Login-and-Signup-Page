import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useCart } from '../CartContext';
import teamImage from '../assets/team.jpeg';
import '../index.css';

const T = {
  en: {
    search:        'Search products...',
    food:          'Food',
    groceries:     'Groceries',
    health_essentials:     'Health Essentials',
    others:    'Others',
    yourStop:      'YOUR DELIVERY STOP',
    changeStop:    'Change',
    noStop:        'No stop selected',
    home:          'Home',
    orders:        'Orders',
    profile:       'Profile',
    notifications: 'Notifications',
    shopNow:       'Shop Now',
    signIn:        'Sign In',
    seat:          'Seat',
    browseAll:     'Browse All Products',
    whoWeAre:      'Who We Are',
    ourMission:    'Kerala\'s First On-Route\nBus Delivery Service',
    aboutDesc:     'Yathrika was born from one simple frustration - why can\'t your groceries travel the same bus route you do? We are a student-led startup from Kerala, bridging the gap between local vendors and commuters by delivering goods directly to your bus stop while you\'re still on the move. No detours. No waiting. Just smart delivery for smart travellers.',
    keralaBorn:    'Kerala-born 🌴',
    studentLed:    'Student-led 🎓',
    communityFirst: 'Community-first 🤝',
    ourJourney:    'Our Journey',
    ideaToImpact:  'From Idea to Impact',
    journeyDesc:   'As a student-led project we\'ve been pushing Yathrika from classroom concept to a recognised startup - here\'s how far we\'ve come.',
    nowHiring:     'NOW HIRING',
    partnerTitle:  'Ride. Deliver. Earn.',
    partnerDesc:   'Already on a bus route? Turn your daily commute into a side income. Join Yathrika as a Delivery Partner - flexible hours, honest pay, real impact in your local community.',
    dailyEarnings: 'Daily Earnings',
    yourHours:     'Your Own Hours',
    ratingsRewards: 'Ratings & Rewards',
    joinPartner:   'Join as Delivery Partner',
  },
  ml: {
    search:        'ഉൽപ്പന്നങ്ങൾ തിരയുക...',
    food:          'ഭക്ഷണം',
    groceries:     'പലചരക്ക്',
    health_essentials:     'സ്വാസ്ഥ്യ അത്യാവശ്യങ്ങൾ',
    others:    'അത്യാവശ്യങ്ങൾ',
    yourStop:      'നിങ്ങളുടെ ഡെലിവറി സ്റ്റോപ്പ്',
    changeStop:    'മാറ്റുക',
    noStop:        'സ്റ്റോപ്പ് തിരഞ്ഞെടുത്തിട്ടില്ല',
    home:          'ഹോം',
    orders:        'ഓർഡറുകൾ',
    profile:       'പ്രൊഫൈൽ',
    notifications: 'അറിയിപ്പുകൾ',
    shopNow:       'ഷോപ്പ് ചെയ്യൂ',
    signIn:        'സൈൻ ഇൻ',
    seat:          'സീറ്റ്',
    browseAll:     'എല്ലാ ഉൽപ്പന്നങ്ങളും കാണുക',
    whoWeAre:      'ഞങ്ങൾ ആരാണ്',
    ourMission:    'കേരളത്തിലെ ആദ്യത്തെ റൂട്ടിൽ\nബസ് ഡെലിവറി സേവനം',
    aboutDesc:     'യാത്രിക ജനിച്ചത് ഒരു ലളിതമായ നിരാശയിൽ നിന്നാണ് - എന്തുകൊണ്ട് നിങ്ങളുടെ പലചരക്ക് സാധനങ്ങൾക്ക് നിങ്ങൾ സഞ്ചരിക്കുന്ന അതേ ബസ് റൂട്ടിൽ സഞ്ചരിക്കാനാവില്ല? ഞങ്ങൾ കേരളത്തിൽ നിന്നുള്ള വിദ്യാർത്ഥികളുടെ നേതൃത്വത്തിലുള്ള ഒരു സ്റ്റാർട്ടപ്പാണ്, പ്രാദേശിക വെണ്ടർമാരും യാത്രക്കാരും തമ്മിലുള്ള അന്തരം നികത്തുന്നു. നിങ്ങൾ യാത്രയിലായിരിക്കുമ്പോൾ തന്നെ നിങ്ങളുടെ ബസ് സ്റ്റോപ്പിൽ സാധനങ്ങൾ എത്തിക്കുന്നു. വഴിതിരിവുകളില്ല. കാത്തിരിപ്പില്ല. സ്മാർട്ട് യാത്രക്കാർക്കായി സ്മാർട്ട് ഡെലിവറി.',
    keralaBorn:    'കേരള ജാതൻ 🌴',
    studentLed:    'വിദ്യാർത്ഥി നേതൃത്വം 🎓',
    communityFirst: 'കമ്മ്യൂണിറ്റി മുൻഗണന 🤝',
    ourJourney:    'ഞങ്ങളുടെ യാത്ര',
    ideaToImpact:  'ആശയത്തിൽ നിന്ന് സ്വാധീനത്തിലേക്ക്',
    journeyDesc:   'വിദ്യാർത്ഥികളുടെ നേതൃത്വത്തിലുള്ള പദ്ധതിയെന്ന നിലയിൽ ഞങ്ങൾ യാത്രികയെ ക്ലാസ്റൂം ആശയത്തിൽ നിന്ന് അംഗീകൃത സ്റ്റാർട്ടപ്പായി മാറ്റാൻ ശ്രമിക്കുന്നു - ഞങ്ങൾ എത്ര ദൂരം എത്തിയെന്ന് ഇതാ.',
    nowHiring:     'ഇപ്പോൾ നിയമിക്കുന്നു',
    partnerTitle:  'സവാരി. ഡെലിവറി. സമ്പാദിക്കുക.',
    partnerDesc:   'ഇതിനകം ഒരു ബസ് റൂട്ടിലാണോ? നിങ്ങളുടെ ദൈനംദിന യാത്രയെ അധിക വരുമാനമാക്കി മാറ്റുക. യാത്രികയിൽ ഡെലിവറി പാർട്ണറായി ചേരുക - ഫ്ലെക്സിബിൾ സമയം, സത്യസന്ധമായ വേതനം, നിങ്ങളുടെ പ്രാദേശിക കമ്മ്യൂണിറ്റിയിൽ യഥാർത്ഥ സ്വാധീനം.',
    dailyEarnings: 'ദൈനംദിന വരുമാനം',
    yourHours:     'നിങ്ങളുടെ സമയം',
    ratingsRewards: 'റേറ്റിംഗ്സും പ്രതിഫലവും',
    joinPartner:   'ഡെലിവറി പാർട്ണറായി ചേരുക',
  },
};

// Day-of-week quotes (Sunday = 0 … Saturday = 6)
const DAY_QUOTES = {
  en: [
    { day: 'Sunday Vibes 🌞',   quote: "Sunday is the golden clasp that binds together the volume of the week.",      sub: "Rest up. We'll carry the groceries." },
    { day: 'Monday Mode 💪',    quote: "Monday: the day your motivation is highest and your milk is lowest.",          sub: "Start the week right - we've got you covered." },
    { day: 'Taco Tuesday? 🌮',  quote: "Tuesday isn't so bad. It's a sign that you somehow survived Monday.",          sub: "Treat yourself. You made it past the worst day." },
    { day: 'Hump Day 🐪',       quote: "Wednesday: halfway to the weekend, fully in need of snacks.",                  sub: "Keep going. Order something delicious as fuel." },
    { day: 'Almost Friday ✨',  quote: "Thursday: the day you start convincing yourself the weekend is basically here.", sub: "Stock up now. Friday you won't want to wait." },
    { day: "It's Friday! 🎉",   quote: "Friday is like a superhero that always arrives just in time to save you.",     sub: "Celebrate with a delivery. You earned it." },
    { day: 'Saturday Sorted 🛋️', quote: "Saturday: the only day where doing nothing counts as productivity.",         sub: "Don't move. We'll bring everything to your stop." },
  ],
  ml: [
    { day: 'ഞായറാഴ്ച വൈബ്സ് 🌞',   quote: "ഞായറാഴ്ച ആഴ്ചയുടെ പുസ്തകത്തെ ഒരുമിച്ച് നിർത്തുന്ന സ്വർണ്ണ കൊളുത്താണ്.",      sub: "വിശ്രമിക്കൂ. ഞങ്ങൾ പലചരക്ക് സാധനങ്ങൾ വഹിക്കാം." },
    { day: 'തിങ്കളാഴ്ച മോഡ് 💪',    quote: "തിങ്കൾ: നിങ്ങളുടെ പ്രചോദനം ഏറ്റവും കൂടുതലും പാലിന്റെ അളവ് ഏറ്റവും കുറഞ്ഞ ദിവസം.",          sub: "ആഴ്ച ശരിയായി തുടങ്ങൂ - ഞങ്ങൾ നിങ്ങളെ പിന്തുണയ്ക്കും." },
    { day: 'ചൊവ്വാഴ്ച? 🌮',  quote: "ചൊവ്വാഴ്ച അത്ര മോശമല്ല. തിങ്കളാഴ്ച എങ്ങനെയോ അതിജീവിച്ചു എന്നതിന്റെ അടയാളമാണ്.",          sub: "സ്വയം ആദരിക്കൂ. ഏറ്റവും മോശം ദിവസം കടന്നു പോയി." },
    { day: 'ബുധനാഴ്ച 🐪',       quote: "ബുധൻ: വാരാന്ത്യത്തിലേക്ക് പകുതി വഴി, പൂർണ്ണമായും ലഘുഭോജനത്തിന്റെ ആവശ്യത്തിൽ.",                  sub: "തുടരുക. ഇന്ധനമായി എന്തെങ്കിലും രുചികരമായത് ഓർഡർ ചെയ്യൂ." },
    { day: 'മുങ്ങിയ വെള്ളി ✨',  quote: "വ്യാഴം: വാരാന്ത്യം അടിസ്ഥാനപരമായി ഇവിടെയാണെന്ന് സ്വയം ബോധ്യപ്പെടുത്താൻ തുടങ്ങുന്ന ദിവസം.", sub: "ഇപ്പോൾ സ്റ്റോക്ക് ചെയ്യൂ. വെള്ളിയാഴ്ച നിങ്ങൾ കാത്തിരിക്കാൻ ആഗ്രഹിക്കില്ല." },
    { day: "വെള്ളിയാഴ്ചയാണ്! 🎉",   quote: "വെള്ളിയാഴ്ച നിങ്ങളെ രക്ഷിക്കാൻ കൃത്യ സമയത്ത് എത്തുന്ന സൂപ്പർഹീറോയെപ്പോലെയാണ്.",     sub: "ഡെലിവറിയോടൊപ്പം ആഘോഷിക്കൂ. നിങ്ങൾ അത് അർഹിക്കുന്നു." },
    { day: 'ശനിയാഴ്ച ക്രമീകരിച്ചു 🛋️', quote: "ശനിയാഴ്ച: ഒന്നും ചെയ്യാതിരിക്കുന്നത് ഉൽപ്പാദനക്ഷമതയായി കണക്കാക്കുന്ന ഏക ദിവസം.",         sub: "അനങ്ങരുത്. ഞങ്ങൾ എല്ലാം നിങ്ങളുടെ സ്റ്റോപ്പിൽ എത്തിക്കാം." },
  ]
};

const CATEGORIES = [
  { key: 'food',       img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvPcTsasbxb7K-aOsx4oRU93OzFQBf_X2Y4CiMCmbNI8fsgvCnOhbXmTJ8gnl3rwVO9Ev2zDjKQTN7CkrU2GQU5rdn_U44DMVLU7N5kLS0AUuxksxWEc0qGoWg0sTIVfWjESaAUsp5Mrjh0J6O5XgdgW6PZwW4ZJHqM-HkTQCRRnws6KnCPwTSIm9bhdfMzKMmNawS40_5zjbOrz934M94rUpoIJcHbQdEqX2yw1YPni59Tjj5E9kEzC_imqvU2NcH1iguOoKwZUI' },
  { key: 'groceries',  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUPrHmRoGtO7fynA-DZvmC907wa-A9nbeR11d9jnkQHMOScl0GYy1qvVEXold2DVNPBk4XhBPcr1amU810_QQpxlniMmAEaeS17F8UVnvnTgtkvnlNz-A9tud1TPnbhd1d3e1huTubW0dtMbcH8AvkTYtr7aGvgaWtJmCeahypDlmN2VGLbevTBDr1fKBFLxADwrahIrXcIFwLVAHLTtBdLNONKIyzJFToIML6gDb9McQxeezJ9F0uje1T02CCMkCJJHEHR_QyizU' },
  { key: 'health_essentials',  img: 'https://freerangestock.com/sample/116027/health-care--healthcare--cardiology.jpg' },
  { key: 'others', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAhRl5lJ64TTi7H9MLKSiyQ2bR0c5Sh-n5eUTHffpig8vQjF18w0geUoZrRB_O3Mhj6DxcWxgXTeT54N1HjdMbbyfUiCbU6VYwHXi9ZlnYWS8Kd9rZS7nBIzdA61ncSpa1RNDmuxkIaWBlZjOBY5M51SB7AtU6THGwyQaiBxeL42cTTlIQpspAQ6k-GUeYgv-0vZuApEyNzjHVxoJkmREZMKyZgC-_dgakVPGY0425F_47uL5YAIidFAEOKsWo02kFlAccoY3Zl9Q' },
];


const YathrikaHome = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = T[language] || T.en;

  let cartCount = 0;
  try { const { getTotalCount } = useCart(); cartCount = getTotalCount?.() || 0; } catch(_) {}

  const [busStop,     setBusStop]     = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yathrika_bus_stop');
      if (saved) setBusStop(JSON.parse(saved));
    } catch(_) {}
  }, []);

  const todayQuote = DAY_QUOTES[language][new Date().getDay()];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div style={S.page}>

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button style={S.signInBtn} onClick={() => navigate('/yathrika-signin')}>
            <span className="material-symbols-outlined" style={{ fontSize:18, color:'#16230f' }}>person</span>
            <span style={S.signInLabel}>{t.signIn}</span>
          </button>
        </div>
        <h1 style={S.brand}>Yathrika</h1>
        <div style={{ width:88 }} />
      </header>

      {/* ── DELIVERY STOP BANNER ── */}
      <div style={S.stopBanner}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#68f91a', flexShrink: 0 }}>directions_bus</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={S.stopLabel}>{t.yourStop}</p>
          <p style={S.stopName}>{busStop ? busStop.name : t.noStop}</p>
          {busStop?.busNumber && (
            <p style={S.busDetails}>
              🚌 {busStop.busNumber}
              {busStop.seatNumber && <span style={{ marginLeft: 8 }}>💺 {t.seat} {busStop.seatNumber}</span>}
            </p>
          )}
        </div>
        <Link to="/routes" style={S.changeBtn}>{t.changeStop}</Link>
      </div>

      {/* ── SEARCH ── */}
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

        {/* ── CATEGORIES ── */}
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

        {/* ── SHOP NOW CTA ── */}
        <div style={S.shopCtaRow}>
          <Link to="/products" style={S.shopCtaBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>storefront</span>
            {t.shopNow} - {t.browseAll}
            <span className="material-symbols-outlined" style={{ fontSize: 18, marginLeft: 'auto' }}>arrow_forward</span>
          </Link>
        </div>

        {/* ── DAY QUOTE ── */}
        <div style={S.quoteCard}>
          <div style={S.quoteAccentOrb} />
          <span style={S.quoteDayBadge}>{todayQuote.day}</span>
          <p style={S.quoteText}>"{todayQuote.quote}"</p>
          <div style={S.quoteDivider} />
          <p style={S.quoteSub}>- {todayQuote.sub}</p>
        </div>

        {/* ── ABOUT US ── */}
        <div style={S.sectionWrap}>
          <span style={S.sectionChip}>{t.whoWeAre}</span>
          <h2 style={S.sectionHeading}>{t.ourMission}</h2>

          {/* Team photo */}
          <div style={S.teamPhotoWrap}>
            <img
              src={teamImage}
              alt="Yathrika Team"
              style={S.teamPhoto}
            />
            <div style={S.teamPhotoOverlay} />
          </div>

          <p style={S.sectionBody}>
            {t.aboutDesc}
          </p>
          <div style={S.aboutPillRow}>
            {[t.keralaBorn, t.studentLed, t.communityFirst].map(p => (
              <span key={p} style={S.aboutPill}>{p}</span>
            ))}
          </div>
        </div>

        {/* ── OUR JOURNEY ── */}
        <div style={S.sectionWrap}>
          <span style={S.sectionChip}>{t.ourJourney}</span>
          <h2 style={S.sectionHeading}>{t.ideaToImpact}</h2>
          <p style={{ ...S.sectionBody, marginBottom: 20 }}>
            {t.journeyDesc}
          </p>

          {/* Timeline */}
          <div style={S.timeline}>

            <div style={S.timelineItem}>
              <div style={S.timelineDot}>🥉</div>
              <div style={S.timelineContent}>
                <div style={S.timelineTag}>IEEE AJCE · I.D.E.A Competition</div>
                <p style={S.timelineTitle}>3rd Prize - Idea Pitching</p>
                <p style={S.timelineDesc}>
                  Competed against college teams across Kerala and secured 3rd place
                  at the I.D.E.A idea pitching competition organised by IEEE AJCE -
                  our first public validation that Yathrika solves a real problem.
                </p>
              </div>
            </div>

            <div style={S.timelineLine} />

            <div style={S.timelineItem}>
              <div style={S.timelineDot}>🚀</div>
              <div style={S.timelineContent}>
                <div style={S.timelineTag}>Samrambhak Mithra Programme</div>
                <p style={S.timelineTitle}>Selected for IDEA 3.0 Challenge</p>
                <p style={S.timelineDesc}>
                  Yathrika was handpicked for the IDEA 3.0 Challenge under the
                  Samrambhak Mithra entrepreneurship programme - giving us access
                  to mentorship, resources and a structured path toward building
                  a real business.
                </p>
              </div>
            </div>

            <div style={S.timelineLine} />

            <div style={S.timelineItem}>
              <div style={S.timelineDot}>💡</div>
              <div style={S.timelineContent}>
                <div style={S.timelineTag}>KSUM · Kerala Startup Mission</div>
                <p style={S.timelineTitle}>WE Pitch to WE Start Programme</p>
                <p style={S.timelineDesc}>
                  Participated in the WE Pitch to WE Start programme by Kerala Startup
                  Mission (KSUM) - connecting with investors, industry experts and
                  fellow student founders across the state.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── DELIVERY PARTNER CTA ── */}
        <div style={S.partnerCard} onClick={() => navigate('/delivery-partner-auth')}>
          <div style={S.partnerGlowOrb} />
          <div style={S.partnerTopRow}>
            <span style={S.partnerBadge}>{t.nowHiring}</span>
            <span className="material-symbols-outlined" style={{ color: '#68f91a', fontSize: 20 }}>open_in_new</span>
          </div>
          <h2 style={S.partnerHeading}>{t.partnerTitle}</h2>
          <p style={S.partnerBody}>
            {t.partnerDesc}
          </p>
          <div style={S.partnerFeatureRow}>
            {[
              { icon: 'payments',   text: t.dailyEarnings   },
              { icon: 'schedule',   text: t.yourHours   },
              { icon: 'star',       text: t.ratingsRewards},
            ].map(f => (
              <div key={f.text} style={S.partnerFeature}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#68f91a' }}>{f.icon}</span>
                <span style={S.partnerFeatureText}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={S.partnerBtn}>
            <span style={{ color: '#16230f' }}>{t.joinPartner}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#16230f' }}>arrow_forward</span>
          </div>
        </div>

      </main>

      {/* ── FOOTER NAV ── */}
      <footer style={S.footer}>
        {[
          { to: '/yathrika-home', icon: 'home',          label: t.home,          active: true  },
          { to: '/order-history', icon: 'receipt_long',  label: t.orders,        active: false },
          { to: '/user-profile',  icon: 'person',        label: t.profile,       active: false },
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
        @keyframes partnerPulse {
          0%,100% { opacity:0.12; transform:scale(1);    }
          50%      { opacity:0.25; transform:scale(1.18); }
        }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
};

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const S = {

  /* Layout */
  page:             { minHeight: '100vh', backgroundColor: '#16230f', fontFamily: "'Space Grotesk', sans-serif", display: 'flex', flexDirection: 'column', paddingBottom: 72 },

  /* Header */
  header:           { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(104,249,26,0.08)' },
  brand:            { color: '#68f91a', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' },
  cartBtn:          { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' },
  cartBadge:        { position: 'absolute', top: -6, right: -6, backgroundColor: '#68f91a', color: '#16230f', fontSize: '0.6rem', fontWeight: 800, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  signInBtn:        { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#68f91a', border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', flexShrink: 0 },
  signInLabel:      { color: '#16230f', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },

  /* Stop banner */
  stopBanner:       { display: 'flex', alignItems: 'center', gap: 10, margin: '12px 16px', backgroundColor: 'rgba(104,249,26,0.06)', border: '1px solid rgba(104,249,26,0.15)', borderRadius: 14, padding: '11px 14px' },
  stopLabel:        { color: '#68f91a', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 },
  stopName:         { color: '#fff', fontSize: '0.88rem', fontWeight: 600, margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 },
  busDetails:       { color: '#68f91a', fontSize: '0.72rem', fontWeight: 600, margin: '3px 0 0', opacity: 0.85 },
  changeBtn:        { color: '#68f91a', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0, opacity: 0.8, textDecoration: 'underline' },

  /* Search */
  searchBox:        { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '0 14px', gap: 8 },
  searchInput:      { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.88rem', padding: '12px 0', fontFamily: "'Space Grotesk', sans-serif" },

  /* Categories */
  categoryGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '16px 16px 8px' },
  catCard:          { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' },
  catImgWrap:       { width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)' },
  catImg:           { width: '100%', height: '100%', objectFit: 'cover' },
  catLabel:         { color: '#ccc', fontSize: '0.7rem', fontWeight: 600, margin: 0, textAlign: 'center' },

  /* Shop CTA */
  shopCtaRow:       { padding: '6px 16px 2px' },
  shopCtaBtn:       { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 16px', backgroundColor: 'rgba(104,249,26,0.1)', border: '1px solid rgba(104,249,26,0.28)', borderRadius: 14, color: '#68f91a', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', boxSizing: 'border-box', textDecoration: 'none' },

  /* Quote card */
  quoteCard:        { margin: '14px 16px 0', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(104,249,26,0.12)', borderRadius: 18, padding: '18px 20px 16px', position: 'relative', overflow: 'hidden' },
  quoteAccentOrb:   { position: 'absolute', top: -28, right: -28, width: 90, height: 90, borderRadius: '50%', backgroundColor: 'rgba(104,249,26,0.09)', pointerEvents: 'none' },
  quoteDayBadge:    { display: 'inline-block', backgroundColor: 'rgba(104,249,26,0.15)', color: '#68f91a', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', borderRadius: 20, padding: '3px 12px', marginBottom: 10 },
  quoteText:        { color: '#e0e0e0', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.6, margin: '0 0 10px', fontStyle: 'italic' },
  quoteDivider:     { height: 1, backgroundColor: 'rgba(104,249,26,0.1)', margin: '8px 0' },
  quoteSub:         { color: '#68f91a', fontSize: '0.75rem', fontWeight: 600, margin: 0, opacity: 0.8 },

  /* Section wrapper (About + Achievements) */
  sectionWrap:      { margin: '16px 16px 0', backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(104,249,26,0.1)', borderRadius: 18, padding: '20px 18px' },
  sectionChip:      { display: 'inline-block', backgroundColor: 'rgba(104,249,26,0.15)', color: '#68f91a', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 20, padding: '3px 12px', marginBottom: 10 },
  sectionHeading:   { color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.35, whiteSpace: 'pre-line' },
  sectionBody:      { color: '#999', fontSize: '0.84rem', lineHeight: 1.7, margin: '0 0 14px' },

  /* About pills */
  aboutPillRow:     { display: 'flex', flexWrap: 'wrap', gap: 8 },
  aboutPill:        { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(104,249,26,0.15)', borderRadius: 20, color: '#ccc', fontSize: '0.76rem', fontWeight: 600, padding: '5px 14px' },

  /* Team photo */
  teamPhotoWrap:    { position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 16, height: 160 },
  teamPhoto:        { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  teamPhotoOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,35,15,0.7) 0%, transparent 60%)' },
  teamPhotoCaption: { position: 'absolute', bottom: 10, left: 14, color: '#fff', fontSize: '0.8rem', fontWeight: 700 },

  /* Journey timeline */
  timeline:         { display: 'flex', flexDirection: 'column' },
  timelineItem:     { display: 'flex', gap: 14, alignItems: 'flex-start' },
  timelineDot:      { width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(104,249,26,0.12)', border: '1px solid rgba(104,249,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0, marginTop: 2 },
  timelineContent:  { flex: 1, paddingBottom: 4 },
  timelineTag:      { color: '#68f91a', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 },
  timelineTitle:    { color: '#fff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 5px' },
  timelineDesc:     { color: '#888', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 },
  timelineLine:     { width: 1, height: 20, backgroundColor: 'rgba(104,249,26,0.2)', margin: '8px 0 8px 18px' },

  /* Achievements - kept in case used elsewhere */
  achieveGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 },
  achieveCard:      { backgroundColor: 'rgba(104,249,26,0.05)', border: '1px solid rgba(104,249,26,0.14)', borderRadius: 14, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 },
  achieveIcon:      { fontSize: '1.6rem', lineHeight: 1 },
  achieveValue:     { color: '#68f91a', fontSize: '1.55rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' },
  achieveLabel:     { color: '#888', fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 },

  /* Partner CTA */
  partnerCard:      { margin: '16px 16px 0', background: 'linear-gradient(140deg, rgba(104,249,26,0.09) 0%, rgba(10,20,6,0.95) 55%)', border: '1px solid rgba(104,249,26,0.3)', borderRadius: 20, padding: '22px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden' },
  partnerGlowOrb:   { position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', backgroundColor: '#68f91a', animation: 'partnerPulse 3s ease-in-out infinite', pointerEvents: 'none' },
  partnerTopRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  partnerBadge:     { backgroundColor: '#68f91a', color: '#16230f', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', borderRadius: 20, padding: '3px 10px' },
  partnerHeading:   { color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 9px', lineHeight: 1.2 },
  partnerBody:      { color: '#aaa', fontSize: '0.83rem', lineHeight: 1.65, margin: '0 0 16px' },
  partnerFeatureRow:{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  partnerFeature:   { display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '5px 12px' },
  partnerFeatureText:{ color: '#ccc', fontSize: '0.75rem', fontWeight: 600 },
  partnerBtn:       { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#68f91a', color: '#16230f', fontWeight: 800, fontSize: '0.9rem', borderRadius: 12, padding: '13px 20px', fontFamily: "'Space Grotesk', sans-serif" },

  /* Footer */
  footer:           { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#0d1808', borderTop: '1px solid rgba(104,249,26,0.08)', padding: '8px 0 10px', zIndex: 100 },
  navItem:          { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', padding: '4px 0' },
};

export default YathrikaHome;