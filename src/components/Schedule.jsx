import { availabilityLabels, formatDate, formatTime } from "../utils/format";

function Schedule({ contractor, onBook, onCancel, mobileBackButton }) {
  const c = contractor;
  const dates = Object.keys(c.schedule).sort();

  function rateLabel() {
    if (c.pricing === "per_sqft") {
      return `$${c.rates.new}/sqft (new) · $${c.rates.old}/sqft (old)`;
    }
    return `$${c.rate}/hr`;
  }

  const typeLabel = c.projectTypes.includes("residential") && c.projectTypes.includes("commercial")
    ? "Residential & Commercial"
    : c.projectTypes.includes("residential")
      ? "Residential Only"
      : "Commercial Only";

  const licenseDisplay = [
    c.licensed ? `Licensed (${c.licenseNumber})` : null,
    c.insured ? "Insured" : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="schedule">
      {mobileBackButton && (
        <button className="mobile-back-btn" onClick={mobileBackButton} aria-label="Back to contractor list">
          &#8592; Back to list
        </button>
      )}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{c.avatar}</div>
          <div className="profile-identity">
            <h2>{c.name}</h2>
            <p>{c.specialty} &middot; {c.phone}</p>
          </div>
          <div className="profile-badge">
            <span className={`badge ${c.availabilityStatus}`}>
              {availabilityLabels[c.availabilityStatus]}
            </span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-value">
              <span className="star">&#9733;</span> {c.rating}
              <span className="stat-sub"> / {c.completedJobs} jobs</span>
            </div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{c.onTimePercent}%</div>
            <div className="stat-label">On-time</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{c.yearsExperience}</div>
            <div className="stat-label">Years Exp</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{c.crewSize}</div>
            <div className="stat-label">Crew Size</div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Rate</span>
            <span className="detail-value">{rateLabel()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Response Time</span>
            <span className="detail-value">{c.responseTime}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Project Types</span>
            <span className="detail-value">{typeLabel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Service Area</span>
            <span className="detail-value">{c.serviceArea}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">License & Insurance</span>
            <span className="detail-value">{licenseDisplay}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Certifications</span>
            <div className="cert-tags">
              {c.certifications.map((cert) => (
                <span key={cert} className="cert-tag">{cert}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="schedule-grid">
        {dates.map((date) => {
          const { day, date: dateStr, isToday } = formatDate(date);
          const slots = c.schedule[date];

          return (
            <div key={date} className={`schedule-day ${isToday ? "today" : ""}`}>
              <div className="day-header">
                <span className="day-name">{day}</span>
                <span className="day-date">{dateStr}</span>
                {isToday && <span className="today-badge">Today</span>}
              </div>
              <div className="day-slots">
                {slots.map((slot, i) => (
                  <div
                    key={i}
                    className={`time-slot ${slot.booked ? "booked" : "open"}`}
                  >
                    <div className="slot-time">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </div>
                    {slot.booked ? (
                      <div className="slot-status">
                        <span className="booked-label">Booked</span>
                        <span className="client-name">{slot.client}</span>
                        <button
                          className="cancel-btn"
                          onClick={() => onCancel(c.id, date, i)}
                          aria-label={`Cancel booking for ${slot.client}`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="slot-status">
                        <span className="open-label">Available</span>
                        <button
                          className="book-btn"
                          onClick={() => onBook(c.id, date, i)}
                          aria-label={`Book ${c.name} on ${dateStr} at ${formatTime(slot.start)}`}
                        >
                          Book
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Schedule;
