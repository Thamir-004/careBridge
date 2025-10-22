🏥 CareBridge – Global Hospital Connectivity Platform

Connect hospitals, transfer patients, and access medical reports seamlessly across the world.

📖 Table of Contents

About the Project

Problem Statement

Solution Overview

Tech Stack

Features

System Architecture

Installation Guide

Usage

API Endpoints

Future Enhancements

Folder Structure

Contributing

License

Author

💡 About the Project

CareBridge is a MERN-based health-tech web application designed to create a digital bridge between hospitals globally.
It allows healthcare institutions to securely share patient data, transfer requests, and reports without endless phone calls or paperwork.

The system enables:

Real-time patient transfer between hospitals.

Instant access to medical records and reports.

Secure, cloud-based data management.

🚨 Problem Statement

Currently, hospitals face:

Difficulty in sharing patient information during transfers.

Paper-based or manual data exchange.

Communication delays during emergencies.

Lack of unified digital infrastructure for hospital interoperability.

These challenges can cost time and lives in critical cases.

💊 Solution Overview

CareBridge solves this by offering:

A centralized digital platform for hospital-to-hospital communication.

Secure patient record management with authentication.

Real-time patient transfer requests and tracking.

Cloud-based medical report sharing and access.

🧠 Tech Stack
Layer	Technology	Description
Frontend	React.js, Tailwind CSS / MUI	Interactive hospital dashboard
Backend	Node.js, Express.js	RESTful APIs & authentication
Database	MongoDB Atlas	Stores hospital and patient data
Authentication	JWT + bcrypt	Secure hospital login
File Handling (optional)	Multer, Cloudinary / AWS S3	Upload & store patient reports
Real-Time Updates (optional)	Socket.IO	Live notifications for transfer requests
✨ Features

✅ Hospital Registration & Login
✅ Add / View / Update / Delete Patient Records
✅ Search Patients by Hospital
✅ Transfer Request System (optional feature)
✅ Medical Report Upload
✅ Analytics Dashboard for Hospital Activity
✅ Role-based Access (Admin, Doctor, Nurse)

🏗️ System Architecture
graph TD
    A[Frontend - React] -->|Axios API Calls| B[Backend - Express.js]
    B --> C[MongoDB Atlas Database]
    B --> D[Authentication - JWT]
    B --> E[File Storage - Cloudinary / GridFS]

⚙️ Installation Guide
1️⃣ Clone the Repository
git clone https://github.com/yourusername/carebridge.git
cd carebridge

2️⃣ Setup Backend
cd backend
npm install


Create .env file:

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/carebridge
JWT_SECRET=your_secret_key
PORT=5000


Run the backend:

npm start


Server runs on: http://localhost:5000

3️⃣ Setup Frontend
cd ../frontend
npm install
npm start


Frontend runs on: http://localhost:3000

🧭 Usage
➕ Add a Patient

Navigate to the “Add Patient” form.

Fill details → click “Submit”.

Patient gets stored in MongoDB.

📋 View Patients

The dashboard lists all patients.

You can update or delete records.

🔌 API Endpoints (Sample)
Method	Endpoint	Description
POST	/api/register	Register hospital
POST	/api/login	Hospital login
GET	/api/patients	Get all patients
POST	/api/patients	Add new patient
PUT	/api/patients/:id	Update patient
DELETE	/api/patients/:id	Delete patient

Example patient document:

{
  "name": "John Doe",
  "age": 34,
  "hospital": "Nairobi General",
  "medicalHistory": ["Diabetes", "Hypertension"]
}

🚀 Future Enhancements

🌐 Real-time hospital communication (Socket.IO).

📎 Upload & share diagnostic reports.

🌍 International hospital directory.

🧠 AI health data insights (predictive analysis).

🔐 Role-based dashboard analytics.

🗂️ Folder Structure
carebridge/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
│
└── README.md

🤝 Contributing

Fork the repository.

Create a new branch: git checkout -b feature-name.

Commit changes: git commit -m 'Add new feature'.

Push: git push origin feature-name.

Open a Pull Request.

🧾 License

This project is licensed under the MIT License — feel free to use and modify for educational or professional use.

👨‍💻 Author

Thamir Khalid
Abubakr Parvez
