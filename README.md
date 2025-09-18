# Vikas - Offline-First Micro-Learning Platform

Vikas is a lightweight, offline-first learning platform designed for low-bandwidth environments. It combines the content delivery approach of Kolibri with the engaging progression system of Duolingo, enabling institutions to deliver interactive educational content even in areas with poor internet connectivity.

## 🌟 Key Features

### 🎯 Core Functionality
- **Offline-First Architecture**: Full functionality without internet connection
- **Audio-First Content**: Optimized for voice-based learning with optional transcripts
- **Progressive Web App (PWA)**: Installable on any device with service worker caching
- **Adaptive Learning Engine**: Duolingo-style skill trees with XP and mastery levels
- **Spaced Repetition**: Intelligent review scheduling for better retention

### 📱 Multi-Role Interface
- **Student Dashboard**: Skill tree navigation, lesson playback, progress tracking
- **Teacher Portal**: Content creation, audio recording, course management
- **Admin Panel**: System monitoring, channel import/export, user management

### 🔄 Sync & Distribution
- **PouchDB/CouchDB Replication**: Bidirectional sync when connectivity available
- **Channel-Based Content**: Zip archive distribution with manifest versioning
- **Sneakernet Support**: USB-based content import/export
- **Delta Updates**: Incremental content updates to minimize bandwidth usage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for full setup)
- Modern web browser with PWA support

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd vikas
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Start backend services (in separate terminal):**
```bash
cd server
npm install
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### Docker Deployment

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Access services:**
- Application: http://localhost
- API: http://localhost:3001
- CouchDB: http://localhost:5984

### Raspberry Pi Setup

Run the automated setup script on a fresh Raspberry Pi OS installation:

```bash
curl -sSL https://raw.githubusercontent.com/your-repo/vikas/main/scripts/setup-pi.sh | bash
```

This will:
- Install Docker and dependencies
- Set up WiFi hotspot (SSID: Vikas-Learning)
- Configure automatic startup
- Provide admin tools

## 📊 Demo Users

The platform includes pre-configured demo accounts:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Student | demo_student | demo123 | Course access, progress tracking |
| Teacher | demo_teacher | demo123 | Content creation, course management |
| Admin | demo_admin | demo123 | Full system administration |

## 🎓 Sample Content

The platform includes a sample "Fluid Mechanics Fundamentals" course with:
- 2 audio-first lessons with transcripts
- Interactive quizzes (MCQ and multi-select)
- Progress tracking and XP system
- Offline playback capability

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **PouchDB** for offline-first data storage
- **Vite** for fast development and building
- **PWA** with Workbox service worker

### Backend Stack
- **Node.js + Express** REST API
- **CouchDB** for sync-capable database
- **Multer** for file uploads
- **JWT** for authentication
- **Docker** for containerization

### Data Model

```typescript
// Core entities with PouchDB compatibility
interface Course {
  _id: string;
  title: string;
  description: string;
  channel_id: string;
  version: string;
}

interface Lesson {
  _id: string;
  module_id: string;
  title: string;
  type: 'audio' | 'video' | 'text';
  content_ref: string;
  transcript?: string;
  duration?: number;
}

interface ProgressEvent {
  _id: string;
  user_id: string;
  lesson_id: string;
  status: 'started' | 'completed';
  score?: number;
  timestamp: string;
}
```

## 📦 Content Management

### Channel Structure

Channels are distributed as ZIP files with this structure:
```
channel.zip
├── manifest.json          # Metadata and resource list
├── audio/
│   ├── lesson1.mp3
│   └── lesson2.mp3
├── video/
│   └── intro.mp4
└── exercises/
    └── quiz1.json
