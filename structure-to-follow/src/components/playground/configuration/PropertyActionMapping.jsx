import React, { useState, useEffect } from 'react';
import { Input, Button, Switch } from '@heroui/react';
import SearchableSelect from './SearchableSelect.jsx';

const PropertyActionMapping = ({ 
  onMappingChange, 
  apiResponseData = null,
  initialMapping = {},
  isCompact = false 
}) => {
  // Book Viewing states
  const [showBookViewing, setShowBookViewing] = useState(initialMapping.showBookViewing || false);
  const [bookViewingText, setBookViewingText] = useState(initialMapping.bookViewingText || 'Book Viewing');
  const [bookViewingUrlPath, setBookViewingUrlPath] = useState(initialMapping.bookViewingUrlPath || '');
  const [staticBookViewingUrl, setStaticBookViewingUrl] = useState(initialMapping.staticBookViewingUrl || '');
  const [useStaticBookViewingUrl, setUseStaticBookViewingUrl] = useState(initialMapping.useStaticBookViewingUrl || false);

  // View Details states
  const [showViewDetails, setShowViewDetails] = useState(initialMapping.showViewDetails || false);
  const [viewDetailsText, setViewDetailsText] = useState(initialMapping.viewDetailsText || 'View Details');
  const [viewDetailsUrlPath, setViewDetailsUrlPath] = useState(initialMapping.viewDetailsUrlPath || '');
  const [staticViewDetailsUrl, setStaticViewDetailsUrl] = useState(initialMapping.staticViewDetailsUrl || '');
  const [useStaticViewDetailsUrl, setUseStaticViewDetailsUrl] = useState(initialMapping.useStaticViewDetailsUrl || false);

  // Update state when initialMapping changes
  useEffect(() => {
    if (initialMapping) {
      setShowBookViewing(initialMapping.showBookViewing || false);
      setBookViewingText(initialMapping.bookViewingText || 'Book Viewing');
      setBookViewingUrlPath(initialMapping.bookViewingUrlPath || '');
      setStaticBookViewingUrl(initialMapping.staticBookViewingUrl || '');
      setUseStaticBookViewingUrl(initialMapping.useStaticBookViewingUrl || false);
      setShowViewDetails(initialMapping.showViewDetails || false);
      setViewDetailsText(initialMapping.viewDetailsText || 'View Details');
      setViewDetailsUrlPath(initialMapping.viewDetailsUrlPath || '');
      setStaticViewDetailsUrl(initialMapping.staticViewDetailsUrl || '');
      setUseStaticViewDetailsUrl(initialMapping.useStaticViewDetailsUrl || false);
    }
  }, [initialMapping]);

  // Parse all field paths from API response
  const parseAllFieldPaths = (obj, parentPath = '', paths = new Set()) => {
    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      paths.add(currentPath);

      const value = obj[key];
      
      if (Array.isArray(value)) {
        paths.add(`${currentPath}[]`);
        value.forEach(item => {
          if (item && typeof item === 'object') {
            parseAllFieldPaths(item, `${currentPath}[]`, paths);
          }
        });
      } else if (value && typeof value === 'object') {
        parseAllFieldPaths(value, currentPath, paths);
      }
    });

    return paths;
  };

  // Get all available field paths from API response with fallback
  const getAllFieldPaths = () => {
    if (!apiResponseData) return [];
    
    let paths = new Set();
    
    if (Array.isArray(apiResponseData)) {
      // Strategy 1: Try first object (preferred for properties)
      if (apiResponseData.length > 0 && apiResponseData[0] && typeof apiResponseData[0] === 'object') {
        const firstObjectPaths = parseAllFieldPaths(apiResponseData[0]);
        if (firstObjectPaths.size > 0) {
          console.log('🏠 Property Action fields from first object:', Array.from(firstObjectPaths));
          return Array.from(firstObjectPaths).sort();
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.size > 0) {
            console.log(`🏠 Property Action fields from object at index ${i}:`, Array.from(objectPaths));
            return Array.from(objectPaths).sort();
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('🏠 Property Action fallback: parsing all objects in array');
      apiResponseData.forEach((item, index) => {
        if (item && typeof item === 'object') {
          const itemPaths = parseAllFieldPaths(item);
          itemPaths.forEach(path => paths.add(path));
        }
      });
    } else if (typeof apiResponseData === 'object') {
      // Handle case where apiResponseData is a single object
      const objectPaths = parseAllFieldPaths(apiResponseData);
      objectPaths.forEach(path => paths.add(path));
    }
    
    console.log('🏠 Final property action paths found:', Array.from(paths));
    return Array.from(paths).sort();
  };

  const allPaths = getAllFieldPaths();

  const getFieldOptions = () => {
    const options = [];
    
    // Always add "None" option first
    options.push({ key: '', label: 'None (Don\'t show this button)', example: 'Button will not appear in preview' });
    
    if (!apiResponseData) {
      options.push({ key: 'no-data', label: 'Test your endpoint first', example: 'API response needed to show available fields' });
      return options;
    }

    if (allPaths.length === 0) {
      options.push({ key: 'no-fields', label: 'No fields found', example: 'API response appears to be empty' });
      return options;
    }

    allPaths.forEach(path => {
      options.push({
        key: path,
        label: path,
        example: `API field: ${path}`
      });
    });

    return options;
  };

  // Notify parent component when mappings change
  useEffect(() => {
    const mapping = {
      showBookViewing,
      bookViewingText: bookViewingText || 'Book Viewing',
      bookViewingUrlPath: useStaticBookViewingUrl ? null : (bookViewingUrlPath || null),
      staticBookViewingUrl: useStaticBookViewingUrl ? (staticBookViewingUrl || null) : null,
      useStaticBookViewingUrl,
      showViewDetails,
      viewDetailsText: viewDetailsText || 'View Details',
      viewDetailsUrlPath: useStaticViewDetailsUrl ? null : (viewDetailsUrlPath || null),
      staticViewDetailsUrl: useStaticViewDetailsUrl ? (staticViewDetailsUrl || null) : null,
      useStaticViewDetailsUrl
    };

    if (onMappingChange) {
      onMappingChange(mapping);
    }
  }, [
    showBookViewing, bookViewingText, bookViewingUrlPath, staticBookViewingUrl, useStaticBookViewingUrl,
    showViewDetails, viewDetailsText, viewDetailsUrlPath, staticViewDetailsUrl, useStaticViewDetailsUrl
  ]);

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {/* Book Viewing Section */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h6 className="text-sm font-medium text-gray-800">Book Viewing Button</h6>
            <p className="text-xs text-gray-600">Allow users to book property viewings</p>
          </div>
          <Switch
            size="sm"
            isSelected={showBookViewing}
            onValueChange={setShowBookViewing}
            className="ml-2"
            aria-label="Enable book viewing button"
          />
        </div>

        {showBookViewing && (
          <div className="space-y-3">
            {/* Button Text */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Button Text
              </label>
              <Input
                size="sm"
                placeholder="Book Viewing"
                value={bookViewingText}
                onChange={(e) => setBookViewingText(e.target.value)}
                className="w-full"
              />
            </div>

            {/* URL Source Toggle */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-700">URL Source</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={!useStaticBookViewingUrl ? "solid" : "bordered"}
                  className={!useStaticBookViewingUrl ? "bg-brand text-dark" : ""}
                  onPress={() => setUseStaticBookViewingUrl(false)}
                >
                  Dynamic
                </Button>
                <Button
                  size="sm"
                  variant={useStaticBookViewingUrl ? "solid" : "bordered"}
                  className={useStaticBookViewingUrl ? "bg-brand text-dark" : ""}
                  onPress={() => setUseStaticBookViewingUrl(true)}
                >
                  Static
                </Button>
              </div>
            </div>

            {/* Dynamic URL Field */}
            {!useStaticBookViewingUrl && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Book Viewing URL Field
                </label>
                <SearchableSelect
                  options={getFieldOptions()}
                  value={bookViewingUrlPath}
                  onChange={setBookViewingUrlPath}
                  placeholder="Select URL field from API response..."
                  className="w-full"
                />
              </div>
            )}

            {/* Static URL Input */}
            {useStaticBookViewingUrl && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Static Book Viewing URL
                </label>
                <Input
                  size="sm"
                  placeholder="https://example.com/book-viewing"
                  value={staticBookViewingUrl}
                  onChange={(e) => setStaticBookViewingUrl(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Details Section */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h6 className="text-sm font-medium text-gray-800">View Details Button</h6>
            <p className="text-xs text-gray-600">Link to detailed property information</p>
          </div>
          <Switch
            size="sm"
            isSelected={showViewDetails}
            onValueChange={setShowViewDetails}
            className="ml-2"
            aria-label="Enable view details button"
          />
        </div>

        {showViewDetails && (
          <div className="space-y-3">
            {/* Button Text */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Button Text
              </label>
              <Input
                size="sm"
                placeholder="View Details"
                value={viewDetailsText}
                onChange={(e) => setViewDetailsText(e.target.value)}
                className="w-full"
              />
            </div>

            {/* URL Source Toggle */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-xs text-gray-700">URL Source</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={!useStaticViewDetailsUrl ? "solid" : "bordered"}
                  className={!useStaticViewDetailsUrl ? "bg-brand text-dark" : ""}
                  onPress={() => setUseStaticViewDetailsUrl(false)}
                >
                  Dynamic
                </Button>
                <Button
                  size="sm"
                  variant={useStaticViewDetailsUrl ? "solid" : "bordered"}
                  className={useStaticViewDetailsUrl ? "bg-brand text-dark" : ""}
                  onPress={() => setUseStaticViewDetailsUrl(true)}
                >
                  Static
                </Button>
              </div>
            </div>

            {/* Dynamic URL Field */}
            {!useStaticViewDetailsUrl && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  View Details URL Field
                </label>
                <SearchableSelect
                  options={getFieldOptions()}
                  value={viewDetailsUrlPath}
                  onChange={setViewDetailsUrlPath}
                  placeholder="Select URL field from API response..."
                  className="w-full"
                />
              </div>
            )}

            {/* Static URL Input */}
            {useStaticViewDetailsUrl && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Static View Details URL
                </label>
                <Input
                  size="sm"
                  placeholder="https://example.com/property-details"
                  value={staticViewDetailsUrl}
                  onChange={(e) => setStaticViewDetailsUrl(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button Previews - Only show if buttons are actually configured */}
      {((showBookViewing && (useStaticBookViewingUrl ? staticBookViewingUrl?.trim() : bookViewingUrlPath?.trim())) || 
        (showViewDetails && (useStaticViewDetailsUrl ? staticViewDetailsUrl?.trim() : viewDetailsUrlPath?.trim()))) && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <h6 className="text-xs font-medium text-gray-700 mb-2">Button Preview:</h6>
          <div className="flex flex-col gap-2">
            {showBookViewing && (useStaticBookViewingUrl ? staticBookViewingUrl?.trim() : bookViewingUrlPath?.trim()) && (
              <Button
                size="sm"
                className="bg-brand text-dark"
                disabled
              >
                {bookViewingText || 'Book Viewing'}
              </Button>
            )}
            {showViewDetails && (useStaticViewDetailsUrl ? staticViewDetailsUrl?.trim() : viewDetailsUrlPath?.trim()) && (
              <Button
                size="sm"
                variant="bordered"
                className="border-gray-300 text-gray-700"
                disabled
              >
                {viewDetailsText || 'View Details'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Show helpful message when no buttons are configured */}
      {(!showBookViewing && !showViewDetails) && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            💡 Enable "Book Viewing" or "View Details" buttons above to add actions to your property cards.
          </p>
        </div>
      )}

      {/* Debug View */}
      {allPaths.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Debug: Show all detected API fields ({allPaths.length} fields)
          </summary>
          <div className="mt-2 p-2 bg-gray-50 rounded border max-h-32 overflow-y-auto">
            {allPaths.map((path, index) => (
              <div key={index} className="font-mono text-xs">
                {path}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default PropertyActionMapping;
