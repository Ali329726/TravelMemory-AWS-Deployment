import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  CalendarDays,
  IndianRupee,
  Search,
  Plus,
  Compass,
  Heart,
  ArrowUpRight,
  X,
  Plane,
  Camera,
  Clock,
  Users,
  Star,
  RefreshCw,
} from "lucide-react";

const categories = ["All Trips", "Family", "Friends", "Couple", "Solo"];

const fallbackImages = [
  "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85",
];

const emptyForm = {
  tripName: "",
  tripDate: "",
  tripType: "Family",
  totalCost: "",
  hotels: "",
  placesVisited: "",
  shortDescription: "",
  experience: "",
  image: "",
  featured: false,
};

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeTrip(trip, index) {
  const rawPlaces = trip.placesVisited;

  const placesVisited = Array.isArray(rawPlaces)
    ? rawPlaces
    : String(rawPlaces ?? "")
        .split(/[;,]/)
        .map((place) => place.trim())
        .filter(Boolean);

  const startDate = trip.startDateOfJourney ?? trip.tripDate ?? "";

  const endDate = trip.endDateOfJourney ?? "";

  const tripDate =
    trip.tripDate ||
    [formatDate(startDate), formatDate(endDate)].filter(Boolean).join(" – ") ||
    "Date not provided";

  const image = typeof trip.image === "string" ? trip.image.trim() : "";

  return {
    ...trip,
    id: trip._id ?? trip.id ?? index,
    tripName: trip.tripName ?? trip.name ?? "Untitled Trip",
    tripType: trip.tripType ?? "Family",
    tripDate,
    totalCost: trip.totalCost ?? 0,
    placesVisited,
    shortDescription: trip.shortDescription ?? "Explore this memorable travel experience.",
    experience: trip.experience ?? "",
    hotels: trip.nameOfHotels ?? trip.hotels ?? "",
    image: /^https?:\/\//i.test(image) ? image : fallbackImages[index % fallbackImages.length],
    featured: trip.featured === true || String(trip.featured).toLowerCase() === "true",
  };
}

