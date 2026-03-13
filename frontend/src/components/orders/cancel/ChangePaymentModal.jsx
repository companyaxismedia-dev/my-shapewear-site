"use client"

import { useState } from "react"
import axios from "axios"
import { X } from "lucide-react"
import { API_BASE } from "@/lib/api"

export default function ChangePaymentModal({
  show,
  setShow,
  orderId,
  refreshOrder
}) {

  const [loading,setLoading] = useState(false)

  const changePayment = async (method) => {

    try {

      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const token = user?.token

      setLoading(true)

      await axios.put(
        `${API_BASE}/api/orders/payment/${orderId}`,
        {
          paymentMethod: method,
          paymentStatus: "Paid"
        },
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      )

      setLoading(false)
      setShow(false)

      refreshOrder()

      alert("Payment updated successfully")

    } catch(err){

      setLoading(false)

      alert(err.response?.data?.message || "Payment update failed")

    }

  }

  if(!show) return null

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-[420px] rounded-lg p-6">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-lg font-semibold">
            Change Payment Method
          </h2>

          <X
            className="cursor-pointer"
            onClick={()=>setShow(false)}
          />

        </div>

        <p className="text-sm text-gray-500 mb-5">
          Select a new payment method
        </p>

        <div className="space-y-3">

          <button
            onClick={()=>changePayment("UPI")}
            className="w-full border p-3 rounded hover:bg-gray-50"
          >
            Pay via UPI
          </button>

          <button
            onClick={()=>changePayment("CARD")}
            className="w-full border p-3 rounded hover:bg-gray-50"
          >
            Pay via Card
          </button>

        </div>

        {loading && (
          <p className="text-sm text-gray-500 mt-4">
            Processing payment...
          </p>
        )}

      </div>

    </div>

  )

}