"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { API_BASE } from "@/lib/api"


import { useParams, useRouter, useSearchParams } from "next/navigation"

import ChatWindow from "@/components/chat/ChatWindow"
import { useChat } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"

export default function ChatPage() {

    const { chatId } = useParams()
    const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId


    const router = useRouter()
    const searchParams = useSearchParams()

    const question = searchParams.get("q")


    const { token: authToken } = useAuth()

    const [order, setOrder] = useState(null)

    const localUser =
        typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("user") || "{}")
            : null

    const token = authToken || localUser?.token

    /* ================= AUTH PROTECTION ================= */

    useEffect(() => {


        if (!token) {
            router.push("/login")
            return
        }

    }, [token, router])

    /* ================= LOAD CHAT MESSAGES ================= */

    



    /* ================= LOAD ORDER ================= */

    const orderId = searchParams.get("orderId")

useEffect(() => {

    if (!orderId || !token) return

    const fetchOrder = async () => {

        try {

            const res = await axios.get(
                `${API_BASE}/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setOrder(res.data.order)

        } catch (error) {

            console.error("ORDER LOAD ERROR:", error)

        }

    }

    fetchOrder()

}, [orderId, token])

    /* ================= INVALID CHAT ================= */

    if (!chatIdString) {

        return (

            <div className="flex items-center justify-center h-screen text-gray-500">
                Invalid chat session
            </div>

        )

    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading chat...
            </div>
        )
    }

    /* ================= PAGE ================= */

    return (

        <div className="h-screen w-full bg-[#f7f7f8] flex flex-col">



            <ChatWindow
                chatId={chatIdString}
                question={question}
                order={order}
            />

        </div>

    )

}