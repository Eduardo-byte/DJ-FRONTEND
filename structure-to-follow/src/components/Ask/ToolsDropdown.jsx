import React, { useState, useContext } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Settings, Globe, Wrench, Image } from 'lucide-react';
import { UserDataContext } from '../../context/UserDataContext';
import CustomToolsDrawer from './CustomToolsDrawer';

const ToolsDropdown = ({ className, customTools = [], onToolsUpdate, userChats = [], onBusinessToolsUpdate, onSearchToggle, isSearchEnabled, onImageToggle, isImageEnabled }) => {
  const [isCustomToolsDrawerOpen, setIsCustomToolsDrawerOpen] = useState(false);
  const { loggedInUser } = useContext(UserDataContext);

  // Check if user has premium access
  const isPremium = loggedInUser?.account_type !== "basic" && loggedInUser?.account_type !== "free";

  const handleToolSelect = (key) => {
    console.log('Selected tool:', key);
    switch (key) {
      case 'search':
        // Toggle search tool on/off
        if (onSearchToggle) {
          onSearchToggle(!isSearchEnabled);
        }
        break;
      case 'image':
        // Toggle image tool on/off
        if (onImageToggle) {
          onImageToggle(!isImageEnabled);
        }
        break;
      case 'custom-tools':
        setIsCustomToolsDrawerOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* <Dropdown backdrop="blur"> */}
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant="light"
            size="sm"
            className={className}
            startContent={<Settings className="w-4 h-4" />}
          >
            Tools
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Tools Menu"
          variant="faded"
          onAction={handleToolSelect}
        >
          <DropdownItem
            key="search"
            startContent={<Globe className="w-4 h-4" />}
            className={isSearchEnabled ? "bg-brand/10 text-gray-900" : ""}
            endContent={isSearchEnabled ? (
              <div className="w-2 h-2 bg-brand rounded-full"></div>
            ) : null}
          >
            Search
          </DropdownItem>
          {/* <DropdownItem 
            key="image" 
            startContent={<Image className="w-4 h-4" />}
            className={isImageEnabled ? "bg-brand/10 text-gray-900" : ""}
            endContent={isImageEnabled ? (
              <div className="w-2 h-2 bg-brand rounded-full"></div>
            ) : null}
          >
            Create Image
          </DropdownItem> */}
          <DropdownItem
            key="custom-tools"
            startContent={<Wrench className="w-4 h-4" />}
          >
            Custom Tools
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Custom Tools Drawer */}
      <CustomToolsDrawer
        isOpen={isCustomToolsDrawerOpen}
        onClose={() => setIsCustomToolsDrawerOpen(false)}
        customTools={customTools}
        onToolsUpdate={onToolsUpdate}
        userChats={userChats}
        onBusinessToolsUpdate={onBusinessToolsUpdate}
        isPremium={isPremium}
      />
    </>
  );
};

export default ToolsDropdown;
