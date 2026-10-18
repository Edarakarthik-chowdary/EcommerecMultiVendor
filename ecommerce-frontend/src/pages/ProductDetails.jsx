import React, { useEffect, useState } from 'react';

const productImages = {
  'Samsung Galaxy Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85',
  'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
  'Men Casual T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
  'Laptop Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
  'Smart LED Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',
  'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
};

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value) || 0);

function ProductDetails({ product, onBack, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [product?.id]);

  if (!product) {
    return <main className="product-details-page" style={{ maxWidth: 1180, margin: '0 auto', padding: 32 }}>
      <h2>Product not found</h2>
      <button type="button" onClick={onBack}>Back to Products</button>
    </main>;
  }

  const stock = Math.max(0, Math.floor(Number(product.quantity ?? product.stockAvailable ?? 0)));
  const price = Number(product.sellingPrice ?? product.price ?? 0);
  const mrp = Number(product.mrpPrice ?? price);
  const image = product.images?.find((item) => typeof item === 'string' && item.trim())
    || product.imageUrl || product.image || productImages[product.title]
    || 'https://placehold.co/900x700/eef3f9/52647b?text=Karthik+Mart';
  const category = typeof product.category === 'string'
    ? product.category : product.category?.name || 'General';
  const brand = typeof product.brand === 'string'
    ? { name: product.brand, logoUrl: '' }
    : product.brand || null;

  function addSelectedQuantity() {
    if (product.isDemo || stock < 1) return;
    const safeQuantity = Math.min(stock, Math.max(1, Math.min(10, Math.floor(Number(quantity) || 1))));
    onAddToCart(product, safeQuantity);
  }

  return (
    <main className="product-details-page" style={{ maxWidth: 1180, margin: '0 auto', padding: '36px 24px 64px' }}>
      <button type="button" onClick={onBack} className="back-button"
        style={{ border: '1px solid #d8dee8', borderRadius: 10, background: '#fff', padding: '10px 16px', marginBottom: 28, cursor: 'pointer' }}>
        ← Back to Products
      </button>

      <div className="product-details-container" style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 42, alignItems: 'start',
      }}>
        <div className="product-details-image" style={{
          minHeight: 360, background: '#f3f5f8', borderRadius: 18, overflow: 'hidden', display: 'grid', placeItems: 'center',
        }}>
          <img src={image} alt={product.title || 'Product'} onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = 'https://placehold.co/900x700/eef3f9/52647b?text=Image+Unavailable';
          }} style={{ width: '100%', height: '100%', maxHeight: 560, objectFit: 'contain' }} />
        </div>

        <section className="product-details-info">
          <p style={{ color: '#536b91', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>{category}</p>
          {brand?.name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 12px' }}>
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  style={{ width: 56, height: 32, objectFit: 'contain' }}
                />
              )}
              <span style={{ color: '#374151', fontSize: 14 }}>
                Brand: <strong>{brand.name}</strong>
              </span>
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.15, margin: '12px 0' }}>{product.title}</h1>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 28 }}>{money(price)}</strong>
            {mrp > price && <><del style={{ color: '#7b8494' }}>{money(mrp)}</del>
              {Number(product.discountPercentage) > 0 && <span style={{ color: '#16804a', fontWeight: 700 }}>{product.discountPercentage}% off</span>}
            </>}
          </div>

          <p style={{ lineHeight: 1.8, color: '#596579', marginTop: 24 }}>
            {product.description || 'Discover quality and value with Karthik Mart.'}
          </p>

          <p role="status" style={{ fontWeight: 600, color: stock > 0 ? '#16804a' : '#b42318', marginTop: 22 }}>
            {stock > 0 ? `✓ In stock — ${stock} available` : 'Currently out of stock'}
          </p>

          {stock > 0 && !product.isDemo && <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
            <label htmlFor="product-quantity" style={{ fontWeight: 600 }}>Quantity</label>
            <select id="product-quantity" value={Math.min(quantity, Math.min(stock, 10))}
              onChange={(event) => setQuantity(Number(event.target.value))}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d8dee8', minWidth: 82 }}>
              {Array.from({ length: Math.min(stock, 10) }, (_, index) => index + 1)
                .map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            {stock > 10 && <span style={{ color: '#687386', fontSize: 13 }}>Maximum 10 per add</span>}
          </div>}

          <button type="button" className="add-cart-button" disabled={product.isDemo || stock <= 0}
            onClick={addSelectedQuantity} style={{ marginTop: 16, minWidth: 180, padding: '14px 20px' }}>
            {product.isDemo ? 'Preview item' : stock <= 0 ? 'Out of stock' : `＋ Add ${Math.min(quantity, stock, 10)} to cart`}
          </button>

          {product.isDemo && <p style={{ color: '#7b8494', fontSize: 13, marginTop: 10 }}>
            Preview only: this item cannot be purchased until the backend inventory is connected.
          </p>}

          <div style={{ marginTop: 28, borderTop: '1px solid #e5e9f0', paddingTop: 18, lineHeight: 2 }}>
            <p>✓ Stock availability is checked before adding to cart</p>
            <p>✓ Final price and inventory must be verified by the server at checkout</p>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .product-details-container { grid-template-columns: minmax(0, 1fr) !important; gap: 24px !important; }
          .product-details-image { min-height: 260px !important; }
        }
      `}</style>
    </main>
  );
}

export default ProductDetails;
