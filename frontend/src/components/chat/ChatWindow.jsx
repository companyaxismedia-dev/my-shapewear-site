"use client"

import { useEffect } from "react"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import { useChat } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"
import { supportQuestions } from "@/data/supportQuestions"
import OrderCard from "./OrderCard"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

export default function ChatWindow({ chatId, question, order }) {

  console.log("CHAT WINDOW ORDER:", order)


  const {
    messages,
    loadMessages,
    setMessages,
    loading
  } = useChat()

  const { token } = useAuth()

  /* ================= LOAD MESSAGES ================= */

  useEffect(() => {

  if (!chatId || !token) return

  loadMessages(chatId, token)

}, [chatId, token])


  /* ================= AUTO QUESTION MESSAGE ================= */

useEffect(() => {

  if (!question) return
  if (messages.length === 0) return

  const alreadyAsked = messages.some(
    (msg) => msg.sender === "user" && msg.message === question
  )

  if (alreadyAsked) return

  const botReplies = supportQuestions[question] || [
    "Sorry, I don't understand your question."
  ]

  const botMessages = botReplies.map((reply) => ({
    sender: "bot",
    message: reply,
    createdAt: new Date()
  }))

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      message: question,
      createdAt: new Date()
    },
    ...botMessages,
    {
      sender: "bot",
      message: "Can I help you with anything else?",
      createdAt: new Date()
    }
  ])

}, [question])

  /* ================= INITIAL GREETING ================= */

  useEffect(() => {

    if (messages.length > 0) return

    const user =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : {}

    setMessages([
      {
        sender: "bot",
        message: `Hey ${user?.name || "there"} 👋, I'm your support assistant`,
        createdAt: new Date()
      }
    ])

  }, [])
  /* ================= UI ================= */

  return (

    <div className="flex flex-col h-screen bg-[#f7f7f8]">

      {/* HEADER */}

      <div className="h-16 flex items-center px-6 bg-white border-b border-green-500">

        <div className="flex items-center gap-4">

          {/* LOGO */}

          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">

            <Image
              src="/hero-image/glovialogo.png"
              alt="Glovia Glamour"
              width={26}
              height={26}
              className="object-contain"
            />

          </div>

          {/* TEXT */}

          <div className="flex flex-col leading-tight">

            <span className="text-lg font-semibold text-gray-800">
              Glovia Support
            </span>

            <span className="text-xs text-green-600">
              Online
            </span>

          </div>

        </div>

      </div>

      {/* MESSAGES */}

      <ChatMessages messages={messages} chatId={chatId} order={order} />



      {loading && (
        <div className="px-4 py-2 text-xs text-gray-400">
          Bot is typing...
        </div>
      )}

      {/* INPUT */}

      <ChatInput />

    </div>

  )

}