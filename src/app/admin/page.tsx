'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';
import { getSubscriptionStats } from '@/lib/subscriptions';
import { getWinnerStats, getPendingVerifications, approveWinner, rejectWinner } from '@/lib/winners';
import { User, Winner } from '@/types';
import { Card, Button, StatCard, LoadingSpinner, Alert } from '@/components/UI';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [winnerStats, setWinnerStats] = useState<any>(null);
  const [pendingVerifications, setPendingVerifications] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'users'>('overview');

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        router.push('/auth/login');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(currentUser);

      const [subStats, winStats, pending] = await Promise.all([
        getSubscriptionStats(),
        getWinnerStats(),
        getPendingVerifications(),
      ]);

      setSubscriptionStats(subStats);
      setWinnerStats(winStats);
      setPendingVerifications(pending);
      setLoading(false);
    };

    checkAdminAndLoadData();
  }, [router]);

  const handleApproveWinner = async (winnerId: string) => {
    if (!user) return;

    const result = await approveWinner(winnerId, user.id);
    if (result.success) {
      // Reload pending verifications
      const pending = await getPendingVerifications();
      setPendingVerifications(pending);
    }
  };

  const handleRejectWinner = async (winnerId: string, reason: string) => {
    if (!user) return;

    const result = await rejectWinner(winnerId, user.id, reason);
    if (result.success) {
      // Reload pending verifications
      const pending = await getPendingVerifications();
      setPendingVerifications(pending);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard 🔧</h1>
          <p className="text-gray-600 mt-2">Manage platform, users, and verify winners</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['overview', 'verification', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && subscriptionStats && winnerStats && (
          <div className="space-y-8">
            {/* Subscription Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Stats</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Subscribers"
                  value={subscriptionStats.totalSubscribers}
                  color="blue"
                  icon="👥"
                />
                <StatCard
                  label="Active Subscriptions"
                  value={subscriptionStats.activeSubscriptions}
                  color="green"
                  icon="✓"
                />
                <StatCard
                  label="Monthly Revenue"
                  value={`$${subscriptionStats.monthlyRevenue.toFixed(2)}`}
                  color="purple"
                  icon="💵"
                />
              </div>
            </div>

            {/* Winner Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Winner Stats</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Winners"
                  value={winnerStats.totalWinners}
                  color="blue"
                  icon="🏆"
                />
                <StatCard
                  label="Pending Verification"
                  value={winnerStats.pendingVerification}
                  color="yellow"
                  icon="⏳"
                />
                <StatCard
                  label="Approved"
                  value={winnerStats.approvedWinners}
                  color="green"
                  icon="✓"
                />
                <StatCard
                  label="Total Paid"
                  value={`$${winnerStats.totalPrizesPaid.toFixed(2)}`}
                  color="purple"
                  icon="💰"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="flex gap-4">
                <Button variant="primary">Create Draw</Button>
                <Button variant="secondary">Add Charity</Button>
                <Button variant="outlined">View All Users</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Winner Verification Tab */}
        {activeTab === 'verification' && (
          <Card title="Pending Winner Verifications">
            {pendingVerifications.length > 0 ? (
              <div className="space-y-4">
                {pendingVerifications.map((winner) => (
                  <div
                    key={winner.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {winner.match_type}-Number Match Winner
                        </p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          Prize: ${winner.prize_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Submitted:{' '}
                          {winner.proof_submitted_at
                            ? new Date(winner.proof_submitted_at).toLocaleDateString()
                            : 'Not yet submitted'}
                        </p>
                      </div>
                    </div>

                    {winner.proof_url && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600 mb-2">Proof Screenshot:</p>
                        <a
                          href={winner.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all text-sm"
                        >
                          View Proof
                        </a>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleApproveWinner(winner.id)}
                        className="flex-1"
                      >
                        Approve ✓
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleRejectWinner(
                            winner.id,
                            'Failed verification'
                          )
                        }
                        className="flex-1"
                      >
                        Reject ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No pending verifications</p>
              </div>
            )}
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card title="User Management">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">User management coming soon</p>
              <p className="text-sm text-gray-500">
                Full user administration panel with filtering and search
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}