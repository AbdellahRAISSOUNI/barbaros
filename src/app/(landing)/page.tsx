import Link from 'next/link';
import { FaCalendarAlt, FaUserClock, FaUsers, FaMobileAlt } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">Barbaros</div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100">Login</Link>
            <Link href="/register" className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Modern Barbershop Management System
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your barbershop operations with our all-in-one appointment booking and client management system.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register" className="px-8 py-3 rounded-md bg-black text-white text-center hover:bg-gray-800">
                  Get Started
                </Link>
                <Link href="#how-it-works" className="px-8 py-3 rounded-md border border-gray-300 text-gray-700 text-center hover:bg-gray-50">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div 
                  className="rounded-md w-full bg-gray-200 flex items-center justify-center"
                  style={{ height: '300px' }}
                >
                  <p className="text-gray-500">Barbershop Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-gray-700 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book appointments online and manage your schedule efficiently.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaUserClock className="text-gray-700 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Queue Management</h3>
              <p className="text-gray-600">Reduce wait times with our virtual queue system.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-gray-700 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-gray-600">Keep track of client preferences and history.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaMobileAlt className="text-gray-700 text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">Access from any device with our responsive design.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create an account as a barber or client.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Book or Manage</h3>
              <p className="text-gray-600">Schedule appointments or manage your barbershop.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Enjoy the Service</h3>
              <p className="text-gray-600">Get notified when it's your turn and enjoy a great haircut.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Barbershop?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of barbershops that have streamlined their operations with Barbaros.</p>
          <Link href="/register" className="px-8 py-3 rounded-md bg-white text-black font-medium hover:bg-gray-100 inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Barbaros</h3>
              <p className="text-gray-400">Modern barbershop management system for the digital age.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">Email: info@barbaros.com</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Barbaros. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 