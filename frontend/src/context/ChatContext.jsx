"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_BASE } from "@/lib/api"

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])
    const [chatId, setChatId] = useState(null)
    const [loading, setLoading] = useState(false)

    /* ================= RESTORE CHAT FROM LOCALSTORAGE ================= */

    useEffect(() => {

        if (!chatId) return

        const savedMessages = localStorage.getItem(`chatMessages_${chatId}`)

        if (savedMessages) {
            setMessages(JSON.parse(savedMessages))
        }

    }, [chatId])

    /* ================= SAVE CHAT ================= */



    useEffect(() => {

        if (!messages || messages.length === 0) return

        if (chatId) {
            localStorage.setItem(`chatId_${chatId}`, chatId)
            localStorage.setItem(`chatMessages_${chatId}`, JSON.stringify(messages))
        }

    }, [messages, chatId])




    /* ================= START CHAT ================= */

    const startChat = async (orderId, token) => {

        try {

            const res = await axios.post(
                `${API_BASE}/api/chat/start/${orderId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setChatId(res.data.chatId)

            return res.data.chatId

        } catch (error) {

            console.error("START CHAT ERROR:", error)

        }

    }

    /* ================= SEND MESSAGE ================= */

    const sendMessage = async (text, token) => {

        if (!chatId || !text || !token) return

        try {

            setLoading(true)

            const res = await axios.post(
                `${API_BASE}/api/chat/message`,
                {
                    chatId,
                    message: text
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setMessages(prev => [
                ...prev,
                res.data.messages.userMessage,
                res.data.messages.botMessage
            ])

        } catch (error) {

            console.error("SEND MESSAGE ERROR:", error)

        } finally {

            setLoading(false)

        }

    }

    /* ================= LOAD MESSAGES ================= */

    const loadMessages = async (id, token) => {

        if (!id || !token) return

        try {

            const res = await axios.get(
                `${API_BASE}/api/chat/messages/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setMessages(res?.data?.messages || [])
            setChatId(id)

            localStorage.setItem("chatId", id)
            localStorage.setItem(`chatMessages_${id}`, JSON.stringify(res?.data?.messages || []))

        } catch (error) {

            console.error("LOAD MESSAGE ERROR:", error.response?.data || error)

            setMessages([])

        }

    }
    return (

        <ChatContext.Provider
            value={{
                chatId,
                messages,
                setMessages,
                loading,
                startChat,
                sendMessage,
                loadMessages
            }}
        >

            {children}

        </ChatContext.Provider>

    )

}

export const useChat = () => useContext(ChatContext)