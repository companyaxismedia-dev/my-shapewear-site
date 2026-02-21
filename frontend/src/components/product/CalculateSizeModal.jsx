"use client";

import ModalWrapper from "./ModalWrapper";

export default function CalculateSizeModal({ onClose }) {
  return (
    <ModalWrapper title="Calculate Size" onClose={onClose}>
      <p className="text-sm text-gray-700">
        Add size calculator content here.
      </p>
    </ModalWrapper>
  );
}
