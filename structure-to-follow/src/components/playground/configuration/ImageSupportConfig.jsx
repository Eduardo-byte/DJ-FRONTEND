import React, { useState } from 'react';
import { Select, SelectItem, Switch, Accordion, AccordionItem } from '@heroui/react';
import CardPreview from './CardPreview.jsx';
import ImageFieldMapping from './ImageFieldMapping.jsx';
import ProductInfoMapping from './ProductInfoMapping.jsx';
import ProductActionMapping from './ProductActionMapping.jsx';
import BlogInfoMapping from './BlogInfoMapping.jsx';
import BlogActionMapping from './BlogActionMapping.jsx';
import PropertyInfoMapping from './PropertyInfoMapping.jsx';
import PropertyActionMapping from './PropertyActionMapping.jsx';

const ImageSupportConfig = ({ 
  isVisible, 
  initialConfig = null,
  onConfigChange,
  validationResponse = null
}) => {
  // Initialize state from props
  const [allowImages, setAllowImages] = useState(() => 
    initialConfig?.enabled || false
  );
  const [imageConfig, setImageConfig] = useState(() => {
    const defaultConfig = {
      cardType: 'product',
      maxImages: 5,
      imageSize: 'medium',
      showPreview: true
    };
    
    if (initialConfig?.config && typeof initialConfig.config === 'object') {
      return { ...defaultConfig, ...initialConfig.config };
    }
    return defaultConfig;
  });

  const [fieldMapping, setFieldMapping] = useState(() => {
    const defaultMapping = {
      isArray: true,
      urlPath: '',
      thumbnailPath: '',
      captionPath: ''
    };
    
    if (initialConfig?.fieldMapping) {
      return { ...defaultMapping, ...initialConfig.fieldMapping };
    }
    return defaultMapping;
  });

  const [productMapping, setProductMapping] = useState(() => {
    const defaultMapping = {
      titlePath: '',
      descriptionPath: '',
      pricePath: '',
      discountedPricePath: '',
      reviewsPath: '',
      ratingPath: '',
      brandPath: ''
    };
    
    if (initialConfig?.productMapping) {
      return { ...defaultMapping, ...initialConfig.productMapping };
    }
    return defaultMapping;
  });

  const [actionMapping, setActionMapping] = useState(() => {
    const defaultMapping = {
      buttonText: '',
      redirectUrlPath: '',
      staticRedirectUrl: '',
      useStaticUrl: false
    };
    
    if (initialConfig?.actionMapping) {
      return { ...defaultMapping, ...initialConfig.actionMapping };
    }
    return defaultMapping;
  });

  const [blogMapping, setBlogMapping] = useState(() => {
    const defaultMapping = {
      titlePath: '',
      descriptionPath: '',
      dateCreatedPath: '',
      minReadPath: '',
      tagsPath: '',
      avatarUrlPath: '',
      authorPath: ''
    };
    
    if (initialConfig?.blogMapping) {
      return { ...defaultMapping, ...initialConfig.blogMapping };
    }
    return defaultMapping;
  });

  const [blogActionMapping, setBlogActionMapping] = useState(() => {
    const defaultMapping = {
      readMoreUrlPath: '',
      staticReadMoreUrl: '',
      useStaticUrl: false,
      buttonText: 'Read More'
    };
    
    if (initialConfig?.blogActionMapping) {
      return { ...defaultMapping, ...initialConfig.blogActionMapping };
    }
    return defaultMapping;
  });

  const [propertyMapping, setPropertyMapping] = useState(() => {
    const defaultMapping = {
      titlePath: '',
      descriptionPath: '',
      pricePath: '',
      addressPath: '',
      bedsPath: '',
      bathsPath: '',
      sqftPath: '',
      propertyTypePath: '',
      listedDatePath: '',
      statusPath: '',
      currencyType: 'USD',
      pricePeriod: 'week'
    };
    
    if (initialConfig?.propertyMapping) {
      return { ...defaultMapping, ...initialConfig.propertyMapping };
    }
    return defaultMapping;
  });

  const [propertyActionMapping, setPropertyActionMapping] = useState(() => {
    const defaultMapping = {
      showBookViewing: false,
      bookViewingText: 'Book Viewing',
      bookViewingUrlPath: '',
      staticBookViewingUrl: '',
      useStaticBookViewingUrl: false,
      showViewDetails: false,
      viewDetailsText: 'View Details',
      viewDetailsUrlPath: '',
      staticViewDetailsUrl: '',
      useStaticViewDetailsUrl: false
    };
    
    if (initialConfig?.propertyActionMapping) {
      return { ...defaultMapping, ...initialConfig.propertyActionMapping };
    }
    return defaultMapping;
  });

  // Helper function to create unified content mapping structure
  const createUnifiedContentMapping = (productInfo, blogInfo, propInfo, cardType) => {
    const baseMapping = {
      titlePath: '',
      descriptionPath: '',
      imagePath: fieldMapping.urlPath || '',
    };

    switch (cardType) {
      case 'product':
        return {
          ...baseMapping,
          titlePath: productInfo.titlePath || '',
          descriptionPath: productInfo.descriptionPath || '',
          pricePath: productInfo.pricePath || '',
          discountedPricePath: productInfo.discountedPricePath || '',
          reviewsPath: productInfo.reviewsPath || '',
          ratingPath: productInfo.ratingPath || '',
          brandPath: productInfo.brandPath || '',
          currencyType: 'USD'
        };
      case 'blog':
        return {
          ...baseMapping,
          titlePath: blogInfo.titlePath || '',
          descriptionPath: blogInfo.descriptionPath || '',
          authorPath: blogInfo.authorPath || '',
          dateCreatedPath: blogInfo.dateCreatedPath || '',
          minReadPath: blogInfo.minReadPath || '',
          tagsPath: blogInfo.tagsPath || '',
          avatarUrlPath: blogInfo.avatarUrlPath || ''
        };
      case 'property':
        return {
          ...baseMapping,
          titlePath: propInfo.titlePath || '',
          descriptionPath: propInfo.descriptionPath || '',
          pricePath: propInfo.pricePath || '',
          addressPath: propInfo.addressPath || '',
          bedsPath: propInfo.bedsPath || '',
          bathsPath: propInfo.bathsPath || '',
          sqftPath: propInfo.sqftPath || '',
          propertyTypePath: propInfo.propertyTypePath || '',
          listedDatePath: propInfo.listedDatePath || '',
          statusPath: propInfo.statusPath || '',
          currencyType: propInfo.currencyType || 'USD',
          pricePeriod: propInfo.pricePeriod || 'week'
        };
      default:
        return baseMapping;
    }
  };

  // Helper function to create unified action mapping
  const createUnifiedActionMapping = (actionInfo, blogActionInfo, propActionInfo, cardType) => {
    const baseActions = {
      primary: {
        enabled: false,
        text: '',
        urlPath: '',
        staticUrl: '',
        useStaticUrl: false
      },
      secondary: {
        enabled: false,
        text: '',
        urlPath: '',
        staticUrl: '',
        useStaticUrl: false
      }
    };

    switch (cardType) {
      case 'product':
        return {
          primary: {
            enabled: !!actionInfo.buttonText,
            text: actionInfo.buttonText || 'Buy Now',
            urlPath: actionInfo.redirectUrlPath || '',
            staticUrl: actionInfo.staticRedirectUrl || '',
            useStaticUrl: actionInfo.useStaticUrl || false
          },
          secondary: { ...baseActions.secondary }
        };
      case 'blog':
        return {
          primary: {
            enabled: !!blogActionInfo.buttonText,
            text: blogActionInfo.buttonText || 'Read More',
            urlPath: blogActionInfo.readMoreUrlPath || '',
            staticUrl: blogActionInfo.staticReadMoreUrl || '',
            useStaticUrl: blogActionInfo.useStaticUrl || false
          },
          secondary: { ...baseActions.secondary }
        };
      case 'property':
        return {
          primary: {
            enabled: propActionInfo.showBookViewing || false,
            text: propActionInfo.bookViewingText || 'Book Viewing',
            urlPath: propActionInfo.bookViewingUrlPath || '',
            staticUrl: propActionInfo.staticBookViewingUrl || '',
            useStaticUrl: propActionInfo.useStaticBookViewingUrl || false
          },
          secondary: {
            enabled: propActionInfo.showViewDetails || false,
            text: propActionInfo.viewDetailsText || 'View Details',
            urlPath: propActionInfo.viewDetailsUrlPath || '',
            staticUrl: propActionInfo.staticViewDetailsUrl || '',
            useStaticUrl: propActionInfo.useStaticViewDetailsUrl || false
          }
        };
      default:
        return baseActions;
    }
  };

  const notifyParent = (enabled, config, mapping = fieldMapping, productInfo = productMapping, actionInfo = actionMapping, blogInfo = blogMapping, blogActionInfo = blogActionMapping, propInfo = propertyMapping, propActionInfo = propertyActionMapping) => {
    if (onConfigChange) {
      const cardType = config?.cardType || 'product';
      
      onConfigChange({
        enabled,
        config: enabled ? config : null,
        
        // 🔄 LEGACY FORMAT (for backward compatibility)
        fieldMapping: enabled ? mapping : null,
        productMapping: enabled ? productInfo : null,
        actionMapping: enabled ? actionInfo : null,
        blogMapping: enabled ? blogInfo : null,
        blogActionMapping: enabled ? blogActionInfo : null,
        propertyMapping: enabled ? propInfo : null,
        propertyActionMapping: enabled ? propActionInfo : null,
        
        // ✨ NEW UNIFIED FORMAT
        unifiedMapping: enabled ? {
          content: createUnifiedContentMapping(productInfo, blogInfo, propInfo, cardType),
          actions: createUnifiedActionMapping(actionInfo, blogActionInfo, propActionInfo, cardType),
          cardType: cardType,
          version: '2.0' // Version marker for future migrations
        } : null
      });
    }
  };

  const handleAllowImagesToggle = (checked) => {
    setAllowImages(checked);
    notifyParent(checked, imageConfig);
  };

  const updateImageConfig = (updates) => {
    const newConfig = { ...imageConfig, ...updates };
    setImageConfig(newConfig);
    notifyParent(allowImages, newConfig);
  };

  // Parse validation response for field mapping
  const getApiResponseData = () => {
    if (!validationResponse?.data) return null;
    
    try {
      // If the data is already an object, return it
      if (typeof validationResponse.data === 'object') {
        return validationResponse.data;
      }
      
      // If it's a string, try to parse it as JSON
      return JSON.parse(validationResponse.data);
    } catch (error) {
      console.warn('Could not parse API response for field mapping:', error);
      return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h6 className="text-sm font-medium text-gray-800">Image Support</h6>
          <p className="text-xs text-gray-600">Enable image processing for this API endpoint</p>
        </div>
        <Switch
          size="sm"
          isSelected={allowImages}
          onValueChange={handleAllowImagesToggle}
          className="ml-2"
          aria-label="Enable image support"
        />
      </div>

      {allowImages && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Left Column - Configuration */}
          <div className="space-y-3">
            {/* Card Type Setting - Always Visible */}
            <div className=" border border-gray-200 rounded-lg p-3">
              <label className="text-xs font-medium text-gray-700 block mb-2">
                Card Type
              </label>
              <Select
                size="sm"
                selectedKeys={[imageConfig.cardType]}
                onSelectionChange={(keys) => {
                  const cardType = Array.from(keys)[0];
                  updateImageConfig({ cardType });
                }}
                className="w-full bg-white"
                aria-label="Select card type"
              >
                <SelectItem key="product">Product Card</SelectItem>
                <SelectItem key="blog">Blog Post</SelectItem>
                <SelectItem key="property">Property Listing</SelectItem>
                {/* Future card types - commented for now */}
                {/* <SelectItem key="promotion">Promotion</SelectItem> */}
                {/* <SelectItem key="link">Link Preview</SelectItem> */}
                {/* <SelectItem key="article">Article Card</SelectItem> */}
                {/* <SelectItem key="event">Event Card</SelectItem> */}
                {/* <SelectItem key="profile">Profile Card</SelectItem> */}
                {/* <SelectItem key="custom">Custom Card</SelectItem> */}
              </Select>
            </div>


            {/* Accordion for Advanced Configuration */}
            <Accordion variant="splitted" className="px-0 border-none">
              <AccordionItem 
                key="field-mapping" 
                aria-label="Image Field Mapping"
                title={
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-800">Image Field Mapping</span>
                    <span className="text-xs text-gray-500">
                      {fieldMapping?.urlPath ? 'Configured' : 'Required'}
                    </span>
                  </div>
                }
                className="!shadow-none"
              >
                <div className="pt-2">
                  <ImageFieldMapping
                    onMappingChange={(mapping) => {
                      setFieldMapping(mapping);
                      notifyParent(allowImages, imageConfig, mapping);
                    }}
                    apiResponseData={getApiResponseData()}
                    isCompact={true}
                    cardType={imageConfig.cardType}
                  />
                </div>
              </AccordionItem>

              {/* Product Information Accordion - Only for Product Cards */}
              {imageConfig.cardType === 'product' && (
                <AccordionItem 
                  key="product-info" 
                  aria-label="Product Information Mapping"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Product Information</span>
                      <span className="text-xs text-gray-500">
                        {productMapping?.titlePath || productMapping?.pricePath ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <ProductInfoMapping
                      onMappingChange={(mapping) => {
                        setProductMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, mapping, actionMapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}

              {/* Product Action Accordion - Only for Product Cards */}
              {imageConfig.cardType === 'product' && (
                <AccordionItem 
                  key="product-action" 
                  aria-label="Product Action Configuration"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Product Action</span>
                      <span className="text-xs text-gray-500">
                        {actionMapping?.buttonText ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <ProductActionMapping
                      onMappingChange={(mapping) => {
                        setActionMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, productMapping, mapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}

              {/* Blog Information Accordion - Only for Blog Cards */}
              {imageConfig.cardType === 'blog' && (
                <AccordionItem 
                  key="blog-info" 
                  aria-label="Blog Information Mapping"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Blog Information</span>
                      <span className="text-xs text-gray-500">
                        {blogMapping?.titlePath || blogMapping?.authorPath ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <BlogInfoMapping
                      onMappingChange={(mapping) => {
                        setBlogMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, productMapping, actionMapping, mapping, blogActionMapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}

              {/* Blog Action Accordion - Only for Blog Cards */}
              {imageConfig.cardType === 'blog' && (
                <AccordionItem 
                  key="blog-action" 
                  aria-label="Blog Action Configuration"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Blog Action</span>
                      <span className="text-xs text-gray-500">
                        {blogActionMapping?.readMoreUrlPath || blogActionMapping?.staticReadMoreUrl || blogActionMapping?.buttonText !== 'Read More' ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <BlogActionMapping
                      onMappingChange={(mapping) => {
                        setBlogActionMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, productMapping, actionMapping, blogMapping, mapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}

              {/* Property Information Accordion - Only for Property Cards */}
              {imageConfig.cardType === 'property' && (
                <AccordionItem 
                  key="property-info" 
                  aria-label="Property Information Mapping"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Property Information</span>
                      <span className="text-xs text-gray-500">
                        {propertyMapping?.pricePath || propertyMapping?.addressPath ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <PropertyInfoMapping
                      onMappingChange={(mapping) => {
                        setPropertyMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, productMapping, actionMapping, blogMapping, blogActionMapping, mapping, propertyActionMapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      initialMapping={propertyMapping}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}

              {/* Property Action Accordion - Only for Property Cards */}
              {imageConfig.cardType === 'property' && (
                <AccordionItem 
                  key="property-action" 
                  aria-label="Property Action Configuration"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-gray-800">Property Action</span>
                      <span className="text-xs text-gray-500">
                        {propertyActionMapping?.showBookViewing || propertyActionMapping?.showViewDetails ? 'Configured' : 'Optional'}
                      </span>
                    </div>
                  }
                  className="!shadow-none"
                >
                  <div className="pt-2">
                    <PropertyActionMapping
                      onMappingChange={(mapping) => {
                        setPropertyActionMapping(mapping);
                        notifyParent(allowImages, imageConfig, fieldMapping, productMapping, actionMapping, blogMapping, blogActionMapping, propertyMapping, mapping);
                      }}
                      apiResponseData={getApiResponseData()}
                      initialMapping={propertyActionMapping}
                      isCompact={true}
                    />
                  </div>
                </AccordionItem>
              )}
            </Accordion>

          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-800 border-b border-gray-200 pb-1">
              Preview
            </h6>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[200px] flex items-center justify-center">
              <CardPreview
                cardType={imageConfig.cardType}
                maxImages={imageConfig.maxImages}
                imageSize={imageConfig.imageSize}
                showPreview={imageConfig.showPreview}
                fieldMapping={fieldMapping}
                productMapping={productMapping}
                actionMapping={actionMapping}
                blogMapping={blogMapping}
                blogActionMapping={blogActionMapping}
                propertyMapping={propertyMapping}
                propertyActionMapping={propertyActionMapping}
                apiResponseData={getApiResponseData()}
              />
            </div>

            {/* Usage Instructions */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
              <h6 className="text-xs font-semibold text-gray-800 mb-1">Usage Instructions:</h6>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• API should return image URLs in response</li>
                <li>• Images will be auto-detected and displayed</li>
                <li>• Supports: JPG, PNG, GIF, WebP formats</li>
                <li>• Max file size: 5MB per image</li>
                {imageConfig.cardType === 'product' && (
                  <>
                    <li>• Include product price, name, and ratings</li>
                    <li>• Perfect for e-commerce and shopping experiences</li>
                  </>
                )}
                {imageConfig.cardType === 'blog' && (
                  <>
                    <li>• Add article title, author, and publication date</li>
                    <li>• Ideal for content sharing and blog previews</li>
                  </>
                )}
                {imageConfig.cardType === 'property' && (
                  <>
                    <li>• Display price, bedrooms, bathrooms, and square footage</li>
                    <li>• Include property type, amenities, and location</li>
                    <li>• Perfect for real estate listings and property search</li>
                  </>
                )}
                {/* Future card type instructions - commented for now */}
                {/* {imageConfig.cardType === 'promotion' && (
                  <>
                    <li>• Highlight discounts and special offers</li>
                    <li>• Great for marketing campaigns and sales</li>
                  </>
                )} */}
                {/* {imageConfig.cardType === 'link' && (
                  <>
                    <li>• Include page title and description</li>
                    <li>• Perfect for URL previews and link sharing</li>
                  </>
                )} */}
                {/* {imageConfig.cardType === 'event' && (
                  <>
                    <li>• Display event date, location, and pricing</li>
                    <li>• Excellent for event promotion and registration</li>
                  </>
                )} */}
                {/* {imageConfig.cardType === 'profile' && (
                  <>
                    <li>• Show user stats and social information</li>
                    <li>• Perfect for social platforms and user cards</li>
                  </>
                )} */}
                {/* {imageConfig.cardType === 'article' && (
                  <>
                    <li>• Include publication source and read time</li>
                    <li>• Great for news articles and content feeds</li>
                  </>
                )} */}
                {/* {imageConfig.cardType === 'custom' && (
                  <>
                    <li>• Flexible layout for any content type</li>
                    <li>• Customize based on your API response structure</li>
                  </>
                )} */}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSupportConfig;
