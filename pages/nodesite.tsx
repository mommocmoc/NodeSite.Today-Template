import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const NodeSiteToday: React.FC = () => {
  return (
    <>
      <Head>
        <title>NodeSite.Today - Create Your Website from Notion in Minutes</title>
        <meta name="description" content="Transform your Notion workspace into a beautiful website with one click. No coding required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">NodeSite.Today</h1>
              </div>
              <nav className="flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                From Notion to Website
                <span className="block text-blue-600">in Minutes</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform your Notion workspace into a beautiful, responsive website with one click. 
                No coding, no complex setup, just pure magic.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/api/auth/notion/authorize"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  🚀 Create Your Website Now
                </Link>
                <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors">
                  📺 Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Why Choose NodeSite.Today?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Lightning Fast</h4>
                <p className="text-gray-600">
                  Deploy your website in under 2 minutes. Our automated system handles everything.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Beautiful Design</h4>
                <p className="text-gray-600">
                  Responsive, modern designs that look great on all devices. No design skills needed.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">Zero Maintenance</h4>
                <p className="text-gray-600">
                  Update your Notion, website updates automatically. Focus on content, not code.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2">Connect Notion</h4>
                <p className="text-gray-600">
                  Authorize our app to access your Notion workspace securely.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2">Copy Template</h4>
                <p className="text-gray-600">
                  Our template is automatically copied to your workspace.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2">Build Website</h4>
                <p className="text-gray-600">
                  Our system automatically builds and deploys your website.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold">
                  4
                </div>
                <h4 className="text-lg font-semibold mb-2">Go Live</h4>
                <p className="text-gray-600">
                  Your website is live and ready to share with the world!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Simple, Transparent Pricing
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border rounded-lg p-8 shadow-sm">
                <h4 className="text-xl font-semibold mb-4">Free</h4>
                <div className="text-4xl font-bold mb-4">$0</div>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    1 Website
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Basic Templates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Community Support
                  </li>
                </ul>
                <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800">
                  Get Started
                </button>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 shadow-sm relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Popular</span>
                </div>
                <h4 className="text-xl font-semibold mb-4">Pro</h4>
                <div className="text-4xl font-bold mb-4">$19<span className="text-lg text-gray-600">/mo</span></div>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    5 Websites
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Premium Templates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Custom Domain
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority Support
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                  Start Free Trial
                </button>
              </div>
              
              <div className="bg-white border rounded-lg p-8 shadow-sm">
                <h4 className="text-xl font-semibold mb-4">Enterprise</h4>
                <div className="text-4xl font-bold mb-4">$99<span className="text-lg text-gray-600">/mo</span></div>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited Websites
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    White-label Solution
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Team Collaboration
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Dedicated Support
                  </li>
                </ul>
                <button className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your Website?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of creators who've already transformed their Notion pages into beautiful websites.
            </p>
            <Link
              href="/api/auth/notion/authorize"
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">NodeSite.Today</h4>
                <p className="text-gray-400">
                  Transform your Notion workspace into a beautiful website with one click.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Templates</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Documentation</a></li>
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 NodeSite.Today. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default NodeSiteToday