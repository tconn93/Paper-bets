import { useState } from 'react';
import { useBetSlipStore } from '../store/betSlipStore';
import { useAuthStore } from '../store/authStore';
import { betApi } from '../services/api';

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

  const handleStakeChange = (oddId: string, value: string) => {
    const stake = parseFloat(value) || 0;
    updateStake(oddId, stake);
  };

  const placeBets = async () => {
    if (!user) return;

    const totalStake = getTotalStake();
    if (totalStake > user.balance) {
      setError('Insufficient balance');
      return;
    }

    if (items.some((item) => item.stake <= 0)) {
      setError('Please enter a valid stake for all bets');
      return;
    }

    setPlacing(true);
    setError('');
    setSuccess('');

    try {
      // Place all bets
      const betPromises = items.map((item) =>
        betApi.place({
          oddId: item.oddId,
          selectedOutcome: item.selectedOutcome,
          stake: item.stake,
        })
      );

      await Promise.all(betPromises);

      // Update balance
      updateBalance(user.balance - totalStake);

      setSuccess(`Successfully placed ${items.length} bet(s)!`);
      clearBetSlip();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place bets');
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
          <div key={item.oddId} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm text-gray-600">{item.sport}</div>
                <div className="font-semibold">
                  {item.homeTeam} vs {item.awayTeam}
                </div>
                <div className="text-sm text-indigo-600">
                  {item.selectedOutcome.charAt(0).toUpperCase() +
                    item.selectedOutcome.slice(1)}{' '}
                  @ {item.odds.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => removeFromBetSlip(item.oddId)}
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
                onChange={(e) => handleStakeChange(item.oddId, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter stake"
              />
              {item.stake > 0 && (
                <div className="mt-1 text-sm text-gray-600">
                  Potential win: ${(item.stake * item.odds).toFixed(2)}
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
          <span className="font-semibold">${user?.balance.toFixed(2)}</span>
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
