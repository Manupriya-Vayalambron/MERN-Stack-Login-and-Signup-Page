import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Support = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I track my delivery?",
      answer: "You can track your delivery in real-time from the 'Orders' screen. We'll show you the current location of the bus and the estimated time of arrival at your selected bus stop."
    },
    {
      id: 2,
      question: "What if my delivery is late?",
      answer: "While we strive for punctuality, bus schedules can sometimes be affected by traffic. Please check the real-time tracker for the most current ETA. If it's significantly delayed, you can contact our support team."
    },
    {
      id: 3,
      question: "Can I change my delivery address?",
      answer: "Delivery is based on bus stops. You can change your designated pickup bus stop up until the package is out for delivery. Once it's on the bus, the destination cannot be changed."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="main-wrapper">
      <div className="flex-grow">
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
          <div className="flex items-center p-4">
            <Link to="/yathrika-home" className="text-white">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
              </svg>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold pr-6">Help & Support</h1>
          </div>
        </header>
        
        <main className="p-4">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details 
                  key={faq.id}
                  className="group rounded-lg bg-background-light/10 dark:bg-black/20 backdrop-blur-sm border border-primary/20 glow-shadow"
                  open={openFAQ === faq.id}
                >
                  <summary 
                    className="flex cursor-pointer list-none items-center justify-between p-4"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFAQ(faq.id);
                    }}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <svg 
                      className={`h-5 w-5 transform transition-transform duration-300 text-primary ${openFAQ === faq.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </summary>
                  {openFAQ === faq.id && (
                    <div className="px-4 pb-4 text-white/70">{faq.answer}</div>
                  )}
                </details>
              ))}
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary/20 dark:bg-primary/20 h-14 font-bold text-white transition-colors hover:bg-primary/30 glow-shadow">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M222.34,158.66l-44.88-22.44a16,16,0,0,0-17.35,1.72l-18,12a120.25,120.25,0,0,1-59.5-59.5l12-18A16,16,0,0,0,96,55.12L73.56,10.24A16,16,0,0,0,56.7,0H24A16,16,0,0,0,8,16C8,132.28,123.72,248,240,248a16,16,0,0,0,16-16V173.3A16,16,0,0,0,222.34,158.66ZM240,232c-106.07,0-192-86-192-192V24h29.53l21.32,42.66-15.1,22.64a16,16,0,0,0,1.36,18.42,136.21,136.21,0,0,0,67.65,67.65,16,16,0,0,0,18.42,1.36L191.8,161.61,234.46,183V208Z"></path>
                </svg>
                Call Us
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary/20 dark:bg-primary/20 h-14 font-bold text-white transition-colors hover:bg-primary/30 glow-shadow">
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M128,24A104,104,0,0,0,24,128c0,33,14.71,63.19,38.83,83.12L48,240l29-14.83A104.3,104.3,0,0,0,128,232a104,104,0,0,0,0-208Zm0,192a88,88,0,0,1-44.25-12.28l-3.23-1.92-32.84,16.78,17.06-32.1L62.5,177.3a87.64,87.64,0,0,1-18.5-49.3,88,88,0,1,1,84,84Zm40.48-61.12c-1.89-1-11.13-5.5-12.87-6.13s-3,-.94-4.26.94-4.85,6.13-6,7.38-2.2,1.4-4.1,.5s-8-3-15.22-9.39-11.8-10.74-13.16-12.63-1.36-2.85-.42-3.8s.84-2.2,1.26-3,.42-1.89,.63-3.15.05-2.4-.48-3.35s-4.26-10.23-5.84-14s-3.1-3.2-4.26-3.26-2.33-.06-3.6-.06a8.31,8.31,0,0,0-6,2.85c-2.32,2.32-8.8,8.59-8.8,21s9,24.31,10.23,26.06,17.61,26.85,42.84,37.82,21.57,7.21,25.68,6.86,16.59-6.78,19-13.34,1.9-12.23,1.31-13.34S131.77,155.82,129.88,154.88Z"></path>
                </svg>
                WhatsApp
              </button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Raise a Ticket</h2>
            <button className="w-full flex items-center justify-center rounded-lg bg-primary h-14 font-bold text-background-dark glow-effect transition-shadow hover:shadow-primary/75">
              Submit a Complaint
            </button>
          </section>
        </main>
      </div>
      
      <footer className="footer-nav">
        <nav className="flex justify-around">
          <Link className="flex flex-col items-center gap-1 text-white/70 hover:text-primary" to="/yathrika-home">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 text-white/70 hover:text-primary" to="/order-history">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
            </svg>
            <span className="text-xs font-medium">Orders</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 text-primary" to="/user-profile">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full"></div>
              <svg className="relative z-10" fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"></path>
              </svg>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </Link>
          <Link className="flex flex-col items-center gap-1 text-white/70 hover:text-primary" to="/notifications">
            <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
            </svg>
            <span className="text-xs font-medium">Notifications</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Support;