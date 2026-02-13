"use client";
import { X } from "lucide-react";

export default function AuthModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={22} />
        </button>
        {children}
      </div>
    </div>
  );
}


const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#444",
  },
};
