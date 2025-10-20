import { Input, Button } from "@heroui/react";
import { Mail, Lock, UserPlus } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../../../styles/phone-input.css';

export default function EmailRegistrationStep({ 
  formData,
  onFormDataChange,
  onSubmit,
  onBack,
  isLoading 
}) {
  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <img
            className="w-[80px] mx-auto mb-4"
            src="Olivia-ai-LOGO.png"
            alt="Olivia AI Network"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">Olivia AI Network</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Build your AI agent and deploy it everywhere.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-12">
          <div className="flex gap-3">
            <Input
              type="text"
              label="First Name"
              labelPlacement="outside"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              isDisabled={isLoading}
              classNames={{
                input: "transition-all duration-250 ",
                inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
              }}
              className="flex-1"
              required
            />
            <Input
              type="text"
              label="Last Name"
              labelPlacement="outside"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              isDisabled={isLoading}
              classNames={{
                input: "transition-all duration-250",
                inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
              }}
              className="flex-1"
              required
            />
          </div>

          <Input
            type="text"
            label="Business Name"
            labelPlacement="outside"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            isDisabled={isLoading}
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <Input
            type="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            endContent={<Mail className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            autoComplete="email"
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <div style={{ marginTop: '1.3rem' }} className="space-y-1">
            <label className="text-sm font-medium text-gray-700 pb-1.5 block">Phone Number*</label>
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

          <Input
            type="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            endContent={<Lock className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            autoComplete="new-password"
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100  bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            endContent={<UserPlus className="w-4 h-4" />}
            isLoading={isLoading}
            size="lg"
          >
            Create account
          </Button>
        </form>

        <div className="text-center mt-8">
          <Button
            variant="light"
            className="text-gray-500 hover:text-gray-700"
            onPress={onBack}
          >
            ← Back to options
          </Button>
        </div>
      </div>
    </div>
  );
}
