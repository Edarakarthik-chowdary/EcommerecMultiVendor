import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BASE = "http://localhost:5454";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getOrderId = (order) =>
  order?.id ?? order?.orderId ?? order?.order_id ?? "—";

const getCustomer = (order) =>
  order?.user?.fullName ??
  order?.user?.name ??
  order?.user?.email ??
  order?.customerName ??
  order?.customer?.fullName ??
  "Customer";

const getOrderStatus = (order) =>
  order?.orderStatus ?? order?.status ?? "UNKNOWN";

const getPaymentStatus = (order) =>
  order?.paymentStatus ?? order?.payment_status ?? "UNKNOWN";

const getOrderTotal = (order) =>
  order?.totalAmount ?? order?.total_amount ?? order?.total ?? 0;

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const [productQuery, setProductQuery] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [notice, setNotice] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [savingBrand, setSavingBrand] = useState(false);
  const emptyBrandForm = { name: "", description: "", logoUrl: "", categoryIds: [] };
  const [brandForm, setBrandForm] = useState(emptyBrandForm);
  const emptyProductForm = {
    title: "", description: "", mrpPrice: "", sellingPrice: "",
    discountPercentage: "0", quantity: "0", color: "", categoryId: "", brandId: "", imageUrl: ""
  };
  const [productForm, setProductForm] = useState(emptyProductForm);

  const adminRequest = async (path, options = {}) => {
    const token = (localStorage.getItem("karthikMartToken") || "").replace(/^Bearer\\s+/i, "");
    if (!token) throw new Error("Your session is missing. Please sign in again.");
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try { message = JSON.parse(text).message || JSON.parse(text).error || text; } catch {}
      throw new Error(message || `Request failed (HTTP ${response.status})`);
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const resetProductForm = () => {
    setProductForm(emptyProductForm);
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const startProductEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      title: product.title || "",
      description: product.description || "",
      mrpPrice: product.mrpPrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      discountPercentage: product.discountPercentage ?? 0,
      quantity: product.quantity ?? 0,
      color: product.color || "",
      categoryId: product.category?.id ?? "",
      brandId: product.brand?.id ?? "",
      imageUrl: Array.isArray(product.images) ? (product.images.find(Boolean) || "") : (product.imageUrl || product.image || ""),
    });
    setShowProductForm(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    setNotice("");
    const mrpPrice = Number(productForm.mrpPrice);
    const sellingPrice = Number(productForm.sellingPrice);
    const quantity = Number(productForm.quantity);
    const discountPercentage = Number(productForm.discountPercentage || 0);

    if (!productForm.title.trim() || mrpPrice <= 0 || sellingPrice <= 0 ||
        sellingPrice > mrpPrice || quantity < 0 || discountPercentage < 0 || discountPercentage > 100) {
      setError("Check the required fields. Prices must be positive, selling price cannot exceed MRP, and stock/discount must be valid.");
      setSavingProduct(false);
      return;
    }

    const payload = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      mrpPrice,
      sellingPrice,
      discountPercentage,
      quantity,
      color: productForm.color.trim(),
      images: productForm.imageUrl.trim() ? [productForm.imageUrl.trim()] : [],
      ...(productForm.categoryId !== "" ? { category: { id: Number(productForm.categoryId) } } : {}),
      ...(productForm.brandId !== "" ? { brand: { id: Number(productForm.brandId) } } : {}),
    };

    try {
      if (editingProductId !== null) {
        await adminRequest(`/api/admin/products/${editingProductId}`, {
          method: "PUT", body: JSON.stringify(payload)
        });
        setNotice("Product updated successfully.");
      } else {
        await adminRequest("/api/admin/products", {
          method: "POST", body: JSON.stringify(payload)
        });
        setNotice("Product added successfully.");
      }
      resetProductForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.title || "this product"}"? This action cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setNotice(`"${product.title}" was deleted.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    if (!query) return true;
    return [product.title, product.id, product.category?.name]
      .some((value) => String(value ?? "").toLowerCase().includes(query));
  });

  const resetBrandForm = () => {
    setBrandForm(emptyBrandForm);
    setEditingBrandId(null);
    setShowBrandForm(false);
  };

  const startBrandEdit = (brand) => {
    setEditingBrandId(brand.id);
    setBrandForm({
      name: brand.name || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
      categoryIds: Array.isArray(brand.categories)
        ? brand.categories.map((category) => String(category.id))
        : [],
    });
    setShowBrandForm(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveBrand = async (event) => {
    event.preventDefault();
    setSavingBrand(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        name: brandForm.name.trim(),
        description: brandForm.description.trim(),
        logoUrl: brandForm.logoUrl.trim(),
        categories: brandForm.categoryIds.map((id) => ({ id: Number(id) })),
      };
      await adminRequest(
        editingBrandId !== null ? `/api/brands/${editingBrandId}` : "/api/brands",
        {
          method: editingBrandId !== null ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      setNotice(editingBrandId !== null ? "Brand updated successfully." : "Brand created successfully.");
      resetBrandForm();
      const response = await fetch(`${API_BASE}/api/brands`, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) setBrands(normalizeList(await response.json()));
    } catch (err) {
      setError(err.message || "Unable to save brand.");
    } finally {
      setSavingBrand(false);
    }
  };

  const deleteBrand = async (brand) => {
    if (!window.confirm(`Delete "${brand.name}"? Brands used by products cannot be deleted.`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(`/api/brands/${brand.id}`, { method: "DELETE" });
      setBrands((current) => current.filter((item) => item.id !== brand.id));
      setNotice(`"${brand.name}" was deleted.`);
    } catch (err) {
      setError(err.message || "Unable to delete brand.");
    }
  };

  const filteredBrands = brands.filter((brand) =>
    [brand.name, brand.description, brand.id, ...(Array.isArray(brand.categories) ? brand.categories.map(category => category.name) : [])]
      .some((value) => String(value ?? "").toLowerCase().includes(brandQuery.trim().toLowerCase()))
  );

  const loadDashboard = useCallback(async () => {
    const storedUser = localStorage.getItem("karthikMartUser");
    const storedToken = localStorage.getItem("karthikMartToken");

    if (!storedUser || !storedToken) {
      setError("Please log in with your administrator account.");
      setLoading(false);
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch {
      setError("Your saved login session is invalid. Please log in again.");
      setLoading(false);
      return;
    }

    const rawRole =
      user?.role ??
      user?.authorities?.[0]?.authority ??
      user?.authorities?.[0] ??
      "";

    const role = String(rawRole).replace(/^ROLE_/i, "").toUpperCase();

    if (role !== "ADMIN") {
      setError(
        "Admin access required. Please log in using an account with ROLE_ADMIN."
      );
      setLoading(false);
      return;
    }

    const token = storedToken.replace(/^Bearer\s+/i, "");

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    setLoading(true);
    setError("");

    try {
      const endpoints = [
        `${API_BASE}/api/admin/dashboard`,
        `${API_BASE}/api/admin/orders`,
        `${API_BASE}/api/admin/products`,
        `${API_BASE}/api/admin/users`,
      ];

      const responses = await Promise.all(
        endpoints.map((url) => fetch(url, { headers }))
      );

      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        if (failedResponse.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (failedResponse.status === 403) {
          throw new Error(
            "The backend denied administrator access. Verify your ROLE_ADMIN authority."
          );
        }

        throw new Error(
          `Backend request failed with HTTP ${failedResponse.status}.`
        );
      }

      const [dashboardData, orderData, productData, userData] =
        await Promise.all(responses.map((response) => response.json()));

      setStats(dashboardData ?? {});
      setOrders(normalizeList(orderData));
      setProducts(normalizeList(productData));
      setUsers(normalizeList(userData));

      // Brand/category loading is separate so an unavailable optional endpoint
      // does not prevent the main admin dashboard from loading.
      try {
        const brandResponse = await fetch(`${API_BASE}/api/brands`, {
          headers: { Accept: "application/json" },
        });
        if (brandResponse.ok) setBrands(normalizeList(await brandResponse.json()));
      } catch (brandError) {
        console.warn("Unable to load brands:", brandError);
      }

      try {
        const categoryResponse = await fetch(`${API_BASE}/api/categories`, { headers });
        if (categoryResponse.ok) setCategories(normalizeList(await categoryResponse.json()));
      } catch (categoryError) {
        console.warn("Unable to load categories:", categoryError);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const paidRevenue =
    stats?.paidRevenue ??
    orders
      .filter((order) => getPaymentStatus(order).toUpperCase() === "SUCCESS")
      .reduce((sum, order) => sum + Number(getOrderTotal(order) || 0), 0);

  const openOrders =
    stats?.openOrders ??
    orders.filter(
      (order) =>
        !["DELIVERED", "CANCELLED"].includes(
          getOrderStatus(order).toUpperCase()
        )
    ).length;

  const totalOrders = stats?.totalOrders ?? orders.length;
  const totalProducts = stats?.totalProducts ?? products.length;
  const totalUsers = stats?.totalUsers ?? users.length;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "orders", label: "Orders", icon: "▤" },
    { id: "products", label: "Products", icon: "◇" },
    { id: "brands", label: "Brands", icon: "✦" },
    { id: "customers", label: "Customers", icon: "♙" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("karthikMartUser");
    localStorage.removeItem("karthikMartToken");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-icon">K</span>
          <span>
            <strong>KARTHIK MART</strong>
            <small>ADMINISTRATION</small>
          </span>
        </Link>

        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div>
            <strong>Store Admin</strong>
            <span>Administrator</span>
          </div>
          <span className="admin-online-dot" />
        </div>

        <p className="admin-menu-heading">WORKSPACE</p>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-menu-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="admin-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeSection === item.id && (
                <span className="admin-menu-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-sidebar-link">
            <span>↗</span> Visit storefront
          </Link>

          <button
            type="button"
            className="admin-sidebar-link admin-logout"
            onClick={handleLogout}
          >
            <span>⇥</span> Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumb">Store / Administration</div>
            <h1>
              {menuItems.find((item) => item.id === activeSection)?.label ??
                "Dashboard"}
            </h1>
          </div>

          <div className="admin-top-actions">
            <span className="admin-live-status">
              <span /> Store overview
            </span>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        {error && (
          <section className="admin-error" role="alert">
            <div>
              <strong>Unable to load admin data</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={loadDashboard}>
              Try again
            </button>
          </section>
        )}

        {notice && <div className="admin-notice" role="status"><span>✓</span>{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>}

        {activeSection === "dashboard" && (
          <>
            <section className="admin-welcome">
              <div>
                <span className="admin-eyebrow">STORE OVERVIEW</span>
                <h2>Welcome to your dashboard 👋</h2>
                <p>
                  Monitor sales, orders, customers, and products in one place.
                </p>
              </div>

              <div className="admin-welcome-art">K</div>
            </section>

            <section className="admin-stats-grid">
              <article className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Paid revenue</span>
                  <span className="admin-stat-icon purple">₹</span>
                </div>
                <strong>{loading ? "—" : formatCurrency(paidRevenue)}</strong>
                <small>Successfully paid orders</small>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Total orders</span>
                  <span className="admin-stat-icon blue">▤</span>
                </div>
                <strong>{loading ? "—" : totalOrders}</strong>
                <small>Orders placed in your store</small>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Open orders</span>
                  <span className="admin-stat-icon orange">◷</span>
                </div>
                <strong>{loading ? "—" : openOrders}</strong>
                <small>Not delivered or cancelled</small>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Products</span>
                  <span className="admin-stat-icon green">◇</span>
                </div>
                <strong>{loading ? "—" : totalProducts}</strong>
                <small>Products in your catalogue</small>
              </article>

              <article className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Registered users</span>
                  <span className="admin-stat-icon pink">♙</span>
                </div>
                <strong>{loading ? "—" : totalUsers}</strong>
                <small>Accounts in your system</small>
              </article>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Recent orders</h2>
                  <p>Latest orders received by your store</p>
                </div>

                <button
                  className="admin-text-button"
                  onClick={() => setActiveSection("orders")}
                >
                  View all orders →
                </button>
              </div>

              <OrdersTable orders={orders.slice(0, 5)} loading={loading} />
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Product overview</h2>
                  <p>Products returned by your backend</p>
                </div>

                <button
                  className="admin-text-button"
                  onClick={() => setActiveSection("products")}
                >
                  View all products →
                </button>
              </div>

              <ProductsTable products={products.slice(0, 5)} loading={loading} />
            </section>
          </>
        )}

        {activeSection === "orders" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>All orders</h2>
                <p>Review order and payment status</p>
              </div>
            </div>
            <OrdersTable orders={orders} loading={loading} />
          </section>
        )}

        {activeSection === "products" && (
          <section className="admin-panel admin-products-panel">
            <div className="admin-panel-heading admin-products-heading">
              <div>
                <span className="admin-section-kicker">INVENTORY CONTROL</span>
                <h2>Product catalogue</h2>
                <p>Manage your products, prices, and available stock.</p>
              </div>
              <button type="button" className="admin-add-product-btn" onClick={() => {
                resetProductForm(); setShowProductForm(true); setError(""); setNotice("");
              }}>
                <span>＋</span> Add product
              </button>
            </div>

            {showProductForm && (
              <form className="admin-product-editor" onSubmit={saveProduct}>
                <div className="admin-editor-header">
                  <div className="admin-editor-icon">{editingProductId === null ? "＋" : "✎"}</div>
                  <div><h3>{editingProductId === null ? "Create a product" : `Edit product #${editingProductId}`}</h3>
                    <p>Fill in the details below. Fields marked * are required.</p></div>
                  <button type="button" className="admin-editor-close" onClick={resetProductForm} aria-label="Close form">×</button>
                </div>
                <div className="admin-editor-grid">
                  <label className="admin-field admin-field-wide">Product name *<input required maxLength={255} placeholder="e.g. Wireless Bluetooth Headphones" value={productForm.title} onChange={e=>setProductForm({...productForm,title:e.target.value})}/></label>
                  <label className="admin-field admin-field-wide">Description<textarea rows={3} maxLength={2000} placeholder="Describe the product and its key features..." value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/></label>
                  <label className="admin-field">MRP (₹) *<input type="number" min="0.01" step="0.01" required placeholder="999.00" value={productForm.mrpPrice} onChange={e=>setProductForm({...productForm,mrpPrice:e.target.value})}/></label>
                  <label className="admin-field">Selling price (₹) *<input type="number" min="0.01" step="0.01" required placeholder="799.00" value={productForm.sellingPrice} onChange={e=>setProductForm({...productForm,sellingPrice:e.target.value})}/></label>
                  <label className="admin-field">Discount (%)<input type="number" min="0" max="100" step="1" value={productForm.discountPercentage} onChange={e=>setProductForm({...productForm,discountPercentage:e.target.value})}/></label>
                  <label className="admin-field">Available stock *<input type="number" min="0" step="1" required value={productForm.quantity} onChange={e=>setProductForm({...productForm,quantity:e.target.value})}/></label>
                  <label className="admin-field">Color<input maxLength={100} placeholder="e.g. Midnight Black" value={productForm.color} onChange={e=>setProductForm({...productForm,color:e.target.value})}/></label>
                  <label className="admin-field">Category *
                    <select required value={productForm.categoryId} onChange={e => setProductForm({
                      ...productForm,
                      categoryId: e.target.value,
                      brandId: ""
                    })}>
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-field">Brand
                    <select value={productForm.brandId} onChange={e=>setProductForm({...productForm,brandId:e.target.value})}>
                      <option value="">No brand</option>
                      {brands
                        .filter(brand => !productForm.categoryId ||
                          !Array.isArray(brand.categories) ||
                          brand.categories.length === 0 ||
                          brand.categories.some(category => String(category.id) === String(productForm.categoryId)))
                        .map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>
                  </label>
                  <label className="admin-field admin-field-wide">Product image URL<input type="url" placeholder="https://example.com/product-image.jpg" value={productForm.imageUrl} onChange={e=>setProductForm({...productForm,imageUrl:e.target.value})}/></label>
                </div>
                {productForm.imageUrl && <div className="admin-image-preview"><img src={productForm.imageUrl} alt="Product preview" onError={e=>{e.currentTarget.style.display="none"}}/><span>Image preview</span></div>}
                <div className="admin-editor-actions">
                  <button type="button" className="admin-cancel-btn" onClick={resetProductForm}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={savingProduct}>{savingProduct ? <><span className="admin-button-spinner"/> Saving…</> : editingProductId === null ? "＋ Create product" : "✓ Save changes"}</button>
                </div>
              </form>
            )}

            <div className="admin-product-controls">
              <div className="admin-search-box"><span>⌕</span><input aria-label="Search products" placeholder="Search products by name, category or ID…" value={productQuery} onChange={e=>setProductQuery(e.target.value)}/>{productQuery && <button type="button" onClick={()=>setProductQuery("")}>Clear</button>}</div>
              <div className="admin-inventory-count"><span className="admin-count-dot"/><strong>{filteredProducts.length}</strong> of {products.length} products</div>
            </div>

            <div className="admin-table-wrapper admin-products-table-wrap">
              <table className="admin-table admin-products-table">
                <thead><tr><th>Product</th><th>Brand / Category</th><th>Pricing</th><th>Inventory</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const image = Array.isArray(product.images) ? product.images.find(Boolean) : (product.imageUrl || product.image);
                    const stock = Number(product.quantity ?? product.stock ?? 0);
                    return <tr key={product.id}>
                      <td><div className="admin-product-cell admin-product-detail">
                        {image ? <img src={image} alt={product.title || "Product"} onError={e=>{e.currentTarget.style.display="none"}}/> : <span className="admin-product-placeholder">◇</span>}
                        <div className="admin-product-name"><strong>{product.title || product.name || "Untitled product"}</strong><span>SKU · KM-{String(product.id).padStart(4,"0")}</span></div>
                      </div></td>
                      <td><div><strong>{product.brand?.name || "No brand"}</strong><br /><span className="admin-category-chip">{product.category?.name || (product.category?.id ? `Category #${product.category.id}` : "Uncategorized")}</span></div></td>
                      <td><div className="admin-price-stack"><strong>{formatCurrency(product.sellingPrice ?? product.price)}</strong>{product.mrpPrice != null && Number(product.mrpPrice) > Number(product.sellingPrice) && <span>{formatCurrency(product.mrpPrice)}</span>}</div></td>
                      <td><div className={`admin-stock-pill ${stock === 0 ? "out" : stock <= 5 ? "low" : "healthy"}`}><span/>{stock === 0 ? "Out of stock" : stock <= 5 ? `Low stock · ${stock}` : `${stock} in stock`}</div></td>
                      <td><div className="admin-product-actions"><button type="button" className="admin-edit-btn" onClick={()=>startProductEdit(product)}><span>✎</span> Edit</button><button type="button" className="admin-delete-btn" onClick={()=>deleteProduct(product)} aria-label={`Delete ${product.title}`}><span>⌫</span></button></div></td>
                    </tr>;
                  })}
                  {!loading && filteredProducts.length === 0 && <EmptyRow columns={5} message={productQuery ? "No products match your search." : "Your catalogue is empty. Add your first product to get started."}/>}
                  {loading && <EmptyRow columns={5} message="Loading your product catalogue…"/>}
                </tbody>
              </table>
            </div>
            <div className="admin-products-footnote"><span>🔒</span> Product changes are protected by administrator authentication.</div>
          </section>
        )}

        {activeSection === "brands" && (
          <section className="admin-panel admin-products-panel">
            <div className="admin-panel-heading admin-products-heading">
              <div>
                <span className="admin-section-kicker">CATALOGUE CONFIGURATION</span>
                <h2>Brand management</h2>
                <p>Create and maintain brands, logos, and supported categories.</p>
              </div>
              <button
                type="button"
                className="admin-add-product-btn"
                onClick={() => {
                  resetBrandForm();
                  setShowBrandForm(true);
                  setError("");
                  setNotice("");
                }}
              >
                <span>＋</span> Add brand
              </button>
            </div>

            {showBrandForm && (
              <form className="admin-product-editor" onSubmit={saveBrand}>
                <div className="admin-editor-header">
                  <div className="admin-editor-icon">{editingBrandId === null ? "＋" : "✎"}</div>
                  <div>
                    <h3>{editingBrandId === null ? "Create a brand" : `Edit brand #${editingBrandId}`}</h3>
                    <p>Enter a unique brand name and optional logo URL.</p>
                  </div>
                  <button type="button" className="admin-editor-close" onClick={resetBrandForm} aria-label="Close form">×</button>
                </div>
                <div className="admin-editor-grid">
                  <label className="admin-field">Brand name *
                    <input required maxLength={100} value={brandForm.name}
                      onChange={(event) => setBrandForm({ ...brandForm, name: event.target.value })}
                      placeholder="e.g. Samsung" />
                  </label>
                  <label className="admin-field">Logo URL
                    <input type="url" maxLength={1000} value={brandForm.logoUrl}
                      onChange={(event) => setBrandForm({ ...brandForm, logoUrl: event.target.value })}
                      placeholder="https://example.com/logo.png" />
                  </label>
                  <label className="admin-field admin-field-wide">Description
                    <textarea rows={3} maxLength={500} value={brandForm.description}
                      onChange={(event) => setBrandForm({ ...brandForm, description: event.target.value })}
                      placeholder="Short brand description" />
                  </label>
                  <fieldset className="admin-field admin-field-wide" style={{ border: "1px solid #e5e9f0", borderRadius: 10, padding: 14 }}>
                    <legend>Categories</legend>
                    {categories.length === 0 ? (
                      <p style={{ margin: 0 }}>No categories returned by /api/categories. You can save the brand without categories.</p>
                    ) : (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {categories.map((category) => (
                          <label key={category.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <input
                              type="checkbox"
                              checked={brandForm.categoryIds.includes(String(category.id))}
                              onChange={(event) => setBrandForm({
                                ...brandForm,
                                categoryIds: event.target.checked
                                  ? [...brandForm.categoryIds, String(category.id)]
                                  : brandForm.categoryIds.filter((id) => id !== String(category.id)),
                              })}
                            />
                            {category.name || `Category #${category.id}`}
                          </label>
                        ))}
                      </div>
                    )}
                  </fieldset>
                </div>
                {brandForm.logoUrl && (
                  <div className="admin-image-preview">
                    <img src={brandForm.logoUrl} alt="Brand logo preview"
                      onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <span>Logo preview</span>
                  </div>
                )}
                <div className="admin-editor-actions">
                  <button type="button" className="admin-cancel-btn" onClick={resetBrandForm}>Cancel</button>
                  <button type="submit" className="admin-save-btn" disabled={savingBrand}>
                    {savingBrand ? "Saving…" : editingBrandId === null ? "＋ Create brand" : "✓ Save changes"}
                  </button>
                </div>
              </form>
            )}

            <div className="admin-product-controls">
              <div className="admin-search-box">
                <span>⌕</span>
                <input aria-label="Search brands" placeholder="Search brands by name or description…"
                  value={brandQuery} onChange={(event) => setBrandQuery(event.target.value)} />
                {brandQuery && <button type="button" onClick={() => setBrandQuery("")}>Clear</button>}
              </div>
              <div className="admin-inventory-count"><span className="admin-count-dot" /><strong>{filteredBrands.length}</strong> brands</div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>Brand</th><th>Description</th><th>Categories</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredBrands.map((brand) => (
                    <tr key={brand.id}>
                      <td>
                        <div className="admin-product-cell">
                          {brand.logoUrl
                            ? <img src={brand.logoUrl} alt={`${brand.name} logo`} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                            : <span className="admin-product-placeholder">✦</span>}
                          <div><strong>{brand.name}</strong><small style={{ display: "block" }}>Brand #{brand.id}</small></div>
                        </div>
                      </td>
                      <td>{brand.description || "—"}</td>
                      <td>{Array.isArray(brand.categories) && brand.categories.length
                        ? brand.categories.map((category) => category.name || `#${category.id}`).join(", ")
                        : "None assigned"}</td>
                      <td>
                        <div className="admin-product-actions">
                          <button type="button" className="admin-edit-btn" onClick={() => startBrandEdit(brand)}>✎ Edit</button>
                          <button type="button" className="admin-delete-btn" onClick={() => deleteBrand(brand)} aria-label={`Delete ${brand.name}`}>⌫</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredBrands.length === 0 && <EmptyRow columns={4} message={brandQuery ? "No brands match your search." : "No brands yet. Add your first brand to get started."} />}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "customers" && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Registered users</h2>
                <p>Accounts returned by the backend</p>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id ?? user.email}>
                      <td>#{user.id ?? "—"}</td>
                      <td>{user.fullName ?? user.name ?? "—"}</td>
                      <td>{user.email ?? "—"}</td>
                      <td>
                        <span className="admin-badge neutral">
                          {String(user.role ?? "USER").replace("ROLE_", "")}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!loading && users.length === 0 && (
                    <EmptyRow columns={4} message="No users found." />
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} Karthik Mart</span>
          <span>Store administration</span>
        </footer>
      </main>
    </div>
  );
}

function OrdersTable({ orders, loading }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Order status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={getOrderId(order)}>
              <td>
                <strong>#{getOrderId(order)}</strong>
              </td>
              <td>{getCustomer(order)}</td>
              <td>{formatCurrency(getOrderTotal(order))}</td>
              <td>
                <StatusBadge status={getPaymentStatus(order)} />
              </td>
              <td>
                <StatusBadge status={getOrderStatus(order)} />
              </td>
            </tr>
          ))}

          {!loading && orders.length === 0 && (
            <EmptyRow columns={5} message="No orders found." />
          )}

          {loading && (
            <EmptyRow columns={5} message="Loading orders..." />
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProductsTable({ products, loading }) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="admin-product-cell">
                  {(product.images?.find(Boolean) || product.imageUrl || product.image) ? (
                    <img
                      src={product.images?.find(Boolean) || product.imageUrl || product.image}
                      alt={product.title ?? product.name ?? "Product"}
                    />
                  ) : (
                    <span className="admin-product-placeholder">◇</span>
                  )}

                  <strong>{product.title ?? product.name ?? "Product"}</strong>
                </div>
              </td>
              <td>
                {product.category?.name ??
                  product.category ??
                  "Uncategorized"}
              </td>
              <td>
                {formatCurrency(product.sellingPrice ?? product.price)}
              </td>
              <td>{product.quantity ?? product.stock ?? "—"}</td>
            </tr>
          ))}

          {!loading && products.length === 0 && (
            <EmptyRow columns={4} message="No products found." />
          )}

          {loading && (
            <EmptyRow columns={4} message="Loading products..." />
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status ?? "UNKNOWN").toUpperCase();
  let style = "neutral";

  if (["SUCCESS", "CONFIRMED", "DELIVERED", "PAID"].includes(normalized)) {
    style = "success";
  } else if (
    ["PENDING", "PROCESSING", "SHIPPED", "CREATED"].includes(normalized)
  ) {
    style = "warning";
  } else if (["FAILED", "CANCELLED", "REFUNDED"].includes(normalized)) {
    style = "danger";
  }

  return (
    <span className={`admin-badge ${style}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function EmptyRow({ columns, message }) {
  return (
    <tr>
      <td colSpan={columns} className="admin-empty-cell">
        {message}
      </td>
    </tr>
  );
}

export default AdminDashboard;