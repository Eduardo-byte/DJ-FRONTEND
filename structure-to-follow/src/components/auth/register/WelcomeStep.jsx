import { Button } from "@heroui/react";
import { Play } from "lucide-react";

export default function WelcomeStep({ 
  businessName = "Your Business",
  onBeginJourney,
  onEditCompanyName,
  onSkipToDashboard,
  isLoading 
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {/* Canva Welcome Video */}
          <div className="w-full max-w-lg mx-auto mb-8 rounded-2xl overflow-hidden relative aspect-video">
            <iframe
              src="https://www.canva.com/design/DAGvUGLCcsU/9QFR98Q2m_iNFFluxbkplw/watch?embed"
              allowFullScreen
              className="w-full h-full"
              title="Welcome to Olivia AI Network"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome, <span className="bg-brand text-gray-900 bg-clip-text text-transparent">{businessName}</span>
          </h1>
          
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Welcome to <span className="font-semibold text-brand">Olivia AI Network</span>! Build intelligent AI agents that can perform tasks, 
            engage with your customers, and handle business operations seamlessly. Create one powerful agent and deploy it everywhere - 
            from your website to social media platforms. Ready to revolutionise your business with AI?
          </p>

          <Button
            className="bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[56px] px-8 text-lg"
            size="lg"
            onPress={onBeginJourney}
            isLoading={isLoading}
          >
            Create My AI Agent
          </Button>

          <div className="mt-4">
            <button
              onClick={onSkipToDashboard}
              className="text-sm text-gray-500 hover:text-gray-700 transition-all duration-200 underline"
            >
              Skip for now
            </button>
          </div>

          <div className="mt-6">
            <span className="text-sm text-gray-500">
              Not {businessName}?{" "}
            </span>
            <button
              onClick={onEditCompanyName}
              className="text-sm text-brand font-semibold hover:opacity-80 transition-all duration-200 underline"
            >
              Edit Company Name
            </button>
          </div>
        </div>
      </div>

   
    </div>
  );
}
