# NivasAI Frontend

React + TypeScript + Vite frontend for the NivasAI civic housing platform targeting urban India.

## Overview

NivasAI is a comprehensive civic technology platform that connects citizens with municipal services, provides AI-powered infrastructure analysis, and facilitates affordable housing matching through PMAY schemes.

## Features

- 🏠 **Housing Match**: PMAY housing unit matching with eligibility verification
- 🗺️ **Slum Planner**: AI-powered infrastructure analysis using satellite imagery
- 📝 **Complaints**: File and track civic complaints with real-time updates
- 📊 **Analytics**: Real-time dashboards for officers and administrators
- 📱 **Mobile-first**: Responsive design optimized for Indian users
- 🌐 **Bilingual**: English and Hindi language support

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Maps**: Google Maps API integration
- **Authentication**: Firebase Auth (Phone OTP)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Real-time**: Firebase Realtime Database
- **Notifications**: Firebase Cloud Messaging
- **AI**: Google Gemini API integration
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project configuration

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/nivasai-frontend.git
cd nivasai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Firebase:
- Create a Firebase project at https://console.firebase.google.com
- Enable Authentication (Phone), Firestore, Storage, and Realtime Database
- Copy your Firebase config to `.env.local`

5. Start development server:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

### Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Gemini AI API
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Project Structure

```
nivasai-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, mock data
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   ├── map/          # Map components
│   │   ├── slum-planner/ # Ward analysis components
│   │   ├── complaints/   # Complaint management
│   │   ├── housing/      # Housing matching
│   │   └── shared/       # Shared UI components
│   ├── config/           # Firebase and API configuration
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── router/           # Route configuration
│   ├── services/         # API service layer
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Key Components

### Authentication
- Phone OTP authentication using Firebase Auth
- Role-based access control (Resident, Officer, Admin)
- Protected routes with role validation

### Housing Match
- Family profile creation and management
- PMAY eligibility checking
- Housing unit matching algorithm
- Document upload and verification

### Slum Planner
- Ward selection and boundary visualization
- Satellite imagery analysis integration
- Infrastructure scoring dashboard
- Upgrade project suggestions

### Complaints
- Complaint filing with photo upload
- Real-time status tracking
- Category-based routing
- Location-based filtering

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

### Code Style

- TypeScript strict mode enabled
- ESLint with React rules
- Prettier for code formatting
- Conventional commits for git messages

### Testing

- Unit tests with Vitest
- Component tests with React Testing Library
- Coverage reporting with v8
- Test utilities for Firebase mocking

## Deployment

### Firebase Hosting

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation for API changes
- Use semantic versioning for releases

## Performance

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Service worker for offline support
- Bundle analysis and optimization

## Accessibility

- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility
- WCAG 2.1 AA compliance

## Security

- Input validation with Zod
- XSS protection with content security policy
- Secure Firebase configuration
- Environment variable protection

## Support

For support, please contact:
- Email: support@nivasai.org
- GitHub Issues: https://github.com/your-org/nivasai-frontend/issues
- Documentation: https://docs.nivasai.org

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
