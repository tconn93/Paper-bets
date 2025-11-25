import { useBetSlipStore } from '../store/betSlipStore';
import type { Odd } from '../types';

interface OddsCardProps {
  odd: Odd;
}

export const OddsCard = ({ odd }: OddsCardProps) => {
  const { addToBetSlip, items } = useBetSlipStore();

  const handleAddBet = (outcome: 'home' | 'away' | 'draw', odds: number) => {
    addToBetSlip({
      oddId: odd.id,
      sport: odd.sport,
      homeTeam: odd.homeTeam,
      awayTeam: odd.awayTeam,
      selectedOutcome: outcome,
      odds,
      stake: 0,
    });
  };

  const isInBetSlip = (outcome: 'home' | 'away' | 'draw') => {
    return items.some(
      (item) => item.oddId === odd.id && item.selectedOutcome === outcome
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold">
            {odd.sport}
          </span>
          <span className="ml-2 text-sm text-gray-600">{odd.league}</span>
        </div>
        <span className="text-sm text-gray-500">{formatDate(odd.startTime)}</span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {odd.homeTeam} vs {odd.awayTeam}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAddBet('home', odd.homeOdds)}
          disabled={odd.status !== 'upcoming'}
          className={`p-3 rounded-lg border-2 transition-all ${
            isInBetSlip('home')
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          } ${
            odd.status !== 'upcoming'
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <div className="text-sm font-medium">{odd.homeTeam}</div>
          <div className="text-lg font-bold">{odd.homeOdds.toFixed(2)}</div>
        </button>

        {odd.drawOdds && (
          <button
            onClick={() => handleAddBet('draw', odd.drawOdds!)}
            disabled={odd.status !== 'upcoming'}
            className={`p-3 rounded-lg border-2 transition-all ${
              isInBetSlip('draw')
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${
              odd.status !== 'upcoming'
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div className="text-sm font-medium">Draw</div>
            <div className="text-lg font-bold">{odd.drawOdds.toFixed(2)}</div>
          </button>
        )}

        <button
          onClick={() => handleAddBet('away', odd.awayOdds)}
          disabled={odd.status !== 'upcoming'}
          className={`p-3 rounded-lg border-2 transition-all ${
            isInBetSlip('away')
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          } ${
            odd.status !== 'upcoming'
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <div className="text-sm font-medium">{odd.awayTeam}</div>
          <div className="text-lg font-bold">{odd.awayOdds.toFixed(2)}</div>
        </button>
      </div>

      {odd.status !== 'upcoming' && (
        <div className="mt-3 text-center">
          <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
            {odd.status === 'live' ? 'Live' : 'Finished'}
          </span>
        </div>
      )}
    </div>
  );
};
