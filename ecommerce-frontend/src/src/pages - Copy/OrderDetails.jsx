import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5454";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("karthikMartUser") || "null");
  } catch {
    return null;
  }
}

function money(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getOrderId(order) {
  return order?.id ?? order?.orderId ?? order?.order_id ?? order?.orderID ?? order?.orderNumber;
}

function getItems(order) {
  return (
    order?.orderItems ??
    order?.items ??
    order?.orderItemsList ??
    order?.products ??
    []
  );
}

function getProductName(item) {
  return (
    item?.product?.title ??
    item?.product?.name ??
    item?.title ??
    item?.name ??
    "Product"
  );
}

function getQuantity(item) {
  return Number(item?.quantity ?? item?.qty ?? 1);
}

function getItemPrice(item) {
  // Order-item APIs may expose the saved purchase price under different names.
  const candidates = [
    item?.sellingPrice,
    item?.unitPrice,
    item?.priceAtPurchase,
    item?.productPrice,
    item?.price,
    item?.subtotal,
    item?.product?.sellingPrice,
    item?.product?.discountedPrice,
    item?.product?.discounted_price,
    item?.product?.price,
  ];

  for (const value of candidates) {
    if (value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))) {
      const amount = Number(value);
      // A subtotal is the total for the line, not the unit price.
      if (value === item?.subtotal && Number(item?.quantity ?? item?.qty ?? 1) > 0) {
        return amount / Number(item?.quantity ?? item?.qty ?? 1);
      }
      return amount;
    }
  }
  return null;
}

function getAddress(order) {
  return order?.shippingAddress ?? order?.address ?? null;
}

