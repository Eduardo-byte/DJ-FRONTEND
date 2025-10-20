import React, { useState } from 'react';
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from '@heroui/react';
import { X, ExternalLink } from 'lucide-react';

const SourcesDrawer = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <>
      {/* Compact Sources Button */}
      <div className="flex justify-start">
        <div className="max-w-[80%] ml-0">
          <Button
            variant="bordered"
            size="sm"
            onPress={openDrawer}
            className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            startContent={
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            }
          >
            <span className="text-sm font-medium">Sources</span>
            <span className="text-xs text-gray-500 ml-1">({sources.length})</span>
          </Button>
        </div>
      </div>

      {/* Sources Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={closeDrawer}
        placement="right"
        size="md"
      >
        <DrawerContent>
          <DrawerHeader className="border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sources</h3>
                <p className="text-sm text-gray-500">
                  {sources.length} source{sources.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </DrawerHeader>

          <DrawerBody className="py-6">
            <div className="space-y-4">
              {sources.map((source, index) => {
                // Extract domain for favicon
                const domain = new URL(source.url).hostname;
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                
                return (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-6 h-6"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-6 h-6 bg-blue-500 rounded text-white text-sm flex items-center justify-center" style={{display: 'none'}}>
                          {domain.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-gray-900 group-hover:text-blue-700 line-clamp-2 mb-2">
                        {source.title}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1 mb-3">
                        {domain}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                          Visit source
                        </span>
                        <ExternalLink className="w-4 h-4 ml-2 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </DrawerBody>

          <DrawerFooter className="border-t border-gray-100 px-6 py-4">
            <div className="flex justify-end w-full">
              <Button
                variant="light"
                onPress={closeDrawer}
              >
                Close
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SourcesDrawer;
