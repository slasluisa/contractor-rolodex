import { useState, useCallback, useEffect } from "react";
import initialContractors from "./data/contractors";
import ContractorCard from "./components/ContractorCard";
import Schedule from "./components/Schedule";
import BookingModal from "./components/BookingModal";
import Toast from "./components/Toast";
import { formatTime } from "./utils/format";
import "./App.css";

function App() {
  const [contractors, setContractors] = useState(initialContractors);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("All");
  const [filterProjectType, setFilterProjectType] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("any");
  const [filterMinRating, setFilterMinRating] = useState("any");
  const [sortBy, setSortBy] = useState("rating");
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState("system");
  const [mobileView, setMobileView] = useState("list");

  const specialties = [
    "All",
    ...new Set(initialContractors.map((c) => c.specialty)),
  ];

  const hasActiveFilters =
    search !== "" ||
    filterSpecialty !== "All" ||
    filterProjectType !== "all" ||
    filterAvailability !== "any" ||
    filterMinRating !== "any";

  function clearFilters() {
    setSearch("");
    setFilterSpecialty("All");
    setFilterProjectType("all");
    setFilterAvailability("any");
    setFilterMinRating("any");
  }

  const filtered = contractors
    .filter((c) => {
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
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "experience") return b.yearsExperience - a.yearsExperience;
      return 0;
    });

  const selected = contractors.find((c) => c.id === selectedId);

  function handleBook(contractorId, date, slotIndex) {
    const contractor = contractors.find((c) => c.id === contractorId);
    const slot = contractor.schedule[date][slotIndex];
    setBooking({ contractorId, date, slotIndex, contractor, slot });
  }

  function confirmBooking(clientName) {
    const { contractor, slot } = booking;
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
    setToast(`Booking confirmed! ${contractor.name} at ${formatTime(slot.start)} - ${formatTime(slot.end)}`);
    setBooking(null);
  }

  function cancelBooking(contractorId, date, slotIndex) {
    setContractors((prev) =>
      prev.map((c) => {
        if (c.id !== contractorId) return c;
        const newSchedule = { ...c.schedule };
        const newSlots = [...newSchedule[date]];
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          booked: false,
          client: undefined,
        };
        newSchedule[date] = newSlots;
        return { ...c, schedule: newSchedule };
      })
    );
  }

  function handleSelectContractor(id) {
    setSelectedId(id);
    setMobileView("schedule");
  }

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme !== "system") {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Contractor Rolodex</h1>
          <p>Find and book contractors for your projects</p>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
            aria-label={`Theme: ${theme}. Click to change.`}
          >
            {theme === "dark" ? "\u{1F319}" : theme === "light" ? "\u{2600}\u{FE0F}" : "\u{1F4BB}"}
            <span className="theme-label">{theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </header>

      <div className="app-layout">
        <aside className={`sidebar ${mobileView === "schedule" && selected ? "mobile-hidden" : ""}`}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search name, specialty, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search contractors by name, specialty, or area"
            />
          </div>
          <div className="filter-bar">
            {specialties.map((s) => (
              <button
                key={s}
                className={`filter-chip ${filterSpecialty === s ? "active" : ""}`}
                onClick={() => setFilterSpecialty(s)}
                aria-label={`Filter by specialty: ${s}`}
                aria-pressed={filterSpecialty === s}
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
                  aria-label={`Filter project type: ${label}`}
                  aria-pressed={filterProjectType === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              className="filter-select"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              aria-label="Filter by availability"
            >
              <option value="any">Any Availability</option>
              <option value="available">Available Now</option>
              <option value="available_limited">Available + Limited</option>
            </select>
            <select
              className="filter-select"
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(e.target.value)}
              aria-label="Filter by minimum rating"
            >
              <option value="any">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <div className="list-toolbar">
            <span className="result-count">{filtered.length} contractor{filtered.length !== 1 ? "s" : ""} found</span>
            <div className="list-toolbar-right">
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort contractors"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>
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
                onClick={() => handleSelectContractor(c.id)}
              />
            ))}
          </div>
        </aside>

        <main className={`main-content ${mobileView === "list" ? "mobile-hidden" : ""}`}>
          {selected ? (
            <Schedule
              contractor={selected}
              onBook={handleBook}
              onCancel={cancelBooking}
              mobileBackButton={() => setMobileView("list")}
            />
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

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}

export default App;
