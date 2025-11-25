import { useBetSlipStore } from '../store/betSlipStore';

export const OddsCard = ({ odd }) => {
  const { addToBetSlip, items } = useBetSlipStore();

  const handleAddBet = (betType, team, odds) => {
    addToBetSlip({
      game_id: odd.id,
      sport_key: odd.sport_key,
      sport_title: odd.sport_title,
      commence_time: odd.commence_time,
      home_team: odd.home_team,
      away_team: odd.away_team,
      bet_type: betType,
      selected_team: team,
      odds,
      stake: 0,
    });
  };

  const isInBetSlip = (betType, team) => {
    return items.some(
      (item) => item.game_id === odd.id && item.bet_type === betType && item.selected_team === team
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = new Date(odd.commence_time) > new Date();
  const hasH2HOdds = odd.odds?.h2h;

  if (!hasH2HOdds) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold">
            {odd.sport_title}
          </span>
        </div>
        <span className="text-sm text-gray-500">{formatDate(odd.commence_time)}</span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {odd.home_team} vs {odd.away_team}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-600 mb-2">MONEYLINE</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddBet('h2h', odd.home_team, odd.odds.h2h.home)}
            disabled={!isUpcoming}
            className={`p-3 rounded-lg border-2 transition-all ${
              isInBetSlip('h2h', odd.home_team)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${
              !isUpcoming
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div className="text-sm font-medium truncate">{odd.home_team}</div>
            <div className="text-lg font-bold">{odd.odds.h2h.home > 0 ? '+' : ''}{odd.odds.h2h.home}</div>
          </button>

          <button
            onClick={() => handleAddBet('h2h', odd.away_team, odd.odds.h2h.away)}
            disabled={!isUpcoming}
            className={`p-3 rounded-lg border-2 transition-all ${
              isInBetSlip('h2h', odd.away_team)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${
              !isUpcoming
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <div className="text-sm font-medium truncate">{odd.away_team}</div>
            <div className="text-lg font-bold">{odd.odds.h2h.away > 0 ? '+' : ''}{odd.odds.h2h.away}</div>
          </button>
        </div>
      </div>

      {!isUpcoming && (
        <div className="mt-3 text-center">
          <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
            Game Started
          </span>
        </div>
      )}
    </div>
  );
};