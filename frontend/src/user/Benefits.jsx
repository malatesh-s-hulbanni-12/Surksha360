import React from 'react'
import UserNavbar from './UserNavbar'

export default function Benefits({ user, setUser }) {
  const benefitsList = [
    {
      icon: "💰",
      title: "Low Monthly Cost",
      description: "Each member pays only ₹10 per month. It is affordable for every family.",
      color: "from-green-400 to-green-500"
    },
    {
      icon: "🏥",
      title: "Financial Support During Surgery",
      description: "If any registered member undergoes surgery after completing 1 year, 50% of the surgery cost will be provided as financial assistance.",
      color: "from-blue-400 to-blue-500"
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Protection",
      description: "All registered family members are covered individually under the plan.",
      color: "from-purple-400 to-purple-500"
    },
    {
      icon: "💪",
      title: "Encourages Savings Habit",
      description: "Regular monthly payment helps families develop a saving habit for medical emergencies.",
      color: "from-yellow-400 to-yellow-500"
    },
    {
      icon: "🤝",
      title: "Community-Based Support System",
      description: "The plan works on mutual contribution, helping members during difficult times.",
      color: "from-red-400 to-red-500"
    },
    {
      icon: "📝",
      title: "Simple Registration Process",
      description: "Families can easily register their details in the system.",
      color: "from-indigo-400 to-indigo-500"
    },
    {
      icon: "✓",
      title: "Transparent Claim Process",
      description: "Members can submit hospital documents, and after verification, the claim amount is processed clearly.",
      color: "from-teal-400 to-teal-500"
    },
    {
      icon: "🛡️",
      title: "Financial Security",
      description: "Provides relief from sudden heavy medical expenses.",
      color: "from-orange-400 to-orange-500"
    },
    {
      icon: "⏳",
      title: "Long-Term Benefit",
      description: "Continuous contribution for 1 year ensures eligibility for claims and stable benefits.",
      color: "from-pink-400 to-pink-500"
    },
    {
      icon: "⭐",
      title: "Affordable Alternative",
      description: "This plan is designed for families who cannot afford high premium insurance policies.",
      color: "from-cyan-400 to-cyan-500"
    }
  ]

  const keyFeatures = [
    "Surgery cost support - 50% of total surgery expenses",
    "Minimum 12 months continuous payment required",
    "Covers medically necessary surgeries",
    "Simple document verification process",
    "No coverage for cosmetic surgeries"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <UserNavbar user={user} setUser={setUser} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-400 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full opacity-10 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Suraksha 360 
              <span className="block text-2xl md:text-3xl mt-2 font-light">
                Family Protection Plan
              </span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Affordable Healthcare Protection for Every Family
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <span className="px-6 py-2 bg-white text-green-600 rounded-full font-semibold shadow-lg">
                Just ₹10/month
              </span>
              <span className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold shadow-lg">
                50% Surgery Coverage
              </span>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="white" fillOpacity="0.2"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 transform hover:scale-105 transition-transform duration-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-green-500 w-2 h-8 rounded-full mr-4"></span>
            Overview
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p className="leading-relaxed">
              The <span className="font-semibold text-green-600">Suraksha 360 Family Protection Plan</span> is a community-based micro-insurance model designed to provide financial assistance to families during medical emergencies. The main objective of this project is to offer affordable healthcare support by collecting a small monthly contribution from each registered family member.
            </p>
            <p className="leading-relaxed">
              Under this scheme, every family member who registers in the system contributes <span className="font-semibold text-green-600">₹10 per month</span>. This small amount ensures that even low-income families can participate without financial burden. The collected contributions are maintained within the system to provide benefits to eligible members.
            </p>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-500 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start">
                  <span className="text-green-500 text-2xl mr-3">✓</span>
                  <p className="text-gray-700">{feature}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            10 Powerful Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsList.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`p-6 bg-gradient-to-br ${benefit.color} text-white text-4xl flex items-center justify-center h-32`}>
                  <span className="transform group-hover:scale-110 transition-transform duration-500">
                    {benefit.icon}
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-green-500 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-bl-3xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Claim Process Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Simple Claim Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Complete 1 Year", desc: "Pay ₹10/month for 12 months continuously" },
              { step: "2", title: "Submit Documents", desc: "Hospital bills, surgery reports, medical certificates" },
              { step: "3", title: "Verification", desc: "Admin verifies all documents" },
              { step: "4", title: "Get 50% Coverage", desc: "Receive 50% of surgery cost" }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col justify-center">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-2xl text-green-400 transform -translate-y-1/2">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Not Covered Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-red-500 w-2 h-8 rounded-full mr-4"></span>
            What's Not Covered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Cosmetic surgeries",
              "Minor treatments without surgical procedures",
              "Pre-existing surgeries before joining the scheme",
              "Cases where monthly payments are incomplete"
            ].map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-300">
                <span className="text-red-500 text-2xl mr-3">✕</span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action - Button text changed */}
        <div className="text-center bg-gradient-to-r from-green-600 to-green-400 rounded-3xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Family's Future?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of families who trust Suraksha 360</p>
          <button className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-300 shadow-xl">
            Register Office
          </button>
        </div>
      </div>

      {/* Footer - Heart symbol removed */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Made by Suraksha360 Team
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2024 Suraksha360. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}