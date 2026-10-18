# E-commerce Multi-Vendor Application

A full-stack e-commerce application designed to support online shopping and multi-vendor product management.

The project combines a React frontend with a Java Spring Boot backend and a MySQL database.

## Overview

This application demonstrates full-stack development using modern frontend technologies, Java backend development, and relational database integration.

## Technology Stack

### Frontend

* React
* JavaScript
* HTML5
* CSS3
* Vite

### Backend

* Java
* Spring Boot
* Spring MVC
* Spring Data JPA
* REST APIs

### Database

* MySQL

### Development Tools

* Git
* GitHub
* Maven
* IntelliJ IDEA
* Visual Studio Code

## Application Features

Document the features implemented and tested in your application.

Potential feature categories include:

* User registration and authentication
* Product listing and product details
* Product search and filtering
* Shopping cart management
* Order management
* Vendor product management
* Administrative product management
* Customer order history

Only claim features that are implemented and working in your application.

## Project Structure

```text
EcommerceMultiVendor/
├── ecommerce-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── src/
│   └── main/
│       ├── java/
│       └── resources/
├── pom.xml
└── README.md
```

The exact structure may vary depending on your current project files.

## Prerequisites

Install the following:

* Java Development Kit (JDK)
* Node.js and npm
* MySQL Server
* Maven

## Running the Application

### 1. Clone the repository

```bash
git clone https://github.com/Edarakarthik-chowdary/EcommerceMultiVendor.git
```

```bash
cd EcommerceMultiVendor
```

### 2. Configure MySQL

Create a database for the application.

Configure the database connection in your local application configuration.

Do not commit database passwords or other sensitive credentials to GitHub.

### 3. Start the Spring Boot backend

From the directory containing `pom.xml`, run:

```bash
mvn spring-boot:run
```

### 4. Start the React frontend

Open a new terminal:

```bash
cd ecommerce-frontend
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

Ensure that the frontend API configuration points to the running backend.

## Future Improvements

* Add automated unit and integration tests.
* Improve error handling and input validation.
* Add API documentation.
* Configure continuous integration using GitHub Actions.
* Deploy the frontend and backend.
* Improve application security and performance.

## Author

**Karthik Edara**

GitHub: https://github.com/Edarakarthik-chowdary
