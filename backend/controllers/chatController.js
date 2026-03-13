const Message = require("../models/Message")
const Chat = require("../models/Chat")
const botService = require("../services/botService")

/* =====================================================
   START CHAT
===================================================== */

exports.startChat = async (req, res) => {

    try {

        const { orderId } = req.params

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "OrderId required"
            })
        }

        /* ===== CHECK EXISTING CHAT ===== */

        let chat = await Chat.findOne({
            orderId,
            userId: req.user._id,
            status: { $ne: "closed" }
        })

        if (!chat) {

            chat = await Chat.create({
                orderId,
                userId: req.user._id,
                status: "bot"
            })

        }
        const existingMessages = await Message.countDocuments({ chatId: chat._id })

        if (existingMessages === 0) {

            await Message.create({
                chatId: chat._id,
                sender: "bot",
                message: "Hi 👋 I'm your support assistant. How can I help you today?",
                status: "sent"
            })

        }

        return res.status(200).json({
            success: true,
            chatId: chat._id
        })

    } catch (error) {

        console.error("START CHAT ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to start chat"
        })

    }

}

/* =====================================================
   SEND MESSAGE
===================================================== */

exports.sendMessage = async (req, res) => {

    try {

        const { chatId, message } = req.body

        /* ========= VALIDATION ========= */

        if (!chatId || !message) {
            return res.status(400).json({
                success: false,
                message: "chatId and message required"
            })
        }

        const text = String(message).trim()

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty"
            })
        }

        /* ========= FIND CHAT ========= */

        const chat = await Chat.findById(chatId)

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            })
        }

        if (chat.status === "closed") {
            return res.status(400).json({
                success: false,
                message: "Chat is closed"
            })
        }

        /* ========= SAVE USER MESSAGE ========= */

        const userMessage = await Message.create({
            chatId,
            sender: "user",
            senderId: req.user._id,
            message: text,
            status: "delivered"
        })

        /* ========= BOT RESPONSE ========= */

        const botReply = await botService.handleMessage(text, chat.orderId)

        /* ========= SAVE BOT MESSAGE ========= */

        const botMessage = await Message.create({
            chatId,
            sender: "bot",
            message: botReply,
            status: "sent"
        })

        /* ========= UPDATE CHAT ========= */

        chat.lastMessage = botReply
        chat.lastSender = "bot"
        chat.unreadUser += 1

        await chat.save()

        /* ========= RESPONSE ========= */

        return res.status(200).json({
            success: true,
            messages: {
                userMessage,
                botMessage
            }
        })

    } catch (error) {

        console.error("SEND MESSAGE ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to send message"
        })

    }

}

/* =====================================================
   GET CHAT MESSAGES
===================================================== */

const mongoose = require("mongoose")

exports.getMessages = async (req, res) => {

    try {

        const { chatId } = req.params
        console.log("CHAT ID RECEIVED:", chatId)

        /* ===== VALIDATE OBJECTID ===== */

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "chatId required"
            })
        }

        const messages = await Message.find({
            chatId: new mongoose.Types.ObjectId(chatId)
        }).sort({ createdAt: 1 })

        return res.status(200).json({
            success: true,
            messages
        })

    } catch (error) {

        console.error("GET MESSAGES ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to load messages"
        })

    }

}

/* =====================================================
   CLOSE CHAT
===================================================== */

exports.closeChat = async (req, res) => {

    try {

        const { chatId } = req.params

        const chat = await Chat.findById(chatId)

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            })
        }

        if (chat.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }

        chat.status = "closed"

        await chat.save()

        return res.status(200).json({
            success: true,
            message: "Chat closed successfully"
        })

    } catch (error) {

        console.error("CLOSE CHAT ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to close chat"
        })

    }

}