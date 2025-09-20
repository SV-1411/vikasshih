# Educational Platform - Google Classroom Alternative

A comprehensive educational platform designed for colleges, teachers, and students with features similar to Google Classroom, optimized for low bandwidth rural colleges.

## 🎯 Key Features

### College Management
- **College Registration**: Colleges can register and get unique college codes
- **College Dashboard**: Complete overview of teachers, students, classrooms, and live lectures
- **User Management**: Track all teachers and students associated with the college

### User System
- **Role-based Access**: Students, Teachers, and College Admins
- **College Code Registration**: Users register using their college's unique code
- **Profile Management**: Complete user profiles with contact information

### Classroom System
- **Create Classrooms**: Teachers can create classrooms with unique join codes
- **Join Classrooms**: Students use classroom codes to join
- **Multi-classroom Support**: Teachers can manage multiple classrooms, students can join multiple ones
- **Classroom Dashboard**: Complete overview of assignments, quizzes, polls, and members

### Interactive Features
- **Assignments**: Create, submit, and grade assignments with file uploads
- **Quizzes**: Interactive quizzes with multiple question types (MCQ, multi-select, true/false, short answer)
- **Polls**: Real-time polls with anonymous voting options
- **Group Chat**: Classroom-based messaging for discussions and doubts
- **Notifications**: Real-time notifications for all activities

### Live Lectures
- **Voice-only Lectures**: Optimized for low bandwidth rural areas
- **College-wide Broadcasting**: Lectures can be broadcast to entire college
- **Attendance Tracking**: Automatic attendance recording
- **Recording Support**: Optional lecture recording for later access

### Low Bandwidth Optimization
- **Voice-only Communication**: Reduces bandwidth requirements
- **Efficient Data Transfer**: Optimized API calls and data structures
- **Offline Capability**: Core features work offline with sync when online
- **Progressive Loading**: Load content as needed

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── CollegeRegistration.tsx      # College registration form
│   ├── CollegeDashboard.tsx         # College admin dashboard
│   ├── UserRegistration.tsx         # Teacher/Student registration
│   ├── ClassroomDashboard.tsx       # Main classroom interface
│   ├── ClassroomDetails.tsx         # Individual classroom view
│   ├── CreateClassroomModal.tsx     # Classroom creation modal
│   └── JoinClassroomModal.tsx       # Classroom joining modal
├── lib/
│   ├── educational-api.ts           # API functions for all features
│   └── supabase.ts                  # Supabase client configuration
└── types/
    └── index.ts                     # TypeScript type definitions
```

### Backend (Express.js + Supabase)
```
server/
└── index.js                        # Express server with educational API endpoints

supabase/
└── migrations/
    └── 20250918170000_educational_platform.sql  # Database schema
