import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRightCircle, ChevronLeft, ChevronRight, School, GraduationCap, Video, Menu, X } from 'lucide-react';
import DemoAccess from './DemoAccess';

const testimonials = [
  {
    name: 'Aarav S.',
    quote: 'Vikas turned my commute into productive learning time. The audio-first lessons are brilliant!',
  },
  {
    name: 'Priya K.',
    quote: 'As a teacher I can create micro-courses in minutes and track student progress even offline.',
  },
  {
    name: 'Dr. Mehta',
    quote: 'The adaptive engine tailors content perfectly for my postgraduate students.',
  },
];

export default function LandingPage() {
  useEffect(() => {
    AOS.init({ once: true, duration: 800, offset: 80 });
  }, []);

  const [index, setIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const next = () => setIndex((index + 1) % testimonials.length);
  const prev = () => setIndex((index - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* NAV */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
            <BookOpen size={28} /> <span>Vikas</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/about" className="hover:text-blue-600">About</Link>
            
            {/* Login Dropdown */}
            <div className="relative group">
              <button className="hover:text-blue-600 flex items-center space-x-1">
                <span>Login</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="/user-login" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg">
                  Student/Teacher Login
                </Link>
                <Link to="/college-login" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg">
                  College Admin Login
                </Link>
              </div>
            </div>

            <Link to="/register-user" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1">
              <span>Join Free</span>
              <ArrowRightCircle size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Link 
                to="/about" 
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Login Options:</p>
                <Link 
                  to="/user-login" 
                  className="block text-gray-700 hover:text-blue-600 py-2 pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Student/Teacher Login
                </Link>
                <Link 
                  to="/college-login" 
                  className="block text-gray-700 hover:text-blue-600 py-2 pl-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  College Admin Login
                </Link>
              </div>
              <Link 
                to="/register-user" 
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden text-white py-28 md:py-36" data-aos="fade-up">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
          <svg className="absolute inset-x-0 bottom-0 -mb-20 w-full opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,96L60,112C120,128,240,160,360,176C480,192,600,192,720,202.7C840,213,960,235,1080,240C1200,245,1320,235,1380,229.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
        </div>

        <div className="container mx-auto px-6 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Built for low-bandwidth colleges • Works offline-first
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
            Modern Learning Platform for <span className="underline decoration-wavy decoration-yellow-400">Colleges</span>
          </h1>
          <p className="text-lg md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto">
            Live slides, interactive assessments, and classroom collaboration that stay smooth on slow internet — so every campus can teach without limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register-college" className="inline-block px-8 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300">
              Register Your College
            </Link>
            <Link to="/college-login" className="inline-block px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:bg-emerald-600">
              College Admin Login
            </Link>
            <Link to="/register-user" className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:bg-gray-100">
              Join as Teacher/Student
            </Link>
          </div>
          <div className="mt-8 text-sm text-white/90">No credit card • Instant setup • Supabase-powered</div>
        </div>
      </section>

      {/* TRUST / STATS BAND */}
      <section className="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
        <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">10x</div>
            <div className="text-gray-600 text-sm">Lower bandwidth than video</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">100%</div>
            <div className="text-gray-600 text-sm">Works offline-first</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">Minutes</div>
            <div className="text-gray-600 text-sm">Setup for new colleges</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900">Zero</div>
            <div className="text-gray-600 text-sm">Cost to get started</div>
          </div>
        </div>
      </section>

      {/* DEMO ACCESS */}
      <section className="container mx-auto px-6 py-20">
        <div>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your college will receive a unique college code</li>
              <li>• Teachers and students can register using this code</li>
              <li>• You'll have access to the college dashboard</li>
              <li>• Start creating classrooms and managing lectures</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Quick Demo Access</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button 
                onClick={() => {
                  import('../lib/demo-data').then(({ loginAsDemoUser }) => {
                    loginAsDemoUser('college');
                    window.location.href = '/college-dashboard';
                  });
                }}
                className="text-left p-2 bg-white rounded border hover:bg-green-50"
              >
                <strong>College Admin:</strong> admin@demo.college / demo123
              </button>
              <button 
                onClick={() => {
                  import('../lib/demo-data').then(({ loginAsDemoUser }) => {
                    loginAsDemoUser('teacher');
                    window.location.href = '/classrooms';
                  });
                }}
                className="text-left p-2 bg-white rounded border hover:bg-green-50"
              >
                <strong>Teacher:</strong> teacher@demo.college / demo123
              </button>
              <button 
                onClick={() => {
                  import('../lib/demo-data').then(({ loginAsDemoUser }) => {
                    loginAsDemoUser('student');
                    window.location.href = '/classrooms';
                  });
                }}
                className="text-left p-2 bg-white rounded border hover:bg-green-50"
              >
                <strong>Student:</strong> student@demo.college / demo123
              </button>
            </div>
          </div>
        </div>
        <DemoAccess />
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Complete Educational Solution</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Everything you need to run classes, engage students, and track progress — with a design that holds up in real-world network conditions.</p>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition" data-aos="zoom-in" data-aos-delay="100">
            <School size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">College Management</h3>
            <p className="text-gray-600 text-sm">Complete dashboard for managing teachers, students, and classrooms with unique college codes.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition" data-aos="zoom-in" data-aos-delay="200">
            <Video size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Live Slides + Voice</h3>
            <p className="text-gray-600 text-sm">Teacher-controlled slides instead of screen share. 10× less data. Real-time sync across all students.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition" data-aos="zoom-in" data-aos-delay="300">
            <GraduationCap size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Interactive Learning</h3>
            <p className="text-gray-600 text-sm">Create assignments, quizzes, polls, and enable group chat for collaborative learning.</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Ready to modernize your college?</h3>
              <p className="text-white/90">Launch live slides, assignments, and classroom tools in minutes. Works even on slow networks.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/register-college" className="px-5 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg hover:bg-yellow-300">Register College</Link>
              <Link to="/register-user" className="px-5 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100">Join as Teacher/Student</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6 max-w-xl text-center relative">
          <h2 className="text-3xl font-bold mb-8">Learners love Vikas</h2>

          <div className="bg-white rounded-xl shadow p-10" data-aos="fade-up">
            <p className="text-lg italic mb-4">“{testimonials[index].quote}”</p>
            <p className="font-semibold text-blue-600">— {testimonials[index].name}</p>
          </div>

          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white shadow rounded-full hover:bg-blue-50">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white shadow rounded-full hover:bg-blue-50">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-blue-900 text-gray-200 py-8">
        <div className="container mx-auto px-6 text-center text-sm space-y-3">
          <p>© {new Date().getFullYear()} Vikas Learning. All rights reserved.</p>
          <div className="space-x-4">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/user-login" className="hover:underline">Student/Teacher Login</Link>
            <Link to="/college-login" className="hover:underline">College Login</Link>
            <Link to="/register-user" className="hover:underline">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
