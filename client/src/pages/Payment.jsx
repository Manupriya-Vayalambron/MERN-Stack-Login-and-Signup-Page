import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Get amount from location state or fallback to a default
    if (location.state && location.state.amount) {
      setAmount(location.state.amount);
    } else {
      setAmount(599); // Fallback amount
    }
  }, [location]);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSuccess(true);
      
      // Simulate redirection to Order Summary after success
      setTimeout(() => {
        navigate('/order-summary');
      }, 2000);
    }, 2500);
  };

  return (
    <div className="payment-portal-container">
      <div className="payment-portal-card">
        {isProcessing && (
          <div className="payment-processing-overlay">
            {!isSuccess ? (
              <>
                <div className="processing-spinner"></div>
                <div className="processing-text">
                  <h3>Processing Payment</h3>
                  <p>Please do not refresh or close the page</p>
                </div>
              </>
            ) : (
              <>
                <div className="success-icon">
                  <span className="material-icons">check</span>
                </div>
                <div className="processing-text">
                  <h3>Payment Successful!</h3>
                  <p>Redirecting you to order summary...</p>
                </div>
              </>
            )}
          </div>
        )}

        <header className="payment-portal-header">
          <div className="payment-portal-logo">
            <span className="material-icons">shield</span>
            <span>Yathrika Pay</span>
          </div>
          <div className="payment-portal-amount">
            <p>Amount to Pay</p>
            <p>₹{amount}</p>
          </div>
        </header>

        <div className="payment-portal-body">
          <h2 className="payment-portal-section-title">Select Payment Method</h2>
          
          <div className="payment-methods">
            <div 
              className={`payment-method-item ${selectedMethod === 'upi' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('upi')}
            >
              <div className="method-icon">
                <span className="material-icons">qr_code_2</span>
              </div>
              <div className="method-details">
                <div className="method-name">UPI</div>
                <div className="method-desc">Pay using any UPI app (Google Pay, PhonePe, Paytm)</div>
              </div>
            </div>

            <div 
              className={`payment-method-item ${selectedMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <div className="method-icon">
                <span className="material-icons">credit_card</span>
              </div>
              <div className="method-details">
                <div className="method-name">Cards (Debit/Credit)</div>
                <div className="method-desc">Visa, Mastercard, RuPay, Maestro</div>
              </div>
            </div>

            <div 
              className={`payment-method-item ${selectedMethod === 'netbanking' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('netbanking')}
            >
              <div className="method-icon">
                <span className="material-icons">account_balance</span>
              </div>
              <div className="method-details">
                <div className="method-name">Netbanking</div>
                <div className="method-desc">All major Indian banks supported</div>
              </div>
            </div>

            <div 
              className={`payment-method-item ${selectedMethod === 'wallet' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('wallet')}
            >
              <div className="method-icon">
                <span className="material-icons">account_balance_wallet</span>
              </div>
              <div className="method-details">
                <div className="method-name">Wallets</div>
                <div className="method-desc">Paytm, PhonePe, Amazon Pay</div>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-portal-footer">
          <button 
            className="pay-now-button"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            <span>Pay ₹{amount}</span>
            <span className="material-icons">arrow_forward</span>
          </button>
          
          <div className="secure-footer">
            <span className="material-icons" style={{fontSize: '14px'}}>lock</span>
            <span>100% Secure Payment Powered by Yathrika</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