export default function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Trips");
  const [searchText, setSearchText] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [savedTrips, setSavedTrips] = useState([]);
  const [formMessage, setFormMessage] = useState("");

  const loadTrips = useCallback(async (signal) => {
    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch("/trip", { signal });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      const result = await response.json();

      const records = Array.isArray(result) ? result : (result?.data ?? result?.trips);

      if (!Array.isArray(records)) {
        throw new Error("The /trip API did not return a list of trips.");
      }

      setTrips(records.map(normalizeTrip));
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("TravelMemory API error:", error);
        setLoadError(error.message || "Unable to load trips.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTrips(controller.signal);

    return () => controller.abort();
  }, [loadTrips]);

  const filteredTrips = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesCategory =
        activeCategory === "All Trips" ||
        trip.tripType.toLowerCase() === activeCategory.toLowerCase();

      const searchableText = [
        trip.tripName,
        trip.tripType,
        trip.shortDescription,
        trip.experience,
        ...(trip.placesVisited || []),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [trips, activeCategory, searchText]);

  const featuredTrips = trips.filter((trip) => trip.featured);

  function updateForm(event) {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function submitTrip(event) {
    event.preventDefault();

    const newTrip = normalizeTrip(
      {
        ...form,
        id: `local-${Date.now()}`,
        totalCost: Number(form.totalCost) || 0,
        placesVisited: form.placesVisited
          .split(",")
          .map((place) => place.trim())
          .filter(Boolean),
        tripDate: form.tripDate || "Date not provided",
        image: form.image.trim(),
      },
      trips.length,
    );

    // This adds the trip to the current browser session only.
    // Connect your backend POST endpoint to save trips permanently.
    setTrips((current) => [newTrip, ...current]);
    setForm(emptyForm);
    setShowForm(false);
    setActiveCategory("All Trips");
    setSearchText("");
    setFormMessage(
      "Trip added to this page. Permanent saving requires the backend create-trip API.",
    );
  }

  function toggleSaved(id) {
    setSavedTrips((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  }

  function scrollToTrips() {
    document.getElementById("all-trips")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="travel-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

        * { box-sizing: border-box; }

        :root {
          font-family: 'DM Sans', sans-serif;
          color: #18342b;
          background: #f7f8f5;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        body { margin: 0; min-width: 320px; }
        button, input, textarea, select { font: inherit; }
        button { cursor: pointer; }
        button:focus-visible, input:focus-visible,
        textarea:focus-visible, select:focus-visible {
          outline: 3px solid #acd8c5;
          outline-offset: 2px;
        }

        .travel-app { min-height: 100vh; }
        .navbar {
          position: sticky;
          top: 0;
          z-index: 5;
          min-height: 74px;
          padding: 12px 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #fff;
          border-bottom: 1px solid #e8eee7;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1e624b;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -.5px;
        }

        .brand-icon {
          display: grid;
          place-items: center;
          width: 41px;
          height: 41px;
          background: #e7f2eb;
          border-radius: 13px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 0;
          color: #64746b;
          border: 0;
          background: transparent;
          font-weight: 600;
        }

        .nav-link:hover { color: #1e624b; }

        .primary-btn, .secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 17px;
          border: 0;
          border-radius: 11px;
          font-weight: 700;
          transition: background .2s, transform .2s;
        }

        .primary-btn {
          color: #fff;
          background: #20664f;
        }

        .primary-btn:hover {
          background: #174f3c;
          transform: translateY(-1px);
        }

        .secondary-btn {
          color: #245d49;
          background: #eaf3ec;
        }

        .secondary-btn:hover { background: #dbece0; }

        .hero {
          max-width: 1440px;
          margin: 0 auto;
          padding: 38px 7% 24px;
        }

        .hero-panel {
          min-height: 365px;
          display: flex;
          align-items: center;
          padding: 45px;
          border-radius: 25px;
          overflow: hidden;
          color: #fff;
          background:
            linear-gradient(90deg, rgba(12,39,31,.86), rgba(12,39,31,.28)),
            url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85') center/cover;
        }

        .hero-copy { max-width: 620px; }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.7px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 18px 0 16px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(37px, 5vw, 60px);
          line-height: 1.08;
          letter-spacing: -.7px;
        }

        .hero p {
          max-width: 510px;
          margin: 0 0 24px;
          color: #eef5ef;
          font-size: 15px;
          line-height: 1.8;
        }

        .hero .primary-btn {
          color: #205b46;
          background: #fff;
        }

        .hero .primary-btn:hover { background: #eaf3ec; }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          background: #fff;
          border: 1px solid #e8eee7;
          border-radius: 15px;
        }

        .stat-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 12px;
          color: #266a51;
          background: #eaf4ed;
        }

        .stat strong { display: block; font-size: 21px; }
        .stat span { color: #78867d; font-size: 12px; }

        .main-content {
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px 7% 70px;
        }

        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin: 15px 0 22px;
        }

        .section-heading h2 {
          margin: 0 0 7px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px;
          letter-spacing: -.4px;
        }

        .section-heading p {
          margin: 0;
          color: #78867d;
          font-size: 14px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          width: min(310px, 100%);
          padding: 0 13px;
          border: 1px solid #e0e8df;
          border-radius: 11px;
          color: #7d8b82;
          background: #fff;
        }

        .search-box input {
          width: 100%;
          padding: 12px 0;
          border: 0;
          outline: 0;
          color: #18342b;
          background: transparent;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 25px;
        }

        .filter {
          padding: 9px 15px;
          border: 1px solid #e0e8df;
          border-radius: 30px;
          color: #68776e;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
        }

        .filter.active, .filter:hover {
          border-color: #20664f;
          color: #fff;
          background: #20664f;
        }

        .trip-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .trip-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e8eee6;
          border-radius: 18px;
          background: #fff;
          transition: transform .2s, box-shadow .2s;
        }

        .trip-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px #193c2910;
        }

        .trip-image-wrap {
          position: relative;
          height: 215px;
          overflow: hidden;
          background: #e6ece5;
        }

        .trip-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s;
        }

        .trip-card:hover .trip-image { transform: scale(1.04); }

        .trip-badge {
          position: absolute;
          top: 13px;
          left: 13px;
          padding: 7px 11px;
          border-radius: 20px;
          color: #275f4d;
          background: #fff;
          font-size: 11px;
          font-weight: 700;
        }

        .save-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          color: #53675b;
          background: #ffffffed;
        }

        .save-btn.saved { color: #d94d5c; }

        .trip-info { padding: 19px; }

        .trip-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 11px;
          color: #7c8b81;
          font-size: 12px;
        }

        .trip-info h3 {
          margin: 0 0 9px;
          font-size: 19px;
          letter-spacing: -.3px;
        }

        .trip-description {
          min-height: 44px;
          margin: 0 0 15px;
          color: #76837b;
          font-size: 13px;
          line-height: 1.7;
        }

        .place-list {
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 22px;
          color: #547367;
          font-size: 12px;
          line-height: 1.5;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          padding-top: 15px;
          border-top: 1px solid #edf0eb;
        }

        .cost-label {
          margin-bottom: 4px;
          color: #87948b;
          font-size: 10px;
        }

        .cost-value { font-size: 16px; font-weight: 700; }

        .text-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 0 8px 8px;
          border: 0;
          color: #20664f;
          background: transparent;
          font-size: 12px;
          font-weight: 700;
        }

        .status, .empty-state {
          padding: 32px 20px;
          border: 1px solid #e7eee5;
          border-radius: 15px;
          background: #fff;
          text-align: center;
        }

        .status p, .empty-state p {
          color: #77867c;
          line-height: 1.7;
        }

        .error-text { color: #a62b38; }

        .message {
          margin: 0 0 18px;
          padding: 12px 15px;
          border-radius: 10px;
          color: #265d45;
          background: #e8f5eb;
          font-size: 13px;
          line-height: 1.5;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 20px;
          background: #10251fc9;
        }

        .modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 19px;
          background: #fff;
          box-shadow: 0 25px 90px #0003;
        }

        .modal-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 19px 22px;
          border-bottom: 1px solid #e8eee7;
          background: #fff;
        }

        .modal-header h2 {
          margin: 0;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
        }

        .icon-btn {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 10px;
          color: #43594d;
          background: #edf3ed;
        }

        .modal-body { padding: 22px; }

        .detail-image {
          width: 100%;
          max-height: 280px;
          object-fit: cover;
          border-radius: 13px;
        }

        .detail-body {
          color: #68776d;
          line-height: 1.8;
          white-space: pre-line;
        }

        .detail-facts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .fact {
          padding: 13px;
          border-radius: 11px;
          background: #f1f6f0;
        }

        .fact span {
          display: block;
          margin-bottom: 6px;
          color: #7a897f;
          font-size: 11px;
        }

        .fact strong { font-size: 13px; overflow-wrap: anywhere; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .field { min-width: 0; }
        .field.full { grid-column: 1 / -1; }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #475b4e;
          font-size: 12px;
          font-weight: 700;
        }

        .field input, .field textarea, .field select {
          width: 100%;
          padding: 12px;
          border: 1px solid #dfe7dd;
          border-radius: 10px;
          background: #fff;
          color: #18342b;
        }

        .field textarea {
          min-height: 85px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #516458;
          font-size: 13px;
        }

        .footer {
          padding: 28px 7%;
          border-top: 1px solid #e5ebe3;
          color: #77867c;
          background: #fff;
          text-align: center;
          font-size: 12px;
          line-height: 1.8;
        }

        @media (max-width: 950px) {
          .trip-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hero, .main-content { padding-left: 4%; padding-right: 4%; }
          .navbar { padding-left: 4%; padding-right: 4%; }
          .hero-panel { padding: 35px; }
        }

        @media (max-width: 640px) {
          .navbar { min-height: 65px; }
          .brand { font-size: 18px; }
          .brand-icon { width: 36px; height: 36px; }
          .nav-links { gap: 10px; }
          .nav-link { display: none; }
          .nav-links .primary-btn { padding: 10px 12px; font-size: 12px; }
          .hero { padding-top: 22px; }
          .hero-panel { min-height: 330px; padding: 27px 22px; border-radius: 18px; }
          .hero h1 { font-size: 39px; }
          .stats { gap: 8px; }
          .stat { padding: 11px 8px; gap: 8px; }
          .stat-icon { width: 33px; height: 33px; }
          .stat strong { font-size: 16px; }
          .stat span { font-size: 10px; }
          .trip-grid { grid-template-columns: 1fr; }
          .trip-image-wrap { height: 230px; }
          .section-heading h2 { font-size: 27px; }
          .search-box { width: 100%; }
          .detail-facts, .form-grid { grid-template-columns: 1fr; }
          .field.full { grid-column: auto; }
          .modal-backdrop { padding: 10px; }
          .modal-body { padding: 16px; }
        }
      `}</style>

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Compass size={23} />
          </div>
          TravelMemory
        </div>

        <nav className="nav-links">
          <button className="nav-link" onClick={scrollToTrips}>
            <Compass size={17} /> Explore
          </button>

          <button
            className="nav-link"
            onClick={() => {
              setSearchText("");
              setActiveCategory("All Trips");
              scrollToTrips();
            }}
          >
            <Camera size={17} /> My trips
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              setFormMessage("");
              setShowForm(true);
            }}
          >
            <Plus size={17} /> Add a trip
          </button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-panel">
          <div className="hero-copy">
            <div className="eyebrow">
              <Compass size={15} /> YOUR JOURNEY, YOUR STORY
            </div>

            <h1>
              Collect moments.
              <br />
              Keep memories.
            </h1>

            <p>
              Discover the places you've been, celebrate the people you've travelled with, and keep
              every adventure in one beautiful place.
            </p>

            <button className="primary-btn" onClick={scrollToTrips}>
              Explore trips <ArrowUpRight size={17} />
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-icon">
              <Plane size={21} />
            </div>
            <div>
              <strong>{trips.length}</strong>
              <span>Total trips</span>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">
              <MapPin size={21} />
            </div>
            <div>
              <strong>{new Set(trips.flatMap((trip) => trip.placesVisited || [])).size}</strong>
              <span>Places listed</span>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">
              <Heart size={21} />
            </div>
            <div>
              <strong>{savedTrips.length}</strong>
              <span>Saved trips</span>
            </div>
          </div>
        </div>
      </section>

      <main className="main-content" id="all-trips">
        {formMessage && (
          <div className="message" role="status">
            {formMessage}
          </div>
        )}

        <div className="section-heading">
          <div>
            <h2>Explore your memories</h2>
            <p>Every destination has a story worth remembering.</p>
          </div>

          <label className="search-box">
            <Search size={18} />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search trips or places..."
              aria-label="Search trips or places"
            />
          </label>
        </div>

        {featuredTrips.length > 0 && activeCategory === "All Trips" && !searchText.trim() && (
          <div className="filters" aria-label="Featured trip indicator">
            <span className="filter active">
              <Star size={13} style={{ display: "inline", marginRight: 5 }} />
              {featuredTrips.length} featured {featuredTrips.length === 1 ? "trip" : "trips"}
            </span>
          </div>
        )}

        <div className="filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="status">
            <RefreshCw size={28} />
            <p>Loading your travel memories...</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="status">
            <h3>We couldn't load your trips</h3>
            <p className="error-text">{loadError}</p>
            <p>
              Check that your backend is running and your Vite proxy points to the correct backend
              port.
            </p>
            <button className="primary-btn" onClick={() => loadTrips()}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        )}

        {!loading && !loadError && filteredTrips.length === 0 && (
          <div className="empty-state">
            <Compass size={35} />
            <h3>{trips.length === 0 ? "Your journey starts here" : "No trips found"}</h3>
            <p>
              {trips.length === 0
                ? "Your backend returned no trips yet. Add a trip to start collecting memories."
                : "Try another category or search for a different place."}
            </p>
            {trips.length === 0 && (
              <button className="primary-btn" onClick={() => setShowForm(true)}>
                <Plus size={16} /> Add your first trip
              </button>
            )}
          </div>
        )}

        {!loading && !loadError && filteredTrips.length > 0 && (
          <div className="trip-grid">
            {filteredTrips.map((trip) => (
              <article className="trip-card" key={trip.id}>
                <div className="trip-image-wrap">
                  <img
                    className="trip-image"
                    src={trip.image}
                    alt={trip.tripName}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImages[3];
                    }}
                  />

                  <span className="trip-badge">{trip.tripType}</span>

                  <button
                    className={`save-btn ${savedTrips.includes(trip.id) ? "saved" : ""}`}
                    onClick={() => toggleSaved(trip.id)}
                    aria-label={savedTrips.includes(trip.id) ? "Remove saved trip" : "Save trip"}
                    title="Save trip"
                  >
                    <Heart
                      size={19}
                      fill={savedTrips.includes(trip.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="trip-info">
                  <div className="trip-meta">
                    <CalendarDays size={14} />
                    {trip.tripDate}
                    {trip.featured && (
                      <span>
                        <Star size={13} fill="currentColor" style={{ verticalAlign: "middle" }} />{" "}
                        Featured
                      </span>
                    )}
                  </div>

                  <h3>{trip.tripName}</h3>

                  <p className="trip-description">{trip.shortDescription}</p>

                  <div className="place-list">
                    <MapPin size={15} />
                    <span>
                      {trip.placesVisited.length > 0
                        ? trip.placesVisited.slice(0, 3).join(", ") +
                          (trip.placesVisited.length > 3 ? "…" : "")
                        : "Places not specified"}
                    </span>
                  </div>

                  <div className="card-footer">
                    <div>
                      <div className="cost-label">TRIP COST</div>
                      <div className="cost-value">{formatMoney(trip.totalCost)}</div>
                    </div>

                    <button className="text-btn" onClick={() => setSelectedTrip(trip)}>
                      View details <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="brand" style={{ justifyContent: "center" }}>
          <Compass size={20} /> TravelMemory
        </div>
        <p>Your travels. Your stories. Your memories.</p>
      </footer>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-trip-title"
          >
            <div className="modal-header">
              <h2 id="add-trip-title">Add a travel memory</h2>
              <button
                className="icon-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={submitTrip}>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="tripName">Trip name *</label>
                    <input
                      id="tripName"
                      name="tripName"
                      value={form.tripName}
                      onChange={updateForm}
                      required
                      placeholder="e.g. Himalayan Family Holiday"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="tripDate">Trip date</label>
                    <input
                      id="tripDate"
                      name="tripDate"
                      type="date"
                      value={form.tripDate}
                      onChange={updateForm}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="tripType">Trip type</label>
                    <select
                      id="tripType"
                      name="tripType"
                      value={form.tripType}
                      onChange={updateForm}
                    >
                      {categories
                        .filter((category) => category !== "All Trips")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="totalCost">Total cost (₹)</label>
                    <input
                      id="totalCost"
                      name="totalCost"
                      type="number"
                      min="0"
                      value={form.totalCost}
                      onChange={updateForm}
                      placeholder="e.g. 25000"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="hotels">Hotel names</label>
                    <input
                      id="hotels"
                      name="hotels"
                      value={form.hotels}
                      onChange={updateForm}
                      placeholder="Hotel names"
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="placesVisited">Places visited (comma-separated)</label>
                    <input
                      id="placesVisited"
                      name="placesVisited"
                      value={form.placesVisited}
                      onChange={updateForm}
                      placeholder="Delhi, Agra, Jaipur"
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="shortDescription">Short description</label>
                    <textarea
                      id="shortDescription"
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={updateForm}
                      placeholder="Describe your journey..."
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="experience">Travel experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={form.experience}
                      onChange={updateForm}
                      placeholder="What made this trip memorable?"
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="image">Image URL (optional)</label>
                    <input
                      id="image"
                      name="image"
                      type="url"
                      value={form.image}
                      onChange={updateForm}
                      placeholder="https://example.com/travel-photo.jpg"
                    />
                  </div>

                  <div className="field full">
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={updateForm}
                      />
                      Feature this trip
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-btn" type="submit">
                    <Plus size={17} /> Add trip
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {selectedTrip && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTrip(null);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-detail-title"
          >
            <div className="modal-header">
              <h2 id="trip-detail-title">{selectedTrip.tripName}</h2>
              <button
                className="icon-btn"
                onClick={() => setSelectedTrip(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <img
                className="detail-image"
                src={selectedTrip.image}
                alt={selectedTrip.tripName}
                onError={(event) => {
                  event.currentTarget.src = fallbackImages[3];
                }}
              />

              <div className="detail-facts">
                <div className="fact">
                  <span>
                    <CalendarDays size={13} /> TRAVEL DATE
                  </span>
                  <strong>{selectedTrip.tripDate}</strong>
                </div>

                <div className="fact">
                  <span>
                    <Users size={13} /> TRIP TYPE
                  </span>
                  <strong>{selectedTrip.tripType}</strong>
                </div>

                <div className="fact">
                  <span>
                    <IndianRupee size={13} /> TOTAL COST
                  </span>
                  <strong>{formatMoney(selectedTrip.totalCost)}</strong>
                </div>

                <div className="fact">
                  <span>
                    <MapPin size={13} /> PLACES VISITED
                  </span>
                  <strong>{selectedTrip.placesVisited.join(", ") || "Not specified"}</strong>
                </div>
              </div>

              {selectedTrip.hotels && (
                <>
                  <h3>
                    <Plane size={16} /> Hotels and resorts
                  </h3>
                  <p className="detail-body">{selectedTrip.hotels}</p>
                </>
              )}

              <h3>About this trip</h3>
              <p className="detail-body">{selectedTrip.shortDescription}</p>

              {selectedTrip.experience && (
                <>
                  <h3>
                    <Camera size={16} /> Travel experience
                  </h3>
                  <p className="detail-body">{selectedTrip.experience}</p>
                </>
              )}

              <button className="secondary-btn" onClick={() => toggleSaved(selectedTrip.id)}>
                <Heart
                  size={17}
                  fill={savedTrips.includes(selectedTrip.id) ? "currentColor" : "none"}
                />
                {savedTrips.includes(selectedTrip.id)
                  ? "Remove from saved trips"
                  : "Save this trip"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
