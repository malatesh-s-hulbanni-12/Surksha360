import React, { useState, useEffect } from 'react'
import UserNavbar from './UserNavbar'

export default function Home({ user, setUser }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Image slider images (using reliable placeholder images)
  const sliderImages = [
    {
      url: "https://images.pexels.com/photos/7551612/pexels-photo-7551612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Secure Your Family's Future",
      subtitle: "With just ₹10 per month"
    },
    {
      url: "https://images.pexels.com/photos/7579823/pexels-photo-7579823.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Medical Emergency Coverage",
      subtitle: "50% surgery cost assistance"
    },
    {
      url: "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      title: "Community Based Support",
      subtitle: "Together we stand, together we secure"
    }
  ]

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  // Reviews data with reliable avatar images
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai",
      review: "Suraksha 360 helped my family during my father's surgery. The claim process was smooth and we received 50% assistance within a week.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      location: "Delhi",
      review: "For just ₹10 per month, this is the best family protection plan. Already completed 8 months, waiting to become eligible for claim.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Anita Desai",
      location: "Pune",
      review: "The transparency in claim process is amazing. My surgery claim was approved without any hassle. Highly recommended!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 4,
      name: "Suresh Patel",
      location: "Ahmedabad",
      review: "Very affordable and reliable. My whole family is covered under this plan. The monthly contribution is so small but benefits are huge.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed UserNavbar at the top */}
      <UserNavbar user={user} setUser={setUser} />
      
      {/* Image Slider Section - Added padding-top to account for fixed navbar */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden pt-20">
        {/* Slider Images */}
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
              <div className="text-white max-w-4xl px-4 animate-fadeIn">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 transform hover:scale-105 transition-transform duration-500">
                  {image.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">{image.subtitle}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl">
                    Join Now
                  </button>
                  <button className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-10 bg-green-500' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* About The Project Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            About Suraksha 360
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fadeIn">
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="text-green-600 font-bold text-2xl">Suraksha 360</span> is a family-based micro contribution plan designed to provide financial protection during medical emergencies.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Each registered member contributes just <span className="text-green-600 font-bold">₹10 per month</span>. This small amount ensures that even low-income families can participate without financial burden.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              After completing <span className="text-green-600 font-bold">one year of continuous payment</span>, members become eligible to receive <span className="text-green-600 font-bold">50% financial assistance</span> in case of medically verified surgery.
            </p>
            <div className="pt-6">
              <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl">
                Join Our Community
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">₹10/month</h3>
              <p className="text-gray-600">Lowest contribution in India</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">50% Coverage</h3>
              <p className="text-gray-600">Surgery cost assistance</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Family Cover</h3>
              <p className="text-gray-600">All members protected</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏳</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">12 Months</h3>
              <p className="text-gray-600">To become eligible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Are Eligible Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slideIn">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Who Can Join?
            </h2>
            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Eligibility Card 1 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👪</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Families</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Any family with 2+ members
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  All ages covered
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  No medical test required
                </li>
              </ul>
            </div>

            {/* Eligibility Card 2 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 animate-fadeIn" style={{animationDelay: '100ms'}}>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Low Income Groups</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Just ₹10 per month
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  No hidden costs
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Affordable for everyone
                </li>
              </ul>
            </div>

            {/* Eligibility Card 3 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:-translate-y-4 transition-all duration-500 animate-fadeIn" style={{animationDelay: '200ms'}}>
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Medical Need</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Surgery coverage after 1 year
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  50% financial assistance
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  Quick claim settlement
                </li>
              </ul>
            </div>
          </div>

          {/* Requirements Box */}
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 transform hover:scale-105 transition-all duration-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Requirements to Join</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-2xl">📄</span>
                <span className="text-gray-600">Valid ID proof (Aadhar, Voter ID, etc.)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-2xl">🏠</span>
                <span className="text-gray-600">Address proof</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-2xl">📸</span>
                <span className="text-gray-600">Passport size photo</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-2xl">💰</span>
                <span className="text-gray-600">First month contribution (₹10 per member)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-slideIn">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our Members Say
          </h2>
          <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl shadow-xl p-6 transform hover:-translate-y-4 transition-all duration-500 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=10b981&color=fff&size=64`;
                  }}
                />
                <div>
                  <h3 className="font-bold text-gray-800">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.location}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-600 italic">"{review.review}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-pulse">
            Start Protecting Your Family Today
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of families who trust Suraksha 360
          </p>
          <button className="px-10 py-5 bg-white text-green-600 rounded-full font-bold text-xl hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 shadow-2xl">
            Register Now - Just ₹10/month
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400">Suraksha360</h3>
              <p className="text-gray-400 text-sm">
                Protecting families with affordable micro-insurance solutions since 2024.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📍 123, Green Park, New Delhi</li>
                <li>📞 +91 98765 43210</li>
                <li>✉️ info@suraksha360.com</li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">
              © 2024 Suraksha360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.8s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}