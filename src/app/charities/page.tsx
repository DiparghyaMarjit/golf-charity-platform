'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllCharities, searchCharities, getCharityStats } from '@/lib/charities';
import { Charity } from '@/types';
import { Card, Button, Input, LoadingSpinner, StatCard } from '@/components/UI';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const loadCharities = async () => {
      const data = await getAllCharities();
      setCharities(data);

      // Load stats for each charity
      const statsMap: { [key: string]: any } = {};
      for (const charity of data) {
        const charityStats = await getCharityStats(charity.id);
        statsMap[charity.id] = charityStats;
      }
      setStats(statsMap);
      setLoading(false);
    };

    loadCharities();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      const data = await getAllCharities();
      setCharities(data);
    } else {
      const results = await searchCharities(query);
      setCharities(results);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const featured = charities.filter(c => c.is_featured);
  const others = charities.filter(c => !c.is_featured);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Support a Charity You Care About ❤️
          </h1>
          <p className="text-gray-600 mt-2">
            Every subscription helps these amazing organizations make a difference
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            label="Search Charities"
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Featured Charities */}
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Charities ⭐</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((charity) => (
                <Card key={charity.id} className="hover:shadow-lg transition">
                  <div>
                    {charity.logo_url && (
                      <img
                        src={charity.logo_url}
                        alt={charity.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-900">{charity.name}</h3>
                    <p className="text-gray-600 mt-2">{charity.description}</p>

                    {stats[charity.id] && (
                      <div className="mt-4 space-y-2 text-sm">
                        <p className="text-gray-600">
                          💰 ${stats[charity.id].totalContributed.toFixed(2)} raised
                        </p>
                        <p className="text-gray-600">
                          👥 {stats[charity.id].contributorCount} supporters
                        </p>
                      </div>
                    )}

                    {charity.website_url && (
                      <a
                        href={charity.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-4 block"
                      >
                        Visit Website →
                      </a>
                    )}

                    <Link href={`/charities/${charity.id}`}>
                      <Button className="w-full mt-4">Learn More</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Charities */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Charities ({charities.length})
          </h2>
          {others.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {others.map((charity) => (
                <Card key={charity.id} className="hover:shadow-lg transition">
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900">
                      {charity.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-2 flex-grow">
                      {charity.description}
                    </p>

                    {stats[charity.id] && (
                      <div className="mt-4 space-y-1 text-sm text-gray-600">
                        <p>
                          💰 ${stats[charity.id].totalContributed.toFixed(2)} raised
                        </p>
                        <p>👥 {stats[charity.id].contributorCount} supporters</p>
                      </div>
                    )}

                    <Link href={`/charities/${charity.id}`}>
                      <Button variant="outlined" className="w-full mt-4">
                        Support
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600">No charities found</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
