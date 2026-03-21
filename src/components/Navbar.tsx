'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Hide navbar on auth pages
  if (pathname.startsWith('/auth')) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⛳</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              Golf for Good
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/draw" className="text-gray-600 hover:text-blue-600 transition">
              Draw
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 transition">
              Leaderboard
            </Link>
            <Link href="/charities" className="text-gray-600 hover:text-blue-600 transition">
              Charities
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition hidden sm:block"
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-purple-600 hover:text-purple-700 transition hidden sm:block font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Subscribe
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}