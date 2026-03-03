import { useState, useEffect, useRef } from "react";
import { formatTime, formatDateLong } from "../utils/format";

function BookingModal({ contractor, date, slot, onConfirm, onCancel }) {
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [constructionType, setConstructionType] = useState("new");
  const [sqft, setSqft] = useState("");
  const modalRef = useRef(null);

  const isPerSqft = contractor.pricing === "per_sqft";

  const hours =
    parseInt(slot.end.split(":")[0]) - parseInt(slot.start.split(":")[0]);

  let cost;
  if (isPerSqft) {
    const rate = constructionType === "new" ? contractor.rates.new : contractor.rates.old;
    const area = parseFloat(sqft) || 0;
    cost = area * rate;
  } else {
    cost = hours * contractor.rate;
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!clientName.trim()) return;
    if (isPerSqft && (!sqft || parseFloat(sqft) <= 0)) return;
    onConfirm(clientName.trim());
  }

  const canSubmit = clientName.trim() && (!isPerSqft || (sqft && parseFloat(sqft) > 0));

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-label={`Book ${contractor.name}`}>
      <div className="modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close" onClick={onCancel} aria-label="Close modal">
          &times;
        </button>
        <h2>Book {contractor.name}</h2>
        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span>{formatDateLong(date)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time</span>
            <span>
              {formatTime(slot.start)} - {formatTime(slot.end)} ({hours}h)
            </span>
          </div>
          {isPerSqft ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Rate (new construction)</span>
                <span>${contractor.rates.new}/sqft</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rate (old construction)</span>
                <span>${contractor.rates.old}/sqft</span>
              </div>
            </>
          ) : (
            <div className="detail-row">
              <span className="detail-label">Rate</span>
              <span>${contractor.rate}/hr</span>
            </div>
          )}
          <div className="detail-row total">
            <span className="detail-label">Estimated Total</span>
            <span>{cost > 0 ? `$${cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="client-name">Project / Client Name *</label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Kitchen Renovation"
              autoFocus
            />
          </div>

          {isPerSqft && (
            <>
              <div className="form-group">
                <label>Construction Type *</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${constructionType === "new" ? "active" : ""}`}
                    onClick={() => setConstructionType("new")}
                    aria-label="Select new construction"
                  >
                    New Construction
                    <span className="toggle-rate">${contractor.rates.new}/sqft</span>
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${constructionType === "old" ? "active" : ""}`}
                    onClick={() => setConstructionType("old")}
                    aria-label="Select existing construction"
                  >
                    Existing / Old Construction
                    <span className="toggle-rate">${contractor.rates.old}/sqft</span>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="sqft">Square Footage *</label>
                <input
                  id="sqft"
                  type="number"
                  min="1"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="e.g. 1500"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;
