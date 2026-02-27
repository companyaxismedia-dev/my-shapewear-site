"use client";

import ModalWrapper from "./ModalWrapper";

export default function SizeChartModal({ onClose }) {
  return (
    <ModalWrapper title="Size Chart" onClose={onClose}>
      <p className="text-sm text-gray-700">
        Add your size chart content here.
      </p>
    </ModalWrapper>
  );
}