function addressLines(address) {
  if (!address) return [];
  return [
    address.name,
    address.address,
    address.locality,
    [address.city, address.state, address.zipcode ?? address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
    address.mobile ? `Mobile: ${address.mobile}` : null,
  ].filter(Boolean);
}

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const stateOrder = location.state?.order ?? null;
  const user = readUser();
  const userId = user?.id ?? user?.userId ?? user?.user?.id ?? null;
  const token = localStorage.getItem("karthikMartToken");

  const [orders, setOrders] = useState(() =>
    stateOrder && String(getOrderId(stateOrder)) === String(id) ? [stateOrder] : []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      setLoading(true);
      setError("");
      if (stateOrder && String(getOrderId(stateOrder)) === String(id)) {
        setOrders([stateOrder]);
        setLoading(false);
        return;
      }
      if (!token || !userId) {
        setError("Your login details were not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE}/api/orders/user/${encodeURIComponent(userId)}`,
          { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
        );
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data?.message || data?.error || `Could not load orders (HTTP ${response.status}).`);
        }
        const candidate = Array.isArray(data)
          ? data
          : data?.content ?? data?.orders ?? data?.data ?? data?.order ?? data;
        const list = Array.isArray(candidate)
          ? candidate
          : candidate && typeof candidate === "object" ? [candidate] : [];
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load order details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrders();
    return () => { cancelled = true; };
  }, [token, userId, id, stateOrder]);

  const order = useMemo(
    () => orders.find((item) => String(getOrderId(item)) === String(id)),
    [orders, id]
  );

  const styles = `
    .km-order-page{min-height:100vh;background:#f5f7fb;color:#182230;padding:30px 20px 56px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .km-order-wrap{max-width:1120px;margin:0 auto}
    .km-order-nav{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px}
    .km-brand{display:flex;align-items:center;gap:11px;font-size:19px;font-weight:850;letter-spacing:-.5px;color:#172554}
    .km-brand-mark{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;font-size:20px;box-shadow:0 7px 18px #4f46e533}
    .km-back{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#4f46e5;background:white;border:1px solid #e5e7eb;border-radius:12px;padding:11px 15px;font-weight:700;font-size:13px;transition:.2s}
    .km-back:hover{background:#eef2ff;border-color:#c7d2fe;transform:translateY(-1px)}
    .km-heading{margin-bottom:24px}.km-kicker{font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:800;color:#6366f1;margin:0 0 8px}
    .km-heading h1{font-size:clamp(27px,4vw,36px);letter-spacing:-1.1px;margin:0;color:#111827}.km-heading p{margin:9px 0 0;color:#6b7280;font-size:14px}
    .km-banner{display:flex;align-items:center;gap:14px;background:linear-gradient(115deg,#eef2ff,#faf5ff);border:1px solid #e0e7ff;border-radius:18px;padding:18px 21px;margin-bottom:22px}
    .km-banner-icon{flex-shrink:0;width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:#fff;color:#4f46e5;font-size:22px;box-shadow:0 3px 12px #312e8110}
    .km-banner strong{display:block;font-size:14px;color:#312e81}.km-banner p{margin:4px 0 0;font-size:12px;color:#6366a8}
    .km-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(270px,.85fr);gap:22px;align-items:start}
    .km-main-col,.km-side-col{display:grid;gap:20px;min-width:0}
    .km-card{background:#fff;border:1px solid #e8ebf2;border-radius:18px;padding:23px;box-shadow:0 5px 24px #10182808}
    .km-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
    .km-card h2{font-size:16px;letter-spacing:-.2px;margin:0;color:#111827}.km-card-subtitle{font-size:12px;color:#8a94a6;margin:6px 0 0}
    .km-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:#ecfdf3;color:#027a48;font-size:11px;font-weight:800;white-space:nowrap}
    .km-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
    .km-meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .km-meta{padding:14px;border:1px solid #eef0f5;border-radius:13px;background:#fcfcfe;min-width:0}
    .km-meta span{display:block;font-size:11px;color:#8a94a6;margin-bottom:7px}.km-meta strong{font-size:14px;color:#202939;overflow-wrap:anywhere}
    .km-meta .km-order-number{color:#4f46e5;font-size:17px}
    .km-items{display:grid;gap:0}
    .km-item{display:flex;align-items:center;gap:15px;padding:16px 0;border-bottom:1px solid #edf0f5}
    .km-item:first-child{padding-top:0}.km-item:last-child{border-bottom:0;padding-bottom:0}
    .km-product-icon{width:64px;height:64px;flex-shrink:0;display:grid;place-items:center;border-radius:15px;background:linear-gradient(135deg,#f1f5f9,#eef2ff);font-size:27px}
    .km-item-info{min-width:0;flex:1}.km-item-info strong{font-size:14px;color:#202939;display:block;line-height:1.45}.km-item-info p{margin:6px 0 0;color:#7b8495;font-size:12px}
    .km-item-price{font-size:14px;color:#111827;white-space:nowrap}
    .km-address-icon{width:42px;height:42px;flex-shrink:0;display:grid;place-items:center;background:#eef2ff;color:#4f46e5;border-radius:13px;font-size:20px}
    .km-address{display:flex;gap:13px}.km-address-content{font-size:13px;color:#687386;line-height:1.85;overflow-wrap:anywhere}.km-address-content strong{display:block;color:#202939;font-size:14px;margin-bottom:2px}.km-address-content p{margin:0}
    .km-address-tag{display:inline-block;margin-top:10px;background:#f3f4f6;color:#667085;border-radius:7px;padding:4px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
    .km-summary-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;color:#667085;font-size:13px}.km-summary-row strong{color:#344054;font-weight:700;text-align:right}
    .km-summary-divider{border:0;border-top:1px dashed #e3e7ef;margin:8px 0}
    .km-summary-total{display:flex;justify-content:space-between;align-items:center;gap:10px;padding-top:15px}.km-summary-total span{font-size:14px;font-weight:800;color:#202939}.km-summary-total strong{font-size:24px;letter-spacing:-.7px;color:#4f46e5}
    .km-payment-note{margin-top:17px;padding:11px 12px;border-radius:11px;background:#f0fdf4;color:#15803d;font-size:11px;line-height:1.5}
    .km-secure{margin-top:15px;text-align:center;color:#98a2b3;font-size:11px}
    .km-state{background:white;border:1px solid #e8ebf2;border-radius:18px;padding:35px 24px;text-align:center;color:#667085;box-shadow:0 5px 24px #10182808}
    .km-state h1{color:#111827;margin:0 0 10px;font-size:24px}.km-state p{font-size:14px;line-height:1.6}
    .km-footer{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;margin-top:25px;color:#98a2b3;font-size:11px}
    @media(max-width:760px){.km-order-page{padding:20px 13px 40px}.km-grid{grid-template-columns:1fr}.km-side-col{grid-row:auto}.km-card{padding:18px}.km-banner{padding:14px}.km-nav{align-items:flex-start}}
    @media(max-width:420px){.km-order-nav{align-items:flex-start}.km-brand{font-size:16px}.km-back{padding:9px 10px;font-size:12px}.km-meta-grid{grid-template-columns:1fr 1fr}.km-meta{padding:11px}.km-item{gap:10px}.km-product-icon{width:52px;height:52px}.km-item-price{font-size:12px}.km-summary-total strong{font-size:21px}}
  `;

  if (loading) return <><style>{styles}</style><main className="km-order-page"><div className="km-order-wrap"><div className="km-state" role="status"><div className="km-brand-mark" style={{margin:"0 auto 16px"}}>🛍</div><h1>Loading your order</h1><p>Getting your order and delivery details ready…</p></div></div></main></>;
  if (error) return <><style>{styles}</style><main className="km-order-page"><div className="km-order-wrap"><div className="km-state"><h1>We couldn't load this order</h1><p>{error}</p><Link className="km-back" to="/orders">← Back to My Orders</Link></div></div></main></>;
  if (!order) return <><style>{styles}</style><main className="km-order-page"><div className="km-order-wrap"><div className="km-state"><h1>Order not found</h1><p>We couldn't match order #{id} with the orders returned for your account. Open My Orders and select View Details.</p><Link className="km-back" to="/orders">← Back to My Orders</Link></div></div></main></>;

  const items = getItems(order);
  const address = getAddress(order);
  const total = Number(order?.totalAmount ?? order?.totalPrice ?? order?.total ?? order?.total_amount ??
    items.reduce((sum, item) => sum + (getItemPrice(item) ?? 0) * getQuantity(item), 0));
  const orderStatus = String(order?.orderStatus ?? order?.status ?? "CONFIRMED");
  const paymentStatus = String(order?.paymentStatus ?? "—");
  const statusComplete = /confirm|deliver|success|complete/i.test(orderStatus);
  const itemPriceDisplay = (item) => {
    let price = getItemPrice(item);
    if (price == null && items.length === 1 && total >= 0) price = total / Math.max(getQuantity(item), 1);
    return price;
  };

  return (
    <>
      <style>{styles}</style>
      <main className="km-order-page">
        <div className="km-order-wrap">
          <nav className="km-order-nav" aria-label="Order navigation">
            <div className="km-brand"><span className="km-brand-mark">K</span><span>KARTHIK <span style={{color:"#6366f1"}}>MART</span></span></div>
            <Link className="km-back" to="/orders">← My Orders</Link>
          </nav>

          <header className="km-heading">
            <p className="km-kicker">PURCHASE SUMMARY</p>
            <h1>Order details</h1>
            <p>Your order, payment, and delivery information — all in one place.</p>
          </header>

          <section className="km-banner">
            <div className="km-banner-icon">{statusComplete ? "✓" : "📦"}</div>
            <div><strong>{statusComplete ? "Your order is confirmed" : `Order status: ${orderStatus}`}</strong><p>Order #{getOrderId(order)} · Keep this page handy for your purchase details.</p></div>
            <span className="km-pill" style={{marginLeft:"auto"}}><span className="km-dot" />{orderStatus}</span>
          </section>

          <div className="km-grid">
            <div className="km-main-col">
              <section className="km-card">
                <div className="km-card-head"><div><h2>Items in this order</h2><p className="km-card-subtitle">{items.length} {items.length === 1 ? "product" : "products"} in your purchase</p></div><span style={{fontSize:22}}>🛍️</span></div>
                {items.length === 0 ? <p className="km-card-subtitle">Product details were not included in the order response.</p> :
                  <div className="km-items">{items.map((item, index) => {
                    const quantity = getQuantity(item);
                    const price = itemPriceDisplay(item);
                    const product = item?.product ?? {};
                    const image = product?.images?.[0] ?? product?.imageUrl ?? product?.image;
                    return <article className="km-item" key={item?.id ?? index}>
                      <div className="km-product-icon">{image ? <img src={image} alt={getProductName(item)} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:15}} /> : "📦"}</div>
                      <div className="km-item-info"><strong>{getProductName(item)}</strong><p>Quantity: {quantity} · {price == null ? "Price unavailable" : money(price) + " each"}</p></div>
                      <strong className="km-item-price">{price == null ? "—" : money(price * quantity)}</strong>
                    </article>;
                  })}</div>}
              </section>

              <section className="km-card">
                <div className="km-card-head"><div><h2>Delivery address</h2><p className="km-card-subtitle">Where your order is being sent</p></div><div className="km-address-icon">⌖</div></div>
                {address ? <div className="km-address"><div className="km-address-icon">⌂</div><div className="km-address-content"><strong>{address.name || "Recipient"}</strong>{address.address && <p>{address.address}</p>}{address.locality && <p>{address.locality}</p>}<p>{[address.city,address.state,address.zipcode ?? address.postalCode].filter(Boolean).join(", ")}</p>{address.country && <p>{address.country}</p>}{address.mobile && <p>Mobile: {address.mobile}</p>}<span className="km-address-tag">Shipping address</span></div></div> : <p className="km-card-subtitle">No shipping address was included for this order.</p>}
              </section>
            </div>

            <aside className="km-side-col">
              <section className="km-card">
                <div className="km-card-head"><div><h2>Order summary</h2><p className="km-card-subtitle">Reference #{getOrderId(order)}</p></div><span style={{fontSize:21}}>🧾</span></div>
                <div className="km-meta-grid">
                  <div className="km-meta"><span>Order status</span><strong>{orderStatus}</strong></div>
                  <div className="km-meta"><span>Payment status</span><strong style={{color:/success|paid/i.test(paymentStatus)?"#15803d":"#344054"}}>{paymentStatus}</strong></div>
                </div>
                <div style={{marginTop:15}}>
                  <div className="km-summary-row"><span>Items</span><strong>{items.reduce((sum,item)=>sum+getQuantity(item),0)} total</strong></div>
                  <div className="km-summary-row"><span>Payment method</span><strong>{order?.paymentMethod ?? order?.paymentDetails?.paymentMethod ?? "Not specified"}</strong></div>
                  <hr className="km-summary-divider" />
                  <div className="km-summary-total"><span>Total paid</span><strong>{money(total)}</strong></div>
                  {/success|paid/i.test(paymentStatus) && <div className="km-payment-note">✓ Payment successful. Your payment has been recorded for this order.</div>}
                  <p className="km-secure">🔒 Your order information is shown securely in your account.</p>
                </div>
              </section>
              <section className="km-card">
                <div className="km-card-head"><div><h2>Order information</h2><p className="km-card-subtitle">Keep this reference for support</p></div><span style={{fontSize:21}}>📋</span></div>
                <div className="km-summary-row"><span>Order ID</span><strong>#{getOrderId(order)}</strong></div>
                <div className="km-summary-row"><span>Order status</span><strong>{orderStatus}</strong></div>
                <div className="km-summary-row"><span>Payment status</span><strong>{paymentStatus}</strong></div>
              </section>
            </aside>
          </div>
          <footer className="km-footer"><span>© {new Date().getFullYear()} Karthik Mart</span><Link className="km-back" to="/orders">← Back to My Orders</Link></footer>
        </div>
      </main>
    </>
  );
}
