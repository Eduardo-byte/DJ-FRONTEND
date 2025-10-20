import React, { useState } from 'react';
import { Switch, Chip } from '@heroui/react';
import SearchableSelect from './SearchableSelect.jsx';

const ImageFieldMapping = ({ 
  onMappingChange,
  apiResponseData = null,
  isCompact = false,
  cardType = 'product'
}) => {
  const [isArray, setIsArray] = useState(cardType === 'blog' ? false : true);
  const [urlPath, setUrlPath] = useState('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [captionPath, setCaptionPath] = useState('');
  
  // Search states for each dropdown
  const [urlSearchTerm, setUrlSearchTerm] = useState('');
  const [thumbnailSearchTerm, setThumbnailSearchTerm] = useState('');
  const [captionSearchTerm, setCaptionSearchTerm] = useState('');

  // Parse API response to extract ALL unique field paths
  const parseAllFieldPaths = (obj, currentPath = '') => {
    const paths = [];
    const seenPaths = new Set();
    
    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value)) {
        // Add the array itself
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
            // Parse ALL objects in the array to get unique keys
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
            
            // Add all unique keys found in array objects
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
                  
                  // Parse nested arrays too
                  if (sampleValue.length > 0 && typeof sampleValue[0] === 'object') {
                    const nestedPaths = parseAllFieldPaths(sampleValue[0], `${arrayItemPath}[]`);
                    paths.push(...nestedPaths.filter(p => !seenPaths.has(p.path)));
                    nestedPaths.forEach(p => seenPaths.add(p.path));
                  }
                } else if (sampleValue && typeof sampleValue === 'object') {
                  paths.push({
                    path: arrayItemPath,
                    type: 'object',
                    description: `Object within array items`,
                    value: '{...}'
                  });
                  
                  const nestedPaths = parseAllFieldPaths(sampleValue, arrayItemPath);
                  paths.push(...nestedPaths.filter(p => !seenPaths.has(p.path)));
                  nestedPaths.forEach(p => seenPaths.add(p.path));
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
            // Array of primitives
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
        // Add the object itself
        if (!seenPaths.has(newPath)) {
          paths.push({ 
            path: newPath, 
            type: 'object',
            description: `Object (${Object.keys(value).length} properties)`,
            value: '{...}'
          });
          seenPaths.add(newPath);
        }
        
        // Parse nested object properties
        const nestedPaths = parseAllFieldPaths(value, newPath);
        paths.push(...nestedPaths.filter(p => !seenPaths.has(p.path)));
        nestedPaths.forEach(p => seenPaths.add(p.path));
      } else {
        // Add primitive values
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
          console.log('🖼️ Image fields from first object:', firstObjectPaths);
          return firstObjectPaths;
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.length > 0) {
            console.log(`🖼️ Image fields from object at index ${i}:`, objectPaths);
            return objectPaths;
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('🖼️ Image fallback: parsing all objects in array');
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
    
    console.log('🖼️ Final image paths found:', paths);
    return paths;
  };

  const allPaths = getAllFieldPaths();

  // Generate dropdown options from ALL API response fields
  const getFieldOptions = (includeEmpty = false, emptyLabel = 'None') => {
    const options = [];
    
    if (includeEmpty) {
      options.push({ key: '', label: emptyLabel, example: 'Skip this field mapping' });
    }
    
    if (!apiResponseData) {
      options.push({ key: '', label: 'Test your endpoint first', example: 'API response needed to show available fields' });
      return options;
    }

    if (allPaths.length === 0) {
      options.push({ key: '', label: 'No fields found', example: 'API response appears to be empty' });
      return options;
    }

    // Add all available paths
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
    const newMapping = {
      isArray,
      urlPath: field === 'url' ? value : urlPath,
      thumbnailPath: field === 'thumbnail' ? value : thumbnailPath,
      captionPath: field === 'caption' ? value : captionPath
    };

    // Update local state
    if (field === 'isArray') {
      setIsArray(value);
      newMapping.isArray = value;
    } else if (field === 'url') {
      setUrlPath(value);
    } else if (field === 'thumbnail') {
      setThumbnailPath(value);
    } else if (field === 'caption') {
      setCaptionPath(value);
    }

    // Notify parent
    if (onMappingChange) {
      onMappingChange(newMapping);
    }
  };


  return (
    <div className={isCompact ? "space-y-3" : "space-y-6"}>
      {!isCompact && (
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-sm font-medium text-gray-800">Image Field Mapping</h6>
            <p className="text-xs text-gray-600 mt-1">
              Select fields from your API response to map to image data
            </p>
          </div>
          <Chip size="sm" variant="flat" color="primary">
            Manual Selection
          </Chip>
        </div>
      )}

      {/* Array vs Single Toggle - Hidden for blog posts */}
      {cardType !== 'blog' && (
        <div className={isCompact ? "space-y-1" : "space-y-2"}>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-700">
                Multiple Images
              </label>
              <p className="text-xs text-gray-500">
                {!apiResponseData ? 
                  'Toggle if your selected field contains multiple images (array)' :
                  allPaths.length === 0 ?
                    'No fields found in API response' :
                    `Found ${allPaths.length} fields in your API response`
                }
              </p>
            </div>
            <Switch
              size="sm"
              isSelected={isArray}
              onValueChange={(checked) => handleMappingUpdate('isArray', checked)}
              aria-label="Toggle multiple images"
            />
          </div>
        </div>
      )}

      {/* URL Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Image URL Location
        </label>
        <SearchableSelect
          value={urlPath}
          onChange={(value) => handleMappingUpdate('url', value)}
          placeholder="Click to select field containing image URLs..."
          options={getFieldOptions()}
          searchTerm={urlSearchTerm}
          onSearchChange={setUrlSearchTerm}
          ariaLabel="Select image URL path"
        />
      </div>

      {/* Thumbnail Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Thumbnail Location (Optional)
        </label>
        <SearchableSelect
          value={thumbnailPath}
          onChange={(value) => handleMappingUpdate('thumbnail', value)}
          placeholder="Click to select thumbnail field (optional)..."
          options={getFieldOptions(true, 'No Thumbnail')}
          searchTerm={thumbnailSearchTerm}
          onSearchChange={setThumbnailSearchTerm}
          ariaLabel="Select thumbnail path"
          allowEmpty={true}
          emptyLabel="No Thumbnail"
        />
      </div>

      {/* Caption Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Caption/Alt Text Location (Optional)
        </label>
        <SearchableSelect
          value={captionPath}
          onChange={(value) => handleMappingUpdate('caption', value)}
          placeholder="Click to select caption field (optional)..."
          options={getFieldOptions(true, 'No Caption')}
          searchTerm={captionSearchTerm}
          onSearchChange={setCaptionSearchTerm}
          ariaLabel="Select caption path"
          allowEmpty={true}
          emptyLabel="No Caption"
        />
      </div>

      {/* Current Selection Summary */}
      {(urlPath || thumbnailPath || captionPath) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h6 className="text-xs font-semibold text-blue-800 mb-2">Current Mapping:</h6>
          <div className="space-y-1">
            {urlPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Images:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {isArray ? `${urlPath}[]` : urlPath}
                </code>
              </div>
            )}
            {thumbnailPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Thumbnails:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {isArray ? `${thumbnailPath}[]` : thumbnailPath}
                </code>
              </div>
            )}
            {captionPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Captions:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {isArray ? `${captionPath}[]` : captionPath}
                </code>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Available Fields Debug */}
      {apiResponseData && allPaths.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs font-medium text-gray-700 cursor-pointer mb-2">
            View all available fields ({allPaths.length} found)
          </summary>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {allPaths.map((path, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-gray-700 flex-1">{path.path}</span>
                  <span className="text-gray-500 mx-2">({path.type})</span>
                  <span className="text-gray-600 text-right max-w-[200px] truncate">
                    {path.value ? String(path.value) : '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

    </div>
  );
};

export default ImageFieldMapping;
