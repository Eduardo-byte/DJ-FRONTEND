import React, { useState } from 'react';
import { Input } from '@heroui/react';
import SearchableSelect from './SearchableSelect.jsx';

const ProductActionMapping = ({ 
  onMappingChange,
  apiResponseData = null,
  isCompact = true
}) => {
  const [buttonText, setButtonText] = useState('');
  const [redirectUrlPath, setRedirectUrlPath] = useState('');
  const [staticRedirectUrl, setStaticRedirectUrl] = useState('');
  const [useStaticUrl, setUseStaticUrl] = useState(false);

  // Search states for dropdowns
  const [redirectUrlSearchTerm, setRedirectUrlSearchTerm] = useState('');

  // Parse API response to extract ALL unique field paths (reused from other components)
  const parseAllFieldPaths = (obj, currentPath = '') => {
    const paths = [];
    const seenPaths = new Set();
    
    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value)) {
        if (!seenPaths.has(newPath)) {
          paths.push({ 
            path: newPath, 
            type: 'array', 
            description: `Array (${value.length} items)`,
            value: `[${value.length} items]`
          });
          seenPaths.add(newPath);
        }
        
        if (value.length > 0) {
          if (typeof value[0] === 'object') {
            const allArrayKeys = new Set();
            const sampleValues = {};
            
            value.forEach(item => {
              if (item && typeof item === 'object') {
                Object.keys(item).forEach(itemKey => {
                  allArrayKeys.add(itemKey);
                  if (!sampleValues[itemKey]) {
                    sampleValues[itemKey] = item[itemKey];
                  }
                });
              }
            });
            
            allArrayKeys.forEach(arrayKey => {
              const arrayItemPath = `${newPath}[].${arrayKey}`;
              const sampleValue = sampleValues[arrayKey];
              
              if (!seenPaths.has(arrayItemPath)) {
                if (Array.isArray(sampleValue)) {
                  paths.push({
                    path: arrayItemPath,
                    type: 'array',
                    description: `Array within array items`,
                    value: `[${sampleValue.length} items]`
                  });
                } else if (sampleValue && typeof sampleValue === 'object') {
                  paths.push({
                    path: arrayItemPath,
                    type: 'object',
                    description: `Object within array items`,
                    value: '{...}'
                  });
                } else {
                  paths.push({
                    path: arrayItemPath,
                    type: typeof sampleValue,
                    description: `${typeof sampleValue} within array items`,
                    value: sampleValue
                  });
                }
                seenPaths.add(arrayItemPath);
              }
            });
          } else {
            const primitiveArrayPath = `${newPath}[]`;
            if (!seenPaths.has(primitiveArrayPath)) {
              paths.push({
                path: primitiveArrayPath,
                type: `array of ${typeof value[0]}`,
                description: `Array items (${typeof value[0]})`,
                value: value[0]
              });
              seenPaths.add(primitiveArrayPath);
            }
          }
        }
      } else if (value && typeof value === 'object') {
        if (!seenPaths.has(newPath)) {
          paths.push({ 
            path: newPath, 
            type: 'object',
            description: `Object (${Object.keys(value).length} properties)`,
            value: '{...}'
          });
          seenPaths.add(newPath);
        }
        
        const nestedPaths = parseAllFieldPaths(value, newPath);
        paths.push(...nestedPaths.filter(p => !seenPaths.has(p.path)));
        nestedPaths.forEach(p => seenPaths.add(p.path));
      } else {
        if (!seenPaths.has(newPath)) {
          paths.push({ 
            path: newPath, 
            type: typeof value,
            description: `${typeof value}`,
            value: value
          });
          seenPaths.add(newPath);
        }
      }
    });

    return paths;
  };

  // Get all available field paths from API response with fallback
  const getAllFieldPaths = () => {
    if (!apiResponseData) return [];
    
    let paths = [];
    
    if (Array.isArray(apiResponseData)) {
      // Strategy 1: Try first object (preferred for properties)
      if (apiResponseData.length > 0 && apiResponseData[0] && typeof apiResponseData[0] === 'object') {
        const firstObjectPaths = parseAllFieldPaths(apiResponseData[0]);
        if (firstObjectPaths.length > 0) {
          console.log('🛍️ Product Action fields from first object:', firstObjectPaths);
          return firstObjectPaths;
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.length > 0) {
            console.log(`🛍️ Product Action fields from object at index ${i}:`, objectPaths);
            return objectPaths;
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('🛍️ Product Action fallback: parsing all objects in array');
      let allPaths = [];
      apiResponseData.forEach((item, index) => {
        if (item && typeof item === 'object') {
          const itemPaths = parseAllFieldPaths(item);
          allPaths = [...allPaths, ...itemPaths];
        }
      });
      // Remove duplicates and return
      paths = [...new Set(allPaths)];
    } else if (typeof apiResponseData === 'object') {
      // Handle case where apiResponseData is a single object
      paths = parseAllFieldPaths(apiResponseData);
    }
    
    console.log('🛍️ Final product action paths found:', paths);
    return paths;
  };

  const allPaths = getAllFieldPaths();

  const getFieldOptions = () => {
    const options = [];
    
    if (!apiResponseData) {
      options.push({ key: '', label: 'Test your endpoint first', example: 'API response needed to show available fields' });
      return options;
    }

    if (allPaths.length === 0) {
      options.push({ key: '', label: 'No fields found', example: 'API response appears to be empty' });
      return options;
    }

    allPaths.forEach(path => {
      options.push({
        key: path.path,
        label: path.path,
        example: `${path.description} | ${path.value ? `Sample: "${String(path.value).substring(0, 50)}${String(path.value).length > 50 ? '...' : ''}"` : 'No sample data'}`
      });
    });

    return options;
  };

  const handleMappingUpdate = (field, value) => {
    let newMapping = {
      buttonText: field === 'buttonText' ? value : buttonText,
      redirectUrlPath: field === 'redirectUrlPath' ? value : redirectUrlPath,
      staticRedirectUrl: field === 'staticRedirectUrl' ? value : staticRedirectUrl,
      useStaticUrl: field === 'useStaticUrl' ? value : useStaticUrl
    };
    
    // Update local state
    if (field === 'buttonText') setButtonText(value);
    if (field === 'redirectUrlPath') setRedirectUrlPath(value);
    if (field === 'staticRedirectUrl') setStaticRedirectUrl(value);
    if (field === 'useStaticUrl') setUseStaticUrl(value);
    
    // Notify parent
    onMappingChange(newMapping);
  };

  const presetButtons = [
    'Buy Now',
    'Add to Cart',
    'Learn More',
    'View Details',
    'Shop Now',
    'Get Quote',
    'Order Now',
    'Book Now',
    'Contact Us',
    'Download'
  ];

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {/* Button Text Configuration */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Button Text
        </label>
        <Input
          size="sm"
          placeholder="Enter button text (e.g., 'Buy Now', 'Learn More')"
          value={buttonText}
          onValueChange={(value) => handleMappingUpdate('buttonText', value)}
          className="w-full"
          aria-label="Enter button text"
        />
        
        {/* Preset Button Options */}
        <div className="flex flex-wrap gap-1 mt-2">
          {presetButtons.map((preset) => (
            <button
              key={preset}
              onClick={() => handleMappingUpdate('buttonText', preset)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* URL Configuration Type Toggle */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Redirect URL Source
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleMappingUpdate('useStaticUrl', false)}
            className={`flex-1 text-xs px-3 py-2 rounded border transition-colors ${
              !useStaticUrl 
                ? 'bg-brand text-dark border-brand' 
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            From API Response
          </button>
          <button
            onClick={() => handleMappingUpdate('useStaticUrl', true)}
            className={`flex-1 text-xs px-3 py-2 rounded border transition-colors ${
              useStaticUrl 
                ? 'bg-brand text-dark border-brand' 
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            Static URL
          </button>
        </div>
      </div>

      {/* Dynamic URL Path Selection */}
      {!useStaticUrl && (
        <div className={isCompact ? "space-y-1" : "space-y-2"}>
          <label className="text-xs font-medium text-gray-700 block">
            URL Field from API
          </label>
          <SearchableSelect
            value={redirectUrlPath}
            onChange={(value) => handleMappingUpdate('redirectUrlPath', value)}
            placeholder="Select field containing redirect URL..."
            options={getFieldOptions()}
            searchTerm={redirectUrlSearchTerm}
            onSearchChange={setRedirectUrlSearchTerm}
            ariaLabel="Select redirect URL path"
          />
        </div>
      )}

      {/* Static URL Input */}
      {useStaticUrl && (
        <div className={isCompact ? "space-y-1" : "space-y-2"}>
          <label className="text-xs font-medium text-gray-700 block">
            Static URL
          </label>
          <Input
            size="sm"
            placeholder="https://example.com/product-page"
            value={staticRedirectUrl}
            onValueChange={(value) => handleMappingUpdate('staticRedirectUrl', value)}
            className="w-full"
            aria-label="Enter static redirect URL"
          />
        </div>
      )}

      {/* URL Validation Helper */}
      {((useStaticUrl && staticRedirectUrl) || (!useStaticUrl && redirectUrlPath)) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
          <h6 className="text-xs font-medium text-gray-700 mb-1">URL Preview:</h6>
          <p className="text-xs text-gray-600">
            {useStaticUrl ? (
              <>
                <span className="font-mono bg-gray-100 px-1 rounded">{staticRedirectUrl || 'Enter URL above'}</span>
                {staticRedirectUrl && !staticRedirectUrl.startsWith('http') && (
                  <span className="text-amber-600 ml-2">⚠️ URL should start with http:// or https://</span>
                )}
              </>
            ) : (
              <>
                Dynamic URL from: <span className="font-mono bg-gray-100 px-1 rounded">{redirectUrlPath}</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Current Configuration Summary */}
      {(buttonText || redirectUrlPath || staticRedirectUrl) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <h6 className="text-xs font-semibold text-blue-800 mb-2">Current Action Configuration:</h6>
          <div className="space-y-1">
            {buttonText && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Button:</span>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">
                  {buttonText}
                </span>
              </div>
            )}
            {(useStaticUrl ? staticRedirectUrl : redirectUrlPath) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">URL:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {useStaticUrl ? staticRedirectUrl : redirectUrlPath}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductActionMapping;
