"use client"

import { useState } from "react"
import { useChat } from "@/context/ChatContext"
import { useAuth } from "@/context/AuthContext"

export default function ChatInput() {

  const [text, setText] = useState("")
  const { sendMessage, loading } = useChat()
  const { token } = useAuth()
  

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {

    const message = text.trim()

    if (!message || loading) return

    await sendMessage(message, token)
    setText("")

  }

  /* ================= ENTER KEY SEND ================= */

  const handleKeyDown = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }

  }

  /* ================= UI ================= */

  return (

    <div className="p-3 border-t bg-white flex gap-2">

      <input
        value={text || ""}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className={`px-4 rounded-lg text-white ${
          loading
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "..." : "Send"}
      </button>

    </div>

  )

}