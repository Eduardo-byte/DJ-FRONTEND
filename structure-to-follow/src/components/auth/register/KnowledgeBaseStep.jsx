import { Input, Button, Checkbox } from "@heroui/react";
import { ArrowRight, Play, Bot } from "lucide-react";

export default function KnowledgeBaseStep({ 
  formData,
  onFormDataChange,
  onSubmit,
  onSkip,
  isLoading 
}) {
  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Custom validation for required fields
    if (!formData.botName?.trim()) {
      alert('Please enter an agent name');
      return;
    }
    
    if (!formData.noWebsite && !formData.websiteUrl?.trim()) {
      alert('Please enter a website URL or check "I don\'t have a website"');
      return;
    }
    
    // Company Services and Intro Message are optional - no validation needed
    
    // If all validations pass, call the original onSubmit
    onSubmit(e);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {/* Canva How it Works Video */}
          <div className="w-full mx-auto mb-6 rounded-2xl overflow-hidden relative aspect-video">
            <iframe
              src="https://www.canva.com/design/DAGvUNUVVdE/vdphHYwO9pXMGs2gQsPRMQ/watch?embed"
              allowFullScreen
              className="w-full h-full"
              title="How to Configure Your AI Agent"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configure Your AI Agent
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Customise your AI agent by providing details about your business and how you want it to interact with your customers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            label="Agent Name"
            labelPlacement="outside"
            placeholder="eg. Olivia"
            value={formData.botName || ""}
            onChange={(e) => handleInputChange('botName', e.target.value)}
            isDisabled={isLoading}
            startContent={<Bot className="w-4 h-4 text-default-400" />}
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <div className="space-y-0">
            <Input
              type="text"
              label="Website"
              labelPlacement="outside"
              placeholder="example.com"
              value={formData.websiteUrl || ""}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              isDisabled={isLoading || formData.noWebsite}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">https://</span>
                </div>
              }
              classNames={{
                input: "transition-all duration-250",
                inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6 mt-4",
              }}
              required={!formData.noWebsite}
            />
            
            <Checkbox
              isSelected={formData.noWebsite || false}
              onValueChange={(checked) => {
                const updatedFormData = { ...formData, noWebsite: checked };
                if (checked) {
                  updatedFormData.websiteUrl = '';
                }
                onFormDataChange(updatedFormData);
              }}
              size="sm"
              classNames={{
                label: "text-sm text-gray-600 ",
              }}
            >
              I don't have a website
            </Checkbox>
          </div>

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            endContent={<ArrowRight className="w-4 h-4" />}
            isLoading={isLoading}
            size="lg"
          >
            Train Your AI Agent
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 underline"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
