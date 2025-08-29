# Heart Burner 💖

**MVP Scheduling App for Therapists**

Heart Burner is a modern scheduling application designed specifically for psychologists and therapists to manage their sessions with patients. Built with React, TypeScript, and Firebase Realtime Database.

## 🌟 Features

### For Therapists:
- **📅 Calendar Management**: Daily, weekly, and monthly views
- **🔗 Booking Links**: Generate unique shareable booking links
- **👥 Patient Management**: Track one-time and recurring patients
- **⚡ Real-time Updates**: Live synchronization with Firebase
- **🎯 Smart Scheduling**: Automatic recurring appointment generation
- **📊 Analytics Dashboard**: Patient statistics and booking metrics

### For Patients:
- **🌐 Public Booking**: Book appointments via shared links
- **🔄 Flexible Options**: Choose between one-time or recurring sessions
- **📱 Mobile Friendly**: Responsive design for all devices
- **✅ Instant Confirmation**: Real-time booking confirmation

### Upcoming Integrations:
- **📬 Google Calendar**: Two-way synchronization
- **📞 Google Meet**: Automatic video link generation  
- **📧 Email Notifications**: Automated confirmations
- **📋 Calendly Integration**: Connect existing Calendly workflows

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Firebase Realtime Database
- **Authentication**: Google OAuth2
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jancidakis/heart-burner.git
   cd heart-burner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication (Google provider)
   - Enable Realtime Database
   - Copy your config to `.env`:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_DATABASE_URL=your_database_url
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase Rules**
   - Copy the rules from `firebase-rules.txt` to your Firebase console

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── calendar/       # Calendar views and scheduling
│   ├── appointments/   # Appointment management
│   └── booking/        # Public booking system
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── services/           # Firebase service layer
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## 🔐 Firebase Security Rules

The application uses comprehensive security rules to ensure data privacy:
- Each therapist can only access their own data
- Public booking links work without authentication
- Patient data is protected and isolated by therapist

## 🚦 Usage

### For Therapists:
1. **Sign up** with Google account
2. **Complete profile** setup (working hours, specialization)
3. **Share booking link** with patients
4. **Manage appointments** from the dashboard
5. **Approve/reject** booking requests

### For Patients:
1. **Click therapist's booking link**
2. **Select available time slot**
3. **Choose appointment type** (one-time or recurring)
4. **Fill contact information**
5. **Receive confirmation** email

## 🔮 Roadmap

- [ ] Google Calendar integration
- [ ] Email notifications system
- [ ] Payment processing
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@heartburner.app or create an issue in this repository.

## 🙏 Acknowledgments

- Built with ❤️ for mental health professionals
- Powered by Firebase and modern web technologies
- Icons by Lucide React

---

**Made with 🔥 by the Heart Burner team**
