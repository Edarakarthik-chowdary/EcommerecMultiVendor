const productImages = {
    "Samsung Galaxy Smartphone":
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85",
    "Wireless Bluetooth Headphones":
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
    "Men Casual T-Shirt":
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
    "Kitchen Storage Container Set":
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85",
    "Daily Skin Care Cream":
        "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85",
    "Fitness Yoga Mat":
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=85",
    "Wireless Gaming Mouse":
        "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=85",
    "Mechanical Gaming Keyboard":
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85",
    "USB-C Fast Charger":
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=85",
    "Laptop Backpack":
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",
    "Smart LED Desk Lamp":
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85",
    "Men's Casual T-Shirt":
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
    "Running Shoes":
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
    "Stainless Steel Water Bottle":
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85",
};

function ProductCard({ product, onAddToCart }) {
    const imageUrl =
        product.images?.find((item) => typeof item === "string" && item.trim()) ||
        product.imageUrl ||
        product.image ||
        productImages[product.title] ||
        "https://placehold.co/600x400/f1f5f9/475569?text=Karthik+Mart";

    const categoryName =
        product.category?.name || "Uncategorized";

    const sellingPrice = Number(product.sellingPrice);
    const mrpPrice = Number(product.mrpPrice);
    const quantity = Number(product.quantity) || 0;
    const discount = Number(product.discountPercentage) || 0;
    const ratingCount = Number(product.numRatings) || 0;

    return (
        <article className="product-card">
            <div className="product-image">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                                "https://placehold.co/600x400/f1f5f9/475569?text=Image+Unavailable";
                        }}
                    />
                ) : (
                    <div className="no-image">
                        No image available
                    </div>
                )}

                {discount > 0 && (
                    <span className="discount-badge">
                        {discount}% OFF
                    </span>
                )}
            </div>

            <div className="product-info">
                <p className="product-category">
                    {categoryName}
                </p>

                <h3>{product.title}</h3>

                <div className="product-rating">
                    {ratingCount > 0 ? (
                        <>
                            <span>⭐</span>
                            <span>{ratingCount} ratings</span>
                        </>
                    ) : (
                        <span>No ratings yet</span>
                    )}
                </div>

                <div className="product-prices">
                    <span className="selling-price">
                        ₹{sellingPrice.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}
                    </span>

                    {mrpPrice > sellingPrice && (
                        <span className="mrp-price">
                            ₹{mrpPrice.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </span>
                    )}

                    {discount > 0 && (
                        <span className="discount-text">
                            {discount}% off
                        </span>
                    )}
                </div>

                <p className="product-stock">
                    {quantity > 0
                        ? "In stock"
                        : "Out of stock"}
                </p>

                <button
                    type="button"
                    disabled={quantity <= 0}
                    onClick={() => onAddToCart(product)}
                >
                    {quantity > 0
                        ? "+ Add to cart"
                        : "Out of Stock"}
                </button>
            </div>
        </article>
    );
}

export default ProductCard;