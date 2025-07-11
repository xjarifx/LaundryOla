import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrollY > 50
            ? "border-b border-white/20 bg-white/95 shadow-lg backdrop-blur-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                LaundryOla
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-8 md:flex">
              <a
                href="#features"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Pricing
              </a>
              <Link
                to="/signin"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="transform rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-white py-4 shadow-xl md:hidden">
              <div className="flex flex-col space-y-4 px-6">
                <a
                  href="#features"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  How It Works
                </a>
                <a
                  href="#pricing"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  Pricing
                </a>
                <Link
                  to="/signin"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-center font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                  ✨ Professional Laundry Service
                </div>
                <h1 className="text-5xl leading-tight font-bold lg:text-6xl">
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Your Clothes,
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Our Care
                  </span>
                </h1>
                <p className="max-w-lg text-xl leading-relaxed text-gray-600">
                  Experience premium laundry service with doorstep pickup and
                  delivery. Track your orders in real-time and get professional
                  care for your clothes.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/signup"
                  className="group flex transform items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  <span>Start Your Journey</span>
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/signin"
                  className="flex items-center justify-center space-x-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50"
                >
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 border-t border-gray-200 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Service Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">99%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Animation */}
            <div className="relative">
              <div className="relative z-10 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {/* Service Cards */}
                  <div className="transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Quick Pickup
                    </h3>
                    <p className="text-sm text-gray-600">
                      Same day pickup within 2 hours
                    </p>
                  </div>

                  <div className="mt-8 transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Quality Care
                    </h3>
                    <p className="text-sm text-gray-600">
                      Professional cleaning process
                    </p>
                  </div>

                  <div className="transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                      <svg
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Real-time Tracking
                    </h3>
                    <p className="text-sm text-gray-600">
                      Track your order progress
                    </p>
                  </div>

                  <div className="mt-8 transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <svg
                        className="h-6 w-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      Fast Delivery
                    </h3>
                    <p className="text-sm text-gray-600">
                      Doorstep delivery guaranteed
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Elements */}
              <div className="absolute -top-4 -right-4 h-72 w-72 rounded-full bg-blue-300 opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 h-64 w-64 rounded-full bg-indigo-300 opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
              Why Choose LaundryOla?
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              We combine cutting-edge technology with professional care to give
              you the best laundry experience
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🚚",
                title: "Free Pickup & Delivery",
                description:
                  "We come to you! Schedule pickup and delivery at your convenience.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: "👕",
                title: "Professional Care",
                description:
                  "Expert handling of all fabric types with eco-friendly detergents.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: "📱",
                title: "Real-time Updates",
                description:
                  "Track your order status from pickup to delivery in real-time.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: "⚡",
                title: "Express Service",
                description:
                  "Need it fast? Get your clothes back within 24 hours.",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: "🔒",
                title: "Secure & Safe",
                description:
                  "Your clothes are safe with us. Fully insured and tracked.",
                color: "from-red-500 to-red-600",
              },
              {
                icon: "💰",
                title: "Affordable Pricing",
                description:
                  "Transparent pricing with no hidden fees. Pay only for what you use.",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="h-full rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-8">
                  <div
                    className={`h-16 w-16 bg-gradient-to-r ${feature.color} mb-6 flex items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20"
      >
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Getting your laundry done has never been easier. Just follow these
              simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Schedule Pickup",
                description:
                  "Book online or through our app. Choose your preferred time slot.",
                icon: "📅",
              },
              {
                step: "02",
                title: "We Collect & Clean",
                description:
                  "Our team picks up your clothes and gives them professional care.",
                icon: "🧺",
              },
              {
                step: "03",
                title: "Fast Delivery",
                description:
                  "Get your fresh, clean clothes delivered back to your doorstep.",
                icon: "🏠",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="transform rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="mb-6 text-6xl">{step.icon}</div>
                  <div className="mb-4 text-6xl font-bold text-blue-600 opacity-20">
                    {step.step}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="absolute top-1/2 -right-4 hidden h-0.5 w-8 -translate-y-1/2 transform bg-blue-300 md:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 lg:text-5xl">
              Transparent Pricing
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              No hidden fees, no surprises. Pay only for what you use with our
              clear pricing structure
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                name: "Basic Wash",
                price: "৳50",
                unit: "per kg",
                description: "Perfect for everyday clothes",
                features: [
                  "Wash & Dry",
                  "Folding Included",
                  "48hr Delivery",
                  "Basic Care",
                ],
                popular: false,
              },
              {
                name: "Premium Care",
                price: "৳80",
                unit: "per kg",
                description: "Best value for quality care",
                features: [
                  "Wash & Dry",
                  "Premium Detergent",
                  "24hr Delivery",
                  "Special Care",
                  "Steam Press",
                ],
                popular: true,
              },
              {
                name: "Express Service",
                price: "৳120",
                unit: "per kg",
                description: "When you need it fast",
                features: [
                  "Wash & Dry",
                  "Premium Care",
                  "6hr Delivery",
                  "Priority Service",
                  "Steam Press",
                  "Stain Treatment",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? "scale-105 transform bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl"
                    : "border border-gray-200 bg-gray-50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3
                    className={`mb-2 text-2xl font-bold ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mb-6 ${
                      plan.popular ? "text-blue-100" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span
                      className={`text-5xl font-bold ${
                        plan.popular ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-lg ${
                        plan.popular ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      {plan.unit}
                    </span>
                  </div>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <svg
                        className={`h-5 w-5 ${
                          plan.popular ? "text-blue-200" : "text-green-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className={
                          plan.popular ? "text-blue-100" : "text-gray-700"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block w-full rounded-xl px-6 py-3 text-center font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            Ready to Experience the Difference?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Join thousands of satisfied customers who trust LaundryOla for their
            laundry needs
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="transform rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Start Your First Order
            </Link>
            <Link
              to="/signin"
              className="rounded-xl border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-blue-600"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 text-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="mb-6 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">LaundryOla</h3>
              </div>
              <p className="mb-6 max-w-md text-gray-400">
                Professional laundry service with doorstep pickup and delivery.
                Making laundry day effortless for busy people.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                >
                  <span className="text-sm">f</span>
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                >
                  <span className="text-sm">t</span>
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 transition-colors hover:bg-blue-600"
                >
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    to="/signin"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@laundryola.com</li>
                <li>📞 +880 1234-567890</li>
                <li>📍 Dhaka, Bangladesh</li>
                <li>🕒 24/7 Support</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 LaundryOla. All rights reserved. Made with ❤️ for busy
              people.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
