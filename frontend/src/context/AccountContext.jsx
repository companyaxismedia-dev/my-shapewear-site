import { createContext, useState, useCallback } from 'react';

export const AccountContext = createContext();

export function AccountProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9876543210',
    birthday: '1995-05-15',
    anniversary: '2020-03-20',
    profession: 'Doctor',
    industry: 'Healthcare',
    kids: '1',
    language: 'Hindi',
    password: '••••••••',
    gender: 'Female',
    city: 'Mumbai',
    state: 'Maharashtra',
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      name: 'Priya Sharma',
      phone: '+91 9876543210',
      address: 'Flat 101, Sunshine Apartments',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
  ]);

  const [orders, setOrders] = useState([]);

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'FIRST50',
      discount: '50% OFF',
      minPurchase: 'Min purchase ₹500',
      expiry: 'Dec 31, 2024',
      used: false,
    },
    {
      id: 2,
      code: 'SUMMER20',
      discount: '₹200 OFF',
      minPurchase: 'Min purchase ₹1000',
      expiry: 'Sep 30, 2024',
      used: false,
    },
  ]);

  const [wallet, setWallet] = useState({
    balance: 2500,
    currency: 'INR',
    transactions: [],
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
  });

  const [notifications, setNotifications] = useState({
    whatsapp: true,
    sms: false,
    push: true,
    email: true,
  });

  const updateUserProfile = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  const addAddress = useCallback((newAddress) => {
    setAddresses(prev => [...prev, { ...newAddress, id: Date.now() }]);
  }, []);

  const deleteAddress = useCallback((id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  }, []);

  const updateBankDetails = useCallback((details) => {
    setBankDetails(details);
  }, []);

  const toggleNotification = useCallback((type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const value = {
    user,
    updateUserProfile,
    addresses,
    addAddress,
    deleteAddress,
    orders,
    coupons,
    wallet,
    bankDetails,
    updateBankDetails,
    notifications,
    toggleNotification,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
