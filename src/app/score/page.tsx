'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addGolfScore } from '@/lib/scores';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';
import { LoadingSpinner, Alert, Card, Button, Input } from '@/components/UI';
import { User } from '@/types';

export default function ScorePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState('');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
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
      setLoading(false);
    };

    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numericScore = Number(score);
    if (Number.isNaN(numericScore)) {
      setError('Please enter a valid numeric score.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    const result = await addGolfScore(user.id, numericScore, scoreDate);

    if (!result.success) {
      setError(result.error || 'Failed to save score');
    } else {
      setMessage('Score saved successfully!');
      setScore('');
      setScoreDate(new Date().toISOString().slice(0, 10));
    }

    setSubmitting(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <Card title="Log Your Score">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} />}
            {message && <Alert type="success" message={message} />}

            <Input
              label="Score (1-45)"
              type="number"
              min={1}
              max={45}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score Date</label>
              <input
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Saving...' : 'Save Score'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back Dashboard
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
