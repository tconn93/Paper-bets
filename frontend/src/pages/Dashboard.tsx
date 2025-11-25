import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { betApi } from '../services/api';
import { OddsList } from '../components/OddsList';
import { BetSlip } from '../components/BetSlip';
import type { UserStats } from '../types';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await betApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Your current balance: <span className="font-bold text-indigo-600">${user?.balance.toFixed(2)}</span>
          </p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm mb-1">Total Bets</div>
              <div className="text-3xl font-bold text-gray-800">{stats.totalBets}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm mb-1">Win Rate</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalBets > 0
                  ? ((stats.wonBets / stats.totalBets) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm mb-1">Total Staked</div>
              <div className="text-3xl font-bold text-gray-800">
                ${stats.totalStaked.toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm mb-1">Profit/Loss</div>
              <div
                className={`text-3xl font-bold ${
                  stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats.profitLoss >= 0 ? '+' : ''}${stats.profitLoss.toFixed(2)}
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <OddsList />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BetSlip />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
