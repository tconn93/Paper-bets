import { useState, useEffect } from 'react';
import { betApi } from '../services/api';
import type { Bet } from '../types';

export const BetHistory = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await betApi.getMyBets();
      setBets(data);
    } catch (err: any) {
      setError('Failed to load bet history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBets = bets.filter((bet) =>
    filter === 'all' ? true : bet.status === filter
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading bet history...</p>
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
        <h2 className="text-2xl font-bold mb-4">Bet History</h2>
        <div className="flex space-x-2">
          {(['all', 'pending', 'won', 'lost'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No bets found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBets.map((bet) => (
            <div
              key={bet.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold">
                    {bet.sport}
                  </span>
                  <span
                    className={`ml-2 inline-block text-xs px-2 py-1 rounded font-semibold border ${getStatusColor(
                      bet.status
                    )}`}
                  >
                    {bet.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(bet.placedAt)}
                </span>
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {bet.homeTeam} vs {bet.awayTeam}
                </h3>
                <p className="text-sm text-gray-600">
                  Selected:{' '}
                  <span className="font-semibold text-indigo-600">
                    {bet.selectedOutcome.charAt(0).toUpperCase() +
                      bet.selectedOutcome.slice(1)}
                  </span>{' '}
                  @ {bet.odds.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Stake</div>
                  <div className="font-bold text-gray-800">
                    ${bet.stake.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Potential Win</div>
                  <div className="font-bold text-gray-800">
                    ${bet.potentialWin.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">
                    {bet.status === 'won'
                      ? 'Won'
                      : bet.status === 'lost'
                      ? 'Lost'
                      : 'Possible Return'}
                  </div>
                  <div
                    className={`font-bold ${
                      bet.status === 'won'
                        ? 'text-green-600'
                        : bet.status === 'lost'
                        ? 'text-red-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {bet.status === 'won'
                      ? `+$${bet.potentialWin.toFixed(2)}`
                      : bet.status === 'lost'
                      ? `-$${bet.stake.toFixed(2)}`
                      : `$${bet.potentialWin.toFixed(2)}`}
                  </div>
                </div>
              </div>

              {bet.settledAt && (
                <div className="mt-3 text-xs text-gray-500">
                  Settled: {formatDate(bet.settledAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
