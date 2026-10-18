import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';

function getStoredAuth() {
  const rawToken = localStorage.getItem('karthikMartToken') || '';
  const rawUser = localStorage.getItem('karthikMartUser');

  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  const token = rawToken.replace(/^Bearer\s+/i, '').replace(/^["']|["']$/g, '');
  const userId = user?.id ?? user?.userId ?? user?.user?.id ?? null;

  return { token, userId };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function getItemUnitPrice(item) {
  const quantity = Math.max(Number(item?.quantity ?? item?.qty ?? 1), 1);
  const candidates = [
    item?.sellingPrice,
    item?.unitPrice,
    item?.priceAtPurchase,
    item?.productPrice,
    item?.price,
    item?.product?.sellingPrice,
    item?.product?.discountedPrice,
    item?.product?.discounted_price,
    item?.product?.price,
  ];
  for (const value of candidates) {
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  if (item?.subtotal !== null && item?.subtotal !== undefined && item?.subtotal !== '') {
    return Number(item.subtotal) / quantity;
  }
  return null;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function statusClass(value) {
  return String(value || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function ShippingAddress({ address }) {
  if (!address) {
    return (
      <section className="order-shipping-address">
        <h3>Delivery address</h3>
        <p>No shipping address is linked to this order.</p>
      </section>
    );
  }

  const addressParts = [
    address.address,
    address.locality,
    address.landmark,
    address.city,
    address.state,
    address.zipcode,
    address.country,
  ].filter((part) => part != null && String(part).trim() !== '');

  return (
    <section className="order-shipping-address">
      <h3>Delivery address</h3>
      <p><strong>{address.name || 'Recipient'}</strong></p>
      {address.mobile && <p>Mobile: {address.mobile}</p>}
      <p>{addressParts.join(', ')}</p>
    </section>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const { token, userId } = getStoredAuth();

        if (!token || userId == null) {
          throw new Error('Your login details were not found. Please log in again, then open My Orders.');
        }

        const response = await fetch(`${API_BASE}/api/orders/user/${userId}`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Your login session is invalid or expired. Please log in again.');
          }
          if (response.status === 403) {
            throw new Error('Your account is not allowed to view these orders.');
          }
          throw new Error(`Unable to load orders (HTTP ${response.status}).`);
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Unable to load orders.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadOrders();
    return () => controller.abort();
  }, []);

  return (
    <main className="my-orders-page">
      <header className="my-orders-header">
        <div>
          <p className="my-orders-eyebrow">KARTHIK MART</p>
          <h1>My Orders</h1>
          <p className="my-orders-subtitle">Track purchases, payment status, and delivery details.</p>
        </div>
        <Link className="my-orders-back" to="/">← Continue shopping</Link>
      </header>

      {loading && (
        <section className="orders-message" aria-live="polite">
          <span className="orders-spinner" />
          <p>Loading your orders…</p>
        </section>
      )}

      {!loading && error && (
        <section className="orders-message orders-error" role="alert">
          <h2>We couldn't load your orders</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </section>
      )}

      {!loading && !error && orders.length === 0 && (
        <section className="orders-message">
          <div className="orders-empty-icon">🛍️</div>
          <h2>No orders yet</h2>
          <p>Your orders will appear here after you complete checkout.</p>
          <Link className="orders-primary-button" to="/">Explore products</Link>
        </section>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="orders-list" aria-label="Your orders">
          <div className="orders-summary">
            <strong>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</strong>
            <span>Most recent orders first</span>
          </div>

          {orders.slice().sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
            .map((order) => {
              const rawItems = order.orderItems ?? order.items ?? order.orderItemsList ?? order.products ?? [];
              const items = Array.isArray(rawItems) ? rawItems : [];
              const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

              // Depending on the backend serializer, the relation may be named shippingAddress.
              const address = order.shippingAddress || order.address || null;

              return (
                <article className="order-card" key={order.id}>
                  <div className="order-card-top">
                    <div>
                      <span className="order-label">ORDER ID</span>
                      <h2>#{order.orderNumber || order.id || order.orderId || order.order_id}</h2>
                      <p className="order-date">Placed {formatDate(order.orderDate)}</p>
                    </div>
                    <div className="order-statuses">
                      <span className={`order-status ${statusClass(order.orderStatus)}`}>
                        {order.orderStatus || 'Status unavailable'}
                      </span>
                      <span className={`payment-status ${statusClass(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-actions">
                    <Link
                      className="orders-primary-button"
                      to={`/orders/${order.id ?? order.orderId ?? order.order_id}`}
                      state={{ order }}
                    >
                      View Details
                    </Link>
                  </div>

                  <div className="order-products">
                    {items.map((item) => {
                      const product = item.product || {};
                      const image = product.images?.[0];
                      let unitPrice = getItemUnitPrice(item);
                      if (unitPrice == null && items.length === 1) {
                        const orderTotal = order.totalAmount ?? order.totalSellingPrice;
                        if (orderTotal != null) unitPrice = Number(orderTotal) / Math.max(Number(item.quantity ?? 1), 1);
                      }
                      const lineTotal = item.subtotal ?? (unitPrice == null ? null : unitPrice * Number(item.quantity ?? 1));
                      return (
                        <div className="order-product" key={item.id ?? `${order.id}-${product.id}`}>
                          <div className="order-product-image">
                            {image ? <img src={image} alt={product.title || 'Product'} /> : <span aria-hidden="true">📦</span>}
                          </div>
                          <div className="order-product-info">
                            <h3>{product.title || 'Product'}</h3>
                            <p>Qty: {item.quantity ?? 1}</p>
                            <small>{unitPrice == null ? 'Price unavailable' : formatCurrency(unitPrice)}</small>
                          </div>
                          <strong className="order-product-total">
                            {lineTotal == null ? 'Price unavailable' : formatCurrency(lineTotal)}
                          </strong>
                        </div>
                      );
                    })}
                    {items.length === 0 && <p className="order-no-items">Item details are not available for this order.</p>}
                  </div>

                  <ShippingAddress address={address} />

                  <div className="order-card-bottom">
                    <div className="order-meta">
                      <span>{totalQty} {totalQty === 1 ? 'item' : 'items'}</span>
                      <span>Paid via {order.paymentMethod || order.paymentDetails?.paymentMethod || 'Not specified'}</span>
                    </div>
                    <div className="order-total">
                      <span>Total paid</span>
                      <strong>{formatCurrency(order.totalAmount ?? order.totalSellingPrice)}</strong>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <p className="order-tracking">Tracking number: <strong>{order.trackingNumber}</strong></p>
                  )}
                </article>
              );
            })}
        </section>
      )}
    </main>
  );
}
