import React from 'react';
import { FaHistory, FaPlay, FaPause, FaTrash, FaFilter } from 'react-icons/fa';

const actionTypeIcon = (type) => {
  switch (type) {
    case 'move': return <span className="text-blue-500"><FaPlay size={20} /></span>;
    case 'turn': return <span className="text-amber-500 text-xl">⟳</span>;
    case 'say': return <span className="text-green-500 text-xl">💬</span>;
    case 'think': return <span className="text-purple-500 text-xl">💭</span>;
    case 'scale': return <span className="text-pink-500 text-xl">⤡</span>;
    default: return <span>🔹</span>;
  }
};

const spriteBadge = (id) => (
  <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ml-1 shadow ${
    id === 1 ? 'bg-blue-200 text-blue-800' : 'bg-pink-200 text-pink-800'
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
    <footer className="w-full bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-2xl sticky bottom-0 z-40 transition-all duration-300">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4">
        {/* Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
          <span className="flex items-center gap-3 text-2xl font-extrabold text-blue-800 drop-shadow-sm">
            <FaHistory className="inline-block" size={32} />
            Action History
          </span>
          <div className="relative group w-44">
            <FaFilter className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
            <select
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-base bg-white/80 focus:ring-2 focus:ring-blue-200 transition w-full shadow hover:border-blue-400"
              value={spriteFilter}
              onChange={e => setSpriteFilter(e.target.value)}
              title="Filter by sprite"
            >
              <option value="all">All Sprites</option>
              <option value="1">Sprite 1</option>
              <option value="2">Sprite 2</option>
            </select>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-300 transition disabled:opacity-50 text-lg"
              onClick={onReplay}
              disabled={isReplaying || actionQueue.length === 0}
              title="Replay all actions"
            >
              <FaPlay size={20} /> {isReplaying ? 'Replaying...' : 'Replay'}
            </button>
            {isReplaying && (
              <button
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg hover:from-yellow-500 hover:to-yellow-600 focus:ring-2 focus:ring-yellow-300 transition text-lg"
                onClick={onPauseResume}
                title="Pause or resume replay"
              >
                <FaPause size={20} /> Pause/Resume
              </button>
            )}
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-300 transition disabled:opacity-50 text-lg"
              onClick={onClear}
              disabled={actionQueue.length === 0}
              title="Clear action history"
            >
              <FaTrash size={20} /> Clear
            </button>
          </div>
        </div>
        {/* Action List */}
        <div className="w-full bg-gradient-to-r from-gray-50/90 to-white/90 border-t border-gray-100 rounded-b-2xl py-3 px-2">
          <ul className="flex flex-row gap-6 py-2 px-2 min-h-[100px] overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
            {actionQueue.length === 0 && (
              <li className="text-gray-400 italic text-lg">No actions yet.</li>
            )}
            {actionQueue
              .filter(a => spriteFilter === 'all' || a.spriteId === Number(spriteFilter))
              .map((action, idx) => (
                <li
                  key={action.timestamp || idx}
                  className={`flex flex-col items-center px-8 py-4 rounded-2xl border-2 font-mono whitespace-nowrap shadow-lg transition-all duration-200 ${
                    isReplaying && replayIndex === idx
                      ? 'bg-blue-100 border-blue-500 text-blue-900 scale-105 animate-pulse ring-2 ring-blue-300'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  style={{ minWidth: 170 }}
                >
                  <span className="flex items-center gap-3 mb-3">
                    <span className="text-base font-bold text-gray-400">#{idx + 1}</span>
                    {spriteBadge(action.spriteId)}
                  </span>
                  <span className="flex items-center gap-3 mb-2 text-xl">
                    {actionTypeIcon(action.type)}
                    <span className="font-semibold capitalize text-lg">{action.type}</span>
                  </span>
                  <span className="text-base text-gray-600 mb-1 font-semibold">{action.value}</span>
                  <span className="text-xs text-gray-400">{action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default ActionHistoryFooter; 