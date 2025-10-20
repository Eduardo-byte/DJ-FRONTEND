import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Plus, Upload, HardDrive } from 'lucide-react';

const PlusDropdown = ({ className, isEmpty, isTransitioning, onFileUpload }) => {
  const handleOptionSelect = (key) => {
    console.log('Selected option:', key);
    switch (key) {
      case 'upload-file':
        // Trigger file upload
        if (onFileUpload) {
          onFileUpload();
        }
        break;
      case 'google-drive':
        // Handle Google Drive integration
        console.log('Google Drive integration not implemented yet');
        break;
      default:
        break;
    }
  };

  return (
    // <Dropdown backdrop="blur">
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          className={className}
          size="sm"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Upload Menu"
        variant="faded"
        onAction={handleOptionSelect}
      >
        <DropdownItem
          key="upload-file"
          startContent={<Upload className="w-4 h-4" />}
        >
          Upload file
        </DropdownItem>
        <DropdownItem
          key="google-drive"
          startContent={<HardDrive className="w-4 h-4" />}
        >
          Google Drive
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default PlusDropdown;
