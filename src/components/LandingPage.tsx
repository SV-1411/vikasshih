import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Globe, Users2, ArrowRightCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
          <div className="hidden md:flex space-x-8 text-sm font-medium">
            <Link to="/about" className="hover:text-blue-600">About</Link>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1">
              <span>Join Free</span>
              <ArrowRightCircle size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-32 md:py-40 min-h-[80vh] flex items-center" data-aos="fade-up">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-8 drop-shadow-lg">
            Learn anywhere, even <span className="underline decoration-wavy decoration-yellow-400">offline</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
            Bite-sized audio lessons, adaptive paths and seamless sync when you get back online.
          </p>
          <Link to="/signup" className="inline-block px-8 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300">
            Start Learning Now
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Vikas?</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition" data-aos="zoom-in" data-aos-delay="200">
            <Headphones size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Audio-first Micro-Lessons</h3>
            <p className="text-gray-600 text-sm">Learn hands-free during your commute or workout.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition" data-aos="zoom-in" data-aos-delay="200">
            <Globe size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Offline-First Sync</h3>
            <p className="text-gray-600 text-sm">No internet? Keep learning; progress syncs automatically later.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition" data-aos="zoom-in" data-aos-delay="200">
            <Users2 size={40} className="mx-auto text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Adaptive Pathways</h3>
            <p className="text-gray-600 text-sm">Content adjusts to your pace &amp; performance for maximal retention.</p>
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
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
