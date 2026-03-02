import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('yathrika_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('yathrika_user');
      }
    }
    setLoading(false);
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is signed in, but we still need our custom user data
        console.log('Firebase user authenticated:', firebaseUser.phoneNumber);
      } else {
        // Firebase user is signed out, clear our user data
        console.log('Firebase user signed out');
        signOut();
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in user after OTP verification
  const signIn = async (phoneNumber, userData = {}) => {
    try {
      // Call backend to create/verify user
      const response = await fetch('http://localhost:3001/api/user/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          name: userData.name || ''
        }),
      });

      const result = await response.json();

      if (result.success) {
        const userInfo = {
          phoneNumber: result.user.phoneNumber,
          name: result.user.name,
          orderCount: result.user.orderCount,
          isVerified: result.user.isVerified,
          signInTime: new Date().toISOString()
        };

        setUser(userInfo);
        setIsAuthenticated(true);
        
        // Store in localStorage for persistence
        localStorage.setItem('yathrika_user', JSON.stringify(userInfo));
        
        console.log('User signed in successfully:', userInfo);
        return { success: true, user: userInfo };
      } else {
        throw new Error(result.message || 'Failed to verify user');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out user
  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('yathrika_user');
    
    // Sign out from Firebase as well
    if (auth.currentUser) {
      auth.signOut().catch(error => {
        console.error('Firebase sign out error:', error);
      });
    }
    
    console.log('User signed out');
  };

  // Update user name
  const updateUserName = async (newName) => {
    if (!user || !newName.trim()) {
      return { success: false, error: 'Invalid name or user not signed in' };
    }

    try {
      const response = await fetch('http://localhost:3001/api/user/update-name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: user.phoneNumber,
          name: newName.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedUser = {
          ...user,
          name: result.user.name
        };
        
        setUser(updatedUser);
        localStorage.setItem('yathrika_user', JSON.stringify(updatedUser));
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(result.message || 'Failed to update user name');
      }
    } catch (error) {
      console.error('Update name error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get fresh user data from server
  const refreshUser = async () => {
    if (!user?.phoneNumber) {
      return { success: false, error: 'No user to refresh' };
    }

    try {
      const response = await fetch(`http://localhost:3001/api/user/${encodeURIComponent(user.phoneNumber)}`);
      const result = await response.json();

      if (result.success) {
        const refreshedUser = {
          phoneNumber: result.user.phoneNumber,
          name: result.user.name,
          orderCount: result.user.orderCount,
          isVerified: result.user.isVerified,
          orders: result.user.orders,
          signInTime: user.signInTime // Keep original sign in time
        };

        setUser(refreshedUser);
        localStorage.setItem('yathrika_user', JSON.stringify(refreshedUser));
        
        return { success: true, user: refreshedUser };
      } else {
        throw new Error(result.message || 'Failed to refresh user data');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get user's order history
  const getUserOrders = () => {
    return user?.orders || [];
  };

  // Get user's display name (name if available, otherwise formatted phone number)
  const getDisplayName = () => {
    if (user?.name && user.name.trim()) {
      return user.name;
    }
    if (user?.phoneNumber) {
      // Format +919876543210 as +91 98765 43210
      const phone = user.phoneNumber;
      if (phone.startsWith('+91')) {
        const digits = phone.substring(3);
        return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
      }
      return phone;
    }
    return 'User';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    updateUserName,
    refreshUser,
    getUserOrders,
    getDisplayName
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;