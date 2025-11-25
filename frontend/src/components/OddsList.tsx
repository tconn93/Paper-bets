import { useState, useEffect } from 'react';
import { oddsApi } from '../services/api';
import { OddsCard } from './OddsCard';
import type { Odd } from '../types';

export const OddsList = () => {
  const [odds, setOdds] = useState<Odd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');

  useEffect(() => {
    loadOdds();
  }, [selectedSport]);

  const loadOdds = async () => {
    setLoading(true);
    setError('');
    try {
      const data =
        selectedSport === 'all'
          ? await oddsApi.getAll()
          : await oddsApi.getBySport(selectedSport);
      setOdds(data);
    } catch (err: any) {
      setError('Failed to load odds');
    } finally {
      setLoading(false);
    }
  };

  const sports = ['all', 'football', 'basketball', 'tennis', 'baseball'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading odds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Available Odds</h2>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedSport === sport
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {odds.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No odds available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {odds.map((odd) => (
            <OddsCard key={odd.id} odd={odd} />
          ))}
        </div>
      )}
    </div>
  );
};
