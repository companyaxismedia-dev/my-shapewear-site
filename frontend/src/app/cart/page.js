"use client";

import React, { useState } from 'react';
import { X, Tag, Gift, Bookmark, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import LoginModal from "../authPage/LoginModal";
import { useEffect } from "react";
import Link from "next/link";
import { useWishlist } from '@/context/WishlistContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, updateQty, removeItem, updateSize } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const initialSelection = {};
    cartItems.forEach(item => {
      initialSelection[item.id] = true;
    });
    setSelectedItems(initialSelection);
  }, [cartItems]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDonationChecked, setIsDonationChecked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openLogin, setOpenLogin] = useState(false);


  const categories = [
    'All', 'Lip Balm', 'Bedsheets', 'Handbags', 'Doormats',
    'Shampoo', 'Day Cream', 'Hair Accessory', 'Jewellery Set'
  ];

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllSelection = () => {
    const allSelected = cartItems.every(item => selectedItems[item.id]);
    const newSelection = {};
    cartItems.forEach(item => {
      newSelection[item.id] = !allSelected;
    });
    setSelectedItems(newSelection);
  };

  const removeSelectedItems = async () => {
    for (const item of cartItems) {
      if (selectedItems[item.id]) {
        await removeItem(item.id);
      }
    }
  };
  const moveToWishlist = async () => {
    if (!user) {
      setOpenLogin(true);
      return;
    }

    for (const item of cartItems) {
      if (selectedItems[item.id]) {

        const productId =
          typeof item.productId === "object"
            ? item.productId._id
            : item.productId;

        await toggleWishlist({
          _id: productId,
          name: item.name,
          brand: item.brand,
          thumbnail: item.image,
          minPrice: item.price,
          mrp: item.mrp,
          discount: item.discount,
        });

        await removeItem(item.id);
      }
    }
  };

  const handleRemoveSingleItem = async () => {
    if (!selectedProduct) return;

    await removeItem(selectedProduct.id);

    setShowMoveModal(false);
    setSelectedProduct(null);
  };

  const handleMoveSingleToWishlist = async () => {
    if (!selectedProduct) return;

    if (!user) {
      setOpenLogin(true);
      return;
    }

    const productId =
      typeof selectedProduct.productId === "object"
        ? selectedProduct.productId._id
        : selectedProduct.productId;

    await toggleWishlist({
      _id: productId,
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      thumbnail: selectedProduct.image,
      minPrice: selectedProduct.price,
      mrp: selectedProduct.mrp,
      discount: selectedProduct.discount,
    });

    await removeItem(selectedProduct.id);

    setShowMoveModal(false);
    setSelectedProduct(null);
  };


  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty >= 1 && newQty <= 10) {
      await updateQty(itemId, newQty);
    }
  };

  const selectedCount = cartItems.filter(item => selectedItems[item.id]).length;
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = totalMRP - totalPrice;
  const donationAmount = isDonationChecked && selectedDonation ? selectedDonation : 0;
  const finalAmount = totalPrice + donationAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600">Add some products to get started!</p>
        </div>
      </div>
    );
  }
  console.log(cartItems);


  return (
    <div className="min-h-screen bg-white">
      {/* Header Progress */}
      <div className="border-b">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-wider">BAG</span>
                <div className="w-12 h-0.5 bg-pink-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                <span className="font-semibold text-sm tracking-wider text-gray-400">ADDRESS</span>
                <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-300"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-0.5 border-t-2 border-dashed border-gray-300"></div>
                <span className="font-semibold text-sm tracking-wider text-gray-400">PAYMENT</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold">100% SECURE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            <div className="bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm mb-1">
                    <span className="text-gray-600">Deliver to: </span>
                    <span className="font-semibold">{user?.name || 'Guest'}</span>
                    <span className="font-semibold">, {user?.pincode || '000000'}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {user?.address || 'Please add delivery address'}
                  </div>
                </div>
                <button className="border border-pink-500 text-pink-500 hover:bg-pink-50 font-semibold text-xs px-6 py-2 transition-colors">
                  CHANGE ADDRESS
                </button>
              </div>
            </div>

            {/* Available Offers */}
            <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2">Available Offers</h3>
                  <p className="text-sm text-gray-600">
                    7.5% Assured Cashback* on a minimum spend of ₹100. T&C
                  </p>
                  {showMoreOffers && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-600">
                        10% Instant Discount on ICICI Bank Credit Cards on a min spend of ₹3000. TCA
                      </p>
                      <p className="text-sm text-gray-600">
                        Flat ₹200 Cashback on Paytm Wallet on a min spend of ₹1999. Code: PAYTM200
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowMoreOffers(!showMoreOffers)}
                    className="text-pink-500 font-semibold text-sm mt-2 flex items-center gap-1 hover:text-pink-600"
                  >
                    {showMoreOffers ? 'Show Less' : 'Show More'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoreOffers ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Items Selection Controls */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={cartItems.every(item => selectedItems[item.id])}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                />
                <label htmlFor="select-all" className="font-semibold text-sm cursor-pointer">
                  {selectedCount}/{cartItems.length} ITEMS SELECTED
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={removeSelectedItems}
                  className="text-sm font-semibold text-gray-600 hover:text-black disabled:opacity-50 cursor-pointer"
                  disabled={selectedCount === 0}
                >
                  REMOVE
                </button>
                <button
                  onClick={moveToWishlist}
                  className="text-sm font-semibold text-gray-600 hover:text-black disabled:opacity-50 cursor-pointer"
                  disabled={selectedCount === 0}
                >
                  MOVE TO WISHLIST
                </button>
              </div>
            </div>

            {/* Product Cards */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md relative">
                  <button
                    // onClick={() => removeItem(item.id)}
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowMoveModal(true);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-bold" />
                  </button>

                  <div className="flex gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id] || false}
                        onChange={() => toggleItemSelection(item.id)}
                        className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500 bg-white cursor-pointer"
                      />
                      <Link href={`/product/${item.slug}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-28 h-36 object-cover cursor-pointer hover:opacity-90 transition"
                        />
                      </Link>
                    </div>

                    <div className="flex-1">
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="font-semibold text-sm mb-1 hover:text-pink-500 cursor-pointer transition-colors">
                          {item.brand}
                        </h3>
                      </Link>

                      <Link href={`/product/${item.slug}`}>
                        <p className="text-sm text-gray-600 mb-1 hover:text-pink-500 cursor-pointer transition-colors">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-500 mb-3">Sold by: {item.seller}</p>

                      <div className="flex gap-4 mb-3">
                        <select
                          value={item.size}
                          onChange={(e) => updateSize(item.id, e.target.value)}
                          className="h-9 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-gray-500"
                        >
                          {item.availableSizes?.map((size) => (
                            // <option key={size} value={size}>
                            //   Size: {size}
                            // </option>
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center border border-gray-300 h-9">
                          {item.quantity > 1 && (
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-9 h-full border-r border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            >
                              -
                            </button>
                          )}
                          <span className="w-9 h-full flex items-center justify-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-9 h-full border-l border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">₹{item.price}</span>
                        {item.discount > 0 && (
                          <>
                            <span className="text-sm text-gray-400 line-through">₹{item.mrp}</span>
                            <span className="text-sm text-orange-500 font-semibold">{item.discount}% OFF</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        </div>
                        <span>{item.returnText || '3 days return available'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Delivery by {item.deliveryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More From Wishlist */}
            <Link href="/wishlist">
              <button className="cursor-pointer w-full border p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-sm">Add More From Wishlist</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Link>

            {/* You may also like */}
            <div className="pt-8 border-t">
              <h3 className="text-xl font-semibold mb-4">You may also like:</h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-pink-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${1580910051328 + i}-2569ce89d5db?w=300&h=300&fit=crop`}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coupons */}
            <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-sm">COUPONS</h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Apply Coupons</span>
                <button
                  className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs px-6 py-2 transition-colors"
                  onClick={() => alert('Coupon applied!')}
                >
                  APPLY
                </button>
              </div>
            </div>

            {/* Gifting */}
            <div className="bg-pink-50 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md">
              <h3 className="font-semibold text-xs mb-3 text-gray-700">GIFTING & PERSONALISATION</h3>
              <div className="flex gap-3">
                <Gift className="w-12 h-12 text-pink-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Buying for a loved one?</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Gift Packaging and personalised message on card. Only for ₹35
                  </p>
                  <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs w-full py-2 transition-colors">
                    ADD GIFT PACKAGE
                  </button>
                </div>
              </div>
            </div>

            {/* Donation */}
            <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md">
              <h3 className="font-semibold text-xs mb-3 text-gray-700">SUPPORT TRANSFORMATIVE SOCIAL WORK IN INDIA</h3>
              <div className="flex items-start gap-2 mb-3">
                <input
                  type="checkbox"
                  id="donation"
                  checked={isDonationChecked}
                  onChange={(e) => setIsDonationChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                />
                <label htmlFor="donation" className="text-sm cursor-pointer">
                  Donate and make a difference
                </label>
              </div>

              {isDonationChecked && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10, 20, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setSelectedDonation(amount)}
                      className={`py-2 px-3 rounded-full text-sm font-medium border transition-colors ${selectedDonation === amount
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-pink-500'
                        }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              )}

              <button className="text-pink-500 text-xs font-semibold hover:text-pink-600">
                Know More
              </button>
            </div>

            {/* Price Details */}
            <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 p-4 rounded-md">
              <h3 className="font-semibold text-xs mb-4 text-gray-700">PRICE DETAILS ({cartItems.length} Items)</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total MRP</span>
                  <span>₹{totalMRP.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount on MRP</span>
                  <span className="text-green-600">- ₹{discount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coupon Discount</span>
                  <button className="text-pink-500 text-xs font-semibold hover:text-pink-600">
                    Apply Coupon
                  </button>
                </div>

                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Platform Fee</span>
                    <button className="text-pink-500 text-xs font-semibold hover:text-pink-600">
                      Know More
                    </button>
                  </div>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                {isDonationChecked && selectedDonation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Donation</span>
                    <span>₹{donationAmount}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-semibold text-lg">₹{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <div className="sticky top-4">
              <p className="text-xs text-gray-500 mb-3">
                By placing the order, you agree to Glovia Glamour's{' '}
                <a href="/terms" className="text-pink-500 font-semibold">Terms of Use</a>
                {' '}and{' '}
                <a href="/privacy" className="text-pink-500 font-semibold">Privacy Policy</a>
              </p>
              <button
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 text-base transition-colors"
                onClick={() => {
                  if (!user) {
                    setOpenLogin(true);
                    return;
                  }

                  window.location.href = '/checkout';
                }}
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
      {showMoveModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowMoveModal(false);
              setSelectedProduct(null);
            }}
          ></div>

          {/* Modal */}
          <div className="relative bg-white w-[420px] rounded-md shadow-xl">
            <div className="flex items-start justify-between p-4 border-b">
              <div className="flex gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold text-sm">Move from Bag</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to move this item from bag?
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedProduct(null);
                }}
              >
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="flex text-sm font-semibold">
              <button
                onClick={handleRemoveSingleItem}
                className="flex-1 py-3 border-r hover:bg-gray-50"
              >
                REMOVE
              </button>

              <button
                onClick={handleMoveSingleToWishlist}
                className="flex-1 py-3 text-pink-500 hover:bg-pink-50"
              >
                MOVE TO WISHLIST
              </button>
            </div>
          </div>
        </div>
      )}
      <LoginModal
        isOpen={openLogin}
        onClose={() => setOpenLogin(false)}
      />

    </div>
  );
}
