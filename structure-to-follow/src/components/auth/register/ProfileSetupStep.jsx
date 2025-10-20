import { Input, Button } from "@heroui/react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../../styles/phone-input.css';

export default function ProfileSetupStep({ 
  formData,
  onFormDataChange,
  onSubmit,
  isLoading 
}) {
  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          {/* Illustration placeholder */}
          <div className="w-32 h-32 mx-auto mb-6 bg-brand bg-opacity-10 rounded-2xl flex items-center justify-center">
            <div className="w-16 h-16  rounded-lg flex items-center justify-center">
              <User className="w-8 h-8 text-brand-dark" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Set up your profile
          </h1>
          <p className="text-gray-600 text-sm">
            Help us set up your account by providing your company name and phone number. No Email Address?{" "}
            <Link to="/login" className="text-brand font-semibold hover:opacity-80">
              Logout
            </Link>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Input
            type="text"
            label="Company Name*"
            labelPlacement="outside"
            placeholder="Company Name*"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            isDisabled={isLoading}
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Phone Number*</label>
            <PhoneInput
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(value) => handleInputChange('phoneNumber', value)}
              defaultCountry="GB"
              disabled={isLoading}
              className="phone-input-custom"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            isLoading={isLoading}
            size="lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
