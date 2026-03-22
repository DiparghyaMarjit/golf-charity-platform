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
          <p className="text-gray-600 mt-2">
            Check out the latest draw and your odds
          </p>
        </div>

        {draw ? (
          <div className="space-y-8">
            {/* Stats */}
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

            {/* Winning Numbers */}
            <Card title="Winning Numbers">
              <div className="flex justify-center gap-4 py-8">
                {(() => {
                  let numbers: number[] = [];

                  if (Array.isArray(draw.winning_numbers)) {
                    numbers = draw.winning_numbers;
                  } else {
  numbers = String(draw.winning_numbers)
    .replace(/\{|\}/g, '')
    .split(',')
    .map((n) => Number(n.trim()));
}

                  return numbers
                    .filter((n) => !Number.isNaN(n))
                    .map((num, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      >
                        {num}
                      </div>
                    ));
                })()}
              </div>
            </Card>

            {/* Prize Distribution */}
            <Card title="Prize Distribution">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>5-Number Match (40%)</span>
                    <span>
                      ${draw.pool_40_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>4-Number Match (35%)</span>
                    <span>
                      ${draw.pool_35_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>3-Number Match (25%)</span>
                    <span>
                      ${draw.pool_25_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div className="bg-blue-600 text-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">
                Ready to compete?
              </h2>
              <Button onClick={() => (window.location.href = '/score')}>
                Log Your Score
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-center py-10">No draw available</p>
          </Card>
        )}
      </div>
    </div>
  );
}