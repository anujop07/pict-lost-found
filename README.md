# PICT Lost and Found System

A full-stack web application for managing lost and found items at PICT. Students can report lost/found items, claim items, and admins can manage the entire system.

## Features

- 🔐 User authentication & authorization
- 📝 Report lost or found items with images
- 🔍 Search and filter items by category
- 📧 Email notifications for matching items
- 👨‍💼 Admin dashboard for approvals
- 📊 Analytics and  reporting
- 🎨 Dark/Light theme

## Tech Stack

**Frontend:** React, Tailwind CSS  
**Backend:** Node.js, Express, MongoDB  
**Auth:** JWT  
**Email:** Nodemailer

## Quick Start

```bash
# Clone repository
git clone https://github.com/anujop07/pict-lost-found.git
cd pict-lost-found

# Install dependencies
npm install
cd client && npm install && cd ..

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials

# Run development servers
npm run dev          # Backend (port 5000)
cd client && npm start  # Frontend (port 3000)
```

## Environment Variables

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── uploads/         # Image uploads
```

## License

MIT License

## Contact

GitHub: [@anujop07](https://github.com/anujop07)
