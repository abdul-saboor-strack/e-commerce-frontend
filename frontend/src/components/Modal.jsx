export default function Modal({ open, onClose, children }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-[var(--current-bg)] rounded-2xl shadow-[var(--current-shadow)] w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-[var(--current-text)] hover:text-[var(--current-text)] opacity-60 hover:opacity-100"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    )
}