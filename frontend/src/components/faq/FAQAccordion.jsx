"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function FAQAccordion({
  items = [],
  title,
  description,
  actionButton,
  showContactSection = true,
}) {
  return (
    <div className="w-full">

      {title && (
        <div className="mb-10 pb-6 border-b border-[#eaeaec] flex justify-between items-start">

          <div>
            <h2 className="text-[26px] font-semibold text-[#282c3f] mb-2">
              {title}
            </h2>

            {description && (
              <p className="text-[14px] text-[#7e818c]">
                {description}
              </p>
            )}
          </div>

          {actionButton && (
            <Link
              href={actionButton.link}
              className="min-w-[140px] text-center px-5 py-3 text-[13px] border border-[#d4d5d9] rounded text-[#526cd0] hover:bg-[#fafbfc]"
            >
              {actionButton.text}
            </Link>
          )}

        </div>
      )}

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id}>
            <h3 className="text-[14px] font-semibold text-[#282c3f] mb-1">
              {item.question}
            </h3>

            <p className="text-[13px] text-[#535766] leading-6 whitespace-pre-line">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      {showContactSection && (
        <div className="mt-12 border-t border-[#eaeaec] pt-8">
          <div className="bg-gray-100 rounded-lg p-8 text-center">

            <h2 className="text-lg font-bold mb-2">
              Still need help?
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Can't find the answer you're looking for?
            </p>

            <button className="flex items-center gap-2 mx-auto px-8 py-3 border bg-white hover:bg-gray-50">
              <Mail className="w-4 h-4" />
              CONTACT US
            </button>

          </div>
        </div>
      )}

    </div>
  );
}