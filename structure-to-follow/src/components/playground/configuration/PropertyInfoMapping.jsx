import React, { useState, useEffect } from 'react';
import { Select, SelectItem } from '@heroui/react';
import SearchableSelect from './SearchableSelect.jsx';

const PropertyInfoMapping = ({ 
  onMappingChange, 
  apiResponseData = null,
  initialMapping = {},
  isCompact = false 
}) => {
  const [titlePath, setTitlePath] = useState(initialMapping.titlePath || '');
  const [descriptionPath, setDescriptionPath] = useState(initialMapping.descriptionPath || '');
  const [pricePath, setPricePath] = useState(initialMapping.pricePath || '');
  const [addressPath, setAddressPath] = useState(initialMapping.addressPath || '');
  const [bedsPath, setBedsPath] = useState(initialMapping.bedsPath || '');
  const [bathsPath, setBathsPath] = useState(initialMapping.bathsPath || '');
  const [sqftPath, setSqftPath] = useState(initialMapping.sqftPath || '');
  const [propertyTypePath, setPropertyTypePath] = useState(initialMapping.propertyTypePath || '');
  const [listedDatePath, setListedDatePath] = useState(initialMapping.listedDatePath || '');
  const [statusPath, setStatusPath] = useState(initialMapping.statusPath || '');
  const [currencyType, setCurrencyType] = useState(initialMapping.currencyType || 'USD');
  const [pricePeriod, setPricePeriod] = useState(initialMapping.pricePeriod || 'week');

  // Update state when initialMapping changes
  useEffect(() => {
    if (initialMapping) {
      setTitlePath(initialMapping.titlePath || '');
      setDescriptionPath(initialMapping.descriptionPath || '');
      setPricePath(initialMapping.pricePath || '');
      setAddressPath(initialMapping.addressPath || '');
      setBedsPath(initialMapping.bedsPath || '');
      setBathsPath(initialMapping.bathsPath || '');
      setSqftPath(initialMapping.sqftPath || '');
      setPropertyTypePath(initialMapping.propertyTypePath || '');
      setListedDatePath(initialMapping.listedDatePath || '');
      setStatusPath(initialMapping.statusPath || '');
      setCurrencyType(initialMapping.currencyType || 'USD');
      setPricePeriod(initialMapping.pricePeriod || 'week');
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

  // Get all available field paths from API response
  // Get all available field paths from API response with fallback
  const getAllFieldPaths = () => {
    if (!apiResponseData) return [];
    
    let paths = new Set();
    
    if (Array.isArray(apiResponseData)) {
      // Strategy 1: Try first object (preferred for properties)
      if (apiResponseData.length > 0 && apiResponseData[0] && typeof apiResponseData[0] === 'object') {
        const firstObjectPaths = parseAllFieldPaths(apiResponseData[0]);
        if (firstObjectPaths.size > 0) {
          console.log('🏠 Property fields from first object:', Array.from(firstObjectPaths));
          return Array.from(firstObjectPaths).sort();
        }
      }
      
      // Strategy 2: Fallback - try to find any non-empty object in the array
      for (let i = 0; i < Math.min(apiResponseData.length, 10); i++) { // Check first 10 items max
        if (apiResponseData[i] && typeof apiResponseData[i] === 'object' && Object.keys(apiResponseData[i]).length > 0) {
          const objectPaths = parseAllFieldPaths(apiResponseData[i]);
          if (objectPaths.size > 0) {
            console.log(`🏠 Property fields from object at index ${i}:`, Array.from(objectPaths));
            return Array.from(objectPaths).sort();
          }
        }
      }
      
      // Strategy 3: Last resort - parse all objects and combine
      console.log('🏠 Property fallback: parsing all objects in array');
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
    
    console.log('🏠 Final property paths found:', Array.from(paths));
    return Array.from(paths).sort();
  };

  const allPaths = getAllFieldPaths();

  // Format options for SearchableSelect component
  const getFieldOptions = (fieldType = 'field') => {
    const options = [];
    
    // Always add "None" option first
    options.push({ 
      key: '', 
      label: `None (Don't show ${fieldType})`, 
      example: `${fieldType} will not appear in preview` 
    });
    
    if (!apiResponseData) {
      options.push({ key: 'no-data', label: 'Test your endpoint first', example: 'API response needed to show available fields' });
      return options;
    }

    if (allPaths.length === 0) {
      options.push({ key: 'no-fields', label: 'No fields found', example: 'API response appears to be empty' });
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
      pricePath: pricePath || null,
      addressPath: addressPath || null,
      bedsPath: bedsPath || null,
      bathsPath: bathsPath || null,
      sqftPath: sqftPath || null,
      propertyTypePath: propertyTypePath || null,
      listedDatePath: listedDatePath || null,
      statusPath: statusPath || null,
      currencyType,
      pricePeriod
    };

    if (onMappingChange) {
      onMappingChange(mapping);
    }
  }, [titlePath, descriptionPath, pricePath, addressPath, bedsPath, bathsPath, sqftPath, propertyTypePath, listedDatePath, statusPath, currencyType, pricePeriod]);

  return (
    <div className={isCompact ? "space-y-3" : "space-y-4"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Title
          </label>
          <SearchableSelect
            options={getFieldOptions('title')}
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
            options={getFieldOptions('description')}
            value={descriptionPath}
            onChange={setDescriptionPath}
            placeholder="Select description field..."
            className="w-full"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Price
          </label>
          <SearchableSelect
            options={getFieldOptions('price')}
            value={pricePath}
            onChange={setPricePath}
            placeholder="Select price field..."
            className="w-full"
          />
        </div>

        {/* Currency Type */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Currency
          </label>
          <Select
            selectedKeys={[currencyType]}
            onSelectionChange={(keys) => setCurrencyType(Array.from(keys)[0])}
            className="w-full"
            variant="bordered"
            size="md"
            aria-label="Select currency type"
          >
            <SelectItem key="USD">$ (USD - US Dollar)</SelectItem>
            <SelectItem key="GBP">£ (GBP - British Pound)</SelectItem>
            <SelectItem key="EUR">€ (EUR - Euro)</SelectItem>
            <SelectItem key="CAD">C$ (CAD - Canadian Dollar)</SelectItem>
            <SelectItem key="AUD">A$ (AUD - Australian Dollar)</SelectItem>
            <SelectItem key="JPY">¥ (JPY - Japanese Yen)</SelectItem>
            <SelectItem key="CHF">CHF (Swiss Franc)</SelectItem>
            <SelectItem key="CNY">¥ (CNY - Chinese Yuan)</SelectItem>
            <SelectItem key="INR">₹ (INR - Indian Rupee)</SelectItem>
          </Select>
        </div>

        {/* Price Period */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Price Period
          </label>
          <Select
            variant="bordered"
            size="md"
            selectedKeys={[pricePeriod]}
            onSelectionChange={(keys) => setPricePeriod(Array.from(keys)[0])}
            className="w-full"
            aria-label="Select price period"
          >
            <SelectItem key="week">/week (Weekly)</SelectItem>
            <SelectItem key="month">/month (Monthly)</SelectItem>
            <SelectItem key="day">/day (Daily)</SelectItem>
            <SelectItem key="year">/year (Yearly)</SelectItem>
          </Select>
        </div>

        {/* Address */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Address
          </label>
          <SearchableSelect
            options={getFieldOptions('address')}
            value={addressPath}
            onChange={setAddressPath}
            placeholder="Select address field..."
            className="w-full"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Bedrooms
          </label>
          <SearchableSelect
            options={getFieldOptions('bedrooms')}
            value={bedsPath}
            onChange={setBedsPath}
            placeholder="Select bedrooms field..."
            className="w-full"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Bathrooms
          </label>
          <SearchableSelect
            options={getFieldOptions('bathrooms')}
            value={bathsPath}
            onChange={setBathsPath}
            placeholder="Select bathrooms field..."
            className="w-full"
          />
        </div>

        {/* Square Footage */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Square Footage
          </label>
          <SearchableSelect
            options={getFieldOptions('square footage')}
            value={sqftPath}
            onChange={setSqftPath}
            placeholder="Select square footage field..."
            className="w-full"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Property Type
          </label>
          <SearchableSelect
            options={getFieldOptions('property type')}
            value={propertyTypePath}
            onChange={setPropertyTypePath}
            placeholder="Select property type field..."
            className="w-full"
          />
        </div>

        {/* Listed Date */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Listed Date
          </label>
          <SearchableSelect
            options={getFieldOptions('listed date')}
            value={listedDatePath}
            onChange={setListedDatePath}
            placeholder="Select listed date field..."
            className="w-full"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Status
          </label>
          <SearchableSelect
            options={getFieldOptions('status')}
            value={statusPath}
            onChange={setStatusPath}
            placeholder="Select status field..."
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

export default PropertyInfoMapping;
