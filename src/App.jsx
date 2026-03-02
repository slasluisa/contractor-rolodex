import { useState } from "react";
import initialContractors from "./data/contractors";
import ContractorCard from "./components/ContractorCard";
import Schedule from "./components/Schedule";
import BookingModal from "./components/BookingModal";
import "./App.css";

function App() {
  const [contractors, setContractors] = useState(initialContractors);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");
  const [filterProjectType, setFilterProjectType] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("any");
  const [filterMinRating, setFilterMinRating] = useState("any");
  const [booking, setBooking] = useState(null);

  const specialties = [
    "All",
    ...new Set(initialContractors.map((c) => c.specialty)),
  ];

  const filtered = contractors.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q) ||
      c.phone.includes(search) ||
      c.serviceArea.toLowerCase().includes(q);
    const matchesSpecialty =
      filterSpecialty === "All" || c.specialty === filterSpecialty;
    const matchesProjectType =
      filterProjectType === "all" || c.projectTypes.includes(filterProjectType);
    const matchesAvailability =
      filterAvailability === "any" ||
      (filterAvailability === "available" && c.availabilityStatus === "available") ||
      (filterAvailability === "available_limited" &&
        (c.availabilityStatus === "available" || c.availabilityStatus === "limited"));
    const matchesRating =
      filterMinRating === "any" ||
      (filterMinRating === "4" && c.rating >= 4) ||
      (filterMinRating === "4.5" && c.rating >= 4.5);
    return matchesSearch && matchesSpecialty && matchesProjectType && matchesAvailability && matchesRating;
  });

  const selected = contractors.find((c) => c.id === selectedId);

  function handleBook(contractorId, date, slotIndex) {
    const contractor = contractors.find((c) => c.id === contractorId);
    const slot = contractor.schedule[date][slotIndex];
    setBooking({ contractorId, date, slotIndex, contractor, slot });
  }

  function confirmBooking(clientName) {
    setContractors((prev) =>
      prev.map((c) => {
        if (c.id !== booking.contractorId) return c;
        const newSchedule = { ...c.schedule };
        const newSlots = [...newSchedule[booking.date]];
        newSlots[booking.slotIndex] = {
          ...newSlots[booking.slotIndex],
          booked: true,
          client: clientName,
        };
        newSchedule[booking.date] = newSlots;
        return { ...c, schedule: newSchedule };
      })
    );
    setBooking(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Contractor Rolodex</h1>
        <p>Find and book contractors for your projects</p>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search name, specialty, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-bar">
            {specialties.map((s) => (
              <button
                key={s}
                className={`filter-chip ${filterSpecialty === s ? "active" : ""}`}
                onClick={() => setFilterSpecialty(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="advanced-filters">
            <div className="segmented-control">
              {[
                ["all", "All Types"],
                ["residential", "Residential"],
                ["commercial", "Commercial"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filterProjectType === value ? "active" : ""}
                  onClick={() => setFilterProjectType(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              className="filter-select"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
            >
              <option value="any">Any Availability</option>
              <option value="available">Available Now</option>
              <option value="available_limited">Available + Limited</option>
            </select>
            <select
              className="filter-select"
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(e.target.value)}
            >
              <option value="any">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div className="contractor-list">
            {filtered.length === 0 && (
              <p className="empty-state">No contractors found.</p>
            )}
            {filtered.map((c) => (
              <ContractorCard
                key={c.id}
                contractor={c}
                isSelected={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              />
            ))}
          </div>
        </aside>

        <main className="main-content">
          {selected ? (
            <Schedule contractor={selected} onBook={handleBook} />
          ) : (
            <div className="empty-schedule">
              <div className="empty-icon">&#128197;</div>
              <h2>Select a contractor</h2>
              <p>
                Choose a contractor from the list to view their schedule and
                availability.
              </p>
            </div>
          )}
        </main>
      </div>

      {booking && (
        <BookingModal
          contractor={booking.contractor}
          date={booking.date}
          slot={booking.slot}
          onConfirm={confirmBooking}
          onCancel={() => setBooking(null)}
        />
      )}
    </div>
  );
}

export default App;
