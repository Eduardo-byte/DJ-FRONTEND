import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Avatar,
  Select,
  SelectItem,
  Chip,
  Tooltip,
  Divider,
} from "@heroui/react";
import {
  Upload,
  X,
  Camera,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  Users,
  Globe
} from "lucide-react";
import { channels, leadStatuses, getStatusColor, getChannelColor } from "../../utils/globalFunctions";
import { supabase } from "../../lib/supabase";
import { userService } from "../../api/services/users.service";

const EditLeadModal = ({ isOpen, onClose, lead }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    status: "",
    channel: "",
    avatar: "",
    user_id: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        email: lead.email || "",
        phone_number: lead.phone_number || "",
        status: lead.status || "new",
        channel: lead.channel || "website",
        avatar: lead.avatar_img || "",
        user_id: lead.user_id || "",
      });
      setAvatarPreview(lead.avatar || "");
      // Reset form state
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setShowSuccessMessage(false);
    }
  }, [lead]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark field as touched
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }

    // Validate field on change
    validateField(name, value);
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark field as touched
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true,
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    // Mark field as touched
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true,
      });

      // Validate field on blur
      validateField(name, formData[name]);
    }
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      // case 'first_name':
      //   if (!value.trim()) {
      //     error = "First name is required";
      //   }
      //   break;
      case 'email':
        // if (!value.trim()) {
        //   error = "Email is required";
        // } else
        if (value != "" && !/\S+@\S+\.\S+/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case 'phone_number':
        if (value && !/^\+?[0-9\s\-()]+$/.test(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: "Image size should be less than 5MB"
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          avatar: "Please select an image file"
        }));
        return;
      }

      setAvatarFile(file);
      setAvatarRemoved(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setErrors(prev => ({
          ...prev,
          avatar: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setAvatarFile(null);
    setAvatarRemoved(true);
    setFormData({
      ...formData,
      avatar: "",
    });
    setErrors(prev => ({
      ...prev,
      avatar: null
    }));
  };

  const validateForm = () => {
    // Validate all fields
    const newErrors = {};
    let isValid = true;

    // Mark all fields as touched
    const newTouched = {};
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
    });
    setTouched(newTouched);

    // Validate required fields
    // if (!formData.first_name.trim()) {
    //   newErrors.first_name = "First name is required";
    //   isValid = false;
    // }

    // if (!formData.email.trim()) {
    //   newErrors.email = "Email is required";
    //   isValid = false;
    // } else 
    if (formData.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    } else {
      isValid = true;
    }

    if (formData.phone_number && !/^\+?[0-9\s\-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadFileToSupabase = async (file, filename) => {
    const { data, error } = await supabase.storage
      .from('leads-avatar') // Ensure this is the correct bucket name
      .upload(filename, file, { upsert: true }); // Enable upsert

    if (error) {
      throw new Error(error.message);
    }

    const url = `https://sasrqcnrvbodywiqeueb.supabase.co/storage/v1/object/public/leads-avatar/${filename}`;
    return url;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        let avatarUrl
        if (avatarFile) {
          // Upload new avatar file
          const extension = avatarFile.name.split('.').pop();
          const fileName = `${formData.user_id}_avatar_image.${extension}`;
          avatarUrl = await uploadFileToSupabase(avatarFile, fileName);
        } else if (avatarRemoved && lead.avatar_img) {
          // If removal is requested and there is an existing avatar,
          // remove the file from storage.
          const filePath = lead.avatar_img.split('/leads-avatar/')[1];
          if (filePath) {
            const { error } = await supabase.storage
              .from('leads-avatar')
              .remove([filePath]);
            if (error) {
              console.error("Error removing file from storage:", error.message);
            }
          }
          avatarUrl = ""; // Clear avatar URL in database
        } else {
          // Keep existing avatar if no changes are made
          avatarUrl = formData.avatar;
        }

        // Update payload with the avatar_img field
        const updatePayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          status: formData.status,
          channel: formData.channel,
          avatar_img: avatarUrl,
        };

        const result = await userService.updateUser(formData.user_id, updatePayload);

        if (result) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrors(prev => ({
            ...prev,
            form: "Error updating user.",
          }));
        }
      } catch (error) {
        console.error("Error updating lead:", error);
        setErrors(prev => ({
          ...prev,
          form: "An error occurred while updating. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Get channel color and icon
  const getChannelDetails = (channelId) => {
    const channel = channels.find(c => c.id === channelId) || channels.find(c => c.id === "website");
    return {
      color: getChannelColor([], channelId),
      Icon: channel?.icon || Globe
    };
  };

  const { color: channelColor, Icon: ChannelIcon } = getChannelDetails(formData.channel);
  const statusColor = getStatusColor(leadStatuses, formData.status);
  const statusName = leadStatuses.find(s => s.key === formData.status)?.name || "New";
  const channelName = channels.find(c => c.id === formData.channel)?.name || "Website";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-white rounded-lg shadow-lg",
        header: "border-b border-gray-100",
        body: "p-4",
        footer: "border-t border-gray-100"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-4">
              <div className="w-full flex justify-between items-end">
                <div className="">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Lead
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Update lead information and settings
                  </p>
                </div>
                {/* {formData.user_id && (
                  <Chip size="sm" className="bg-gray-100 text-gray-700">
                    <strong>Lead Id:</strong> {formData.user_id}
                  </Chip>
                )} */}
              </div>
            </ModalHeader>

            <Divider className="opacity-50" />

            <ModalBody>
              {showSuccessMessage ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Lead Updated Successfully</h4>
                  <p className="text-sm text-gray-500 text-center">
                    The lead information has been updated successfully.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Error message for form */}
                  {errors.form && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-700">{errors.form}</p>
                        <p className="text-xs text-red-600 mt-1">Please try again or contact support if the issue persists.</p>
                      </div>
                    </div>
                  )}

                  {/* Avatar Upload with improved design */}
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${avatarPreview ? 'border-brand/20' : 'border-gray-100'} transition-all duration-200`}>
                        <Avatar
                          src={avatarPreview || formData.avatar}
                          className="w-full h-full text-[49px] font-bold text-opacity-10"
                          fallback={formData.first_name.charAt(0) + (formData.last_name ? formData.last_name.charAt(0) : "")}
                        />
                      </div>

                      <div className="absolute -bottom-2 -right-2 transition-transform duration-200 transform group-hover:scale-110">
                        <Tooltip content="Change avatar">
                          <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-md">
                              <Camera className="w-5 h-5 text-gray-900" />
                            </div>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </label>
                        </Tooltip>
                      </div>

                      {/* {avatarPreview || formData.avatar && ( */}
                      {(avatarPreview || formData.avatar) && (
                        <Tooltip content="Remove avatar">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="absolute -top-2 -right-2 bg-white shadow-md border border-gray-200 rounded-full"
                            onPress={removeAvatar}
                          >
                            <X className="w-4 h-4 text-gray-700" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>

                    {errors.avatar ? (
                      <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.avatar}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Recommended: Square image, max 5MB
                      </p>
                    )}
                  </div>

                  {/* Lead Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      Personal Information
                    </h4>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="First Name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          variant="bordered"
                          isInvalid={touched.first_name && !!errors.first_name}
                          errorMessage={touched.first_name && errors.first_name}
                          // isRequired
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            input: "text-gray-800",
                            inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          label="Last Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          variant="bordered"
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            input: "text-gray-800",
                            inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      Contact Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          variant="bordered"
                          isInvalid={touched.email && !!errors.email}
                          errorMessage={touched.email && errors.email}
                          // isRequired
                          startContent={<Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            input: "text-gray-800",
                            inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          label="Phone Number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          variant="bordered"
                          isInvalid={touched.phone_number && !!errors.phone_number}
                          errorMessage={touched.phone_number && errors.phone_number}
                          startContent={<Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            input: "text-gray-800",
                            inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Classification Section */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      Lead Classification
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Select
                          label="Status"
                          selectedKeys={[formData.status]}
                          onChange={(e) => handleSelectChange("status", e.target.value)}
                          variant="bordered"
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            trigger: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        >
                          {leadStatuses.map((status) => (
                            <SelectItem
                              key={status.key}
                              value={status.key}
                              startContent={
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(leadStatuses, status.key)}`}></div>
                              }
                            >
                              {status.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Select
                          label="Channel"
                          selectedKeys={[formData.channel]}
                          onChange={(e) => handleSelectChange("channel", e.target.value)}
                          variant="bordered"
                          classNames={{
                            label: "text-sm font-medium text-gray-700",
                            trigger: "border-gray-300 hover:border-gray-400 focus-within:!border-brand",
                          }}
                        >
                          {channels.map((channel) => {
                            const ChannelIcon = channel.icon;
                            return (
                              <SelectItem
                                key={channel.id}
                                value={channel.id}
                                startContent={
                                  <div className="p-1 rounded" style={{ backgroundColor: `${getChannelColor([], channel.id)}20` }}>
                                    <ChannelIcon className="w-3 h-3" style={{ color: getChannelColor([], channel.id) }} />
                                  </div>
                                }
                              >
                                {channel.name}
                              </SelectItem>
                            );
                          })}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Current Channel & Status Display */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${channelColor}20` }}>
                        <ChannelIcon className="w-5 h-5" style={{ color: channelColor }} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Channel</p>
                        <p className="text-sm font-medium text-gray-900">{channelName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full ${statusColor} bg-opacity-20`}>
                        <span className={`text-sm font-medium ${statusColor.replace('bg-', 'text-')}`}>
                          {statusName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                isDisabled={isSubmitting || showSuccessMessage}
              >
                Cancel
              </Button>
              <Button
                className="bg-brand text-gray-900"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={showSuccessMessage}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditLeadModal;
