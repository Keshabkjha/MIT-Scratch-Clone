import React, { useState, useEffect, useRef } from 'react';
import { FaHistory, FaPlay, FaPause, FaTrash, FaFilter, FaChartBar } from 'react-icons/fa';
import AnalyticsDashboard from './AnalyticsDashboard';

const actionTypeIcon = (type) => {
  switch (type) {
    case 'move': return <span className="text-blue-500"><FaPlay size={18} /></span>;
    case 'turn': return <span className="text-amber-500 text-lg">⟳</span>;
    case 'say': return <span className="text-green-500 text-lg">💬</span>;
    case 'think': return <span className="text-purple-500 text-lg">💭</span>;
    case 'scale': return <span className="text-pink-500 text-lg">⤡</span>;
    default: return <span>🔹</span>;
  }
};

const spriteBadge = (id) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ml-1 ${
    id === 1 ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
  }`}>
    Sprite {id}
  </span>
);

// Add custom keyframes for pulse and bounce
const addDynamicAnalyticsButtonStyles = () => {
  if (document.getElementById('analytics-btn-animations')) return;
  const style = document.createElement('style');
  style.id = 'analytics-btn-animations';
  style.innerHTML = `
    @keyframes analytics-pulse {
      0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5), 0 4px 24px 0 rgba(80,0,120,0.18); }
      70% { box-shadow: 0 0 0 16px rgba(168,85,247,0); 0 4px 24px 0 rgba(80,0,120,0.18); }
      100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5), 0 4px 24px 0 rgba(80,0,120,0.18); }
    }
    @keyframes analytics-bounce {
      0%, 100% { transform: translateY(0); }
      20% { transform: translateY(-10px) scale(1.08); }
      40% { transform: translateY(0); }
      60% { transform: translateY(-6px) scale(1.04); }
      80% { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
};

const ActionHistoryFooter = ({
  actionQueue,
  onReplay,
  onClear,
  onPauseResume,
  isReplaying,
  replayIndex,
  spriteFilter,
  setSpriteFilter
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [bounce, setBounce] = useState(false);
  const bounceTimeout = useRef(); // No initial value

  useEffect(() => {
    addDynamicAnalyticsButtonStyles();
    // Initial bounce
    setBounce(true);
    let initial = setTimeout(() => setBounce(false), 900);
    // Periodic bounce every 10s
    const interval = setInterval(() => {
      setBounce(true);
      bounceTimeout.current = setTimeout(() => setBounce(false), 900);
    }, 10000);
    return () => {
      clearTimeout(initial);
      if (bounceTimeout.current) clearTimeout(bounceTimeout.current);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="w-full px-2 md:px-0 fixed left-0 bottom-0 z-50 flex justify-center items-end pointer-events-none">
      <div className="w-full max-w-5xl mx-auto mb-4 pointer-events-auto relative">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-4 py-5 md:py-6 flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-center md:justify-start">
              <span className="flex items-center gap-2 text-2xl font-extrabold text-blue-800 drop-shadow-sm">
                <FaHistory className="inline-block" size={28} />
                Action History
              </span>
              <div className="relative group w-44">
                <FaFilter className="absolute left-2 top-3 text-gray-400 pointer-events-none" size={16} />
                <select
                  className="pl-8 pr-2 py-2 border border-gray-200 rounded-lg text-base bg-white/80 focus:ring-2 focus:ring-blue-200 transition w-full shadow-sm hover:border-blue-400 font-semibold"
                  value={spriteFilter}
                  onChange={e => setSpriteFilter(e.target.value)}
                  title="Filter by sprite"
                >
                  <option value="all">All Sprites</option>
                  <option value="1">Sprite 1</option>
                  <option value="2">Sprite 2</option>
                </select>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-300 transition disabled:opacity-50 text-base"
                onClick={onReplay}
                disabled={isReplaying || actionQueue.length === 0}
                title="Replay all actions"
              >
                <FaPlay size={18} /> {isReplaying ? 'Replaying...' : 'Replay'}
              </button>
              {isReplaying && (
                <button
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-600 focus:ring-2 focus:ring-yellow-300 transition text-base"
                  onClick={onPauseResume}
                  title="Pause or resume replay"
                >
                  <FaPause size={18} /> Pause/Resume
                </button>
              )}
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-300 transition disabled:opacity-50 text-base"
                onClick={onClear}
                disabled={actionQueue.length === 0}
                title="Clear action history"
              >
                <FaTrash size={18} /> Clear
              </button>
            </div>
          </div>
          {/* Action List */}
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
            <ul className="flex flex-row gap-4 py-3 px-1 min-h-[90px] md:min-h-[80px] overflow-x-auto font-mono">
              {actionQueue.length === 0 && (
                <li className="flex items-center justify-center w-full text-gray-400 italic text-base mx-auto">No actions yet.</li>
              )}
              {actionQueue
                .filter(a => spriteFilter === 'all' || a.spriteId === Number(spriteFilter))
                .map((action, idx) => (
                  <li
                    key={action.timestamp || idx}
                    className={`flex flex-col items-center px-5 py-3 rounded-xl border-2 whitespace-nowrap shadow-md transition-all duration-200 min-w-[170px] max-w-xs bg-gradient-to-br ${
                      isReplaying && replayIndex === idx
                        ? 'from-blue-100 to-blue-50 border-blue-500 text-blue-900 scale-105 animate-pulse ring-2 ring-blue-300'
                        : 'from-white to-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                      {spriteBadge(action.spriteId)}
                    </span>
                    <span className="flex items-center gap-2 mb-1 text-lg">
                      {actionTypeIcon(action.type)}
                      <span className="font-semibold capitalize text-base">{action.type}</span>
                    </span>
                    <span className="text-sm text-gray-600 mb-1 font-semibold break-all">{action.value}</span>
                    <span className="text-xs text-gray-400">{action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        {/* Floating Analytics Button - Bottom Center */}
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-24 md:bottom-20 z-50 group select-none">
          <button
            className={`bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-white rounded-full shadow-2xl p-4 md:p-5 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 hover:scale-110 ${
              bounce ? 'animate-analytics-bounce' : ''
            } animate-analytics-pulse border-4 border-white`}
            style={{
              animation: 'analytics-pulse 2s infinite',
              fontSize: '1.8rem',
              position: 'relative',
              zIndex: 60
            }}
            onClick={() => setShowAnalytics(true)}
            title="View Analytics"
            tabIndex={0}
            aria-label="View Analytics"
          >
            <FaChartBar size={32} />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
            <div className="bg-black text-white text-xs rounded px-3 py-1 shadow-lg font-semibold whitespace-nowrap">
              📊 View Analytics
            </div>
          </div>
        </div>
        <AnalyticsDashboard
          open={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          actionQueue={actionQueue}
        />
      </div>
    </footer>
  );
};

export default ActionHistoryFooter; 