import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useUser } from '../UserContext';
import '../index.css';

// ─── Load Razorpay checkout script dynamically ────────────────────────────────
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Payment = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { cartItems, getTotalPrice, getTotalCount } = useCart();
  const { user } = useUser();

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [paymentState, setPaymentState]     = useState('idle'); // idle | processing | success | failed
  const [failReason, setFailReason]         = useState('');

  // Amount: use cart total + delivery - discount, or fallback from location state
  const subtotal   = getTotalPrice();
  const delivery   = 40;
  const discount   = 20;
  const totalAmount = subtotal > 0 ? subtotal + delivery - discount
                                   : (location.state?.amount || 599);

  // ─── Main payment handler ────────────────────────────────────────────────
  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentState('processing');

    // 1. Load Razorpay SDK
    const sdkLoaded = await loadRazorpay();
    if (!sdkLoaded) {
      alert('Failed to load payment SDK. Check your internet connection.');
      setIsProcessing(false);
      setPaymentState('idle');
      return;
    }

    try {
      // 2. Create order on your backend
      const orderRes = await fetch('http://localhost:5000/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:    totalAmount,
          cartItems: cartItems,
          userId:    user?.phoneNumber || 'guest',
          phoneNumber: user?.phoneNumber,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Order creation failed');

      // 3. Open Razorpay checkout popup
      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        order_id:    orderData.orderId,
        name:        'Yathrika',
        description: `${getTotalCount()} item(s) from Yathrika`,
        image:       '', // add your logo URL here

        // ── Pre-fill merchant UPI (for UPI collect flow) ──────────────────
        // The customer pays TO this UPI ID
        // (Razorpay routes the money to the account linked to your Razorpay key,
        //  but you can set default UPI for display in notes)

        // ── Pre-select method based on user's choice ──────────────────────
        config: {
          display: {
            blocks: {
              utib: { name: 'UPI',        instruments: [{ method: 'upi' }] },
              card: { name: 'Cards',      instruments: [{ method: 'card' }] },
              nb:   { name: 'Netbanking', instruments: [{ method: 'netbanking' }] },
              wlt:  { name: 'Wallets',    instruments: [{ method: 'wallet' }] },
            },
            sequence: selectedMethod === 'upi'        ? ['block.utib', 'block.card', 'block.nb', 'block.wlt']
                     : selectedMethod === 'card'       ? ['block.card', 'block.utib', 'block.nb', 'block.wlt']
                     : selectedMethod === 'netbanking' ? ['block.nb',   'block.utib', 'block.card', 'block.wlt']
                                                       : ['block.wlt',  'block.utib', 'block.card', 'block.nb'],
            preferences: { show_default_blocks: true },
          },
        },

        // ── Success handler ───────────────────────────────────────────────
        handler: async (response) => {
          try {
            const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                cartItems:           cartItems,
                totalAmount:         totalAmount,
                userId:              user?.phoneNumber || 'guest',
                phoneNumber:         user?.phoneNumber,
                paymentMethod:       selectedMethod,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // ── Console log for Step 1 (before DB integration) ─────────
              console.log('\n✅ PAYMENT SUCCESS (frontend)');
              console.log('   Payment ID :', response.razorpay_payment_id);
              console.log('   Order ID   :', response.razorpay_order_id);
              console.log('   Amount     : ₹' + totalAmount);
              console.log('   Items      :', cartItems.map(i => `${i.name} x${i.quantity}`));
              console.log('   Timestamp  :', new Date().toISOString());

              setPaymentState('success');
              setTimeout(() => navigate('/order-summary', {
                state: {
                  paymentId:   response.razorpay_payment_id,
                  orderId:     response.razorpay_order_id,
                  customOrderId: verifyData.customOrderId,
                  amount:      totalAmount,
                  cartItems:   cartItems,
                  paymentMethod: selectedMethod,
                  user:        user,
                }
              }), 2500);

            } else {
              throw new Error('Signature verification failed');
            }
          } catch (verifyErr) {
            console.error('\n❌ PAYMENT VERIFY ERROR (frontend):', verifyErr.message);
            setPaymentState('failed');
            setFailReason('Payment could not be verified. Contact support.');
            setIsProcessing(false);
          }
        },

        // ── Modal dismiss / user cancel ───────────────────────────────────
        modal: {
          ondismiss: async () => {
            console.log('\n⚠️  PAYMENT CANCELLED — user closed the payment window');
            console.log('   Order ID  :', orderData.orderId);
            console.log('   Amount    : ₹' + totalAmount);
            console.log('   Timestamp :', new Date().toISOString());

            // Notify backend
            await fetch('http://localhost:5000/api/payment/failed', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId:     orderData.orderId,
                error:       { description: 'User cancelled payment', reason: 'user_cancelled' },
                cartItems:   cartItems,
                totalAmount: totalAmount,
                userId:      user?.phoneNumber || 'guest',
                phoneNumber: user?.phoneNumber,
                paymentMethod: selectedMethod,
              }),
            }).catch(() => {});

            setPaymentState('idle');
            setIsProcessing(false);
          },
        },

        // ── Prefill user details (replace with real user data later) ──────
        prefill: {
          name:    user?.name || '',
          email:   '',
          contact: user?.phoneNumber ? user.phoneNumber.replace('+91', '') : '',
        },

        theme: {
          color:        '#68f91a',
          backdrop_color: 'rgba(22, 35, 15, 0.85)',
        },
      };

      const rzp = new window.Razorpay(options);

      // ── Payment failure inside checkout (declined card, UPI timeout etc.) ──
      rzp.on('payment.failed', async (response) => {
        const errInfo = {
          code:        response.error.code,
          description: response.error.description,
          reason:      response.error.reason,
          orderId:     response.error.metadata?.order_id,
          paymentId:   response.error.metadata?.payment_id,
        };

        console.log('\n❌ PAYMENT FAILED (frontend)');
        console.log('   Reason     :', errInfo.reason);
        console.log('   Description:', errInfo.description);
        console.log('   Code       :', errInfo.code);
        console.log('   Order ID   :', errInfo.orderId);
        console.log('   Payment ID :', errInfo.paymentId);
        console.log('   Amount     : ₹' + totalAmount);
        console.log('   Timestamp  :', new Date().toISOString());

        // Notify backend
        await fetch('http://localhost:5000/api/payment/failed', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId:     errInfo.orderId,
            error:       errInfo,
            cartItems:   cartItems,
            totalAmount: totalAmount,
            userId:      user?.phoneNumber || 'guest',
            phoneNumber: user?.phoneNumber,
            paymentMethod: selectedMethod,
          }),
        }).catch(() => {});

        setPaymentState('failed');
        setFailReason(errInfo.description || 'Payment was declined. Please try again.');
        setIsProcessing(false);
      });

      rzp.open();

    } catch (err) {
      console.error('\n❌ PAYMENT INIT ERROR (frontend):', err.message);
      setPaymentState('failed');
      setFailReason('Could not initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="payment-portal-container">
      <div className="payment-portal-card" style={{ position: 'relative' }}>

        {/* ── Processing / Result overlay ── */}
        {paymentState === 'processing' && (
          <div className="payment-processing-overlay">
            <div className="processing-spinner"></div>
            <div className="processing-text">
              <h3>Opening Payment</h3>
              <p>Please complete payment in the popup</p>
            </div>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="payment-processing-overlay">
            <div className="success-icon">
              <span className="material-icons">check</span>
            </div>
            <div className="processing-text">
              <h3>Payment Successful!</h3>
              <p>Redirecting to your order summary…</p>
            </div>
          </div>
        )}

        {paymentState === 'failed' && (
          <div className="payment-processing-overlay">
            <div className="success-icon" style={{ background: 'rgba(255,80,80,0.2)', border: '2px solid rgba(255,80,80,0.5)' }}>
              <span className="material-icons" style={{ color: '#ff6464' }}>close</span>
            </div>
            <div className="processing-text">
              <h3 style={{ color: '#ff6464' }}>Payment Failed</h3>
              <p>{failReason}</p>
              <button
                onClick={() => setPaymentState('idle')}
                style={{
                  marginTop: '1.25rem',
                  padding: '0.65rem 1.5rem',
                  background: 'var(--primary)',
                  color: '#0c1508',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <header className="payment-portal-header">
          <div className="payment-portal-logo">
            <span className="material-icons">shield</span>
            <span>Yathrika Pay</span>
          </div>
          <div className="payment-portal-amount">
            <p>Amount to Pay</p>
            <p>₹{totalAmount}</p>
          </div>
        </header>

        {/* ── Payment methods ── */}
        <div className="payment-portal-body">
          <h2 className="payment-portal-section-title">Select Payment Method</h2>

          <div className="payment-methods">
            {[
              { id: 'upi',        icon: 'qr_code_2',             label: 'UPI',               desc: 'GPay, PhonePe, Paytm, BHIM & all UPI apps' },
              { id: 'card',       icon: 'credit_card',           label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay, Maestro' },
              { id: 'netbanking', icon: 'account_balance',       label: 'Netbanking',          desc: 'All major Indian banks' },
              { id: 'wallet',     icon: 'account_balance_wallet', label: 'Wallets',            desc: 'Paytm, PhonePe, Amazon Pay' },
            ].map(({ id, icon, label, desc }) => (
              <div
                key={id}
                className={`payment-method-item ${selectedMethod === id ? 'selected' : ''}`}
                onClick={() => setSelectedMethod(id)}
              >
                <div className="method-icon">
                  <span className="material-icons">{icon}</span>
                </div>
                <div className="method-details">
                  <div className="method-name">{label}</div>
                  <div className="method-desc">{desc}</div>
                </div>
                {selectedMethod === id && (
                  <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px', marginLeft: 'auto' }}>
                    check_circle
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Cart summary preview */}
          {cartItems.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(104,249,26,0.05)',
              border: '1px solid rgba(104,249,26,0.15)',
              borderRadius: '10px',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.55)',
            }}>
              <div style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                {user?.name ? `Order for ${user.name}` : 'Guest Order'}
                {user?.phoneNumber && (
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {user.phoneNumber}
                  </div>
                )}
              </div>
              {cartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>{i.name} × {i.quantity}</span>
                  <span>₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.4rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 700 }}>
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Pay button ── */}
        <div className="payment-portal-footer">
          <button
            className="pay-now-button"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            <span className="material-icons">lock</span>
            <span>Pay ₹{totalAmount} Securely</span>
            <span className="material-icons">arrow_forward</span>
          </button>

          <div className="secure-footer">
            <span className="material-icons" style={{ fontSize: '13px' }}>verified_user</span>
            <span>Secured by Razorpay · 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;