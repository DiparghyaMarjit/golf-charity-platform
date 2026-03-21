'use client';

import { useEffect, useState } from 'react';
import { getAllWinners, getWinnerStats } from '@/lib/winners';
import { Winner } from '@/types';
import { Card, StatCard, LoadingSpinner } from '@/components/UI';

export default function ResultsPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [winnersData, statsData] = await Promise.all([
        getAllWinners(),
        getWinnerStats(),
      ]);

      setWinners(winnersData);
      setStats(statsData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prize Results 🏆</h1>
          <p className="text-gray-600 mt-2">See all the winners from past draws</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Total Winners"
              value={stats.totalWinners}
              color="blue"
              icon="🎯"
            />
            <StatCard
              label="Pending Verification"
              value={stats.pendingVerification}
              color="yellow"
              icon="⏳"
            />
            <StatCard
              label="Approved"
              value={stats.approvedWinners}
              color="green"
              icon="✓"
            />
            <StatCard
              label="Paid Out"
              value={stats.paidWinners}
              color="purple"
              icon="💰"
            />
            <StatCard
              label="Total Paid"
              value={`$${stats.totalPrizesPaid.toFixed(2)}`}
              color="green"
              icon="💵"
            />
          </div>
        )}

        {/* Winners List */}
        <Card title="All Winners">
          {winners.length > 0 ? (
            <div className="space-y-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {winner.match_type}-Number Match
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Prize: ${winner.prize_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Drawn: {new Date(winner.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold">
                        {winner.verification_status === 'approved' && (
                          <span className="bg-green-100 text-green-800">✓ Approved</span>
                        )}
                        {winner.verification_status === 'pending' && (
                          <span className="bg-yellow-100 text-yellow-800">⏳ Pending</span>
                        )}
                        {winner.verification_status === 'rejected' && (
                          <span className="bg-red-100 text-red-800">✕ Rejected</span>
                        )}
                      </div>

                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ml-2">
                        {winner.payment_status === 'paid' && (
                          <span className="bg-blue-100 text-blue-800">💰 Paid</span>
                        )}
                        {winner.payment_status === 'pending' && (
                          <span className="bg-gray-100 text-gray-800">⏳ Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No winners yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
          key={i}
          className="border p-3 mb-2 flex justify-between"
        >
          <span>{w.users?.name}</span>
          <span>Match: {w.match_count}</span>
          <span>₹{w.prize_amount}</span>
        </div>
      ))}
    </div>
  );
}