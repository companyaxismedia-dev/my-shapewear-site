const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    // User ID se link karna zaroori hai taaki pata chale kiska cart hai
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Items array jisme products ki details hongi
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            image: {
                type: String, // Logo ya product image ka path
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            qty: {
                type: Number,
                required: true,
                default: 1,
                min: [1, 'Quantity 1 se kam nahi ho sakti']
            },
            // Specific for your store (Size and Color)
            size: {
                type: String,
                required: false
            },
            color: {
                type: String,
                required: false
            }
        }
    ],
    // Total price calculate karne ke liye
    bill: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true // Isse createdAt aur updatedAt automatically add ho jayega
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);