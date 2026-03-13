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

export default function SupportCenter() {

  const [expandedFaq, setExpandedFaq] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [ticketData, setTicketData] = useState({
    subject: "",
    message: "",
  })

  const [submitStatus, setSubmitStatus] = useState(null)
  const { orderId } = useParams()
  const router = useRouter()
  const { startChat } = useChat()

  const faqs = [
    {
      id: 1,
      question: "How do I track leads on the map?",
      answer:
        "Navigate to 'Leads Map Tracking' from the sidebar. The map will display all your leads with their geographical locations.",
    },
    {
      id: 2,
      question: "How can I add a new agent to my team?",
      answer:
        "Go to Team Management > Add New Agent and invite the agent.",
    },
    {
      id: 3,
      question: "What do the pin status colors mean?",
      answer:
        "Green = Active leads, Yellow = Pending, Red = Closed leads.",
    },
    {
      id: 4,
      question: "How do I export reports?",
      answer:
        "Navigate to Reports section and click Export.",
    },
    {
      id: 5,
      question: "Can I customize dashboard filters?",
      answer:
        "Yes, click the filter icon and customize your dashboard.",
    },
    {
      id: 6,
      question: "How do I reset my password?",
      answer:
        "Go to settings → security → change password.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /* ================= SUBMIT TICKET ================= */

  const handleTicketSubmit = async (e) => {

    e.preventDefault()

    const res = await fetch("/api/support/ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ticketData)
    })

    const data = await res.json()

    if (data.success) {

      setSubmitStatus("success")

      setTicketData({
        subject: "",
        message: ""
      })

      setTimeout(() => setSubmitStatus(null), 3000)

    }

  }

  /* ================= CHAT ================= */

  const handleChatStart = async () => {

    if (!orderId) {
      alert("Order ID missing")
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

  /* ================= EMAIL ================= */

  const handleEmailClick = () => {

    window.location.href = "mailto:support@yourstore.com"

  }

  /* ================= PHONE ================= */

  const handlePhoneClick = () => {

    window.location.href = "tel:+911234567890"

  }

  return (

    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-6 py-12">

          <h1 className="text-4xl font-bold mb-2">
            Support Center
          </h1>

          <p className="text-gray-500">
            Get help and find answers to your questions
          </p>

        </div>

      </div>


      <div className="max-w-7xl mx-auto px-6 py-12">


        {/* SUPPORT OPTIONS */}

        <div className="grid md:grid-cols-3 gap-6 mb-12">

          {/* CHAT */}

          <div className="bg-white p-8 border rounded-lg">

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
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              Start Chat
            </button>

          </div>


          {/* EMAIL */}

          <div className="bg-white p-8 border rounded-lg">

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
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Send Email
            </button>

          </div>


          {/* PHONE */}

          <div className="bg-white p-8 border rounded-lg">

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

        <div className="grid lg:grid-cols-2 gap-12">


          {/* FAQ */}

          <div className="bg-white border rounded-lg p-8">

            <h2 className="text-2xl font-bold mb-4">
              Frequently Asked Questions
            </h2>


            {/* SEARCH */}

            <div className="relative mb-6">

              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />

            </div>


            {/* FAQ LIST */}

            <div className="space-y-3">

              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="border rounded-lg">

                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex justify-between px-4 py-4"
                  >

                    <span>{faq.question}</span>

                    <ChevronDown className={`w-5 h-5 ${expandedFaq === faq.id && "rotate-180"}`} />

                  </button>

                  {expandedFaq === faq.id && (

                    <div className="px-4 pb-4 text-gray-500">
                      {faq.answer}
                    </div>

                  )}

                </div>
              ))}

            </div>

          </div>


          {/* TICKET */}

          <div className="bg-white border rounded-lg p-8">

            <h2 className="text-2xl font-bold mb-2">
              Submit a Ticket
            </h2>

            <p className="text-gray-500 mb-6">
              We'll respond within 24h
            </p>

            {submitStatus === "success" && (

              <div className="bg-green-100 p-3 rounded mb-4 text-green-700">
                Ticket submitted successfully
              </div>

            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4">

              <input
                type="text"
                placeholder="Subject"
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                className="w-full border px-4 py-2 rounded"
              />

              <textarea
                rows="5"
                placeholder="Describe your issue"
                value={ticketData.message}
                onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                className="w-full border px-4 py-2 rounded"
              />

              <button className="w-full bg-indigo-600 text-white py-3 rounded flex justify-center gap-2">

                <Send className="w-4 h-4" />

                Submit Ticket

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  )

}