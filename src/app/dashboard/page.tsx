'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';
import { getUserScores } from '@/lib/scores';
import { getActiveSubscription } from '@/lib/subscriptions';
import { getUserWinners, getTotalWinnings } from '@/lib/winners';
import { getCharityById } from '@/lib/charities';
import { getLatestDraw } from '@/lib/draws';
import { User, GolfScore, Subscription, Winner, Charity, Draw } from '@/types';
import { Card, Button, StatCard, LoadingSpinner, Alert } from '@/components/UI';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [latestDraw, setLatestDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'winnings'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        router.push('/auth/login');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);

      const [
        userSubscription,
        userScores,
        userWinners,
        winnings,
        charityData,
        draw,
      ] = await Promise.all([
        getActiveSubscription(currentUser.id),
        getUserScores(currentUser.id),
        getUserWinners(currentUser.id),
        getTotalWinnings(currentUser.id),
        currentUser.selected_charity_id
          ? getCharityById(currentUser.selected_charity_id)
          : Promise.resolve(null),
        getLatestDraw(),
      ]);

      setSubscription(userSubscription);
      setScores(userScores);
      setWinners(userWinners);
      setTotalWinnings(winnings);
      setCharity(charityData);
      setLatestDraw(draw);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return 'inactive';
    if (subscription.status !== 'active') return subscription.status;
    if (new Date(subscription.renewal_date!) < new Date()) return 'expired';
    return 'active';
  };

  const renewalDate = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString()
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Manage your golf scores and track your winnings</p>
        </div>

        {/* Subscription Alert */}
        {getSubscriptionStatus() !== 'active' && (
          <Alert
            type={getSubscriptionStatus() === 'inactive' ? 'warning' : 'error'}
            title={
              getSubscriptionStatus() === 'inactive'
                ? 'No Active Subscription'
                : 'Subscription Expired'
            }
            message={
              getSubscriptionStatus() === 'inactive'
                ? 'Subscribe to start participating in draws.'
                : 'Your subscription has expired. Renew to continue playing.'
            }
          />
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {['overview', 'scores', 'winnings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard
                label="Subscription Status"
                value={getSubscriptionStatus().toUpperCase()}
                color={getSubscriptionStatus() === 'active' ? 'green' : 'red'}
                icon={getSubscriptionStatus() === 'active' ? '✓' : '✕'}
              />
              <StatCard
                label="Next Renewal"
                value={renewalDate}
                color="blue"
                icon="📅"
              />
              <StatCard
                label="Total Winnings"
                value={`$${totalWinnings.toFixed(2)}`}
                color="purple"
                icon="🏆"
              />
              <StatCard
                label="Scores Logged"
                value={scores.length}
                unit="/ 5"
                color="blue"
                icon="⛳"
              />
            </div>

            {/* Subscription & Charity */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Subscription Card */}
              <Card title="Your Subscription">
                {subscription ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.plan_type === 'monthly'
                          ? 'Monthly'
                          : 'Yearly'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${subscription.plan_price.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="outlined" className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                    <Link href="/subscribe">
                      <Button className="w-full">Subscribe Now</Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Charity Card */}
              <Card title="Supporting">
                {charity ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {charity.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {charity.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Your contribution</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.charity_contribution_percentage}% of subscription
                      </p>
                    </div>
                    <Link href="/charities">
                      <Button variant="outlined" className="w-full">
                        Change Charity
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Select a charity to support</p>
                    <Link href="/charities">
                      <Button className="w-full">Choose Charity</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Scores */}
            <Card title="Recent Scores">
              {scores.length > 0 ? (
                <div className="space-y-2">
                  {scores.map((score) => (
                    <div
                      key={score.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          Score: {score.score}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(score.score_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No scores logged yet</p>
              )}
              <Link href="/draw">
                <Button className="w-full mt-4">Log Score</Button>
              </Link>
            </Card>

            {/* Latest Draw */}
            {latestDraw && (
              <Card title="Latest Draw">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Draw Month</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {latestDraw.month_year}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {latestDraw.status.toUpperCase()}
                    </p>
                  </div>
                  <Link href="/draw">
                    <Button className="w-full">View Draw</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Scores Tab */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            <Card title="Your Golf Scores">
              {scores.length > 0 ? (
                <div className="space-y-3">
                  {scores.map((score) => (
                    <div
                      key={score.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">Score: {score.score}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(score.score_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="secondary" className="text-sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No scores yet</p>
              )}
            </Card>
            <Link href="/draw">
              <Button className="w-full">Enter New Score</Button>
            </Link>
          </div>
        )}

        {/* Winnings Tab */}
        {activeTab === 'winnings' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard
                label="Total Winnings"
                value={`$${totalWinnings.toFixed(2)}`}
                color="purple"
                icon="🏆"
              />
              <StatCard
                label="Total Wins"
                value={winners.length}
                color="green"
                icon="✓"
              />
              <StatCard
                label="Pending Verification"
                value={winners.filter(w => w.verification_status === 'pending').length}
                color="blue"
                icon="⏳"
              />
            </div>

            <Card title="Your Wins">
              {winners.length > 0 ? (
                <div className="space-y-3">
                  {winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {winner.match_type}-Number Match
                          </p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            ${winner.prize_amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Status:{' '}
                            <span
                              className={`font-semibold ${
                                winner.verification_status === 'approved'
                                  ? 'text-green-600'
                                  : winner.verification_status === 'rejected'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              {winner.verification_status.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                      {winner.verification_status === 'pending' &&
                        !winner.proof_submitted_at && (
                        <Button className="w-full mt-4" variant="primary">
                          Submit Proof
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No wins yet. Keep playing!</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}