```

### Manifest Format

```json
{
  "channel_id": "vikas-physics-101",
  "version": "1.0.3", 
  "title": "Physics Fundamentals",
  "created_at": "2025-01-01T00:00:00Z",
  "resources": [
    {
      "id": "res1",
      "type": "audio",
      "path": "audio/lesson1.mp3",
      "sha256": "abc123...",
      "size": 2048000
    }
  ]
}
```

## 🔧 API Reference

### Course Management
```bash
GET    /api/v1/courses              # List all courses
POST   /api/v1/courses              # Create new course
GET    /api/v1/lessons/:moduleId    # Get lessons by module
```

### Content Upload
```bash
POST   /api/v1/upload/audio         # Upload audio file
POST   /api/v1/import-channel       # Import channel ZIP
GET    /api/v1/export-channel/:id   # Export course as ZIP
```

### Progress Tracking
```bash
POST   /api/v1/progress            # Record learning event
GET    /api/v1/progress/:userId    # Get user progress
```

### Sync Operations
```bash
POST   /api/v1/sync               # Trigger manual sync
```

## 📱 PWA Features

The application includes full PWA capabilities:

- **Offline Support**: Service worker caches app shell and content
- **Install Prompt**: Add to home screen functionality  
- **Background Sync**: Queues actions when offline
- **Push Notifications**: Learning reminders (configurable)
- **Media Caching**: Automatic caching of audio/video content

### PWA Manifest
- Standalone display mode
- Portrait orientation
- Themed status bars
- App shortcuts for quick access

## 🔒 Security & Privacy

### Authentication
- Local account system with bcrypt password hashing
- Role-based access control (Student/Teacher/Admin)
- Session management with secure tokens

### Data Protection  
- Minimal PII collection
- Local-first data storage
- Optional central sync (user controlled)
- HTTPS-only communication for sync

### Content Integrity
- SHA256 checksums for all content files
- Manifest validation on import
- Conflict resolution for sync operations

## 📈 Performance Optimizations

### Bandwidth Efficiency
- Audio-first content (smaller than video)
- Delta updates for content changes
- Gzip compression for all transfers
- Progressive download with resume capability

### Storage Management
- Configurable disk usage limits
- Automatic cleanup of old content
- Smart prefetching based on usage patterns
- IndexedDB for efficient local storage

### Device Compatibility
- Responsive design (mobile-first)
- Low-resource operation
- Graceful degradation for older devices
- Battery usage optimization

## 🌍 Localization

The platform supports internationalization through i18next:

```typescript
// Add new language support
const i18n = {
  en: { welcome: "Welcome to Vikas" },
  hi: { welcome: "विकास में आपका स्वागत है" },
  // Add more languages...
};
```

Currently supported:
- English (en) - Default
- Hindi (hi) - Partial
- Extensible for additional languages

## 🧪 Testing

### Running Tests
```bash
npm test                 # Frontend tests
cd server && npm test    # Backend tests
```

### Test Coverage
- Unit tests for core components
- API endpoint testing
- PWA functionality testing
- Offline behavior validation

## 🚀 Deployment Options

### Local Server (Raspberry Pi)
Perfect for classroom or community center deployment:
- WiFi hotspot capability
- 50-200 concurrent users
- USB content import/export
- Local admin interface

### Cloud Deployment
For larger scale or multi-site deployments:
- Docker Swarm or Kubernetes
- Central content distribution
- Federated authentication
- Analytics and reporting

### Hybrid Setup
Combine both approaches:
- Central content management
- Local edge servers for delivery
- Automatic content synchronization
- Regional customization support

## 📋 Administration

### Raspberry Pi Admin Commands

```bash
vikas start              # Start the platform
vikas stop               # Stop the platform  
vikas restart            # Restart services
vikas logs               # View system logs
vikas status             # Check service status
vikas update             # Update to latest version
vikas backup             # Create data backup
vikas import content.zip # Import new content
```

### Content Management

1. **Creating Courses**: Use teacher interface or API
2. **Recording Audio**: Built-in web-based recorder
3. **Adding Exercises**: JSON-based exercise definitions
4. **Managing Users**: Role assignment and group management
5. **Monitoring Progress**: Real-time analytics dashboard

## 🔮 Roadmap

### Phase 2 Enhancements
- [ ] H5P interactive content support
- [ ] Automatic speech recognition (ASR)
- [ ] Advanced analytics dashboard
- [ ] Gamification features (leaderboards, achievements)
- [ ] Peer-to-peer content sharing

### Phase 3 Extensions
- [ ] Mobile app (React Native)
- [ ] Advanced authoring tools
- [ ] Machine learning recommendations
- [ ] Multi-tenant architecture
- [ ] Integration APIs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain offline-first architecture
- Write tests for new features
- Update documentation
- Consider low-bandwidth impact

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Community**: Join our learning platform community

## 🏆 Acknowledgments

- Inspired by Kolibri's offline-first approach
- Learning progression inspired by Duolingo
- Built for educators in resource-constrained environments
- Designed with accessibility and inclusion in mind

---

**Vikas** (विकास) means "development" or "growth" in Sanskrit - reflecting our mission to enable learning and development everywhere, regardless of connectivity constraints.