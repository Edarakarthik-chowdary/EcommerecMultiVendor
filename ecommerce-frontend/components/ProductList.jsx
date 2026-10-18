import { useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";
import ProductCard from "./ProductCard";

function ProductList({ onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadProducts() {
            setLoading(true);
            setError("");

            try {
                const data = await getAllProducts();

                if (isMounted) {
                    setProducts(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "An unexpected error occurred."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <section className="products-section" aria-live="polite">
                <p>Loading products...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="products-section" role="alert">
                <p>Unable to load products: {error}</p>
                <p>
                    Check that the Spring Boot backend is running on port 5454,
                    then refresh the page.
                </p>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="products-section">
                <p>No products available yet.</p>
            </section>
        );
    }

    return (
        <section className="products-section">
            <div className="section-heading">
                <p className="section-label">OUR COLLECTION</p>
                <h2>Discover your favorites</h2>
                <p>Thoughtfully selected products for everyday life.</p>
            </div>

            <div className="products-grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </section>
    );
}

export default ProductList;
