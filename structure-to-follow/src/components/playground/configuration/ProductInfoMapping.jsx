import React, { useState } from 'react';
import SearchableSelect from './SearchableSelect.jsx';

const ProductInfoMapping = ({ 
  onMappingChange,
  apiResponseData = null,
  isCompact = true
}) => {
  const [titlePath, setTitlePath] = useState('');
  const [descriptionPath, setDescriptionPath] = useState('');
  const [pricePath, setPricePath] = useState('');
  const [discountedPricePath, setDiscountedPricePath] = useState('');
  const [reviewsPath, setReviewsPath] = useState('');
  const [ratingPath, setRatingPath] = useState('');
  const [brandPath, setBrandPath] = useState('');

  // Search states for each dropdown
  const [titleSearchTerm, setTitleSearchTerm] = useState('');
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState('');
  const [priceSearchTerm, setPriceSearchTerm] = useState('');
  const [discountedPriceSearchTerm, setDiscountedPriceSearchTerm] = useState('');
  const [reviewsSearchTerm, setReviewsSearchTerm] = useState('');
  const [ratingSearchTerm, setRatingSearchTerm] = useState('');
  const [brandSearchTerm, setBrandSearchTerm] = useState('');

  // Parse API response to extract ALL unique field paths (reused from ImageFieldMapping)
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
          console.log('🛍️ Product fields from first object:', firstObjectPaths);
          return firstObjectPaths;
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.length > 0) {
            console.log(`🛍️ Product fields from object at index ${i}:`, objectPaths);
            return objectPaths;
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('🛍️ Product fallback: parsing all objects in array');
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
    
    console.log('🛍️ Final product paths found:', paths);
    return paths;
  };

  const allPaths = getAllFieldPaths();

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
      titlePath: field === 'title' ? value : titlePath,
      descriptionPath: field === 'description' ? value : descriptionPath,
      pricePath: field === 'price' ? value : pricePath,
      discountedPricePath: field === 'discountedPrice' ? value : discountedPricePath,
      reviewsPath: field === 'reviews' ? value : reviewsPath,
      ratingPath: field === 'rating' ? value : ratingPath,
      brandPath: field === 'brand' ? value : brandPath
    };
    
    // Update local state
    setTitlePath(newMapping.titlePath);
    setDescriptionPath(newMapping.descriptionPath);
    setPricePath(newMapping.pricePath);
    setDiscountedPricePath(newMapping.discountedPricePath);
    setReviewsPath(newMapping.reviewsPath);
    setRatingPath(newMapping.ratingPath);
    setBrandPath(newMapping.brandPath);
    
    // Notify parent
    onMappingChange(newMapping);
  };

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      {/* Title Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Product Title
        </label>
        <SearchableSelect
          value={titlePath}
          onChange={(value) => handleMappingUpdate('title', value)}
          placeholder="Select field for product title..."
          options={getFieldOptions()}
          searchTerm={titleSearchTerm}
          onSearchChange={setTitleSearchTerm}
          ariaLabel="Select product title path"
        />
      </div>

      {/* Description Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Product Description
        </label>
        <SearchableSelect
          value={descriptionPath}
          onChange={(value) => handleMappingUpdate('description', value)}
          placeholder="Select field for product description..."
          options={getFieldOptions(true, 'No Description')}
          searchTerm={descriptionSearchTerm}
          onSearchChange={setDescriptionSearchTerm}
          ariaLabel="Select product description path"
        />
      </div>

      {/* Price Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Product Price
        </label>
        <SearchableSelect
          value={pricePath}
          onChange={(value) => handleMappingUpdate('price', value)}
          placeholder="Select field for product price..."
          options={getFieldOptions()}
          searchTerm={priceSearchTerm}
          onSearchChange={setPriceSearchTerm}
          ariaLabel="Select product price path"
        />
      </div>

      {/* Discounted Price Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Discounted Price (Optional)
        </label>
        <SearchableSelect
          value={discountedPricePath}
          onChange={(value) => handleMappingUpdate('discountedPrice', value)}
          placeholder="Select field for discounted price..."
          options={getFieldOptions(true, 'No Discount')}
          searchTerm={discountedPriceSearchTerm}
          onSearchChange={setDiscountedPriceSearchTerm}
          ariaLabel="Select discounted price path"
        />
      </div>

      {/* Brand Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Brand (Optional)
        </label>
        <SearchableSelect
          value={brandPath}
          onChange={(value) => handleMappingUpdate('brand', value)}
          placeholder="Select field for brand name..."
          options={getFieldOptions(true, 'No Brand')}
          searchTerm={brandSearchTerm}
          onSearchChange={setBrandSearchTerm}
          ariaLabel="Select brand path"
        />
      </div>

      {/* Rating Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Rating (Optional)
        </label>
        <SearchableSelect
          value={ratingPath}
          onChange={(value) => handleMappingUpdate('rating', value)}
          placeholder="Select field for product rating..."
          options={getFieldOptions(true, 'No Rating')}
          searchTerm={ratingSearchTerm}
          onSearchChange={setRatingSearchTerm}
          ariaLabel="Select rating path"
        />
      </div>

      {/* Reviews Path Selection */}
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        <label className="text-xs font-medium text-gray-700 block">
          Reviews Count (Optional)
        </label>
        <SearchableSelect
          value={reviewsPath}
          onChange={(value) => handleMappingUpdate('reviews', value)}
          placeholder="Select field for reviews count..."
          options={getFieldOptions(true, 'No Reviews')}
          searchTerm={reviewsSearchTerm}
          onSearchChange={setReviewsSearchTerm}
          ariaLabel="Select reviews path"
        />
      </div>

      {/* Current Selection Summary */}
      {(titlePath || pricePath || descriptionPath) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <h6 className="text-xs font-semibold text-blue-800 mb-2">Current Product Mapping:</h6>
          <div className="space-y-1">
            {titlePath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Title:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {titlePath}
                </code>
              </div>
            )}
            {pricePath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Price:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {pricePath}
                </code>
              </div>
            )}
            {discountedPricePath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Discount:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {discountedPricePath}
                </code>
              </div>
            )}
            {brandPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Brand:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {brandPath}
                </code>
              </div>
            )}
            {ratingPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Rating:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {ratingPath}
                </code>
              </div>
            )}
            {reviewsPath && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600">Reviews:</span>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                  {reviewsPath}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfoMapping;
