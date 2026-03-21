'use client';

import { useEffect, useState } from 'react';
import { getLatestDraw } from '@/lib/draws';
import { Draw } from '@/types';
import { Card, Button, LoadingSpinner, StatCard } from '@/components/UI';

export default function DrawPage() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDraw = async () => {
      const latestDraw = await getLatestDraw();
      setDraw(latestDraw);
      setLoading(false);
    };

    loadDraw();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Draw 🎰</h1>
          <p className="text-gray-600 mt-2">Check out the latest draw and your odds</p>
        </div>

        {draw ? (
          <div className="space-y-8">
            {/* Draw Statistics */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard
                label="Total Prize Pool"
                value={`$${draw.total_prize_pool?.toFixed(2) || '0.00'}`}
                color="blue"
                icon="💰"
              />
              <StatCard
                label="Draw Month"
                value={draw.month_year}
                color="green"
                icon="📅"
              />
              <StatCard
                label="Status"
                value={draw.status.toUpperCase()}
                color={draw.status === 'published' ? 'green' : 'yellow'}
                icon={draw.status === 'published' ? '✓' : '⏳'}
              />
            </div>

            {/* Draw Results */}
            <Card title="Winning Numbers">
              <div className="flex justify-center gap-4 py-8">
                {(Array.isArray(draw.winning_numbers)
                  ? draw.winning_numbers
                  : typeof draw.winning_numbers === 'string'
                  ? draw.winning_numbers
                      .replace(/\{|\}/g, '')
                      .split(',')
                      .map((n) => Number(n.trim()))
                  : [])
                  .filter((n) => !Number.isNaN(Number(n)))
                  .map((num, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    >
                      {num}
                    </div>
                  ))}
              </div>
            </Card>

            {/* Prize Distribution */}
            <Card title="Prize Distribution">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">5-Number Match (40%)</span>
                    <span className="text-lg font-bold text-green-600">
                      ${draw.pool_40_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Match all 5 numbers to win!</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">4-Number Match (35%)</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${draw.pool_35_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Match 4 numbers</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">3-Number Match (25%)</span>
                    <span className="text-lg font-bold text-purple-600">
                      ${draw.pool_25_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Match 3 numbers</p>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to compete?
              </h2>
              <p className="text-blue-100 mb-6">
                Log your scores and enter the draw for a chance to win big!
              </p>
              <Button variant="primary" className="px-8 py-3" onClick={() => window.location.href = '/score'}>
                Log Your Score
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-600 mb-4">No active draw yet</p>
              <p className="text-sm text-gray-500">Check back soon!</p>
              <p className="text-sm text-gray-500">
                In the meantime, log your score to qualify for the next draw.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/score'}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Log Your Score
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}