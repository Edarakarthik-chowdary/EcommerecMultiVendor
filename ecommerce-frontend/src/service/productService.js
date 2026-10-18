const API_URL = "http://localhost:5454/api/products";

export async function getAllProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
}

export async function getProductById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return response.json();
}