import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Admin = () => {
  const liveOrders = [
    {
      id: '12345',
      busStop: 'Central Station',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANBNNPjU6mAdXgx9-Fxxv5MBddePWJ-pSX4LrulHuuc-tqmQmq4Z0_ncoqaUE3n-BYLW4grTNw1934fdHpzESm_Exbsc3BEoHgO5dbP2HTZ1OClzQLoeLnELDJ4C-G-LYeW8Jk9Rp_zBH3QjMtOn49u23b80I0GH2Ac2TZnqeBUn3UqaF9ET1S60lITMd5ojw8tgkVtlWgidfdhROKun6KL3fbUZtavnlpCL1WoxEL_-Zck5DEMqUZQ-Yi35NMDupWWiFySbtQTOk'
    },
    {
      id: '67890',
      busStop: 'University',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH8ODLdc3m1ywvPxzCcfZFlON0demJOYF6T9kcUiipaiVJmOQJaKYe0lSEiwMzLwAcLr3wAozC3lG7nQ990P7iHyAayE8vGyATUamiT9zrqpY1I9ULPUckyhhSdRTqDXAQLIEwlqTpB6LzImdARYqVwdjwMP152o6rSzu6h_JzMQuEkiT-BRPvkvRxV99R4HgG1YH2QfhtG0aCtOIx4pX9XdIqy3h4PPIxSUX0WriDQNjIhSyralKjdJ_H2tdwCZ4X04nl5CIYVaM'
    }
  ];

  const deliveryPartners = [
    {
      name: 'Partner A',
      status: 'Available',
      isAvailable: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4GPvwV4RDb72PUb8742zR_yJf0DAvkvffjsHdrvlDIW58M27hPPPgi5swaYroOzFWuZFBUfqraBE_u720qGeBrBO_vW3o5gBIPaN62vjnApGxc7GwJ2_ThpTwWW22qaANpqfGlDYq8Yxvt9F6prSsUef8qXWbGCldsvYn_l34fY2tIgCYDWeO8rkxhz9a9eGv43szA9wY9YC-PHG1SwuHzUympCfLjWSqjgdZWLRqNrJqCdlVm8kPfkRFOvji2SktB5-46F8NDw'
    },
    {
      name: 'Partner B',
      status: 'Busy',
      isAvailable: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzMgMvlL2B7uu6RwppB7YEfFgK4J-du3DGbJe0WLCk7gglWlI-uIfhwHD5cLHWFlYko_tVCD_3ikmvWu9gg_nXQJdHpF7Bt5pRtmB98OcX1UH_fKCZYmHeF9yeYG9pA563JaDLFwnzwuRT0Bq2IKM6Qt4EWjp_n8rYGiAKWwhEp2ftCOFsjceYHhP2GB7UKFx-cgQblqQw4QFRMdQzvvrm0VIBGSWrJucfS4vg4fcbr8_WjwZ_ynY01zfYvlqF1Iiv3_-MnwIii_U'
    }
  ];

  return (
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="w-12"></div>
            <h1 className="text-xl font-bold text-white text-center flex-1">Yathrika Admin</h1>
            <div className="flex w-12 items-center justify-end">
              <button className="p-2 rounded-full hover:bg-primary/20 transition-colors">
                <svg className="text-white" fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216.7,132.7,199.11,154a8,8,0,0,0-2,5.85,75.46,75.46,0,0,1,0,12.3,8,8,0,0,0,2,5.85l17.59,21.3a8,8,0,0,1-1.39,11.83l-19.45,16a8,8,0,0,0-6.14,1,75.43,75.43,0,0,1-10.66,10.66,8,8,0,0,0-1,6.14l-2.82,21.75a8,8,0,0,1-10.42,7.3l-21-5.61a8,8,0,0,0-6.4,0,76.5,76.5,0,0,1-12.3,0,8,8,0,0,0-6.4,0l-21,5.61a8,8,0,0,1-10.42-7.3l-2.82-21.75a8,8,0,0,0-1-6.14,75.43,75.43,0,0,1-10.66-10.66,8,8,0,0,0-6.14-1l-19.45-16a8,8,0,0,1-1.39-11.83l17.59-21.3a8,8,0,0,0,2-5.85,75.46,75.46,0,0,1,0-12.3,8,8,0,0,0-2-5.85L39.3,123.3a8,8,0,0,1,1.39-11.83l19.45-16a8,8,0,0,0,6.14-1,75.43,75.43,0,0,1,10.66-10.66,8,8,0,0,0,1-6.14l2.82-21.75a8,8,0,0,1,10.42-7.3l21,5.61a8,8,0,0,0,6.4,0,76.5,76.5,0,0,1,12.3,0,8,8,0,0,0,6.4,0l21-5.61a8,8,0,0,1,10.42,7.3l2.82,21.75a8,8,0,0,0,1,6.14,75.43,75.43,0,0,1,10.66,10.66,8,8,0,0,0,6.14,1l19.45,16A8,8,0,0,1,216.7,132.7ZM128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white px-0 pb-4">Live Orders</h2>
            <div className="space-y-4">
              {liveOrders.map((order) => (
                <div key={order.id} className="bg-background-light/50 dark:bg-background-dark/50 rounded-xl p-4 flex items-center gap-4 border border-primary/20">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">Order #{order.id}</p>
                      <p className="text-sm text-primary">Bus Stop: {order.busStop}</p>
                    </div>
                    <button className="px-5 py-2 text-sm font-bold text-black bg-primary rounded-full hover:opacity-90 transition-opacity glow-effect">
                      Track
                    </button>
                  </div>
                  <div 
                    className="w-28 h-28 rounded-lg bg-cover bg-center" 
                    style={{backgroundImage: `url("${order.image}")`}}
                  ></div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white px-0 pb-4">Delivery Partners</h2>
            <div className="space-y-2">
              {deliveryPartners.map((partner, index) => (
                <div key={index} className="bg-background-light/50 dark:bg-background-dark/50 rounded-xl p-4 flex items-center gap-4 border border-primary/20">
                  <div 
                    className="w-14 h-14 rounded-full bg-cover bg-center" 
                    style={{backgroundImage: `url("${partner.image}")`}}
                  ></div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-white">{partner.name}</p>
                    <p className={`text-sm ${partner.isAvailable ? 'text-primary' : 'text-white/70'}`}>
                      {partner.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white px-0 pb-4">Revenue</h2>
            <div className="bg-primary/20 rounded-xl p-6 border border-primary/30">
              <p className="text-base font-medium text-primary">Total Today</p>
              <p className="text-4xl font-bold text-white mt-1">$5,432</p>
            </div>
          </section>
        </main>
      </div>

      <footer className="footer-nav">
        <div className="flex justify-around p-2">
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-primary" to="/admin">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0l.11.11,80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-white/70 hover:text-primary transition-colors" to="/analytics">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path>
            </svg>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-white/70 hover:text-primary transition-colors" to="/users">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
            </svg>
          </Link>
          <Link className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-white/70 hover:text-primary transition-colors" to="/routes">
            <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM104,52.94l48,24V203.06l-48-24ZM40,62.25l48-12v127.5l-48,12Zm176,131.5-48,12V78.25l48-12Z"></path>
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Admin;