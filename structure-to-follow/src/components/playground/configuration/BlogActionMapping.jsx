import React, { useState, useEffect } from 'react';
import { Input, Button } from '@heroui/react';
import SearchableSelect from './SearchableSelect.jsx';

const BlogActionMapping = ({ 
  onMappingChange, 
  apiResponseData = null,
  isCompact = false 
}) => {
  const [readMoreUrlPath, setReadMoreUrlPath] = useState('');
  const [staticReadMoreUrl, setStaticReadMoreUrl] = useState('');
  const [useStaticUrl, setUseStaticUrl] = useState(false);
  const [buttonText, setButtonText] = useState('Read More');

  // Parse all field paths from API response
  const parseAllFieldPaths = (obj, parentPath = '', paths = new Set()) => {
    if (!obj || typeof obj !== 'object') return paths;

    Object.keys(obj).forEach(key => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      paths.add(currentPath);

      const value = obj[key];
      
      if (Array.isArray(value)) {
        // Add array notation
        paths.add(`${currentPath}[]`);
        
        // Parse all objects in the array to get all possible keys
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
          console.log('📋 Blog Action fields from first object:', Array.from(firstObjectPaths));
          return Array.from(firstObjectPaths).sort();
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.size > 0) {
            console.log(`📋 Blog Action fields from object at index ${i}:`, Array.from(objectPaths));
            return Array.from(objectPaths).sort();
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('📋 Blog Action fallback: parsing all objects in array');
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
    
    console.log('📋 Final blog action paths found:', Array.from(paths));
    return Array.from(paths).sort();
  };

  const allPaths = getAllFieldPaths();

  // Format options for SearchableSelect component
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
      readMoreUrlPath: useStaticUrl ? null : (readMoreUrlPath || null),
      staticReadMoreUrl: useStaticUrl ? (staticReadMoreUrl || null) : null,
      useStaticUrl,
      buttonText: buttonText || 'Read More'
    };

    if (onMappingChange) {
      onMappingChange(mapping);
    }
  }, [readMoreUrlPath, staticReadMoreUrl, useStaticUrl, buttonText]);

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {/* URL Source Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div>
          <h6 className="text-sm font-medium text-gray-800">Read More URL Source</h6>
          <p className="text-xs text-gray-600">Choose between dynamic API field or static URL</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={!useStaticUrl ? "solid" : "bordered"}
            className={!useStaticUrl ? "bg-brand text-dark" : ""}
            onPress={() => setUseStaticUrl(false)}
          >
            Dynamic
          </Button>
          <Button
            size="sm"
            variant={useStaticUrl ? "solid" : "bordered"}
            className={useStaticUrl ? "bg-brand text-dark" : ""}
            onPress={() => setUseStaticUrl(true)}
          >
            Static
          </Button>
        </div>
      </div>

      {/* Dynamic URL Field Selection */}
      {!useStaticUrl && (
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Read More URL Field
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={readMoreUrlPath}
            onChange={setReadMoreUrlPath}
            placeholder="Select URL field from API response..."
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the field that contains the article URL
          </p>
        </div>
      )}

      {/* Static URL Input */}
      {useStaticUrl && (
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Static Read More URL
          </label>
          <Input
            size="sm"
            placeholder="https://example.com/blog-post"
            value={staticReadMoreUrl}
            onChange={(e) => setStaticReadMoreUrl(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a fixed URL for all blog posts
          </p>
        </div>
      )}

      {/* Button Text Customization */}
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1">
          Button Text
        </label>
        <Input
          size="sm"
          placeholder="Read More"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Customize the text displayed on the action button
        </p>
      </div>

      {/* Button Preview */}
      <div className="p-3 bg-gray-50 rounded-lg border">
        <h6 className="text-xs font-medium text-gray-700 mb-2">Button Preview:</h6>
        <Button
          size="sm"
          className="bg-brand text-dark"
          disabled
        >
          {buttonText || 'Read More'}
        </Button>
      </div>

      {/* Debug View */}
      {allPaths.length > 0 && !useStaticUrl && (
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

export default BlogActionMapping;
