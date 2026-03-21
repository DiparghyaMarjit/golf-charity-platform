'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isLoggedIn } from '@/lib/auth';
import { getActiveSubscription, createSubscription, SUBSCRIPTION_PLANS } from '@/lib/subscriptions';
import { User, Subscription } from '@/types';
import { Button, Card, LoadingSpinner, Alert } from '@/components/UI';

export default function SubscribePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      const authenticated = await isLoggedIn();
      if (!authenticated) {
        router.push('/auth/login');
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);
      const sub = await getActiveSubscription(currentUser.id);
      setActiveSub(sub);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    setError('');
    setSuccess('');

    const stripeDummy = `test_${plan}_${Date.now()}`;
    const result = await createSubscription(user.id, plan, stripeDummy);

    if (!result.success) {
      setError(result.error || 'Could not create subscription.');
      return;
    }

    setSuccess(`Subscribed to ${SUBSCRIPTION_PLANS[plan].name} plan successfully.`);
    setActiveSub(result.subscription ?? null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscribe</h1>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {activeSub ? (
          <Card title="Active Subscription">
            <div className="space-y-2">
              <p className="text-gray-700">Plan: {activeSub.plan_type}</p>
              <p className="text-gray-700">Price: ${activeSub.plan_price.toFixed(2)}</p>
              <p className="text-gray-700">Status: {activeSub.status}</p>
              <p className="text-gray-700">Renewal: {new Date(activeSub.renewal_date || '').toLocaleDateString()}</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(SUBSCRIPTION_PLANS) as Array<'monthly' | 'yearly'>).map((plan) => {
              const details = SUBSCRIPTION_PLANS[plan];
              return (
                <Card key={plan} title={`${details.name} Plan`}>
                  <p className="text-gray-700">Price: ${details.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Interval: {details.interval}</p>
                  {details.savings && <p className="text-sm text-green-600">Save {details.savings}</p>}
                  <Button className="w-full mt-4" onClick={() => handleSubscribe(plan)}>
                    Subscribe Now
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
