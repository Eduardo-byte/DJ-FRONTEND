import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Chip } from '@heroui/react';
import { FileText, ExternalLink, Grid, Eye, Bed, Bath, Square } from 'lucide-react';

const CardsDisplay = ({ cards }) => {
  const [processedCards, setProcessedCards] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [previousVisibleCount, setPreviousVisibleCount] = useState(0);
  const [imageIndexes, setImageIndexes] = useState({}); // Track current image index for each card
  const INITIAL_LOAD = 4;
  const LOAD_MORE_INCREMENT = 4;

  // Reset visible count when cards change
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
    setPreviousVisibleCount(0);
  }, [cards]);

  // Load more products function
  const handleLoadMore = () => {
    setPreviousVisibleCount(visibleCount);
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_INCREMENT, processedCards.length));
  };

  // Enhanced function to get value from complex nested paths
    const getValueFromPath = (obj, path) => {
    if (!path || !obj) return '';
    
    try {
      // Handle direct dot notation paths like "property_media.photos" or "location.city"
      const pathParts = path.split('.');
      let current = obj;
      
      for (const part of pathParts) {
        if (current === null || current === undefined) {
          return '';
        }
        
        // Handle array notation within parts like "photos[0]" or "items[]"
        if (part.includes('[') && part.includes(']')) {
          const arrayName = part.split('[')[0];
          const indexMatch = part.match(/\[(\d*)\]/);
          
          if (current[arrayName] && Array.isArray(current[arrayName])) {
            if (indexMatch && indexMatch[1] !== '') {
              // Specific index like [0]
              const arrayIndex = parseInt(indexMatch[1]);
              current = current[arrayName][arrayIndex];
      } else {
              // Empty brackets [] - return the whole array
              current = current[arrayName];
            }
          } else {
          return '';
        }
        } else if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return '';
      }
      }
      
      return current;
    } catch (err) {
      console.warn('Error accessing path:', path, 'in object:', obj, 'error:', err);
      return '';
    }
    };

  useEffect(() => {
    // TODO: Expand this useEffect for future functionality
    // For now, just console log the raw data
    console.log('Cards raw data:', cards);
    
    // Set dummy data for testing if no cards provided
    if (!cards) {
      const dummyCards = [
        {
          id: 'dummy-1',
          cardType: 'product',
          title: 'Beautiful Villa',
          description: 'A stunning 3-bedroom villa with ocean views',
          price: '$299.99',
          brand: 'Premium Properties',
          url: 'https://example.com/villa'
        },
        {
          id: 'dummy-2',
          cardType: 'product',
          title: 'How to Choose the Perfect Property',
          description: 'A comprehensive guide to finding your dream home...',
          price: '$19.99',
          brand: 'Real Estate Guide',
          url: 'https://example.com/blog-post'
        }
      ];
      setProcessedCards(dummyCards);
    } else {
      // Process actual cards data with mapping
      try {
        const mapping = cards.mapping;
        const data = cards.data;
        const cardType = mapping?.cardType || 'product';
        
        if (mapping && mapping.content && data) {
          // Get the main array data using the mapping
          const contentMapping = mapping.content;
          
          // Handle different data structures
          let arrayData = null;
          
          // Check if data is directly an array (like property data)
          if (Array.isArray(data)) {
            arrayData = data;
          } else {
            // Find which field contains the array (e.g., "products[]")
            const contentValues = Object.values(contentMapping);
            const arrayField = contentValues.find(path => path && path.includes && path.includes('[]'));
            
            if (arrayField) {
              const arrayKey = arrayField.split('[]')[0]; // e.g., "products"
              arrayData = data[arrayKey];
            }
          }
          
          if (Array.isArray(arrayData)) {
            const processed = [];
            
            arrayData.forEach((item, index) => {
              // For property data, check if it has nested data arrays or direct property structure
              if (cardType === 'property') {
                console.log('🏠 Processing property item:', { index, item, hasData: !!item.data });
                // Handle nested structure (item.data[]) or direct structure
                const propertyItems = item.data && Array.isArray(item.data) ? item.data : [item];
                console.log('🏠 Property items to process:', propertyItems);
                
                propertyItems.forEach((subItem, subIndex) => {
                  console.log('🏠 Processing property subItem:', { 
                    subIndex, 
                    subItem,
                    subItemType: typeof subItem,
                    subItemKeys: Object.keys(subItem || {}),
                    hasRoomsAvailable: !!subItem?.rooms_available,
                    roomsAvailableLength: subItem?.rooms_available?.length,
                    firstRoom: subItem?.rooms_available?.[0]
                  });
                  const card = {
                    id: subItem.property_id || `property-${index}-${subIndex}`,
                    cardType: cardType,
                    displayOrder: processed.length,
                    // Copy all original data for dynamic button processing
                    ...subItem
                  };
                  
                  // Store original arrays for button logic - preserve ALL arrays dynamically
                  const originalArrays = {};
                  Object.keys(subItem).forEach(key => {
                    if (Array.isArray(subItem[key])) {
                      originalArrays[key] = [...subItem[key]]; // Deep copy arrays
                    }
                  });
                  
                  console.log('🔧 Preserved original arrays:', Object.keys(originalArrays));
                  
                  // Map each content field for property data
                  console.log('🗺️ Content mapping:', contentMapping);
                  Object.entries(contentMapping).forEach(([key, path]) => {
                    console.log('🗺️ Processing mapping:', { key, path });
                    try {
                      if (path && path.includes && path.includes('[]')) {
                        // Handle array paths like "properties[].media.photos[].photo"
                        const pathParts = path.split('[]');
                        // For nested arrays like "properties[].rooms_available[].price_per_week"
                        // We need to keep everything after the first "properties[]."
                        let fieldPath = '';
                        if (pathParts.length > 1) {
                          // Join all parts after the first one, keeping the [] notation
                          const remainingParts = pathParts.slice(1);
                          fieldPath = remainingParts.join('[]').replace(/^\./, '');
                        }
                        
                        console.log('🔧 Path processing:', { 
                          originalPath: path, 
                          pathParts, 
                          fieldPath,
                          subItem: Object.keys(subItem || {})
                        });
                        
                        if (key === 'imagePath' && fieldPath) {
                          console.log('🖼️ Processing image path:', { key, path, fieldPath, subItem, originalPath: path });
                          
                          // For image paths with arrays like "media.photos[].photo", we need to handle the array extraction dynamically
                          if (fieldPath.includes('[].')) {
                            // Find the array pattern dynamically
                            const arrayMatch = fieldPath.match(/^(.+?)\.([^.]+)\[\]\.(.+)$/);
                            if (arrayMatch) {
                              const [, beforeArrayPath, arrayName, afterArrayField] = arrayMatch;
                              
                              console.log('🖼️ Dynamic image path parts:', { 
                                beforeArrayPath, 
                                arrayName, 
                                afterArrayField,
                                fullFieldPath: fieldPath 
                              });
                              
                              // Get the array (e.g., media.photos)
                              const arrayPath = beforeArrayPath ? `${beforeArrayPath}.${arrayName}` : arrayName;
                              const imageArray = getValueFromPath(subItem, arrayPath);
                              
                              console.log('🖼️ Dynamic image array:', { arrayPath, imageArray });
                              
                              if (Array.isArray(imageArray) && imageArray.length > 0) {
                                const imageUrls = imageArray
                                  .map(item => item[afterArrayField])
                                  .filter(url => url && typeof url === 'string');
                                
                                console.log('✅ Extracted image URLs dynamically:', imageUrls);
                                
                                if (imageUrls.length > 0) {
                                  card.images = imageUrls;
                                  card.image = imageUrls[0];
                                  console.log('✅ Set card.images:', card.images);
                                  console.log('✅ Set card.image (primary):', card.image);
                                }
                              }
                            }
                          } else {
                            // Use the configured path directly to extract images
                            const value = getValueFromPath(subItem, fieldPath);
                            console.log('🔍 Raw value from path:', value);
                            
                            if (Array.isArray(value) && value.length > 0) {
                              // If it's an array, extract all image URLs
                              let imageUrls = [];
                              
                              // Check if array contains objects with photo/image properties
                              if (value[0] && typeof value[0] === 'object') {
                                // Try common image property names
                                const imageProps = ['photo', 'image', 'url', 'src'];
                                for (const prop of imageProps) {
                                  if (value[0][prop]) {
                                    imageUrls = value.map(item => item[prop]).filter(url => url && typeof url === 'string');
                                    console.log(`✅ Found images using property "${prop}":`, imageUrls);
                                    break;
                                  }
                                }
                              } else if (typeof value[0] === 'string') {
                                // Array of direct URLs
                                imageUrls = value.filter(url => typeof url === 'string');
                                console.log('✅ Found direct URL array:', imageUrls);
                              }
                              
                              if (imageUrls.length > 0) {
                                card.images = imageUrls;
                                card.image = imageUrls[0];
                                console.log('✅ Set card.images:', card.images);
                                console.log('✅ Set card.image (primary):', card.image);
                              }
                            } else if (typeof value === 'string') {
                              // Single image URL
                              card.images = [value];
                              card.image = value;
                              console.log('✅ Set single image:', value);
                            } else {
                              console.log('❌ No valid images found for path:', fieldPath, 'value:', value);
                            }
                          }
                        } else if (fieldPath) {
                          console.log('🔧 Processing field:', { key, fieldPath, subItem });
                          
                          // Simple and direct approach - handle the specific case
                          if (fieldPath.includes('rooms_available[].')) {
                            // Extract from rooms_available array
                            const fieldName = fieldPath.replace('rooms_available[].', '');
                            const roomsArray = subItem.rooms_available;
                            
                            console.log('🏠 Rooms available extraction:', { 
                              fieldName, 
                              roomsArray, 
                              isArray: Array.isArray(roomsArray),
                              length: roomsArray?.length,
                              firstRoom: roomsArray?.[0]
                            });
                            
                            if (Array.isArray(roomsArray) && roomsArray.length > 0) {
                              const firstRoom = roomsArray[0];
                              const extractedValue = firstRoom[fieldName];
                              
                              console.log('✅ Direct extraction result:', { 
                                fieldName, 
                                extractedValue, 
                                type: typeof extractedValue 
                              });
                              
                              card[key.replace('Path', '')] = extractedValue !== null && extractedValue !== undefined ? String(extractedValue) : '';
                            } else {
                              card[key.replace('Path', '')] = '';
                            }
                          } else {
                            // Handle other field types (location.city, etc.)
                            const value = getValueFromPath(subItem, fieldPath);
                            console.log('🔧 Other field extraction:', { fieldPath, value, type: typeof value });
                            card[key.replace('Path', '')] = value !== null && value !== undefined ? String(value) : '';
                          }
                        }
                      } else if (path) {
                        // For direct field access
                        const value = getValueFromPath(subItem, path);
                        card[key.replace('Path', '')] = value || '';
                      }
                    } catch (err) {
                      console.warn('Error processing field:', key, path, err);
                      card[key.replace('Path', '')] = '';
                    }
                  });
                  
                  // Handle special property fields
                  if (card.image && Array.isArray(card.image)) {
                    card.image = card.image[0]; // Take first image
                  }
                  
                  // Format price if exists
                  if (card.price && typeof card.price === 'string') {
                    const currencySymbol = contentMapping.currencyType === 'GBP' ? '£' : 
                                         contentMapping.currencyType === 'USD' ? '$' : 
                                         contentMapping.currencyType || '$';
                    const period = contentMapping.pricePeriod ? `/${contentMapping.pricePeriod}` : '';
                    card.price = `${currencySymbol}${card.price}${period}`;
                  }
                  
                  // Ensure all card properties are safe for React rendering
                  const sanitizeValue = (value) => {
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object' && !Array.isArray(value)) {
                      // Convert objects to strings to prevent React errors
                      return JSON.stringify(value);
                    }
                    if (Array.isArray(value)) {
                      // For arrays, join them or take first item
                      return value.length > 0 ? value[0] : '';
                    }
                    return String(value);
                  };
                  
                  // Restore original arrays for dynamic button logic (before sanitization)
                  Object.keys(originalArrays).forEach(arrayKey => {
                    card[arrayKey] = originalArrays[arrayKey];
                  });
                  
                  console.log('🔧 Restored arrays for button logic:', Object.keys(originalArrays));
                  
                  // Sanitize all card properties except images array and preserved arrays
                  Object.keys(card).forEach(key => {
                    if (key !== 'images' && key !== 'image' && !originalArrays.hasOwnProperty(key)) {
                      card[key] = sanitizeValue(card[key]);
                    }
                  });
                  
                  console.log('✅ Final processed card:', card);
                  console.log('🎠 Card images for carousel:', card.images);
                  processed.push(card);
                });
              } else {
                // Handle other card types (products, blogs)
                const card = {
                  id: item.id || `card-${index}`,
                  cardType: cardType,
                  displayOrder: index
                };
                
                // Map each content field
                Object.entries(contentMapping).forEach(([key, path]) => {
                  try {
                    if (path && path.includes && path.includes('[]')) {
                      // Extract field name after []
                      const fieldName = path.split('[].')[1];
                      if (fieldName) {
                        card[key.replace('Path', '')] = item[fieldName] || '';
                      }
                    } else if (path) {
                      // Direct field access
                      card[key.replace('Path', '')] = getValueFromPath(data, path);
                    }
                  } catch (err) {
                    console.warn('Error processing field:', key, path, err);
                    card[key.replace('Path', '')] = '';
                  }
                });
                
                // Handle special fields
                if (card.image && Array.isArray(card.image)) {
                  card.image = card.image[0]; // Take first image
                }
                
                // Format price if exists
                if (card.price && typeof card.price === 'number') {
                  card.price = `${contentMapping.currencyType || '$'}${card.price}`;
                }
                
                processed.push(card);
              }
            });
            
            setProcessedCards(processed);
          }
        }
      } catch (error) {
        console.error('Error processing cards data:', error);
        // Set empty array on error to prevent crash
        setProcessedCards([]);
      }
    }
  }, [cards]);

  const renderCardByType = (card) => {
    switch (card.cardType) {
      case 'property':
        return renderPropertyCard(card);
      case 'blog':
        return renderBlogCard(card);
      case 'product':
        return renderProductCard(card);
      case 'service':
        return renderServiceCard(card);
      default:
        return renderDefaultCard(card);
    }
  };

  const renderPropertyCard = (card) => (
    <Card className="w-full bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Grid className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {card.title || 'Property Card'}
              </h4>
              <Chip size="sm" variant="flat" color="primary">
                Property
              </Chip>
            </div>
            {card.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {card.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {card.location || 'Location not specified'}
              </span>
              {card.url && (
                <Button
                  size="sm"
                  variant="flat"
                  className="h-6 px-2 text-xs"
                  startContent={<Eye size={10} />}
                  onPress={() => window.open(card.url, '_blank')}
                >
                  View
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderBlogCard = (card) => (
    <Card className="w-full bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {card.title || 'Blog Post'}
              </h4>
              <Chip size="sm" variant="flat" color="success">
                Blog
              </Chip>
            </div>
            {card.excerpt && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {card.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {card.publishDate || 'Date not specified'}
              </span>
              {card.url && (
                <Button
                  size="sm"
                  variant="flat"
                  className="h-6 px-2 text-xs"
                  startContent={<ExternalLink size={10} />}
                  onPress={() => window.open(card.url, '_blank')}
                >
                  Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderProductCard = (card) => (
    <Card className="w-full bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {card.image ? (
              <div className="w-full h-[10rem] rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={card.image} 
                  alt={card.title || 'Product'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <Grid className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center">
                <Grid className="w-6 h-6 text-purple-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Title and Brand */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {card.title || 'Product'}
                </h4>
                {card.brand && (
                  <p className="text-xs text-gray-500 truncate">
                    {card.brand}
                  </p>
                )}
              </div>
              <Chip size="sm" variant="flat" color="secondary" className="ml-2">
                Product
              </Chip>
            </div>
            
            {/* Description */}
            {card.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {card.description}
              </p>
            )}
            
            {/* Price and Rating */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {card.price && (
                  <span className="text-sm font-semibold text-gray-900">
                    {typeof card.price === 'number' ? `$${card.price}` : card.price}
                  </span>
                )}
                {card.discountedPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {typeof card.discountedPrice === 'number' ? `$${card.discountedPrice}` : card.discountedPrice}
                  </span>
                )}
              </div>
              {card.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">★</span>
                  <span className="text-xs text-gray-600">{card.rating}</span>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            {card.url && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="flat"
                  className="h-6 px-3 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100"
                  startContent={<Eye size={10} />}
                  onPress={() => window.open(card.url, '_blank')}
                >
                  View Product
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderServiceCard = (card) => (
    <Card className="w-full bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Grid className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {card.title || 'Service'}
              </h4>
              <Chip size="sm" variant="flat" color="warning">
                Service
              </Chip>
            </div>
            {card.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {card.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {card.category || 'Category not specified'}
              </span>
              {card.url && (
                <Button
                  size="sm"
                  variant="flat"
                  className="h-6 px-2 text-xs"
                  startContent={<Eye size={10} />}
                  onPress={() => window.open(card.url, '_blank')}
                >
                  Learn More
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderDefaultCard = (card) => (
    <Card className="w-full bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {card.title || 'Card'}
              </h4>
              <Chip size="sm" variant="flat" color="default">
                {card.cardType || 'Unknown'}
              </Chip>
            </div>
            {card.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                {card.description}
              </p>
            )}
            {card.url && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="flat"
                  className="h-6 px-2 text-xs"
                  startContent={<ExternalLink size={10} />}
                  onPress={() => window.open(card.url, '_blank')}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // Helper functions for rendering
  const formatPrice = (price) => {
    if (!price) return '';
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    return price;
  };

  const formatRating = (rating) => {
    if (!rating) return '0.0';
    return typeof rating === 'number' ? rating.toFixed(1) : rating;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-xs ${
              index < fullStars
                ? 'text-yellow-400'
                : index === fullStars && hasHalfStar
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Helper function to safely render any value in React
  const safeRender = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && !Array.isArray(value)) {
      // If it's a small object that looks like it should be a primitive, show a warning
      console.log('⚠️ Rendering object as JSON (this might be wrong):', value);
      return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : fallback;
    }
    return String(value);
  };

  const renderActionButtons = (product, actions) => {
    console.log('🔥 renderActionButtons called with:', { product, actions });
    
    if (!actions) {
      console.log('❌ No actions provided');
      return null;
    }

    const primaryAction = actions.primary;
    const secondaryAction = actions.secondary;
    
    console.log('🔍 Actions check:', { primaryAction, secondaryAction });
    
    const renderSingleButton = (action, buttonType) => {
      if (!action || !action.text || !action.enabled) {
        console.log(`❌ ${buttonType} action invalid:`, { action, hasText: !!action?.text, enabled: action?.enabled });
      return null;
    }

    // Determine the URL to use
    let redirectUrl = '';
    if (action.useStaticUrl && action.staticUrl) {
      redirectUrl = action.staticUrl;
        console.log(`🔗 ${buttonType} using static URL:`, redirectUrl);
    } else if (action.urlPath) {
        console.log(`🔍 ${buttonType} processing urlPath:`, action.urlPath);
        
        // Handle dynamic nested array paths like "properties[].rooms_available[].booking_link_url"
      if (action.urlPath.includes('[]')) {
          console.log(`🔍 ${buttonType} processing dynamic array path:`, action.urlPath);
          
          // Use the same dynamic path processing as field extraction
          const pathParts = action.urlPath.split('[].');
          if (pathParts.length >= 3) {
            // This is a nested array path like "properties[].rooms_available[].booking_link_url"
            // Skip the first part (properties[]) and process the rest
            const remainingPath = pathParts.slice(1).join('[].');
            console.log(`🔍 ${buttonType} remaining path after properties[]:`, remainingPath);
            
            // Check if there's another array in the path
            if (remainingPath.includes('[].')) {
              const nestedParts = remainingPath.split('[].');
              const arrayPath = nestedParts[0]; // e.g., "rooms_available"
              const fieldPath = nestedParts[1]; // e.g., "booking_link_url"
              
              console.log(`🔍 ${buttonType} nested array extraction:`, { arrayPath, fieldPath });
              
              // Get the array from the product using dynamic path
              const arrayData = getValueFromPath(product, arrayPath);
              console.log(`🔍 ${buttonType} array data:`, { arrayPath, arrayData, isArray: Array.isArray(arrayData) });
              
              if (Array.isArray(arrayData) && arrayData.length > 0) {
                // Find the first item with a non-null value for the field
                const itemWithValue = arrayData.find(item => {
                  const value = getValueFromPath(item, fieldPath);
                  return value && value !== null;
                });
                
                if (itemWithValue) {
                  redirectUrl = getValueFromPath(itemWithValue, fieldPath);
                  console.log(`🔗 ${buttonType} found URL in array item:`, { fieldPath, url: redirectUrl, item: itemWithValue });
      } else {
                  console.log(`🔗 ${buttonType} no item found with valid URL for field:`, fieldPath);
                }
              }
            } else {
              // Simple nested path without additional arrays
              redirectUrl = getValueFromPath(product, remainingPath);
              console.log(`🔗 ${buttonType} simple nested path result:`, redirectUrl);
            }
          } else {
            // Handle simpler array patterns
            const pathAfterArray = pathParts.length > 1 ? pathParts[1] : '';
            redirectUrl = getValueFromPath(product, pathAfterArray);
            console.log(`🔗 ${buttonType} simple array result:`, redirectUrl);
          }
        } else {
          // Direct path - no arrays
          redirectUrl = getValueFromPath(product, action.urlPath) || action.urlPath;
          console.log(`🔗 ${buttonType} direct path result:`, redirectUrl);
        }
      }

      console.log(`🎯 ${buttonType} final redirect URL:`, redirectUrl);

      const hasValidUrl = redirectUrl && redirectUrl.trim() !== '' && redirectUrl !== 'null';
      console.log(`🔘 ${buttonType} button state:`, { hasValidUrl, redirectUrl, type: typeof redirectUrl });

      if (!hasValidUrl) {
        console.log(`❌ ${buttonType} button hidden - no valid URL`);
        return null;
      }

      console.log(`✅ Rendering ${buttonType} button:`, action.text);
    return (
      <button 
          key={buttonType}
        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors ${
            buttonType === 'primary' 
              ? 'bg-brand hover:bg-brand/90 text-gray-900'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          onClick={() => window.open(redirectUrl, '_blank')}
          title={`${action.text}: ${redirectUrl}`}
      >
        {action.text}
      </button>
      );
    };

    const primaryButton = renderSingleButton(primaryAction, 'primary');
    const secondaryButton = renderSingleButton(secondaryAction, 'secondary');

    // Return buttons in a container
    const buttons = [primaryButton, secondaryButton].filter(Boolean);
    
    if (buttons.length === 0) {
      console.log('❌ No valid buttons to render');
      return null;
    }

    console.log(`✅ Rendering ${buttons.length} button(s)`);
    return (
      <div className="space-y-2">
        {buttons}
      </div>
    );
  };

  // For product, blog, and property cards, use grid layout
  if (processedCards.length > 0 && (processedCards[0]?.cardType === 'product' || processedCards[0]?.cardType === 'blog' || processedCards[0]?.cardType === 'property')) {
    return (
      <div className="mt-3">
        <div className="bg-transparent rounded-lg max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {processedCards[0]?.cardType === 'blog' ? 'Blog Posts' : 
               processedCards[0]?.cardType === 'property' ? 'Properties' : 'Products'} ({Math.min(visibleCount, processedCards.length)} of {processedCards.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedCards.slice(0, visibleCount).map((product, index) => {
              // Animate initial load or new cards after load more
              const isInitialLoad = previousVisibleCount === 0;
              const isNewCard = index >= previousVisibleCount;
              const shouldAnimate = isInitialLoad || isNewCard;
              
              let animationDelay = 0;
              if (isInitialLoad) {
                animationDelay = index * 150;
              } else if (isNewCard) {
                animationDelay = (index - previousVisibleCount) * 150;
              }
              
              return (
                <div 
                  key={product.id || index} 
                  className={`border border-gray-100 rounded-lg overflow-hidden ${product.cardType === 'blog' || product.cardType === 'property' ? 'h-auto' : 'p-3 h-96'} flex flex-col ${shouldAnimate ? 'animate-fadeInUp' : ''}`}
                  style={{ 
                    animationDelay: shouldAnimate ? `${animationDelay}ms` : undefined
                  }}
                >
                  {product.cardType === 'property' ? (
                    /* Property Card Layout */
                    <>
                      {/* Property Image with Carousel */}
                      <div className="w-full h-48 overflow-hidden relative group">
                        {(() => {
                          const images = product.images || (product.image ? [product.image] : []);
                          const currentIndex = imageIndexes[product.id] || 0;
                          const safeIndex = Math.min(currentIndex, images.length - 1);
                          const currentImage = images[safeIndex];
                          
                          const nextImage = () => {
                            setImageIndexes(prev => ({
                              ...prev,
                              [product.id]: (currentIndex + 1) % images.length
                            }));
                          };
                          
                          const prevImage = () => {
                            setImageIndexes(prev => ({
                              ...prev,
                              [product.id]: (currentIndex - 1 + images.length) % images.length
                            }));
                          };
                          
                          return (
                            <>
                              {currentImage ? (
                                <img 
                                  src={currentImage} 
                            alt={product.title || 'Property'} 
                                  className="w-full h-full object-cover transition-all duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                              <div className={`w-full h-full bg-gray-200 ${currentImage ? 'hidden' : 'flex'} items-center justify-center`}>
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                              
                              {/* Navigation Arrows */}
                              {images.length > 1 && (
                                <>
                                  <button
                                    onClick={prevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                                    style={{ backdropFilter: 'blur(4px)' }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={nextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                                    style={{ backdropFilter: 'blur(4px)' }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </>
                              )}
                              
                              {/* Image Counter */}
                              {images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                  {safeIndex + 1}/{images.length}
                                </div>
                              )}
                              
                              {/* Dot Indicators */}
                              {images.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                  {images.slice(0, Math.min(5, images.length)).map((_, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setImageIndexes(prev => ({
                                        ...prev,
                                        [product.id]: i
                                      }))}
                                      className={`w-2 h-2 rounded-full transition-all ${
                                        i === safeIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                      }`}
                                    />
                                  ))}
                                  {images.length > 5 && (
                                    <span className="text-white text-xs ml-1">+{images.length - 5}</span>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                          {product.status || 'Available'}
                        </div>
                      </div>
                      
                      {/* Property Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Title */}
                        {product.title && (
                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                          </div>
                        )}
                        
                        {/* Description */}
                        {product.description && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                          </div>
                        )}
                        
                        {/* Price and Address */}
                        <div className="mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{safeRender(product.price, 'Price on request')}</h4>
                          <p className="text-xs text-gray-600">{safeRender(product.address, 'Address not available')}</p>
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                          {product.beds && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              <span>{safeRender(product.beds)}</span>
                            </div>
                          )}
                          {product.baths && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-3 h-3" />
                              <span>{safeRender(product.baths)}</span>
                            </div>
                          )}
                          {product.sqft && (
                            <div className="flex items-center gap-1">
                              <Square className="w-3 h-3" />
                              <span>{safeRender(product.sqft)}</span>
                            </div>
                          )}
                        </div>

                        {/* Listed Date */}
                        {product.listedDate && (
                          <div className="text-xs text-gray-500 mb-2">
                            Listed {product.listedDate}
                          </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="mt-auto">
                          {renderActionButtons(product, cards?.mapping?.actions)}
                        </div>
                      </div>
                    </>
                  ) : product.cardType === 'blog' ? (
                    /* Blog Card Layout */
                    <>
                      {/* Blog Image */}
                      <div className="w-full h-32 overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title || 'Blog post'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gray-200 ${product.image ? 'hidden' : 'flex'} items-center justify-center`}>
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      </div>
                      
                      {/* Blog Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Tags and Read Time */}
                        <div className="flex items-center gap-2 mb-2">
                          {product.tags && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {Array.isArray(product.tags) ? product.tags[0] : product.tags}
                            </span>
                          )}
                          {product.minRead && (
                            <span className="text-xs text-gray-500">{product.minRead}</span>
                          )}
                        </div>
                        
                        {/* Blog Title */}
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                          {product.title}
                        </h4>
                        
                        {/* Blog Description */}
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1">
                          {product.description}
                        </p>
                        
                        {/* Author and Date */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {product.avatarUrl ? (
                              <img 
                                src={product.avatarUrl} 
                                alt={product.author}
                                className="w-6 h-6 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-6 h-6 bg-gray-300 rounded-full ${product.avatarUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                              <span className="text-xs text-gray-600">{product.author?.charAt(0) || 'A'}</span>
                            </div>
                            <span className="text-xs text-gray-500">{product.author}</span>
                          </div>
                          <span className="text-xs text-gray-400">{product.dateCreated}</span>
                        </div>
                        
                        {/* Action Button */}
                        <div className="pt-3 border-t border-gray-100">
                          {renderActionButtons(product, cards?.mapping?.actions)}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Product Card Layout */
                    <>
                      {/* Top Section - Image and Title */}
                      <div className="flex flex-col items-center text-center">
                        {/* Product Image */}
                        <div className="w-full h-[10rem] rounded-lg overflow-hidden border border-gray-200 mb-2">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.title || 'Product'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-[10rem] bg-gray-100 rounded-lg flex items-center justify-center" style={{display: product.image ? 'none' : 'flex'}}>
                            <Grid className="w-12 h-12 text-gray-400" />
                          </div>
                        </div>

                        {/* Product Title */}
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 min-h-[2rem]" title={product.title}>
                          {product.title || 'Product'}
                        </h4>

                        {/* Brand */}
                        <div className="min-h-[1rem]">
                          {product.brand && (
                            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                          )}
                        </div>
                      </div>

                      {/* Middle Section - Price and Rating */}
                      <div className="flex flex-col items-center text-center">
                        {/* Price */}
                        <div className="flex items-center justify-center mt-2">
                          {product.discountedPrice ? (
                            <div className="text-center">
                              <span className="text-sm font-bold text-green-600 block">{formatPrice(product.discountedPrice)}</span>
                              <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-green-600">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        
                        {/* Rating */}
                        <div className="min-h-[2rem] flex flex-col items-center justify-center">
                          {product.rating && (
                            <>
                              <div className="flex items-center justify-center mt-1">
                                {renderStars(product.rating)}
                              </div>
                              <span className="text-xs text-gray-500">({formatRating(product.rating)})</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Bottom Section - Action Button */}
                      <div className="mt-auto">
                        {renderActionButton(product, cards?.mapping?.actions)}
                      </div>
                    </>
                  )}
              </div>
              );
            })}
          </div>
          
          {/* Load More Button */}
          {visibleCount < processedCards.length && (
            <div className="flex justify-center mt-6 animate-fadeInUp" style={{ animationDelay: `${visibleCount * 150}ms` }}>
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 border-2 border-brand text-brand font-medium rounded-lg hover:bg-brand hover:text-white transition-colors duration-200"
              >
                Load More {processedCards[0]?.cardType === 'blog' ? 'Posts' : 
                         processedCards[0]?.cardType === 'property' ? 'Properties' : 'Products'} ({processedCards.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For other card types, use the original layout
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Grid className="w-4 h-4 text-brand" />
        <span className="text-sm font-medium text-gray-800">
          Cards ({Math.min(visibleCount, processedCards.length)} of {processedCards.length}) {!cards ? '(Dummy Data)' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {processedCards.slice(0, visibleCount).map((card, index) => {
          // Animate initial load or new cards after load more
          const isInitialLoad = previousVisibleCount === 0;
          const isNewCard = index >= previousVisibleCount;
          const shouldAnimate = isInitialLoad || isNewCard;
          
          let animationDelay = 0;
          if (isInitialLoad) {
            animationDelay = index * 150;
          } else if (isNewCard) {
            animationDelay = (index - previousVisibleCount) * 150;
          }
          
          return (
            <div 
              key={card.id || card.displayOrder}
              className={shouldAnimate ? 'animate-fadeInUp' : ''}
              style={{ 
                animationDelay: shouldAnimate ? `${animationDelay}ms` : undefined
              }}
            >
              {renderCardByType(card)}
            </div>
          );
        })}
      </div>
      
      {/* Load More Button */}
      {visibleCount < processedCards.length && (
        <div className="flex justify-center mt-4 animate-fadeInUp" style={{ animationDelay: `${visibleCount * 150}ms` }}>
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border-2 border-brand text-brand font-medium rounded-lg hover:bg-brand hover:text-white transition-colors duration-200"
          >
            Load More Cards ({processedCards.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsDisplay;
