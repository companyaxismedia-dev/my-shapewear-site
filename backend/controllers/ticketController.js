const Ticket = require("../models/Ticket")
const mongoose = require("mongoose")

/* =====================================================
   CREATE SUPPORT TICKET
===================================================== */

exports.createTicket = async (req, res) => {

    try {

        const { subject, message, orderId, category, priority } = req.body
        const image = req.file ? req.file.filename : null

        /* ================= VALIDATION ================= */

        if (!subject || !message || !orderId || !category || !priority) {
            return res.status(400).json({
                success: false,
                message: "Subject, message and orderId are required"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid orderId"
            })
        }

        /* ================= RATE LIMIT ================= */

        const lastTicket = await Ticket.findOne({
            user: req.user._id
        }).sort({ createdAt: -1 })

        if (lastTicket) {

            const diff =
                (Date.now() - new Date(lastTicket.createdAt).getTime()) / 1000

            if (diff < 30) {
                return res.status(429).json({
                    success: false,
                    message: "Please wait before creating another ticket"
                })
            }

        }

        /* ================= CREATE TICKET ================= */

        const ticket = await Ticket.create({
            user: req.user._id,
            orderId,
            category,
            priority,
            subject: subject.trim(),
            message: message.trim(),
            image
        })

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: ticket
        })

    } catch (error) {

        console.error("CREATE TICKET ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to create ticket"
        })

    }

}