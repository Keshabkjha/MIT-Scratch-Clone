import React from 'react';
import { FaHistory, FaPlay, FaPause, FaTrash, FaFilter } from 'react-icons/fa';

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
  return (
    <footer className="w-full bg-white/70 backdrop-blur-lg border-t border-gray-200 shadow-2xl rounded-t-2xl py-4 px-0 sticky bottom-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-center md:justify-start">
          <span className="flex items-center gap-2 text-2xl font-extrabold text-blue-800 drop-shadow-sm">
            <FaHistory className="inline-block" size={28} />
            Action History
          </span>
          <div className="relative group w-40">
            <FaFilter className="absolute left-2 top-3 text-gray-400 pointer-events-none" size={16} />
            <select
              className="pl-8 pr-2 py-2 border border-gray-200 rounded-lg text-base bg-white/80 focus:ring-2 focus:ring-blue-200 transition w-full shadow-sm hover:border-blue-400"
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
        <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end mt-2 md:mt-0">
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-300 transition disabled:opacity-50"
            onClick={onReplay}
            disabled={isReplaying || actionQueue.length === 0}
            title="Replay all actions"
          >
            <FaPlay size={18} /> {isReplaying ? 'Replaying...' : 'Replay'}
          </button>
          {isReplaying && (
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-600 focus:ring-2 focus:ring-yellow-300 transition"
              onClick={onPauseResume}
              title="Pause or resume replay"
            >
              <FaPause size={18} /> Pause/Resume
            </button>
          )}
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-300 transition disabled:opacity-50"
            onClick={onClear}
            disabled={actionQueue.length === 0}
            title="Clear action history"
          >
            <FaTrash size={18} /> Clear
          </button>
        </div>
      </div>
      {/* Action List */}
      <div className="overflow-x-auto w-full bg-gradient-to-r from-gray-50/80 to-white/80 border-t border-gray-100 mt-4 rounded-b-2xl">
        <ul className="flex flex-row gap-4 py-4 px-4 min-h-[80px] overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
          {actionQueue.length === 0 && (
            <li className="text-gray-400 italic text-base">No actions yet.</li>
          )}
          {actionQueue
            .filter(a => spriteFilter === 'all' || a.spriteId === Number(spriteFilter))
            .map((action, idx) => (
              <li
                key={action.timestamp || idx}
                className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 font-mono whitespace-nowrap shadow-md transition-all duration-200 ${
                  isReplaying && replayIndex === idx
                    ? 'bg-blue-100 border-blue-500 text-blue-900 scale-105 animate-pulse ring-2 ring-blue-300'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
                style={{ minWidth: 140 }}
              >
                <span className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                  {spriteBadge(action.spriteId)}
                </span>
                <span className="flex items-center gap-2 mb-2 text-lg">
                  {actionTypeIcon(action.type)}
                  <span className="font-semibold capitalize text-base">{action.type}</span>
                </span>
                <span className="text-sm text-gray-600 mb-1 font-semibold">{action.value}</span>
                <span className="text-xs text-gray-400">{action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}</span>
              </li>
            ))}
        </ul>
      </div>
    </footer>
  );
};

export default ActionHistoryFooter; 