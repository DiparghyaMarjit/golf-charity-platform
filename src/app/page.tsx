'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { Button, StatCard } from '@/components/UI';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    // Logged-in user sees dashboard link
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ready to enter your scores and compete for prizes?
            </p>
            <Link href="/dashboard">
              <Button className="px-8 py-3 text-lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="text-6xl">⛳</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Golf for Good
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Track your golf scores, compete in monthly draws, and make a real difference for charity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="inline-block">
                <button className="px-8 py-3 text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition">
                  Start Your Journey
                </button>
              </Link>
              <Link href="/auth/login" className="inline-block">
                <button className="px-8 py-3 text-lg font-medium text-white border-2 border-white hover:bg-blue-500 rounded-lg transition">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Log Your Scores</h3>
              <p className="text-gray-600">
                Enter your latest Stableford scores and track your performance over time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <span className="text-3xl">🎰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Draws</h3>
              <p className="text-gray-600">
                Automatically entered into prize draws based on your scores. Win big every month.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Support Charity</h3>
              <p className="text-gray-600">
                Every subscription automatically supports charities you care about.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Simple, Transparent Pricing
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Monthly</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">$19.99</p>
              <p className="text-gray-600 mb-8">per month</p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li>✓ Unlimited score entry</li>
                <li>✓ Monthly draw participation</li>
                <li>✓ 10% minimum charity contribution</li>
                <li>✓ Winner verification system</li>
              </ul>
              <Link href="/auth/signup?plan=monthly" className="w-full">
                <Button className="w-full">Choose Monthly</Button>
              </Link>
            </div>

            {/* Yearly */}
            <div className="border-2 border-blue-600 rounded-lg p-8 bg-blue-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Yearly
                <span className="ml-2 text-sm font-semibold text-green-600">Save 17%</span>
              </h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">$199.99</p>
              <p className="text-gray-600 mb-8">per year (billed once)</p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li>✓ Everything in Monthly</li>
                <li>✓ All 12 draws included</li>
                <li>✓ 17% discount vs monthly</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/auth/signup?plan=yearly" className="w-full">
                <Button className="w-full">Choose Yearly</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard
              label="Active Players"
              value="500+"
              color="blue"
              icon="⛳"
            />
            <StatCard
              label="Prizes Distributed"
              value="$25K+"
              color="green"
              icon="🏆"
            />
            <StatCard
              label="Charity Donated"
              value="$10K+"
              color="purple"
              icon="❤️"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Compete for Good?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of golfers supporting their favorite charities.
          </p>
          <Link href="/auth/signup" className="inline-block">
            <button className="px-8 py-3 text-lg font-medium text-blue-600 bg-white hover:bg-gray-50 rounded-lg transition">
              Subscribe Now
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Golf for Good</h4>
              <p className="text-sm">Making golf better for everyone.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/draw" className="hover:text-white">Draw</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
                <li><Link href="/charities" className="hover:text-white">Charities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <p className="text-sm">support@golfforgood.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Golf for Good. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
