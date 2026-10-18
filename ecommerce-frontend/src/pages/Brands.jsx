import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Brands.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5454";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/brands`, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load brands (HTTP ${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setBrands(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
      })
      .catch((err) => { if (!cancelled) setError(err.message || "Unable to load brands."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleBrands = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return brands.filter((brand) =>
      [brand.name, brand.description, ...(brand.categories || []).map((category) => category.name)]
        .some((value) => String(value || "").toLowerCase().includes(needle))
    );
  }, [brands, query]);

  return (
    <main className="brands-page">
      <div className="brands-page-top">
        <Link to="/" className="brands-back-link">← Back to shopping</Link>
        <span className="brands-eyebrow">KARTHIK MART COLLECTION</span>
        <h1>Shop by brand</h1>
        <p>Explore trusted brands and find products for your everyday needs.</p>
        <label className="brands-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands…" aria-label="Search brands" />
        </label>
      </div>

      {error && <p className="brands-message error" role="alert">{error}</p>}
      {loading && <p className="brands-message">Loading brands…</p>}
      {!loading && !error && visibleBrands.length === 0 && (
        <p className="brands-message">{brands.length ? "No brands match your search." : "No brands are available yet."}</p>
      )}

      <section className="brands-grid" aria-label="Available brands">
        {visibleBrands.map((brand) => (
          <article className="brand-card" key={brand.id}>
            <div className="brand-card-logo">
              {brand.logoUrl
                ? <img src={brand.logoUrl} alt={`${brand.name} logo`} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                : <span>{String(brand.name || "B").slice(0, 1).toUpperCase()}</span>}
            </div>
            <div className="brand-card-copy">
              <h2>{brand.name}</h2>
              <p>{brand.description || "Explore products from this brand."}</p>
              <div className="brand-card-categories">
                {(brand.categories || []).length
                  ? brand.categories.map((category) => <span key={category.id}>{category.name || `Category #${category.id}`}</span>)
                  : <span>All categories</span>}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
