import React from 'react';
import { Search, Filter, Video } from 'lucide-react';
import { FilterState } from '../../types/event';
import { Input } from '../ui/Input';

interface SearchFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: string[];
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ filters, setFilters, categories }) => {
  return (
    <div className="glass-panel p-4 rounded-2xl space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="w-full md:w-96">
          <Input
            icon={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search events by title or keyword..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>

        {/* Virtual Only Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, isVirtualOnly: !prev.isVirtualOnly }))}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              filters.isVirtualOnly
                ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-glow'
                : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>Virtual Only</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 shrink-0 pr-2 border-r border-gray-800">
          <Filter className="w-3.5 h-3.5" /> Category
        </span>

        {categories.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 border border-gray-800/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
