# PICT Lost and Found System

A full-stack web application for managing lost and found items at PICT (Pune Institute of Computer Technology). This system allows students to report lost items, claim found items, and enables admins to manage requests efficiently.

## Features

### User Features
- 🔐 User authentication (Register/Login)
- 📝 Report lost or found items
- 🔍 Browse and search items by category
- 📧 Email notifications for item matches
- 📊 Personal dashboard to track reports
- 🎨 Dark/Light theme support
- 📱 Responsive design

### Admin Features
- ✅ Approve/Reject item reports
- 👥 User management
- 📈 Analytics dashboard
- 🔔 Email notification system
- 📋 Request management

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Context API for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email notifications
- Multer for file uploads

## Prerequisites

Before running this project, make sure you have:
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/anujop07/pict-lost-found.git
cd pict-lost-found
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

# Email Configuration (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run dev
```

2. Start the frontend (in a new terminal):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Mode

```bash
npm run build
npm start
```

## Project Structure

```
pict-lost-found/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # Context providers
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── utils/             # Utility functions
├── uploads/               # Uploaded images
├── .env.example          # Environment variables template
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items
- `GET /api/items` - Get all approved items
- `POST /api/items` - Report new item
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Admin
- `GET /api/admin/requests` - Get pending requests
- `PUT /api/admin/requests/:id/approve` - Approve request
- `PUT /api/admin/requests/:id/reject` - Reject request
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/my-reports` - Get user's reports

## Environment Variables

See `.env.example` for all required environment variables.

## Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

See `EMAIL_SETUP.md` for detailed instructions.

## Default Admin Account

After seeding, you can create an admin account:
```bash
node server/utils/createAdmin.js
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Your Name - anujop07
Project Link: [https://github.com/anujop07/pict-lost-found](https://github.com/anujop07/pict-lost-found)

## Acknowledgments

- PICT (Pune Institute of Computer Technology)
- React.js community
- Express.js community
