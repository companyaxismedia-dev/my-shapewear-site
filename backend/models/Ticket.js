const mongoose = require("mongoose")

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        category: {
            type: String,
            enum: ["order", "payment", "refund", "delivery", "product"],
            required: true
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        image: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "open"
        }

    },
    {
        timestamps: true
    }
)

/* ===== INDEXES ===== */

ticketSchema.index({ user: 1, createdAt: -1 })
ticketSchema.index({ orderId: 1 })
ticketSchema.index({ status: 1 })

module.exports =
    mongoose.models.Ticket ||
    mongoose.model("Ticket", ticketSchema)