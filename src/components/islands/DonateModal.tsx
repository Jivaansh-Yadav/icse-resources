import React, { useState, useCallback, useEffect } from "react";
import { Heart, X, Copy, Check, ExternalLink } from "lucide-react";

export interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

const UPI_ID = "jivaanshyadav@ptyes";
const UPI_LINK = "upi://pay?pa=jivaanshyadav@ptyes&pn=ICSE%20Resources&cu=INR&tn=Donation%20for%20ICSE%20Resources";
const UPI_QR_SRC = "/upi_qr.png";

/**
 * DONATE MODAL ISLAND
 * Provides UPI QR code display, direct UPI app link, and clipboard copy of the UPI ID.
 */
export const DonateModal: React.FC<DonateModalProps> = ({ open, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Copy UPI ID to clipboard
  const handleCopy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback for older browsers
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="fixed z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-label="Support and Donate"
      >
        <div className="rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Support / Donate</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            If this site has assisted you in your studies, consider supporting its upkeep and hosting. Every
            contribution directly supports maintaining free, accessible educational materials for all ICSE students.
          </p>

          {/* UPI QR Code Container */}
          <div className="flex justify-center mb-5">
            <div className="rounded-2xl border-2 border-border bg-background p-3 shadow-inner flex flex-col items-center">
              <img
                src={UPI_QR_SRC}
                alt="UPI Payment QR Code"
                className="h-48 w-48 object-contain rounded-lg"
                loading="eager"
              />
              <span className="text-[11px] text-muted-foreground mt-2 font-medium tracking-wide">
                Scan with GPay, PhonePe, Paytm or BHIM
              </span>
            </div>
          </div>

          {/* Pay via UPI App Direct Link */}
          <a
            href={UPI_LINK}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all mb-3 shadow-md"
          >
            <span>Pay with any UPI app</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Copy UPI ID Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-background hover:bg-accent/40 active:scale-[0.99] transition-all text-left"
          >
            <div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Direct UPI ID
              </p>
              <p className="text-sm font-mono font-semibold text-foreground select-all">{UPI_ID}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DonateModal;
