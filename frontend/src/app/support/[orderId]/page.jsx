"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useChat } from "@/context/ChatContext"
import {
  MessageCircle,
  Mail,
  Phone,
  Search,
  ChevronDown,
  Send,
} from "lucide-react"
import { toast } from "sonner"

export default function SupportCenter() {


  const [ticketData, setTicketData] = useState({
    category: "",
    priority: "",
    subject: "",
    message: "",
    image: null
  })

  const [submitStatus, setSubmitStatus] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const { orderId } = useParams()
  const router = useRouter()
  const { startChat } = useChat()


  /* ================= SUBMIT TICKET ================= */

  const handleTicketSubmit = async (e) => {

    e.preventDefault()

    if (
      !ticketData.category ||
      !ticketData.priority ||
      !ticketData.subject ||
      !ticketData.message
    ) {
      toast.error("Please fill all fields")
      return
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const token = user?.token

    try {

      const formData = new FormData()

      formData.append("orderId", orderId)
      formData.append("category", ticketData.category)
      formData.append("priority", ticketData.priority)
      formData.append("subject", ticketData.subject)
      formData.append("message", ticketData.message)

      if (ticketData.image) {
        formData.append("image", ticketData.image)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/support/ticket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      const data = await res.json()

      if (data.success) {

        setShowPopup(true)

        setTicketData({
          category: "",
          priority: "",
          subject: "",
          message: "",
          image: null
        })

        setTimeout(() => {
          setShowPopup(false)
        }, 3000)

      }

    } catch (err) {

      console.error("Ticket error:", err)

    }

  }

  /* ================= EMAIL ================= */

  const handleEmailClick = () => {

    window.location.href = "mailto:support@yourstore.com"

  }

  /* ================= CHAT ================= */

  const handleChatStart = async () => {

    if (!orderId) {
      toast.error("Order ID missing")
      return
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const token = user?.token

    const chatId = await startChat(orderId, token)

    if (chatId) {
      localStorage.setItem("chatOrderId", orderId)
      router.push(`/chat/${chatId}?orderId=${orderId}`)
    }

  }

  /* ================= PHONE ================= */

  const handlePhoneClick = () => {

    window.location.href = "tel:+911234567890"

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* HEADER */}

      <div className="bg-white relative">

        <div className="max-w-7xl mx-auto px-6 py-12">

          <h1 className="text-4xl font-bold mb-2">
            Support Center
          </h1>

          <p className="text-gray-500">
            Get help and find answers to your questions
          </p>

        </div>

        {/* GRADIENT LINE */}
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">


        {/* SUPPORT OPTIONS */}

        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* CHAT */}

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">

            <div className="flex items-start mb-6">

              <div className="bg-indigo-100 p-4 rounded-full mr-4">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Live Chat
                </h3>

                <p className="text-sm text-gray-500">
                  Chat with our support team
                </p>
              </div>

            </div>

            <button
              onClick={handleChatStart}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Start Chat
            </button>

          </div>


          {/* EMAIL */}

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">

            <div className="flex items-start mb-6">

              <div className="bg-green-100 p-4 rounded-full mr-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Email Support
                </h3>

                <p className="text-sm text-gray-500">
                  support@yourstore.com
                </p>
              </div>

            </div>

            <button
              onClick={handleEmailClick}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Send Email
            </button>

          </div>

          {/* PHONE */}

          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">

            <div className="flex items-start mb-6">

              <div className="bg-blue-100 p-4 rounded-full mr-4">

                <Phone className="w-6 h-6 text-blue-600" />

              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  Phone Support
                </h3>

                <p className="text-sm text-gray-500">
                  +91 12345 67890
                </p>

              </div>

            </div>

            <button
              onClick={handlePhoneClick}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Call Now
            </button>



          </div>
        </div>


        {/* FAQ + TICKET */}

        <div className="max-w-xl mx-auto">


          {/* TICKET */}

          <div className="p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500">
            <div className="bg-white rounded-2xl p-8 shadow-xl">

              <h2 className="text-2xl font-bold mb-2">
                Submit a Ticket
              </h2>

              <p className="text-gray-500 mb-6">
                We'll respond within 24h
              </p>



              <form onSubmit={handleTicketSubmit} className="space-y-4">

                <select
                  value={ticketData.category}
                  onChange={(e) =>
                    setTicketData({ ...ticketData, category: e.target.value })
                  }
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg outline-none"
                >
                  <option value="">Select Issue Type</option>
                  <option value="order">Order Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="refund">Refund / Return</option>
                  <option value="delivery">Delivery Problem</option>
                  <option value="product">Product Quality</option>
                </select>



                <input
                  type="text"
                  placeholder="Subject"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg outline-none"
                />


                <select
                  value={ticketData.priority}
                  onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg outline-none"
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>



                <textarea
                  rows="5"
                  placeholder="Describe your issue"
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg outline-none"
                />


                <div className="p-[1.5px] rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg flex justify-center items-center gap-2 font-semibold transition"
                >

                  <Send className="w-4 h-4" />

                  Submit Ticket

                </button>

              </form>
            </div>

          </div>

        </div>

        {/* SUCCESS POPUP */}
        {showPopup && (

          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="bg-white rounded-xl p-6 w-[350px] text-center shadow-lg">

              <div className="text-green-600 text-3xl mb-2">
                ✓
              </div>

              <h3 className="text-lg font-semibold">
                Ticket Submitted
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Your support ticket has been created successfully.
              </p>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg"
              >
                OK
              </button>

            </div>

          </div>

        )}

      </div>

    </div>



  )


}
