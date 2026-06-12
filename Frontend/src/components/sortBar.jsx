import { useState } from 'react';

const SORT_OPTIONS = [
  { key: 'date',  label: 'Date'  },
  { key: 'price', label: 'Price' },
  { key: 'title', label: 'Title' },
];

const SortBar = ({ onSortChange }) => {
  const [active, setActive] = useState('date');
  const [direction, setDirection] = useState('desc');

  const handleClick = (key) => {
    if (active === key) {
      const newDir = direction === 'asc' ? 'desc' : 'asc';
      setDirection(newDir);
      onSortChange(key, newDir);
    } else {
      setActive(key);
      setDirection('desc');
      onSortChange(key, 'desc');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Sort by</span>
      {SORT_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => handleClick(key)}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border transition-colors
            ${active === key
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
              : 'text-gray-600 border-gray-200 hover:border-gray-300 dark:text-gray-400 dark:border-gray-700'
            }`}
        >
          {label}
          {active === key && (
            <span className="text-xs">{direction === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SortBar;