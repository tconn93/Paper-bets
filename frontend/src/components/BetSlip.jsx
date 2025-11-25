import { useState } from 'react';
import { useBetSlipStore } from '../store/betSlipStore';
import { useAuthStore } from '../store/authStore';
import { betApi, authApi } from '../services/api';

export const BetSlip = () => {
  const {
    items,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    getTotalStake,
    getTotalPotentialWin,
  } = useBetSlipStore();
  const { user, updateBalance } = useAuthStore();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculatePotentialWin = (odds, stake) => {
    // Convert American odds to decimal and calculate potential win
    let decimalOdds;
    if (odds > 0) {
      decimalOdds = odds / 100 + 1;
    } else {
      decimalOdds = 100 / Math.abs(odds) + 1;
    }
    return stake * decimalOdds;
  };

  const handleStakeChange = (key, value) => {
    const stake = parseFloat(value) || 0;
    updateStake(key, stake);
  };

  const placeBets = async () => {
    if (!user) return;

    const totalStake = getTotalStake();
    if (totalStake > user.balance) {
      setError('Insufficient balance');
      return;
    }

    if (items.some((item) => !item.stake || item.stake <= 0)) {
      setError('Please enter a valid stake for all bets');
      return;
    }

    setPlacing(true);
    setError('');
    setSuccess('');

    try {
      // Place all bets
      const betPromises = items.map((item) => {
        const betData = {
          game_id: item.game_id,
          sport_key: item.sport_key,
          sport_title: item.sport_title,
          commence_time: item.commence_time,
          home_team: item.home_team,
          away_team: item.away_team,
          bet_type: item.bet_type,
          selected_team: item.selected_team,
          odds: parseFloat(item.odds),
          stake: parseFloat(item.stake),
        };
        console.log('Placing bet:', betData);
        return betApi.place(betData);
      });

      const results = await Promise.all(betPromises);
      console.log('Bet results:', results);

      // Refetch balance to sync with backend
      const balanceResponse = await authApi.getBalance();
      updateBalance(balanceResponse.data.balance);

      setSuccess(`Successfully placed ${items.length} bet(s)!`);
      clearBetSlip();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Bet error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to place bets';
      setError(errorMsg);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Bet Slip</h3>
        <p className="text-gray-500 text-center py-8">
          Your bet slip is empty. Click on odds to add bets.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Bet Slip ({items.length})</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item._key} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm text-gray-600">{item.sport_title}</div>
                <div className="font-semibold">
                  {item.home_team} vs {item.away_team}
                </div>
                <div className="text-sm text-indigo-600">
                  {item.selected_team} @ {item.odds > 0 ? '+' : ''}{item.odds}
                </div>
              </div>
              <button
                onClick={() => removeFromBetSlip(item._key)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stake ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.stake || ''}
                onChange={(e) => handleStakeChange(item._key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter stake"
              />
              {item.stake > 0 && (
                <div className="mt-1 text-sm text-gray-600">
                  Potential win: ${calculatePotentialWin(item.odds, item.stake).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Stake:</span>
          <span className="font-semibold">${getTotalStake().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Potential Win:</span>
          <span className="font-semibold text-green-600">
            ${getTotalPotentialWin().toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your Balance:</span>
          <span className="font-semibold">${user?.balance?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <button
          onClick={placeBets}
          disabled={placing || getTotalStake() === 0}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {placing ? 'Placing Bets...' : 'Place Bets'}
        </button>
        <button
          onClick={clearBetSlip}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear Bet Slip
        </button>
      </div>
    </div>
  );
};