"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import OrderCard from "./OrderCard"
import { useSearchParams } from "next/navigation"

export default function ChatMessages({ messages, chatId, order }) {

  const bottomRef = useRef(null)
  const router = useRouter()

const searchParams = useSearchParams()
const orderId = searchParams.get("orderId")

  const [showMore, setShowMore] = useState(false)

  const askedQuestions = messages
    .filter((m) => m.sender === "user")
    .map((m) => m.message)

  const formatDateDivider = (date) => {

    if (!date) return ""

    const messageDate = new Date(date)

    const today = new Date()
    const yesterday = new Date()

    yesterday.setDate(today.getDate() - 1)

    const messageDay = messageDate.getDate()
    const messageMonth = messageDate.getMonth()
    const messageYear = messageDate.getFullYear()

    if (
      messageDay === today.getDate() &&
      messageMonth === today.getMonth() &&
      messageYear === today.getFullYear()
    ) {
      return "Today"
    }

    if (
      messageDay === yesterday.getDate() &&
      messageMonth === yesterday.getMonth() &&
      messageYear === yesterday.getFullYear()
    ) {
      return "Yesterday"
    }

    return messageDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto"
    })

  }, [messages])

  /* ================= EMPTY STATE ================= */

  if (!messages || messages.length === 0) {

    return (

      <div className="flex-1 flex items-center justify-center text-gray-400">
        Start a conversation
      </div>

    )

  }

  /* ================= UI ================= */

  return (

    <div className="flex-1 overflow-y-auto px-16 py-6 space-y-5 bg-[#f7f7f8]">

      

      {messages.map((msg, index) => {

        const isUser = msg.sender === "user"

        const prevDate = messages[index - 1]?.createdAt || null
        const currentDate = msg.createdAt || new Date()

        const showDateDivider =
          index === 0 ||
          (prevDate &&
            new Date(prevDate).toDateString() !==
            new Date(currentDate).toDateString())

    

        if (showDateDivider) {
          return (
            <div key={`wrapper-${msg._id || index}`}>
              <div className="flex justify-center my-4">
                <div className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow">
                  {formatDateDivider(msg.createdAt)}
                </div>
              </div>
               
              <div
                key={msg._id || `${msg.createdAt}-${index}`}
                className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[60%] px-5 py-3 rounded-2xl text-[16px] shadow-sm ${isUser ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                >
                  <div>{msg.message}</div>

                  {index === 0 && order && <OrderCard order={order} />}

                  <div className="text-[10px] mt-1 opacity-70 text-right">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        return (

          <div
            key={msg._id || `${msg.createdAt}-${index}`}
            className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
          >

            <div
              className={`max-w-[60%] px-5 py-3 rounded-2xl text-[16px] shadow-sm ${isUser ? "bg-blue-600 text-white" : "bg-white"
                }`}
            >
              <div>{msg.message}</div>

              <div className="text-[10px] mt-1 opacity-70 text-right">
                {msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                  : ""}
              </div>
            </div>

          </div>



        )

      })}

      <div ref={bottomRef} />

      {/* QUICK QUESTIONS CARD */}

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 mt-6 w-[320px] overflow-hidden">

        <div className="px-5 py-4 text-[16px] font-semibold text-gray-800">
          How may I help you?
        </div>

        <div className="flex flex-col text-[15px]">

          {/* MAIN QUESTIONS */}

          {!askedQuestions.includes("Where is my order") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Where is my order`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Where is my order?
            </button>
          )}

          {!askedQuestions.includes("Delivery agent number") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Delivery agent number`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Get delivery agent's number
            </button>
          )}

          {!askedQuestions.includes("Faster delivery") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Faster delivery`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Is faster delivery possible?
            </button>
          )}

          {!askedQuestions.includes("Get my bill or invoice") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Invoice or bill`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Get my bill or invoice
            </button>
          )}

          {!askedQuestions.includes("Change delivery address") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Change delivery address`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Change delivery address
            </button>
          )}

          {!askedQuestions.includes("Cancel my order") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Cancel my order`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              Cancel my order
            </button>

          )}


          {/* EXTRA QUESTIONS */}

          {showMore && (

            <>

              {!askedQuestions.includes("Check return policy") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Return policy`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Check return policy
                </button>
              )}

              {!askedQuestions.includes("Product size issue") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Product size issue`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Size issue
                </button>
              )}

              {!askedQuestions.includes("Refund time") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Refund time`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Refund status
                </button>
              )}

              {!askedQuestions.includes("Track shipment") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Track shipment`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Track shipment
                </button>
              )}

              {!askedQuestions.includes("Exchange product") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Exchange product`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Exchange product
                </button>
              )}

              {!askedQuestions.includes("Offer or coupon issue") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Offer or coupon issue`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Offer or coupon issue
                </button>
              )}

              {!askedQuestions.includes("Update account details") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Update account details`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Update account details
                </button>
              )}

              {!askedQuestions.includes("Talk to human agent") && (
                <button
                  onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Talk to human agent`)}
                  className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
                >
                  Talk to human agent
                </button>
              )}


            </>

          )}

          {!askedQuestions.includes("Bye") && (
            <button
              onClick={() => router.push(`/chat/${chatId}?orderId=${orderId}&q=Bye`)}
              className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left"
            >
              End chat
            </button>
          )}

          {/* MORE BUTTON */}

          <button
            onClick={() => setShowMore(!showMore)}
            className="px-5 py-3 text-blue-600 border-t border-gray-200 hover:bg-gray-50 text-left flex justify-between"
          >
            <span>{showMore ? "Less Options" : "More Options"}</span>
            <span>{showMore ? "▴" : "▾"}</span>
          </button>


        </div>
      </div>

    </div>

  )

}