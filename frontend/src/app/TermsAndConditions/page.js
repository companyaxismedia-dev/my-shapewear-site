"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { termsData } from "@/data/terms";

export default function TermsAndConditions() {

  const [activeTab, setActiveTab] = useState("user-agreement");

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">

          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">

            <Link href="/" className="text-2xl font-bold text-pink-500">
              M
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8 relative">

              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

              <input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              />

            </div>

            {/* Icons */}
            <div className="flex items-center gap-8">

              <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-pink-500 text-sm">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-pink-500 text-sm">
                <Heart className="w-5 h-5" />
                <span>Wishlist</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-pink-500 text-sm">
                <ShoppingBag className="w-5 h-5" />
                <span>Bag</span>
              </button>

            </div>
          </div>

        </div>
      </header>


      {/* Main Content */}
      <div className="w-[60%] mx-auto py-10">

        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          TERMS AND CONDITIONS
        </h1>


        {/* Tabs */}
        <div className="flex gap-6 mb-8 border-b border-gray-200">

          <button
            onClick={() => setActiveTab("user-agreement")}
            className={`pb-4 font-medium ${
              activeTab === "user-agreement"
                ? "text-gray-800 border-b-2 border-pink-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            User Agreement
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`pb-4 font-medium ${
              activeTab === "archive"
                ? "text-gray-800 border-b-2 border-pink-500"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Archive
          </button>

        </div>


        {/* Terms Content */}

        {activeTab === "user-agreement" && (

          <div className="space-y-12">

            {termsData.mainOffers.map((offer) => (

              <div key={offer.id}>

                <h3 className="text-blue-600 text-sm font-medium mb-4">
                  {offer.title}
                </h3>

                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: termsData.detailedTerms.main,
                  }}
                />

              </div>

            ))}

          </div>

        )}


        {activeTab === "archive" && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No archived terms and conditions
            </p>
          </div>
        )}

      </div>


      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 bg-gray-50">

        <div className="w-[60%] mx-auto text-center text-sm text-gray-600">

          <p>© 2024 Imkaa. All rights reserved.</p>

          <p className="mt-2">
            For queries and support, please contact us at support@imkaa.com
          </p>

        </div>

      </footer>

    </div>
  );
}