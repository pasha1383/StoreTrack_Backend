🚀 StoreTrack Backend API
Welcome to the StoreTrack backend! This is a modern inventory and order management system built with NestJS, TypeORM, and MySQL. The API provides a robust and secure way to manage products, process orders, and track business insights.

✨ Features
User Authentication: Secure login and registration with JWT.

Product Management: Full CRUD operations for products, including detailed filtering and sorting.

Order Processing: Create new orders, manage order statuses, and automatically update stock.

Transaction History: Detailed history for every product's stock movement.

Reporting: Generate valuable sales and low-stock reports.

Automated Alerts: Receive email notifications for low-stock products via a scheduled cron job.

Scalability: Containerized with Docker for easy deployment and consistent environments.

🛠️ Tech Stack
Backend: NestJS

Database: MySQL

ORM: TypeORM

Containerization: Docker, Docker Compose

Email Service: Nodemailer

Task Scheduling: @nestjs/schedule

🚀 Getting Started
Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js (version 18 or higher)

Docker Desktop

Setup
Clone the repository.

git clone https://github.com/your-username/store-track-backend.git
cd store-track-backend

Create a .env file in the root directory and add your configuration.

DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=storetrack_db

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
JWT_SECRET=your_secret_key

Note: Make sure to replace the placeholder values with your actual credentials.

Start the application using Docker Compose. This command will build the backend image and start the MySQL database.

docker-compose up

The application will be accessible at http://localhost:3000.

🗺️ API Endpoints
All endpoints are protected and require a valid JWT access token in the Authorization: Bearer <token> header, unless specified otherwise.

Authentication
Method

Endpoint

Description

POST

/auth/register

Register a new user

POST

/auth/login

Log in and receive a JWT token

Products
Method

Endpoint

Description

GET

/products

Get a list of all products with optional filters.

GET

/products?search=<term>

Search products by name or category.

GET

/products?sort=newest

Get products sorted by newest first.

GET

/products?sort=price_desc

Get products sorted from most expensive to cheapest.

GET

/products?sort=price_asc

Get products sorted from cheapest to most expensive.

GET

/products/:id

Get a single product by ID.

POST

/products

Create a new product.

PUT

/products/:id

Update a product by ID.

DELETE

/products/:id

Delete a product by ID.

GET

/products/:id/history

Get the transaction history for a specific product.

Orders
Method

Endpoint

Description

POST

/orders

Create a new order.

GET

/orders

Get all orders with optional filters.

GET

/orders?search=<term>

Filter orders by product name.

GET

/orders?startDate=<date>&endDate=<date>

Filter orders by a date range (YYYY-MM-DD).

PATCH

/orders/:id/status

Update the status of an order.

Reports
Method

Endpoint

Description

GET

/reports/sales

Get a sales report.

GET

/reports/low-stock

Get a list of products with low stock.

