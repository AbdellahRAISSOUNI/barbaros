import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUserClock, FaUsers, FaMobileAlt, FaClock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800 hover:text-black transition-colors duration-200">
            <Link href="/">Barbaros</Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">How It Works</Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
          </nav>
          <div className="flex space-x-4">
            <Link 
              href="/reservations/new" 
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Book Now
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 flex-1 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Modern Barbershop Management System
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your barbershop operations with our all-in-one appointment booking and client management system.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/reservations/new" 
                  className="group px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <FaCalendarAlt className="inline-block mr-2" />
                  Make Reservation
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link 
                  href="/register" 
                  className="px-8 py-4 rounded-lg bg-black text-white text-center hover:bg-gray-800 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
              
              {/* Quick Reservation CTA */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100 transform hover:scale-102 transition-all duration-200">
                <div className="flex items-center text-blue-800">
                  <FaClock className="mr-2 text-xl" />
                  <span className="font-medium text-lg">Need a quick appointment?</span>
                </div>
                <p className="text-blue-600 mt-2">
                  Book your slot in under 30 seconds - no account required!
                </p>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                <div 
                  className="rounded-xl w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden"
                  style={{ height: '400px' }}
                >
                  {/* Replace with your actual hero image */}
                  <Image
                    src="/images/hero-image.jpg"
                    alt="Barbershop Management"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full rounded-xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Book With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaCheckCircle,
                title: 'Instant Confirmation',
                description: 'Get immediate confirmation and we\'ll call you to finalize details.',
                color: 'green'
              },
              {
                icon: FaClock,
                title: 'Flexible Scheduling',
                description: 'Choose your preferred time and date that works best for you.',
                color: 'blue'
              },
              {
                icon: FaUsers,
                title: 'Expert Barbers',
                description: 'Professional barbers ready to give you the perfect cut.',
                color: 'purple'
              }
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="card hover:scale-105 transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <benefit.icon className={`text-${benefit.color}-600 text-2xl`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center">{benefit.title}</h3>
                <p className="text-gray-600 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaCalendarAlt,
                title: 'Easy Scheduling',
                description: 'Book appointments online and manage your schedule efficiently.',
                color: 'blue'
              },
              {
                icon: FaUserClock,
                title: 'Queue Management',
                description: 'Reduce wait times with our virtual queue system.',
                color: 'green'
              },
              {
                icon: FaUsers,
                title: 'Client Management',
                description: 'Keep track of client preferences and history.',
                color: 'purple'
              },
              {
                icon: FaMobileAlt,
                title: 'Mobile Friendly',
                description: 'Access from any device with our responsive design.',
                color: 'orange'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="card hover:scale-105 transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-full flex items-center justify-center mb-4`}>
                  <feature.icon className={`text-${feature.color}-700 text-xl`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Choose Your Time',
                description: 'Pick your preferred date and time from available slots.'
              },
              {
                step: 2,
                title: 'Get Confirmation',
                description: 'Receive instant confirmation and a call from our team.'
              },
              {
                step: 3,
                title: 'Enjoy Your Cut',
                description: 'Arrive on time and enjoy a premium barbering experience.'
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-105 transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for Your Perfect Cut?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who trust us with their style. Book your appointment now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/reservations/new" 
              className="group px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 inline-block shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <FaCalendarAlt className="inline-block mr-2" />
              Book Your Appointment
              <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-lg bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 inline-block transition-all duration-200 transform hover:scale-105"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Barbaros</h3>
              <p className="text-gray-400">Modern barbershop management system for the digital age.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</Link></li>
                <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200">How It Works</Link></li>
                <li><Link href="/reservations/new" className="text-gray-400 hover:text-white transition-colors duration-200">Book Appointment</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-200">Login</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors duration-200">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Hair Cutting</span></li>
                <li><span className="text-gray-400">Beard Styling</span></li>
                <li><span className="text-gray-400">Hair Washing</span></li>
                <li><span className="text-gray-400">Styling</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">Email: info@barbaros.com</p>
              <p className="text-gray-400 mb-2">Phone: (123) 456-7890</p>
              <p className="text-gray-400">Address: 123 Barber St, City</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Barbaros. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 