const availabilityLabels = {
  available: "Available",
  limited: "Limited",
  booked_out: "Booked Out",
};

function ContractorCard({ contractor, isSelected, onClick }) {
  const c = contractor;
  const typeLabel = c.projectTypes.includes("residential") && c.projectTypes.includes("commercial")
    ? "Res/Com"
    : c.projectTypes.includes("residential")
      ? "Res"
      : "Com";

  return (
    <div
      className={`contractor-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="card-avatar">{c.avatar}</div>
      <div className="card-body">
        <div className="card-row-1">
          <h3>{c.name}</h3>
          <span className="card-rating">
            <span className="star">&#9733;</span> {c.rating} ({c.completedJobs} jobs)
          </span>
          <span className="card-availability-badge">
            <span className={`badge ${c.availabilityStatus}`}>
              {availabilityLabels[c.availabilityStatus]}
            </span>
          </span>
        </div>
        <div className="card-row-2">
          <span className="card-specialty">{c.specialty}</span>
          <span className="card-ontime">{c.onTimePercent}% on-time</span>
        </div>
        <div className="card-row-3">
          <span>{typeLabel}</span>
          <span className="sep">|</span>
          <span>Crew: {c.crewSize}</span>
          <span className="sep">|</span>
          <span>{c.yearsExperience} yrs</span>
          <span className="sep">|</span>
          <span>{c.licensed && c.insured ? "Lic & Ins" : c.licensed ? "Lic" : c.insured ? "Ins" : ""}</span>
        </div>
      </div>
    </div>
  );
}

export default ContractorCard;
