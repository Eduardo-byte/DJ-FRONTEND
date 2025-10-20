import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import { metaAuthService, facebookService, clientExtensionService } from "../../api/index.js";

/**
 * MetaAuthComponent handles authentication with Meta platforms (Facebook, Instagram)
 * It manages the OAuth flow, token exchange, and client extension creation/update
 */
const MetaAuthComponent = ({ platform, clientId, onAuthSuccess, onAuthFailure }) => {
  const [appId, setAppId] = useState(null);
  const [shortLivedToken, setShortLivedToken] = useState("");
  const [longLivedToken, setLongLivedToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState({ message: "", type: "" });
  const [tokenSection, setTokenSection] = useState(false);
  const [longLivedTokenSection, setLongLivedTokenSection] = useState(false);

  // Define scopes based on platform
  const scopes = platform.toLowerCase() === "facebook"
    // ? "pages_messaging,pages_read_engagement,pages_manage_metadata,pages_show_list"
    ? "pages_messaging,pages_manage_metadata,pages_show_list,business_management,pages_read_engagement"
    // ? "pages_messaging,pages_manage_metadata,pages_show_list"
    // : "instagram_basic,instagram_manage_messages,pages_manage_metadata";
    : "instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_messaging,pages_show_list,business_management,pages_read_engagement";

  // Fetch the Meta App ID when component mounts
  useEffect(() => {
    fetchAppId();
    checkUrlForAccessToken();
  }, []);

  // Fetch the Meta App ID from the server
  const fetchAppId = async () => {
    try {
      setIsLoading(true);
      const response = await metaAuthService.getAppId();

      if (response.success && response.appId) {
        setAppId(response.appId);
        //console.log('Meta App ID loaded successfully');
      } else {
        showStatus('Error loading Meta App ID', 'error');
      }
    } catch (error) {
      showStatus(`Error loading Meta App ID: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for access token in URL hash
  const checkUrlForAccessToken = () => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        //console.log('Access token found in URL hash');

        // Update the token
        setShortLivedToken(accessToken);
        setTokenSection(true);

        // Show a success message
        showStatus('Received short-lived token from Facebook', 'success');

        // Clean the URL hash
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    }
  };

  // Connect with Facebook/Instagram using a direct link in a new tab
  const connectWithMeta = () => {
    if (!appId) {
      showStatus('Meta App ID not loaded. Please try again later.', 'error');
      return;
    }

    showStatus('Initiating Meta login...', 'info');

    // Create a state object with platform and client ID
    const stateObj = {
      platform: platform.toLowerCase(),
      clientId: clientId // Pass the client ID in the state parameter
    };

    // Encode the state object as a JSON string and then base64 encode it
    // This allows passing complex data through the state parameter
    const stateParam = btoa(JSON.stringify(stateObj));

    // Build the OAuth URL
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth-callback`);
    const scope = encodeURIComponent(scopes);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token&state=${stateParam}`;

    // Create a link element
    const link = document.createElement('a');
    link.href = authUrl;
    link.target = '_blank'; // Open in a new tab
    link.rel = 'noopener noreferrer'; // Security best practice
    link.style.display = 'none';
    document.body.appendChild(link);

    // Click the link to open the auth page in a new tab
    link.click();

    // Clean up
    document.body.removeChild(link);

    // Show instructions to the user
    showStatus('Facebook login page opened in a new tab. Please complete the authentication there and return to this page.', 'info');

    // Set up a listener for the auth callback message
    const messageHandler = function (event) {
      if (event.origin === window.location.origin && event.data.type === 'META_AUTH_TOKEN') {
        // Clean up
        window.removeEventListener('message', messageHandler);

        if (event.data.token) {
          setShortLivedToken(event.data.token);
          setTokenSection(true);
          showStatus('Received short-lived token from Facebook', 'success');

          // Automatically exchange the token
          exchangeToken(event.data.token);
        } else if (event.data.error) {
          showStatus(`Authentication error: ${event.data.error}`, 'error');
        }
      }
    };

    window.addEventListener('message', messageHandler, false);

    // Set up a polling mechanism to check for the token in sessionStorage
    // This is a fallback in case the postMessage doesn't work
    const storageCheckInterval = setInterval(() => {
      const token = sessionStorage.getItem('metaAuthToken');
      if (token) {
        // Clear the token from sessionStorage
        sessionStorage.removeItem('metaAuthToken');

        // Clean up
        clearInterval(storageCheckInterval);
        window.removeEventListener('message', messageHandler);

        setShortLivedToken(token);
        setTokenSection(true);
        showStatus('Received short-lived token from Facebook', 'success');

        // Automatically exchange the token
        exchangeToken(token);
      }
    }, 1000);

    // Clean up the storage check interval after 10 minutes
    setTimeout(() => {
      clearInterval(storageCheckInterval);
    }, 600000); // 10 minutes
  };

  // Exchange short-lived token for long-lived token
  const exchangeToken = async (tokenParam = null) => {
    const tokenToUse = tokenParam || shortLivedToken;

    if (!tokenToUse) {
      showStatus('No short-lived token available', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Exchanging token...', 'info');

    try {
      // Get the first page from the pages API to use for the exchange
      const pagesResponse = await facebookService.getPages(tokenToUse);

      if (!pagesResponse.success || !pagesResponse.pages || pagesResponse.pages.length === 0) {
        throw new Error('No pages found to exchange token');
      }

      const page = pagesResponse.pages[0];

      // Call our API endpoint to exchange the token
      const response = await metaAuthService.exchangeToken({
        pageId: page.id,
        pageName: page.name,
        accessToken: tokenToUse
      });

      if (response.success && response.longLivedToken) {
        setLongLivedToken(response.longLivedToken);
        setLongLivedTokenSection(true);
        showStatus('Successfully exchanged for long-lived token', 'success');

        // Subscribe to subscribed_apps -> new method done on the api-socials
        //here

        // Create or update client extension
        await createOrUpdateClientExtension(response.longLivedToken);
        // console.log("userUpdated: ", userUpdated);

      } else {
        throw new Error(response.message || 'Failed to exchange token');
      }
    } catch (error) {
      showStatus(`Error exchanging token: ${error.message}`, 'error');
      if (onAuthFailure) onAuthFailure(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update client extension
  const createOrUpdateClientExtension = async (token) => {
    if (!clientId) {
      showStatus('Client ID is required to create extension', 'error');
      return;
    }

    try {
      // First check if an extension already exists for this platform
      const existingExtensions = await clientExtensionService.getClientExtensionsByClientId(clientId);

      if (existingExtensions && !existingExtensions.status) {
        // Find if there's an existing extension for this platform
        const existingExtension = existingExtensions.find(ext =>
          ext.extension_name?.toLowerCase() === platform.toLowerCase()
        );

        if (existingExtension) {
          // Update the existing extension
          const updateData = {
            is_connected: true,
            connected_at: new Date().toISOString(),
            long_lived_token: token,
            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
          };

          const response = await clientExtensionService.updateClientExtension(
            existingExtension.client_extension_id,
            updateData
          );

          if (response && !response.status) {
            //console.log(`${platform} extension updated:`, response);
            showStatus(`${platform} connected successfully`, 'success');

            if (onAuthSuccess) {
              onAuthSuccess(response);
            }
          } else {
            throw new Error(response.message || `Failed to update ${platform} extension`);
          }

          return;
        }
      }

      // Create a new extension if none exists
      const extensionData = {
        client_id: clientId,
        extension_name: platform.toLowerCase(),
        is_connected: true,
        connected_at: new Date().toISOString(),
        long_lived_token: token,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
      };

      const response = await clientExtensionService.createClientExtension(extensionData);

      if (response && !response.status) {
        //console.log(`${platform} extension created:`, response);
        showStatus(`${platform} connected successfully`, 'success');

        if (onAuthSuccess) {
          onAuthSuccess(response);
        }
      } else {
        console.error(`Error creating ${platform} extension:`, response);
        showStatus(`Failed to connect ${platform}`, 'error');

        if (onAuthFailure) {
          onAuthFailure(response.message || `Failed to connect ${platform}`);
        }
      }
    } catch (error) {
      console.error(`Error creating ${platform} extension:`, error);
      showStatus(`Error creating ${platform} extension: ${error.message}`, 'error');

      if (onAuthFailure) {
        onAuthFailure(error.message);
      }
    }
  };

  // Show status message
  const showStatus = (message, type) => {
    setAuthStatus({ message, type });
  };

  return (
    <div className="space-y-6">
      {!tokenSection ? (
        <div className="p-6 border border-gray-100 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
          <div
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: `${platform.color}20` }}
          >
            {platform.toLowerCase() === "facebook" ? (
              <Facebook className="w-8 h-8" style={{ color: platform.color }} />
            ) : (
              <Instagram className="w-8 h-8" style={{ color: platform.color }} />
            )}
          </div>
          <h5 className="text-base font-medium text-gray-900 mb-1">
            Connect to {platform}
          </h5>
          <p className="text-sm text-gray-500 text-center mb-4">
            You'll be redirected to {platform} to complete the authorization process.
          </p>
          <Button
            className="bg-brand text-gray-900 font-medium min-w-[200px]"
            startContent={platform.toLowerCase() === "facebook" ? <Facebook className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
            onPress={connectWithMeta}
            isLoading={isLoading}
            isDisabled={!appId || isLoading}
          >
            Connect Now
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Short-lived Token
            </label>
            <textarea
              rows="2"
              value={shortLivedToken}
              onChange={(e) => setShortLivedToken(e.target.value)}
              placeholder="Your short-lived token will appear here"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              onPress={() => exchangeToken()}
              isLoading={isLoading}
              isDisabled={!shortLivedToken || isLoading}
            >
              Exchange for Long-lived Token
            </Button>
          </div>

          {longLivedTokenSection && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Long-lived Token
              </label>
              <textarea
                rows="2"
                value={longLivedToken}
                readOnly
                placeholder="Your long-lived token will appear here"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          )}
        </div>
      )}

      {authStatus.message && (
        <div className={`p-3 rounded mt-4 ${authStatus.type === 'success' ? 'bg-green-100 text-green-800' :
          authStatus.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
          {authStatus.message}
        </div>
      )}
    </div>
  );
};

export default MetaAuthComponent;
