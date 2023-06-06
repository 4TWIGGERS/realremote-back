# Realremote Backend

Welcome to the Realremote Backend repository! This repository contains the codebase for the backend of the Realremote website, available at [https://www.realremote.io](https://www.realremote.io). Realremote is a platform dedicated to curating and showcasing hand-picked remote job opportunities across various industries.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

The Realremote Backend provides the following features:

- **API Endpoints:** The backend exposes various API endpoints to interact with the Realremote platform, such as retrieving job listings, creating user accounts, saving job listings, and more.
- **Database Integration:** We utilized MongoDB, a popular NoSQL database, to store and manage job listings, user information, and other relevant data.

## Getting Started

To set up the Realremote Backend repository locally, follow these steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/your-username/realremote-backend.git
   ```

2. **Navigate to the project directory:**
   ```
   cd realremote-backend
   ```

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Start the development server:**
   ```
   npm start
   ```

   The backend server will be running at [http://localhost:3000](http://localhost:3000), ready to handle requests from the Realremote Frontend.

## Dependencies

The Realremote Backend has the following dependencies:

- [Node.js](https://nodejs.org): A JavaScript runtime environment
- [Express.js](https://expressjs.com): A fast and minimalist web framework for Node.js
- [MongoDB](https://www.mongodb.com): A NoSQL document database

Make sure you have these dependencies installed and properly configured before running the backend.

## Configuration

The Realremote Backend requires some configuration to run properly. Here are the steps to set up the configuration:

1. Create a `.env` file in the root directory of the backend project.
2. Inside the `.env` file, specify the following environment variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/realremote
   JWT_SECRET=your-secret-key
   HOST=localhost:
   PORT=PORT
   SENDGRID_API_KEY="SENDGRID API KEY"
   MONGODB_URI="MONGODBURI"
   ```

   Adjust the values according to your desired configuration.

3. Save the `.env` file.

Please note that the `MONGODB_URI` variable should point to your MongoDB instance.

## Contributing

We welcome contributions to improve the Realremote Backend repository. To contribute, please follow these steps:

1. Fork the repository from the [Realremote Backend GitHub page](https://github.com/your-username/realremote-backend).
2. Create a new branch with a descriptive name for your feature or bug fix.
3. Make the necessary changes
