import React, { useState } from 'react';
import { Input, Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { ChevronDown, Search } from 'lucide-react';

const SearchableSelect = ({ 
  value, 
  onChange, 
  placeholder, 
  options = [], 
  searchTerm: externalSearchTerm, 
  onSearchChange: externalOnSearchChange,
  ariaLabel,
  allowEmpty = false,
  emptyLabel = 'None',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  
  // Use external search term if provided, otherwise use internal state
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const onSearchChange = externalOnSearchChange || setInternalSearchTerm;
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option.key);
    setIsOpen(false);
    onSearchChange(''); // Clear search when selecting
  };

  const selectedOption = options.find(opt => opt.key === value);

  return (
    <div className={className}>
      <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-start">
        <PopoverTrigger>
          <Button
            variant="bordered"
            className="w-full justify-between h-10 px-3"
            endContent={<ChevronDown className="w-4 h-4 text-gray-400" />}
            aria-label={ariaLabel}
            isDisabled={disabled}
          >
            <span className="text-left truncate text-sm">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-white shadow-lg border border-gray-200 rounded-lg">
          <div className="p-2 w-full border-b border-gray-200 bg-white">
            <Input
              size="sm"
              placeholder="Search fields..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              value={searchTerm}
              onValueChange={onSearchChange}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto bg-white">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                {searchTerm ? 'No matching fields found' : 'No fields available'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {option.example}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          
          {/* Show results count when filtering */}
          {searchTerm && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center">
              {filteredOptions.length} of {options.length} fields shown
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchableSelect;
