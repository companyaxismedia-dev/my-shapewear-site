"use client"

import Image from "next/image"

export default function OrderCard({ order }) {

  if (!order) return null

  const product = order?.products?.[0] || order?.items?.[0]

  return (

    <div className="flex justify-start px-2 my-2">

      <div className="bg-white rounded-lg w-[280px] p-4">

        <div className="flex flex-col items-center">

          <div className="relative w-[220px] h-[240px] bg-transparent">

            <Image
              src={
                product?.img
                  ? `${process.env.NEXT_PUBLIC_API_URL}${product.img}`
                  : "/placeholder.jpg"
              }
              alt={product?.name || "product"}
              fill
              className="object-contain"
            />

          </div>

          <div className="mt-2 text-sm text-gray-800 text-center leading-tight line-clamp-2">
            {product?.name || product?.title}
          </div>

        </div>

      </div>

    </div>

  )

}