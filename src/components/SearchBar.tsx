import React, {
  type Dispatch,
  type SetStateAction,
  useState,
  type ChangeEvent,
} from 'react';
import { SearchIcon } from './Icons';

type SearchElement = {
  id: string;
  name: string;
};
type SearchBarProps<T extends SearchElement> = {
  placeholder: string;
  setSearch: Dispatch<SetStateAction<string>>;
  searchResults?: Array<T>;
  onClick?: (input: T) => void;
};

const SearchBar = <T extends SearchElement>({
  placeholder,
  setSearch,
  searchResults,
  onClick,
}: SearchBarProps<T>) => {
  const [focused, setFocused] = useState(false);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full max-w-xs px-5 py-4 md:max-w-sm lg:max-w-md">
      <div className="relative ">
        <span className="absolute inset-y-0 flex items-center pl-3">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          className="h-10 w-full rounded-full border pl-10 pr-3 focus:outline-none"
          tabIndex={0}
          onChange={handleSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 300)}
        />
        {focused && searchResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-sm shadow-lg">
            {searchResults.map((item) => (
              <button
                type="button"
                key={item.name}
                className="w-full bg-gray-50 px-4 py-2 text-left font-semibold hover:bg-gray-200"
                onClick={() => (onClick ? onClick(item) : null)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchBar;
