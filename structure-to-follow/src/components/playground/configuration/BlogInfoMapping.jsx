import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect.jsx';

const BlogInfoMapping = ({ 
  onMappingChange, 
  apiResponseData = null,
  isCompact = false 
}) => {
  const [titlePath, setTitlePath] = useState('');
  const [descriptionPath, setDescriptionPath] = useState('');
  const [dateCreatedPath, setDateCreatedPath] = useState('');
  const [minReadPath, setMinReadPath] = useState('');
  const [tagsPath, setTagsPath] = useState('');
  const [avatarUrlPath, setAvatarUrlPath] = useState('');
  const [authorPath, setAuthorPath] = useState('');

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
          console.log('📋 Blog fields from first object:', Array.from(firstObjectPaths));
          return Array.from(firstObjectPaths).sort();
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.size > 0) {
            console.log(`📋 Blog fields from object at index ${i}:`, Array.from(objectPaths));
            return Array.from(objectPaths).sort();
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine (for blogs that have flat array structure)
      console.log('📋 Blog fallback: parsing all objects in array');
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
    
    console.log('📋 Final blog paths found:', Array.from(paths));
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
      titlePath: titlePath || null,
      descriptionPath: descriptionPath || null,
      dateCreatedPath: dateCreatedPath || null,
      minReadPath: minReadPath || null,
      tagsPath: tagsPath || null,
      avatarUrlPath: avatarUrlPath || null,
      authorPath: authorPath || null
    };

    if (onMappingChange) {
      onMappingChange(mapping);
    }
  }, [titlePath, descriptionPath, dateCreatedPath, minReadPath, tagsPath, avatarUrlPath, authorPath]);

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Title
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={titlePath}
            onChange={setTitlePath}
            placeholder="Select title field..."
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Description
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={descriptionPath}
            onChange={setDescriptionPath}
            placeholder="Select description field..."
            className="w-full"
          />
        </div>

        {/* Date Created */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Date Created
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={dateCreatedPath}
            onChange={setDateCreatedPath}
            placeholder="Select date field..."
            className="w-full"
          />
        </div>

        {/* Min Read */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Min Read
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={minReadPath}
            onChange={setMinReadPath}
            placeholder="Select read time field..."
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Tags
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={tagsPath}
            onChange={setTagsPath}
            placeholder="Select tags field..."
            className="w-full"
          />
        </div>

        {/* Author */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Author
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={authorPath}
            onChange={setAuthorPath}
            placeholder="Select author field..."
            className="w-full"
          />
        </div>

        {/* Avatar URL */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Avatar URL
          </label>
          <SearchableSelect
            options={getFieldOptions()}
            value={avatarUrlPath}
            onChange={setAvatarUrlPath}
            placeholder="Select avatar URL field..."
            className="w-full"
          />
        </div>
      </div>

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

export default BlogInfoMapping;