```

### Database Schema (Supabase PostgreSQL)
- **colleges**: College information and codes
- **profiles**: Extended user profiles with college association
- **classrooms**: Classroom data with unique codes
- **classroom_members**: Student enrollment in classrooms
- **assignments**: Assignment management
- **assignment_submissions**: Student submissions and grading
- **quizzes**: Quiz creation and management
- **quiz_attempts**: Student quiz attempts and scores
- **polls**: Real-time polling system
- **poll_responses**: Poll voting data
- **live_lectures**: Live lecture scheduling and management
- **lecture_attendees**: Attendance tracking
- **classroom_chat**: Group messaging system
- **notifications**: Real-time notification system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account and project
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
- Create a new Supabase project
- Run the migration files in `supabase/migrations/`
- Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Start the backend server**
```bash
cd server
npm install
npm start
```

## 📱 User Flows

### College Registration Flow
1. College admin visits `/register-college`
2. Fills college information and admin details
3. System generates unique college code (e.g., COL-ABC123)
4. Admin account is created and college dashboard is accessible

### Teacher/Student Registration Flow
1. User visits `/register-user`
2. Selects role (Teacher/Student)
3. Enters college code to associate with college
4. Completes registration with personal details
5. Gets access to classroom dashboard

### Classroom Creation Flow (Teachers)
1. Teacher clicks "Create Classroom"
2. Fills classroom details (name, subject, description)
3. System generates unique classroom code (e.g., CLS-XYZ789)
4. Classroom is ready for student enrollment

### Classroom Joining Flow (Students)
1. Student clicks "Join Classroom"
2. Enters classroom code provided by teacher
3. Gets enrolled and gains access to classroom content

### Live Lecture Flow
1. Teacher schedules a lecture in classroom
2. Lecture appears on college dashboard (for college-wide access)
3. Teacher starts lecture (status changes to "live")
4. Students join via voice-only connection
5. Attendance is automatically tracked
6. Teacher ends lecture and optional recording is saved

## 🔧 API Endpoints

### College Management
- `POST /api/v1/colleges` - Register new college
- `GET /api/v1/colleges/:code` - Get college by code

### User Management
- `POST /api/v1/profiles` - Create user profile
- `GET /api/v1/profiles/:id` - Get user profile

### Classroom Management
- `POST /api/v1/classrooms` - Create classroom
- `GET /api/v1/classrooms/:code` - Get classroom by code
- `GET /api/v1/classrooms/user/:userId` - Get user's classrooms
- `POST /api/v1/classroom-members` - Join classroom
- `GET /api/v1/classroom-members/:classroomId` - Get classroom members

### Assignments
- `POST /api/v1/assignments` - Create assignment
- `GET /api/v1/assignments/classroom/:classroomId` - Get classroom assignments

### Quizzes
- `POST /api/v1/quizzes` - Create quiz
- `GET /api/v1/quizzes/classroom/:classroomId` - Get classroom quizzes

### Polls
- `POST /api/v1/polls` - Create poll
- `GET /api/v1/polls/classroom/:classroomId` - Get classroom polls

### Live Lectures
- `POST /api/v1/lectures` - Create/schedule lecture
- `GET /api/v1/lectures/college/:collegeId` - Get college lectures

### Chat
- `POST /api/v1/chat` - Send message
- `GET /api/v1/chat/:classroomId` - Get classroom messages

## 🎨 UI/UX Features

### Modern Design
- Clean, intuitive interface
- Responsive design for all devices
- Consistent color scheme and typography
- Loading states and error handling

### Accessibility
- Screen reader friendly
- Keyboard navigation support
- High contrast mode support
- Clear visual hierarchy

### User Experience
- Minimal clicks to perform actions
- Clear navigation and breadcrumbs
- Real-time updates and notifications
- Offline-first approach with sync

## 🔒 Security Features

### Authentication & Authorization
- Supabase Auth integration
- Role-based access control (RLS)
- JWT token-based authentication
- Secure password requirements

### Data Protection
- Row Level Security (RLS) policies
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Privacy
- Anonymous polling options
- Private classroom discussions
- Secure file uploads
- GDPR compliance ready

## 🌐 Deployment

### Frontend Deployment
- Build optimized production bundle
- Deploy to Vercel, Netlify, or similar
- Configure environment variables

### Backend Deployment
- Deploy Express server to Railway, Heroku, or similar
- Configure production database
- Set up file storage for uploads

### Database Setup
- Run Supabase migrations
- Configure RLS policies
- Set up database backups

## 🔮 Future Enhancements

### Planned Features
- **Video Lectures**: Optional video support for better connectivity areas
- **Mobile Apps**: Native iOS and Android applications
- **Advanced Analytics**: Detailed learning analytics and reports
- **Integration APIs**: Connect with existing college management systems
- **Multi-language Support**: Support for regional languages
- **Offline Sync**: Enhanced offline capabilities with conflict resolution

### Scalability Improvements
- **Microservices Architecture**: Break down into smaller services
- **CDN Integration**: Faster content delivery
- **Caching Layer**: Redis for improved performance
- **Load Balancing**: Handle increased user load

## 📊 Technical Specifications

### Performance Targets
- **Page Load Time**: < 2 seconds on 3G connection
- **Voice Latency**: < 200ms for live lectures
- **Concurrent Users**: Support 1000+ simultaneous users per college
- **Uptime**: 99.9% availability

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Android Chrome 90+
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@educational-platform.com
- Documentation: [docs.educational-platform.com]

---

**Built with ❤️ for educational institutions worldwide, especially rural colleges with limited bandwidth.**
