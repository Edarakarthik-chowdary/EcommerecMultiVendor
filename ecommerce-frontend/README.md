# Karthik Mart — E-commerce Frontend

A responsive React + Vite storefront for a Spring Boot multivendor e-commerce application.

## Features

- Responsive storefront homepage
- Product listing from the Spring Boot backend
- Product images based on product titles
- Product search and category filtering
- Sorting by price and discount
- Product favorites interface
- Shopping cart interface with quantity controls
- Indian Rupee (INR) price formatting
- Sample products when the backend is unavailable

## Technologies

- React
- Vite
- JavaScript
- CSS
- Spring Boot REST API
- MySQL

## Run Locally

### 1. Install Node.js

Install a supported Node.js LTS version.

### 2. Open the project folder

Open a terminal in the frontend project directory.

### 3. Install dependencies

```bash
npm install
```

### 4. Configure the backend URL (optional)

If your backend runs on a different URL, copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:5454
```

The default backend URL is:

```text
http://localhost:5454
```

### 5. Start the development server

```bash
npm run dev
```

Open the URL printed by Vite. It is usually:

http://localhost:5173

## Backend Connection

The frontend requests products from:

```http
GET http://localhost:5454/api/products
```

The backend should return product data in a JSON format compatible with the frontend normalization logic in `src/App.jsx`.

If the backend is unavailable, the frontend displays sample preview products.

### CORS Configuration

Configure your Spring Boot backend to allow requests from:

```text
http://localhost:5173
```

For production, configure CORS for your actual frontend domain.

## Important Notes

This project is a frontend starter connected to a Spring Boot backend.

The following features still require backend integration:

- User registration and login
- Order creation
- Payment processing
- Persistent shopping cart
- Persistent favorites
- Newsletter subscriptions

The current cart interface does not create actual orders or process payments.

Implement appropriate backend validation, authentication, and authorization before using these features in production.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the application for production.

```bash
npm run lint
```

Runs the configured Oxlint checks.

```bash
npm run preview
```

Previews the production build locally.

## Project Structure

```text
ecommerce-frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── .env.example
└── README.md
```

## Project Status

The frontend storefront is connected to the Spring Boot product API.

Additional backend integration is required to complete the multivendor e-commerce workflow.