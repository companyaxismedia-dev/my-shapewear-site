const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userInfo: {
    // Name: Guest checkout ke liye default value set hai
    name: { 
      type: String, 
      trim: true,
      default: "Customer" 
    },
    // Phone: Validation message ke saath
    phone: { 
      type: String, 
      required: [true, "Phone number is mandatory"],
      trim: true
    },
    // Email: Lowercase conversion active hai
    email: { 
      type: String, 
      lowercase: true,
      trim: true
    },
    // Address Details
    address: { 
      type: String, 
      required: [true, "Delivery address is mandatory"] 
    },
    city: { 
      type: String, 
      default: "N/A" 
    },
    pincode: { 
      type: String 
    }
  },

  // Products: Detailed sub-document structure
  products: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
      size: { type: String, default: "Standard" },
      // Image URL storage (Optional but helpful for Admin panel)
      img: { type: String } 
    }
  ],

  totalAmount: { 
    type: Number, 
    required: true 
  },

  // Logistics & Tracking
  trackingId: { 
    type: String, 
    default: "" 
  },

  // Order Status Flow
  status: { 
    type: String, 
    enum: ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Order Placed" 
  },

  // Payment Details
  paymentType: { 
    type: String, 
    enum: ["Online", "COD"], // Sirf do types allow honge
    default: "Online" 
  },
  
  paymentId: { 
    type: String, 
    default: "N/A" 
  },

  // Timestamp
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true // Yeh automatic 'updatedAt' bhi create karega
});

// Adding an Index for faster searching in Admin Panel
OrderSchema.index({ "userInfo.phone": 1, createdAt: -1 });

/**
 * model exports check: 
 * Yeh logic Next.js API ya standard Node.js server 
 * dono mein model re-compilation error se bachata hai.
 */
module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);