'use client';

import { useEffect, useState } from 'react';
import { getCharityLeaderboard } from '@/lib/charities';
import { Charity } from '@/types';
import { Card, StatCard, LoadingSpinner } from '@/components/UI';

export default function LeaderboardPage() {
  const [charities, setCharities] = useState<
    (Charity & { totalContributed: number; contributorCount: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getCharityLeaderboard();
      setCharities(data);
      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalRaised = charities.reduce((sum, c) => sum + c.totalContributed, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Charity Leaderboard 🏆</h1>
          <p className="text-gray-600 mt-2">See which charities are making the biggest impact</p>
        </div>

        {/* Total Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Total Raised"
            value={`$${totalRaised.toFixed(2)}`}
            color="green"
            icon="💚"
          />
          <StatCard
            label="Charities Supported"
            value={charities.length}
            color="blue"
            icon="🤝"
          />
        </div>

        {/* Leaderboard */}
        <Card title="Top Charities">
          <div className="space-y-3">
            {charities.map((charity, idx) => (
              <div
                key={charity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{charity.name}</p>
                    <p className="text-sm text-gray-600">
                      {charity.contributorCount} contributors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${charity.totalContributed.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">raised</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}