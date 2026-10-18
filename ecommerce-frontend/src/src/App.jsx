import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import Home from './Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Brands from './pages/Brands.jsx';
import './App.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';

function ProductDetailsRoute() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(
    location.state?.product || null
  );
  const [loading, setLoading] = useState(
    !location.state?.product
  );

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Product not found');
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  if (loading) {
    return (
      <main className="product-route-message">
        Loading product…
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-route-message">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </main>
    );
  }

  function addProductToCart(item) {
    try {
      const cart = JSON.parse(
        localStorage.getItem('karthikMartCart') || '[]'
      );

      const existing = cart.find(
        (cartItem) => String(cartItem.id) === String(item.id)
      );

      if (existing) {
        const stockAvailable =
          existing.stockAvailable ?? item.quantity ?? 0;

        if (existing.quantity < stockAvailable) {
          existing.quantity += 1;
        }
      } else {
        cart.push({
          ...item,
          stockAvailable: item.quantity,
          quantity: 1,
        });
      }

      localStorage.setItem(
        'karthikMartCart',
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error('Unable to update cart:', error);
    }

    navigate('/');
  }

  return (
    <ProductDetails
      product={product}
      onBack={() => navigate('/')}
      onAddToCart={addProductToCart}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route
        path="/products/:id"
        element={<ProductDetailsRoute />}
      />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
