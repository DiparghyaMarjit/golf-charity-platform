'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { getAllCharities } from '@/lib/charities';
import { Charity } from '@/types';
import { Input, Button, Select, Alert, LoadingSpinner } from '@/components/UI';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    selectedCharityId: '',
    charityPercentage: '10',
    plan: searchParams.get('plan') || 'monthly',
  });

  useEffect(() => {
    const loadCharities = async () => {
      const data = await getAllCharities();
      setCharities(data);
      setLoading(false);
    };

    loadCharities();
  }, []);

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.selectedCharityId) {
      setError('Please select a charity');
      return false;
    }

    const percentage = parseInt(formData.charityPercentage);
    if (percentage < 10) {
      setError('Minimum charity contribution is 10%');
      return false;
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.selectedCharityId,
        parseInt(formData.charityPercentage)
      );

      if (result.success) {
        // Redirect to dashboard directly after signup
        router.push('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Golf for Good</h1>
          <p className="text-gray-600 mt-2">Join our community</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} />}

          {step === 1 ? (
            <>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <div className="flex gap-4">
                  {['monthly', 'yearly'].map((plan) => (
                    <label
                      key={plan}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan}
                        checked={formData.plan === plan}
                        onChange={(e) =>
                          setFormData({ ...formData, plan: e.target.value })
                        }
                        className="mr-2"
                      />
                      <span className="text-gray-700">
                        {plan === 'monthly' ? 'Monthly ($19.99)' : 'Yearly ($199.99)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full mb-4"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Your Charity
              </h2>

              <div className="mb-6 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {charities.map((charity) => (
                  <button
                    key={charity.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, selectedCharityId: charity.id })
                    }
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition ${
                      formData.selectedCharityId === charity.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : ''
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{charity.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {charity.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charity Contribution
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.charityPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, charityPercentage: e.target.value })
                  }
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {formData.charityPercentage}% of your subscription goes to charity
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}