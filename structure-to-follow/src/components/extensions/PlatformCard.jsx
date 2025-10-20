import { Button, Tooltip } from "@heroui/react";
import { CheckCircle2, XCircle, RefreshCw, Globe, Clock } from "lucide-react";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserDataContext";

export default function PlatformCard({
  platform,
  onCardClick,
  onConnectClick,
  onRefreshClick,
  onDisconnectClick,
  setIsRequestModalOpen,
  setSelectedPlatformRequest,
  setIsRequestSmsAndEmailModalOpen,
}) {

  const { userData, loggedInUser } = useContext(UserDataContext);

  return (
    <div
      className={`bg-white border border-gray-100 rounded-lg p-6 space-y-5 ${platform.comingSoon ? 'opacity-80' : ''} cursor-pointer hover:shadow-sm transition-all duration-200 hover:border-gray-200`}
      onClick={() => onCardClick(platform)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: `${platform.color}20` }}
          >
            <platform.icon
              className="w-5 h-5"
              style={{ color: platform.color }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {platform.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {platform.comingSoon ? (
                platform.name === "Whatsapp" ? (
                  <></>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <p className="text-sm text-gray-500">Not Connected</p>
                  </>
                )
              )
                : (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full ${platform.isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <p className="text-sm text-gray-500">
                      {platform.name === "Widget" ? (
                        "active"
                      ) : (
                        platform.isConnected ? "Connected" : "Not Connected"
                      )}

                    </p>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* {(platform.comingSoon || !(loggedInUser.role === "Tester" || loggedInUser.role === "God Mode") && platform.name != "Widget" && platform.name !== "Telegram") ? ( */}
        {/* {
          (platform.comingSoon) ? (
          <Button
            size="sm"
            className="bg-amber-50 text-amber-600 font-medium min-w-[120px] cursor-default"
            disabled={true}
            startContent={<Clock className="w-4 h-4" />}
          >
            Coming Soon
          </Button>
          ) */}
        {platform.comingSoon ? (
          platform.name === "Whatsapp" ? (
            <Button
              as="a"
              href="/profile?tab=plans"
              size="sm"
              className="bg-blue-50 text-blue-600 font-medium min-w-[200px] hover:bg-blue-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // so it doesn't trigger the card click
              }}
              startContent={<Globe className="w-4 h-4" />}
            >
              Upgrade your plan
            </Button>
          ) : (
            // <Button
            //   size="sm"
            //   className="bg-blue-50 text-blue-600 font-medium min-w-[120px] cursor-default"
            //   // disabled={true}
            //   onPress={() => setIsRequestModalOpen(true)}
            //   startContent={<Clock className="w-4 h-4" />}
            // >
            //   Contact Us
            // </Button>
            <Button
              size="sm"
              className="bg-blue-50 text-blue-600 font-medium min-w-[120px] cursor-default"
              onPress={() => {
                if (["X", "LinkedIn"].includes(platform.name)) {
                  setIsRequestModalOpen(true);
                } else {
                  setSelectedPlatformRequest(platform.name);
                  setIsRequestSmsAndEmailModalOpen(true);
                }
              }}
              startContent={<Clock className="w-4 h-4" />}
            >
              Contact Us
            </Button>

          )
        )
          : platform.isConnected ? (
            platform.name === "Widget" ? (
              <Button
                size="sm"
                className="bg-brand text-gray-900 font-medium min-w-[120px] hover:bg-brand/90 transition-colors"
                onPress={(e) => {
                  e.stopPropagation();
                  onConnectClick(platform.name);
                }}
                startContent={<Globe className="w-4 h-4" />}
              >
                Embed
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {platform.name !== "Telegram" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshClick(platform.name);
                    }}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    aria-label="Refresh token"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                <Button
                  size="sm"
                  className="bg-red-50 text-red-600 font-medium min-w-[120px] hover:bg-red-100 transition-colors"
                  onPress={(e) => {
                    onDisconnectClick(platform.name);
                  }}
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Disconnect
                </Button>
              </div>
            )
          ) : (
            <Button
              size="sm"
              className="bg-brand text-gray-900 font-medium min-w-[120px] hover:bg-brand/90 transition-colors"
              onPress={(e) => {
                e.stopPropagation();
                onConnectClick(platform.name);
              }}
              startContent={<CheckCircle2 className="w-4 h-4" />}
            >
              Connect
            </Button>
          )}
      </div>

      {/* Description */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className="text-sm text-gray-600">
          {/* {platform.isConnected
            ? (platform.connectedDescription || `Your ${platform.name} is connected!`)
            : (platform.description || `Connect your ${platform.name} account to manage messages and interactions.`)
          } */}
          {platform.isConnected
            ? (platform.connectedDescription || `Your ${platform.name} is connected!`)
            : platform.name === "Whatsapp" && platform.comingSoon
              ? "Upgrade to Advanced plan or above to connect your agent with your WhatsApp Business account so it can automatically engage with your customers and manage conversations for you."
              : (platform.description || `Connect your ${platform.name} account to manage messages and interactions.`)
          }

        </p>
      </div>
    </div >
  );
}
