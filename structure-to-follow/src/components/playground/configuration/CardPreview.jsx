import React, { useState } from 'react';
import { Bed, Bath, Square, MapPin } from 'lucide-react';

// Combined image component that shows real image or placeholder
const ImageWithFallback = ({ className = "", index = 0, customSize = null, imageUrl = null, images = [], width = 'w-24', height = 'h-24' }) => {
  // Use provided imageUrl or fallback to images array
  const finalImageUrl = imageUrl || images[index];
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use custom size if provided, otherwise use default dimensions
  const imageWidth = customSize?.width || width;
  const imageHeight = customSize?.height || height;
  
  const hasValidImage = finalImageUrl && typeof finalImageUrl === 'string' && !imageError;
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {hasValidImage ? (
        <img 
          src={finalImageUrl} 
          alt={`Preview image ${index + 1}`}
          className={`rounded-lg object-cover ${imageWidth} ${imageHeight}`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageError ? 'none' : 'block' }}
        />
      ) : null}
      
      {/* Always show placeholder if no image or image failed to load */}
      {(!hasValidImage || imageError) && (
        <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${imageWidth} ${imageHeight}`}>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

const CardPreview = ({ cardType, maxImages, imageSize, showPreview, fieldMapping = null, productMapping = null, actionMapping = null, blogMapping = null, blogActionMapping = null, propertyMapping = null, propertyActionMapping = null, apiResponseData = null, productLayout = 'vertical' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [multiplePropertyImageIndexes, setMultiplePropertyImageIndexes] = useState({});
  
  // Debug logging to track what props are being passed
  console.log('CardPreview Props:', {
    cardType,
    fieldMapping: fieldMapping ? 'exists' : 'null',
    apiResponseData: apiResponseData ? 'exists' : 'null',
    productMapping: productMapping ? 'exists' : 'null',
    propertyMapping: propertyMapping ? 'exists' : 'null'
  });
  
  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small': return { width: 'w-16', height: 'h-16', text: '150px' };
      case 'medium': return { width: 'w-24', height: 'h-24', text: '300px' };
      case 'large': return { width: 'w-32', height: 'h-32', text: '500px' };
      case 'xlarge': return { width: 'w-40', height: 'h-40', text: '800px' };
      default: return { width: 'w-24', height: 'h-24', text: '300px' };
    }
  };

  const { width, height, text } = getImageDimensions();

  const ImagePlaceholder = ({ className = "" }) => (
    <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${width} ${height} ${className}`}>
      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  // Extract images from API response using field mappings
  const extractImagesFromResponse = () => {
    if (!apiResponseData || !fieldMapping?.urlPath) {
      return [];
    }

    try {
      const pathParts = fieldMapping?.urlPath?.split('.') || [];
      let data = apiResponseData;
      let collectedImages = [];
      
      // Helper function to recursively collect images from nested arrays
      const collectImagesFromPath = (currentData, pathIndex, currentPath = []) => {
        if (pathIndex >= pathParts.length) {
          // We've reached the end of the path
          if (Array.isArray(currentData)) {
            collectedImages.push(...currentData);
          } else if (currentData) {
            collectedImages.push(currentData);
          }
          return;
        }

        const part = pathParts[pathIndex];
        
        if (part.includes('[]')) {
          // Handle array notation
          const arrayKey = part.replace('[]', '');
          if (currentData[arrayKey] && Array.isArray(currentData[arrayKey])) {
            // Iterate through all items in the array
            currentData[arrayKey].forEach((item, index) => {
              collectImagesFromPath(item, pathIndex + 1, [...currentPath, `${arrayKey}[${index}]`]);
            });
          }
        } else if (currentData && currentData[part] !== undefined) {
          collectImagesFromPath(currentData[part], pathIndex + 1, [...currentPath, part]);
        }
      };

      // Start the recursive collection
      collectImagesFromPath(data, 0);
      
      // Remove duplicates and limit to maxImages
      const uniqueImages = [...new Set(collectedImages.filter(img => img && typeof img === 'string'))];
      return uniqueImages.slice(0, maxImages);
      
    } catch (error) {
      console.warn('Error extracting images from API response:', error);
      return [];
    }
  };

  let images = [];
  
  try {
    images = extractImagesFromResponse();
  } catch (error) {
    console.error('Error extracting images from response:', error);
    images = [];
  }


  // Simple function to get raw products array
  const getRawProductsArray = () => {
    if (!apiResponseData) return [];
    
    // Check if we have an image field mapping with array notation
    if (fieldMapping?.urlPath?.includes('[]')) {
      const pathBeforeArray = fieldMapping.urlPath.split('[]')[0];
      const pathParts = pathBeforeArray.split('.');
      
      let data = apiResponseData;
      for (const part of pathParts) {
        if (data && data[part] !== undefined) {
          data = data[part];
        } else {
          return [];
        }
      }
      
      if (Array.isArray(data)) {
        return data;
      }
    }
    
    // Check product mapping paths for arrays
    if (productMapping) {
      const arrayPaths = Object.values(productMapping).filter(path => path && path.includes('[]'));
      if (arrayPaths.length > 0) {
        const firstPath = arrayPaths[0];
        const pathBeforeArray = firstPath.split('[]')[0];
        const pathParts = pathBeforeArray.split('.');
        
        let data = apiResponseData;
        for (const part of pathParts) {
          if (data && data[part] !== undefined) {
            data = data[part];
          } else {
            return [];
          }
        }
        
        if (Array.isArray(data)) {
          return data;
        }
      }
    }
    
    return [];
  };

  // Extract image from a single item
  const getImageFromItem = (item) => {
    if (!fieldMapping?.urlPath || !item) return null;
    
    // Get the path after []
    const urlPath = fieldMapping.urlPath;
    const arrayIndex = urlPath.indexOf('[]');
    if (arrayIndex === -1) return null;
    
    const pathAfterArray = urlPath.substring(arrayIndex + 3);
    
    // If no path after [], the item itself might be the URL
    if (!pathAfterArray) {
      return typeof item === 'string' ? item : null;
    }
    
    // Remove leading dot if exists
    const cleanPath = pathAfterArray.startsWith('.') ? pathAfterArray.substring(1) : pathAfterArray;
    
    // If still no path, item is the URL
    if (!cleanPath) {
      return typeof item === 'string' ? item : null;
    }
    
    // Navigate the path
    const parts = cleanPath.split('.');
    let current = item;
    
    for (const part of parts) {
      if (!current) return null;
      
      // Handle array notation like "photos[]" or "images[0]"
      if (part.includes('[') && part.includes(']')) {
        const arrayName = part.split('[')[0];
        const indexMatch = part.match(/\[(\d+)\]/);
        
        if (current[arrayName] && Array.isArray(current[arrayName])) {
          if (indexMatch) {
            // Specific index like [0]
            const arrayIndex = parseInt(indexMatch[1]);
            current = current[arrayName][arrayIndex];
          } else {
            // Empty brackets [] - take first item
            current = current[arrayName][0];
          }
        } else {
          return null;
        }
      } else if (typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    // If we got an array, take the first string URL
    if (Array.isArray(current)) {
      for (const item of current) {
        if (typeof item === 'string') return item;
      }
      return null;
    }
    
    return typeof current === 'string' ? current : null;
  };

  // Extract product data - simplified
  const extractProductData = () => {
    const rawProducts = getRawProductsArray();
    
    // If we have multiple products
    if (rawProducts.length > 0) {
      return rawProducts.map((item, index) => {
        const imageUrl = getImageFromItem(item);
        
        // Extract product fields if mappings are provided
        let productInfo = {
          title: `Product ${index + 1}`,
          description: 'Product description',
          price: '$99.99',
          discountedPrice: null,
          brand: 'Brand Name',
          rating: 4.5,
          reviews: 123,
          imageUrl: imageUrl
        };
        
        // If we have product mappings, try to extract actual values
        if (productMapping) {
          const extractField = (fieldPath) => {
            if (!fieldPath) return null;
            
            // Remove the array part from the path since we're already inside the item
            const cleanPath = fieldPath.includes('[]') 
              ? fieldPath.split('[]').pop().replace(/^\./, '')
              : fieldPath;
            
            if (!cleanPath) return null;
            
            const parts = cleanPath.split('.');
            let current = item;
            
            for (const part of parts) {
              if (current && typeof current === 'object' && part in current) {
                current = current[part];
              } else {
                return null;
              }
            }
            
            return current;
          };
          
          productInfo = {
            title: extractField(productMapping?.titlePath) || productInfo.title,
            description: extractField(productMapping?.descriptionPath) || productInfo.description,
            price: extractField(productMapping?.pricePath) || productInfo.price,
            discountedPrice: extractField(productMapping?.discountedPricePath) || productInfo.discountedPrice,
            brand: extractField(productMapping?.brandPath) || productInfo.brand,
            rating: extractField(productMapping?.ratingPath) || productInfo.rating,
            reviews: extractField(productMapping?.reviewsPath) || productInfo.reviews,
            imageUrl: imageUrl
          };
        }
        
        return productInfo;
      });
    }
    
    // Single product fallback
    return [{
      title: 'Product Name',
      description: 'Product description goes here',
      price: '$99.99',
      discountedPrice: null,
      brand: 'Brand Name',
      rating: 4.5,
      reviews: 123,
      imageUrl: images[0] || null
    }];
  };

  let allProductsData = [];
  let isMultipleProducts = false;
  let productData = null;
  
  try {
    allProductsData = extractProductData();
    isMultipleProducts = allProductsData.length > 1;
    productData = allProductsData[0]; // Keep for backward compatibility
  } catch (error) {
    console.error('Error extracting product data:', error);
    allProductsData = [];
    isMultipleProducts = false;
    productData = null;
  }

  // Extract blog data from API response using blog mappings
  const extractBlogData = () => {
    if (!blogMapping || !apiResponseData) {
      return {
        title: 'How to Build Amazing User Experiences with Modern Design',
        description: 'Discover the latest trends in UI/UX design that will help you create...',
        dateCreated: 'Dec 15, 2023',
        minRead: '5 min read',
        tags: 'Technology',
        author: 'John Doe',
        avatarUrl: null
      };
    }

    const extractValue = (path) => {
      if (!path) return null;
      
      try {
        const pathParts = path.split('.');
        let data = apiResponseData;
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          
          if (part.includes('[]')) {
            const arrayKey = part.replace('[]', '');
            if (data[arrayKey] && Array.isArray(data[arrayKey])) {
              if (i === pathParts.length - 1) {
                return data[arrayKey][0]; // Return first item for preview
              }
              data = data[arrayKey][0];
            } else {
              return null;
            }
          } else if (data && data[part] !== undefined) {
            data = data[part];
          } else {
            return null;
          }
        }
        
        return data;
      } catch (error) {
        console.warn('Error extracting blog data:', error);
        return null;
      }
    };

    return {
      title: extractValue(blogMapping?.titlePath) || 'How to Build Amazing User Experiences with Modern Design',
      description: extractValue(blogMapping?.descriptionPath) || 'Discover the latest trends in UI/UX design that will help you create...',
      dateCreated: extractValue(blogMapping?.dateCreatedPath) || 'Dec 15, 2023',
      minRead: extractValue(blogMapping?.minReadPath) || '5 min read',
      tags: extractValue(blogMapping?.tagsPath) || 'Technology',
      author: extractValue(blogMapping?.authorPath) || 'John Doe',
      avatarUrl: extractValue(blogMapping?.avatarUrlPath) || null
    };
  };

  let blogData = null;
  
  try {
    blogData = extractBlogData();
  } catch (error) {
    console.error('Error extracting blog data:', error);
    blogData = {
      title: 'How to Build Amazing User Experiences with Modern Design',
      description: 'Discover the latest trends in UI/UX design that will help you create...',
      dateCreated: 'Dec 15, 2023',
      minRead: '5 min read',
      tags: 'Technology',
      author: 'John Doe',
      avatarUrl: null
    };
  }

  // Extract property data from API response using property mappings
  const extractPropertyData = () => {
    // For property cards, we need to flatten the structure since each top-level object contains a data array
    const rawProperties = Array.isArray(apiResponseData) ? apiResponseData : [];
    
    // Flatten the data: each top-level object has a data array with actual properties
    let allProperties = [];
    rawProperties.forEach((topLevelProperty, topIndex) => {
      if (topLevelProperty.data && Array.isArray(topLevelProperty.data)) {
        topLevelProperty.data.forEach((dataItem, dataIndex) => {
          if (dataItem && Object.keys(dataItem).length > 0) { // Skip empty objects
            allProperties.push({
              ...dataItem,
              _topLevelIndex: topIndex, // Keep track of which top-level object this came from
              _dataIndex: dataIndex     // Keep track of position within data array
            });
          }
        });
      }
    });
    
    console.log('🏠 Flattened properties:', allProperties);
    
    // If we have multiple properties
    if (allProperties.length > 0) {
      return allProperties.map((property, index) => {
        // For properties, get image directly from the flattened property object
        let imageUrl = null;
        
        if (property.property_media && property.property_media.photos && property.property_media.photos.length > 0) {
          imageUrl = property.property_media.photos[0].photo;
        }
        
        console.log(`Property ${index}:`, {
          propertyId: property?.property_id,
          price: property?.price_per_room || 'N/A',
          imageUrl: imageUrl,
          photos: property?.property_media?.photos?.length || 0,
          firstPhotoUrl: property?.property_media?.photos?.[0]?.photo,
          title: property?.property_title || 'N/A'
        });
        
        // Helper function to format price with currency and period
        const formatPriceWithCurrency = (price, currency = 'USD', period = 'week') => {
          if (!price) return null;
          
          const currencySymbols = {
            'USD': '$',
            'GBP': '£',
            'EUR': '€',
            'CAD': 'C$',
            'AUD': 'A$',
            'JPY': '¥',
            'CHF': 'CHF ',
            'CNY': '¥',
            'INR': '₹'
          };
          
          const periodSuffixes = {
            'week': '/week',
            'month': '/month',
            'day': '/day',
            'year': '/year'
          };
          
          const symbol = currencySymbols[currency] || '$';
          const cleanPrice = String(price).replace(/[^\d.,]/g, '');
          const periodSuffix = periodSuffixes[period] || '/week';
          
          // For currencies that go after the number
          if (currency === 'CHF') {
            return `${symbol}${cleanPrice}${periodSuffix}`;
          }
          
          return `${symbol}${cleanPrice}${periodSuffix}`;
        };

        // Extract property fields if mappings are provided
        let propertyInfo = {
          title: 'Beautiful Family Home',
          description: 'Charming property with modern amenities and great location',
          price: '$485,000',
          address: '123 Oak Street, Downtown',
          beds: '3',
          baths: '2',
          sqft: '1,850',
          propertyType: 'Single Family',
          listedDate: '3 days ago',
          status: 'For Sale',
          imageUrl: imageUrl
        };
        
        // If we have property mappings, try to extract actual values
        if (propertyMapping) {
          const extractField = (fieldPath) => {
            if (!fieldPath) return null;
            
            console.log('🔍 Extracting field:', fieldPath, 'from flattened property:', property);
            
            // Handle different path formats:
            // 1. "data[].property_title" -> "property_title" (since we flattened the data)
            // 2. "square_meter_size" -> "square_meter_size" (direct access)
            // 3. "data[].location.city" -> "location.city" (nested access)
            
            let cleanPath = fieldPath;
            if (fieldPath.includes('data[].')) {
              // Remove "data[]." prefix since we've flattened the structure
              cleanPath = fieldPath.replace('data[].', '');
            } else if (fieldPath.includes('[]')) {
              // For other array notations, remove the array part
              cleanPath = fieldPath.split('[]').pop().replace(/^\./, '');
            }
            
            console.log('🧹 Clean path after flattening:', cleanPath);
            
            if (!cleanPath) return null;
            
            const parts = cleanPath.split('.');
            let current = property;
            
            console.log('🚶 Starting navigation from flattened property');
            
            for (const part of parts) {
              console.log(`🔎 Looking for part "${part}" in:`, current);
              if (current && typeof current === 'object' && part in current) {
                current = current[part];
                console.log(`✅ Found "${part}":`, current);
              } else {
                console.log(`❌ Failed to find "${part}" in:`, current);
                return null;
              }
            }
            
            console.log('🎯 Final result:', current);
            return current;
          };
          
          const extractedPrice = extractField(propertyMapping?.pricePath);
          const formattedPrice = extractedPrice ? 
            formatPriceWithCurrency(extractedPrice, propertyMapping?.currencyType, propertyMapping?.pricePeriod) : 
            propertyInfo.price;

          propertyInfo = {
            propertyId: property.property_id,
            title: extractField(propertyMapping?.titlePath) || propertyInfo.title,
            description: extractField(propertyMapping?.descriptionPath) || propertyInfo.description,
            price: formattedPrice,
            address: extractField(propertyMapping?.addressPath) || propertyInfo.address,
            beds: extractField(propertyMapping?.bedsPath) || propertyInfo.beds,
            baths: extractField(propertyMapping?.bathsPath) || propertyInfo.baths,
            sqft: extractField(propertyMapping?.sqftPath) || propertyInfo.sqft,
            propertyType: extractField(propertyMapping?.propertyTypePath) || propertyInfo.propertyType,
            listedDate: extractField(propertyMapping?.listedDatePath) || propertyInfo.listedDate,
            status: extractField(propertyMapping?.statusPath) || propertyInfo.status,
            imageUrl: imageUrl
          };
        }
        
        return propertyInfo;
      });
    }
    
    // Single property fallback
    return [{
      price: '$485,000',
      address: '123 Oak Street, Downtown',
      beds: '3',
      baths: '2',
      sqft: '1,850',
      propertyType: 'Single Family',
      listedDate: '3 days ago',
      status: 'For Sale',
      imageUrl: images[0] || null
    }];
  };

  let allPropertyData = [];
  let isMultipleProperties = false;
  let propertyData = null;
  
  try {
    allPropertyData = extractPropertyData();
    isMultipleProperties = cardType === 'property' ? allPropertyData.length > 1 : false;
    propertyData = allPropertyData[0]; // Keep for backward compatibility
  } catch (error) {
    console.error('Error extracting property data:', error);
    allPropertyData = [];
    isMultipleProperties = false;
    propertyData = null;
  }


  // Extract action data from API response using action mappings
  const extractActionData = () => {
    if (!actionMapping) {
      return {
        buttonText: 'Buy Now',
        redirectUrl: '#'
      };
    }

    let redirectUrl = '#';
    
    if (actionMapping?.useStaticUrl) {
      redirectUrl = actionMapping?.staticRedirectUrl || '#';
    } else if (actionMapping?.redirectUrlPath && apiResponseData) {
      try {
        const pathParts = actionMapping.redirectUrlPath.split('.');
        let data = apiResponseData;
        
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          
          if (part.includes('[]')) {
            const arrayKey = part.replace('[]', '');
            if (data[arrayKey] && Array.isArray(data[arrayKey])) {
              if (i === pathParts.length - 1) {
                redirectUrl = data[arrayKey][0] || '#';
                break;
              }
              data = data[arrayKey][0];
            } else {
              break;
            }
          } else if (data && data[part] !== undefined) {
            data = data[part];
          } else {
            break;
          }
        }
        
        if (data && typeof data === 'string') {
          redirectUrl = data;
        }
      } catch (error) {
        console.warn('Error extracting action URL:', error);
      }
    }

    return {
      buttonText: actionMapping?.buttonText || 'Buy Now',
      redirectUrl: redirectUrl
    };
  };

  const actionData = extractActionData();


  // Shared utility functions for product cards
  const formatPrice = (price) => {
    if (!price) return '$99.99';
    const priceStr = String(price);
    return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
  };

  const formatRating = (rating) => {
    const numRating = parseFloat(rating) || 4.5;
    return Math.min(Math.max(numRating, 0), 5);
  };

  const renderStars = (rating) => {
    const actualRating = formatRating(rating);
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-3 h-3 ${i < Math.floor(actualRating) ? 'fill-current' : 'fill-gray-300'}`} 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Single Product Vertical Layout (Current)
  const renderSingleProductVertical = (product, productIndex = 0) => {
    const actualRating = formatRating(product.rating);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
        <div className="flex gap-3">
          <ImageWithFallback index={productIndex} imageUrl={product.imageUrl} images={images} width={width} height={height} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate" title={product.title}>
              {product.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
            <div className="flex items-center mt-2">
              {product.discountedPrice ? (
                <>
                  <span className="text-lg font-bold text-green-600">{formatPrice(product.discountedPrice)}</span>
                  <span className="text-sm text-gray-500 ml-2 line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
              )}
            </div>
            <div className="flex items-center mt-2">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500 ml-1">({actualRating}) · {product.reviews} reviews</span>
            </div>
            {product.description && product.description !== 'Product description' && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2" title={product.description}>
                {product.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {actionMapping?.buttonText && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button 
              className="w-full bg-brand hover:bg-brand/90 text-dark py-2 px-4 rounded-md text-sm font-medium transition-colors"
              onClick={() => window.open(actionData.redirectUrl, '_blank')}
              title={`Go to: ${actionData.redirectUrl}`}
            >
              {actionData.buttonText}
            </button>
            {actionData.redirectUrl !== '#' && (
              <p className="text-xs text-gray-500 mt-1 text-center truncate" title={actionData.redirectUrl}>
                → {actionData.redirectUrl}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Single Product Horizontal Layout
  const renderSingleProductHorizontal = (product, productIndex = 0) => {
    const actualRating = formatRating(product.rating);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
        <div className="flex gap-4">
          <ImageWithFallback 
            index={productIndex} 
            customSize={{ width: 'w-20', height: 'h-20' }}
            imageUrl={product.imageUrl}
            images={images}
            width={width}
            height={height}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1" title={product.title}>
              {product.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                {product.discountedPrice ? (
                  <>
                    <span className="text-lg font-bold text-green-600">{formatPrice(product.discountedPrice)}</span>
                    <span className="text-sm text-gray-500 ml-2 line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
                )}
              </div>
              {actionMapping?.buttonText && (
                <button 
                  className="bg-brand hover:bg-brand/90 text-dark px-3 py-1 rounded text-xs font-medium transition-colors"
                  onClick={() => window.open(actionData.redirectUrl, '_blank')}
                  title={`Go to: ${actionData.redirectUrl}`}
                >
                  {actionData.buttonText}
                </button>
              )}
            </div>
            <div className="flex items-center mt-2">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500 ml-1">({actualRating}) · {product.reviews} reviews</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Multiple Products Horizontal Layout
  const renderMultipleProductsHorizontal = () => {
    // Limit to 2 products to fit in one card
    const productsToShow = allProductsData.slice(0, 2);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            {allProductsData.length} Products Found
          </h3>
          {allProductsData.length > 2 && (
            <span className="text-xs text-gray-500">+{allProductsData.length - 2} more</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productsToShow.map((product, index) => {
            return (
              <div key={index} className="border border-gray-100 rounded-lg p-3">
                <div className="flex flex-col items-center text-center">
                  <ImageWithFallback 
                    index={index} 
                    customSize={{ width: 'w-16', height: 'h-16' }}
                    imageUrl={product.imageUrl}
                    images={images}
                    width={width}
                    height={height}
                  />
                <h4 className="text-xs font-semibold text-gray-900 mt-2 line-clamp-2" title={product.title}>
                  {product.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                
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
                
                <div className="flex items-center justify-center mt-2">
                  {renderStars(product.rating)}
                </div>
                <span className="text-xs text-gray-500 mt-1">({formatRating(product.rating)})</span>
                
                {actionMapping?.buttonText && (
                  <button 
                    className="w-full bg-brand hover:bg-brand/90 text-dark px-2 py-1 rounded text-xs font-medium transition-colors mt-3"
                    onClick={() => window.open(actionData.redirectUrl, '_blank')}
                    title={`Go to: ${actionData.redirectUrl}`}
                  >
                    {actionData.buttonText}
                  </button>
                )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProductCard = () => {
    // Choose layout based on product count and layout preference
    if (isMultipleProducts) {
      return renderMultipleProductsHorizontal();
    } else {
      // For single product, choose layout based on productLayout prop
      if (productLayout === 'horizontal') {
        return renderSingleProductHorizontal(productData, 0);
      } else {
        return renderSingleProductVertical(productData, 0);
      }
    }
  };

  const renderBlogCard = () => {
    // Get the blog action URL
    const getReadMoreUrl = () => {
      if (!blogActionMapping) return null;
      
      if (blogActionMapping?.useStaticUrl) {
        return blogActionMapping?.staticReadMoreUrl;
      }
      
      if (blogActionMapping?.readMoreUrlPath && apiResponseData) {
        try {
          const pathParts = blogActionMapping.readMoreUrlPath.split('.');
          let data = apiResponseData;
          
          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            
            if (part.includes('[]')) {
              const arrayKey = part.replace('[]', '');
              if (data[arrayKey] && Array.isArray(data[arrayKey])) {
                if (i === pathParts.length - 1) {
                  return data[arrayKey][0];
                }
                data = data[arrayKey][0];
              } else {
                return null;
              }
            } else if (data && data[part] !== undefined) {
              data = data[part];
            } else {
              return null;
            }
          }
          
          return data;
        } catch (error) {
          console.warn('Error extracting blog action URL:', error);
          return null;
        }
      }
      
      return null;
    };

    const readMoreUrl = getReadMoreUrl();

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm">
        <ImageWithFallback 
          index={0} 
          customSize={{ width: 'w-full', height: 'h-32' }}
          className="rounded-none"
          images={images}
          width={width}
          height={height}
        />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {Array.isArray(blogData.tags) ? blogData.tags[0] : blogData.tags}
            </span>
            <span className="text-xs text-gray-500">{blogData.minRead}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {blogData.title}
          </h4>
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {blogData.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {blogData.avatarUrl ? (
                <img 
                  src={blogData.avatarUrl} 
                  alt={blogData.author}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-6 h-6 bg-gray-300 rounded-full ${blogData.avatarUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                <span className="text-xs text-gray-600">{blogData.author?.charAt(0) || 'A'}</span>
              </div>
              <span className="text-xs text-gray-500">{blogData.author}</span>
            </div>
            <span className="text-xs text-gray-400">{blogData.dateCreated}</span>
          </div>
          {readMoreUrl && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button className="bg-brand text-dark text-xs px-3 py-1.5 rounded font-medium w-full">
                {blogActionMapping?.buttonText || 'Read More'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromotionCard = () => (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 text-white max-w-sm relative overflow-hidden">
      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
        50% OFF
      </div>
      <div className="flex items-center gap-3">
        <ImageWithFallback index={0} className="border-2 border-white" images={images} width={width} height={height} />
        <div className="flex-1">
          <h4 className="text-sm font-bold">Limited Time Offer!</h4>
          <p className="text-xs opacity-90 mt-1">Special holiday discount on all products</p>
          <div className="mt-2">
            <span className="text-lg font-bold">$49.99</span>
            <span className="text-xs line-through opacity-75 ml-2">$99.99</span>
          </div>
          <button className="bg-white text-red-500 text-xs px-3 py-1 rounded-full font-semibold mt-2">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );

  const renderLinkCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-sm hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <ImageWithFallback index={0} className="flex-shrink-0" images={images} width={width} height={height} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
            Amazing Website Title - Check This Out
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            This is a preview description of the linked content that will be displayed...
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-gray-500">example.com</span>
            <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArticleCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <ImageWithFallback index={0} images={images} width={width} height={height} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">News</span>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
            Breaking: Important Industry Update You Need to Know
          </h4>
          <p className="text-xs text-gray-600 mt-2 line-clamp-3">
            Recent developments in the industry have led to significant changes that will impact...
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">TechNews Daily</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs text-gray-500">1.2k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm">
      <div className="bg-blue-500 text-white p-3 relative">
        <div className="absolute top-2 right-2">
          <ImageWithFallback index={0} customSize={{ width: 'w-12', height: 'h-12' }} images={images} width={width} height={height} />
        </div>
        <div className="pr-16">
          <h4 className="text-sm font-bold">Annual Tech Conference 2024</h4>
          <p className="text-xs opacity-90 mt-1">Join us for the biggest tech event of the year</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Dec 15, 2024</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">San Francisco</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">$299</span>
          <button className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg">
            Register
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm text-center">
      <div className="flex justify-center">
        <ImageWithFallback 
          index={0} 
          customSize={{ width: 'w-20', height: 'h-20' }}
          className="rounded-full"
          images={images}
          width={width}
          height={height}
        />
      </div>
      <h4 className="text-sm font-semibold text-gray-900 mt-3">Sarah Johnson</h4>
      <p className="text-xs text-gray-600 mt-1">Senior Product Designer</p>
      <p className="text-xs text-gray-500 mt-2">
        Passionate about creating intuitive user experiences and innovative design solutions.
      </p>
      <div className="flex justify-center gap-4 mt-3">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">1.2k</div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">856</div>
          <div className="text-xs text-gray-500">Following</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">124</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
      </div>
      <button className="bg-blue-500 text-white text-xs px-4 py-2 rounded-lg mt-3 w-full">
        Follow
      </button>
    </div>
  );

  const renderPropertyCard = () => {
    if (isMultipleProperties) {
      return renderMultipleProperties();
    } else {
      return renderSingleProperty(propertyData);
    }
  };

  const renderSingleProperty = (property) => {
    // Extract images for this specific property
    const extractPropertyImages = () => {
      if (!fieldMapping?.urlPath || !apiResponseData || cardType !== 'property') {
        return images; // Fallback to general images
      }

      try {
        // For single property view, use the first property (index 0)
        // Path: 0.data[].property_media.photos[].photo
        
        if (!apiResponseData || !Array.isArray(apiResponseData)) {
          console.warn('API response is not an array:', apiResponseData);
          return images;
        }

        // Get the first property
        const property = apiResponseData[0];
        if (!property) {
          console.warn('First property not found in API response');
          return images;
        }

        // Check if this property has data array and it's not empty
        if (!property.data || !Array.isArray(property.data) || property.data.length === 0) {
          console.warn('First property has no data array or empty data:', property);
          return images;
        }

        // Get the first data item that has property_media
        let propertyData = null;
        for (const dataItem of property.data) {
          if (dataItem && dataItem.property_media && dataItem.property_media.photos) {
            propertyData = dataItem;
            break;
          }
        }

        if (!propertyData) {
          console.warn('First property has no data with property_media.photos:', property.data);
          return images;
        }

        // Extract all photo URLs from the photos array
        const photos = propertyData.property_media.photos;
        if (!Array.isArray(photos)) {
          console.warn('Photos is not an array:', photos);
          return images;
        }

        // Extract the photo URLs
        const imageUrls = photos.map(photoObj => photoObj.photo).filter(url => url && typeof url === 'string');
        
        console.log('Single property images:', imageUrls);
        return imageUrls.length > 0 ? imageUrls : images;
        
      } catch (error) {
        console.warn('Error extracting single property images:', error);
        return images;
      }
    };

    const propertyImages = extractPropertyImages();
    const totalImages = propertyImages.length || 1;
    const safeCurrentIndex = Math.min(currentImageIndex, totalImages - 1);
    
    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };
    
    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    // Get property action URLs - only return URL if properly configured
    const getBookViewingUrl = () => {
      if (!propertyActionMapping?.showBookViewing) return null;
      
      if (propertyActionMapping?.useStaticBookViewingUrl) {
        // Static URL: only show if URL is actually provided
        return propertyActionMapping?.staticBookViewingUrl?.trim() || null;
      } else {
        // Dynamic URL: only show if path is mapped
        return propertyActionMapping?.bookViewingUrlPath?.trim() ? '#dynamic-book-viewing' : null;
      }
    };

    const getViewDetailsUrl = () => {
      if (!propertyActionMapping?.showViewDetails) return null;
      
      if (propertyActionMapping?.useStaticViewDetailsUrl) {
        // Static URL: only show if URL is actually provided
        return propertyActionMapping?.staticViewDetailsUrl?.trim() || null;
      } else {
        // Dynamic URL: only show if path is mapped
        return propertyActionMapping?.viewDetailsUrlPath?.trim() ? '#dynamic-view-details' : null;
      }
    };

    const bookViewingUrl = getBookViewingUrl();
    const viewDetailsUrl = getViewDetailsUrl();

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm">
        <div className="relative group">
          <div 
            className="cursor-pointer"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              setTouchStart(touch.clientX);
            }}
            onTouchEnd={(e) => {
              if (!touchStart) return;
              const touch = e.changedTouches[0];
              const diff = touchStart - touch.clientX;
              
              if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                  nextImage(); // Swipe left = next image
                } else {
                  prevImage(); // Swipe right = previous image
                }
              }
              setTouchStart(null);
            }}
            onMouseDown={(e) => {
              setTouchStart(e.clientX);
            }}
            onMouseUp={(e) => {
              if (!touchStart) return;
              const diff = touchStart - e.clientX;
              
              if (Math.abs(diff) > 50) { // Minimum drag distance
                if (diff > 0) {
                  nextImage(); // Drag left = next image
                } else {
                  prevImage(); // Drag right = previous image
                }
              }
              setTouchStart(null);
            }}
          >
            <ImageWithFallback 
              index={safeCurrentIndex} 
              customSize={{ width: 'w-full', height: 'h-48' }}
              className="rounded-none transition-all duration-300"
              images={propertyImages}
              width={width}
              height={height}
            />
          </div>
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
            {property?.status || 'For Sale'}
          </div>
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {totalImages > 1 ? `${safeCurrentIndex + 1}/${totalImages}` : '1/1'}
          </div>
          
          {/* Navigation Arrows - Enhanced with better visibility */}
          {totalImages > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          {/* Image Dots Indicator */}
          {totalImages > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(Math.min(totalImages, 5))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === safeCurrentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
              {totalImages > 5 && (
                <span className="text-white text-xs ml-1">+{totalImages - 5}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-4">
          {/* Title and Description */}
          {property?.title && (
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
            </div>
          )}
          {property?.description && (
            <div className="mb-2">
              <p className="text-xs text-gray-600 line-clamp-2">{property.description}</p>
            </div>
          )}
          
          <div className="mb-2">
            <h4 className="text-lg font-bold text-gray-900">{property?.price || 'N/A'}</h4>
            <p className="text-xs text-gray-600">{property?.address || 'Address not available'}</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Bed className="w-3 h-3" />
              <span>{property?.beds || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-3 h-3" />
              <span>{property?.baths || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="w-3 h-3" />
              <span>{property?.sqft || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{property?.propertyType || 'Property'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>Listed {property?.listedDate || 'recently'}</span>
          </div>

          {/* Action Buttons */}
          {(bookViewingUrl || viewDetailsUrl) && (
            <div className="flex flex-col gap-2">
              {bookViewingUrl && (
                <button className="bg-brand text-dark px-3 py-1 rounded text-xs font-medium w-full">
                  {propertyActionMapping?.bookViewingText}
                </button>
              )}
              {viewDetailsUrl && (
                <button className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium w-full">
                  {propertyActionMapping?.viewDetailsText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMultipleProperties = () => {
    // Filter out properties that don't have data or images, then take first 2
    const propertiesWithData = allPropertyData.filter(property => {
      // Only show properties that have actual data
      return property && property.imageUrl && property.imageUrl !== null;
    });
    
    const propertiesToShow = propertiesWithData.slice(0, 2); // Show max 2 properties
    
    // Helper function to get images for a specific property
    const getPropertyImages = (propertyIndex) => {
      if (!fieldMapping?.urlPath || !apiResponseData || cardType !== 'property') {
        return images; // Fallback to general images
      }

      try {
        // For property cards, we need to get from the API response structure
        // Path: 0.data[].property_media.photos[].photo
        
        if (!apiResponseData || !Array.isArray(apiResponseData)) {
          console.warn('API response is not an array:', apiResponseData);
          return images;
        }

        // Get the specific property (propertyIndex corresponds to the index in the response array)
        const property = apiResponseData[propertyIndex];
        if (!property) {
          console.warn(`Property ${propertyIndex} not found in API response`);
          return images;
        }

        // Check if this property has data array and it's not empty
        if (!property.data || !Array.isArray(property.data) || property.data.length === 0) {
          console.warn(`Property ${propertyIndex} has no data array or empty data:`, property);
          return images;
        }

        // Get the first data item that has property_media
        let propertyData = null;
        for (const dataItem of property.data) {
          if (dataItem && dataItem.property_media && dataItem.property_media.photos) {
            propertyData = dataItem;
            break;
          }
        }

        if (!propertyData) {
          console.warn(`Property ${propertyIndex} has no data with property_media.photos:`, property.data);
          return images;
        }

        // Extract all photo URLs from the photos array
        const photos = propertyData.property_media.photos;
        if (!Array.isArray(photos)) {
          console.warn(`Photos is not an array:`, photos);
          return images;
        }

        // Extract the photo URLs
        const imageUrls = photos.map(photoObj => photoObj.photo).filter(url => url && typeof url === 'string');
        
        console.log(`Property ${propertyIndex} images:`, imageUrls);
        return imageUrls.length > 0 ? imageUrls : images;
        
      } catch (error) {
        console.warn('Error extracting property images:', error);
        return images;
      }
    };

    return (
      <div className="grid grid-cols-2 gap-3 max-w-2xl">
        {propertiesToShow.map((property, displayIndex) => {
          // Find the original index of this property in the API response
          const originalPropertyIndex = apiResponseData.findIndex(p => p.property_id === property.propertyId);
          const propertyImages = getPropertyImages(originalPropertyIndex);
          const totalImages = propertyImages.length || 1;
          const currentIndex = multiplePropertyImageIndexes[displayIndex] || 0;
          const safeCurrentIndex = Math.min(currentIndex, totalImages - 1);
          
          const nextImage = () => {
            setMultiplePropertyImageIndexes(prev => ({
              ...prev,
              [displayIndex]: (currentIndex + 1) % totalImages
            }));
          };
          
          const prevImage = () => {
            setMultiplePropertyImageIndexes(prev => ({
              ...prev,
              [displayIndex]: (currentIndex - 1 + totalImages) % totalImages
            }));
          };

          return (
            <div key={displayIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative group">
                <div 
                  className="cursor-pointer"
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    setTouchStart(touch.clientX);
                  }}
                  onTouchEnd={(e) => {
                    if (!touchStart) return;
                    const touch = e.changedTouches[0];
                    const diff = touchStart - touch.clientX;
                    
                    if (Math.abs(diff) > 30) { // Smaller swipe distance for compact cards
                      if (diff > 0) {
                        nextImage();
                      } else {
                        prevImage();
                      }
                    }
                    setTouchStart(null);
                  }}
                  onMouseDown={(e) => {
                    setTouchStart(e.clientX);
                  }}
                  onMouseUp={(e) => {
                    if (!touchStart) return;
                    const diff = touchStart - e.clientX;
                    
                    if (Math.abs(diff) > 30) {
                      if (diff > 0) {
                        nextImage();
                      } else {
                        prevImage();
                      }
                    }
                    setTouchStart(null);
                  }}
                >
                  <ImageWithFallback 
                    index={safeCurrentIndex} 
                    customSize={{ width: 'w-full', height: 'h-32' }}
                    className="rounded-none transition-all duration-300"
                    images={propertyImages}
                    width={width}
                    height={height}
                  />
                </div>
                
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                  {property?.status || 'For Sale'}
                </div>
                
                <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                  {totalImages > 1 ? `${safeCurrentIndex + 1}/${totalImages}` : '1/1'}
                </div>
                
                {/* Navigation Arrows for Multiple Properties */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                      style={{ backdropFilter: 'blur(4px)' }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                      style={{ backdropFilter: 'blur(4px)' }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Compact Dot Indicators */}
                {totalImages > 1 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {[...Array(Math.min(totalImages, 3))].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMultiplePropertyImageIndexes(prev => ({
                          ...prev,
                          [displayIndex]: i
                        }))}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === safeCurrentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                    {totalImages > 3 && (
                      <span className="text-white text-xs ml-1">+{totalImages - 3}</span>
                    )}
                  </div>
                )}
              </div>
            <div className="p-2">
              {/* Title */}
              {property?.title && (
                <div className="mb-1">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                </div>
              )}
              
              <div className="mb-1">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{property?.price || 'N/A'}</h4>
                <p className="text-xs text-gray-600 line-clamp-1">{property?.address || 'Address not available'}</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  <span>{property?.beds || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  <span>{property?.baths || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3" />
                  <span>{property?.sqft || 'N/A'}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-2">
                Listed {property?.listedDate || 'recently'}
              </div>

              {/* Compact Action Buttons */}
              {(propertyActionMapping?.showBookViewing || propertyActionMapping?.showViewDetails) && (
                <div className="flex flex-col gap-1">
                  {propertyActionMapping?.showBookViewing && (
                    <button className="bg-brand text-dark px-2 py-1 rounded text-xs font-medium w-full">
                      {propertyActionMapping?.bookViewingText}
                    </button>
                  )}
                  {propertyActionMapping?.showViewDetails && (
                    <button className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-2 py-1 rounded text-xs font-medium w-full">
                      {propertyActionMapping?.viewDetailsText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  const renderCustomCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        <ImageWithFallback index={0} images={images} width={width} height={height} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">Custom Card Layout</h4>
          <p className="text-xs text-gray-600">Fully customizable design</p>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-600 mb-3">
          This card type allows you to create custom layouts based on your specific needs and API response structure.
        </p>
        <div className="flex gap-2">
          {maxImages > 1 && [...Array(Math.min(maxImages, 4))].map((_, i) => (
            <ImageWithFallback key={i} index={i} customSize={{ width: 'w-12', height: 'h-12' }} images={images} width={width} height={height} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCard = () => {
    switch (cardType) {
      case 'product': return renderProductCard();
      case 'blog': return renderBlogCard();
      case 'promotion': return renderPromotionCard();
      case 'link': return renderLinkCard();
      case 'article': return renderArticleCard();
      case 'event': return renderEventCard();
      case 'profile': return renderProfileCard();
      case 'property': return renderPropertyCard();
      case 'custom': return renderCustomCard();
      default: return renderProductCard();
    }
  };

  try {
    return (
      <div className="w-full">
        {renderCard()}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">
            <span className="capitalize">{cardType}</span> Card • {maxImages} image{maxImages > 1 ? 's' : ''} • {text}
          </p>
          {showPreview && (
            <p className="text-xs text-green-600 mt-1">✓ Will show in chat preview</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('CardPreview Error:', error);
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <h6 className="text-sm font-medium text-red-800 mb-2">Preview Error</h6>
        <p className="text-xs text-red-600">
          Error rendering card preview: {error.message}
        </p>
        <details className="mt-2">
          <summary className="text-xs text-red-600 cursor-pointer">Error Details</summary>
          <pre className="text-xs text-red-500 mt-1 overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    );
  }
};

export default CardPreview;
