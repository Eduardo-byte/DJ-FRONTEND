import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Building2, Phone, Instagram, Facebook } from 'lucide-react';
import {
  clientExtensionService,
  facebookService,
  instagramService,
  metaAuthService
} from '../api/index.js';
import { toast } from 'sonner';

/**
 * AuthCallback page handles the OAuth callback from Meta platforms.
 *
 * Groups items under each business (Facebook flow) or under each FB Page (Instagram flow),
 * so the user can select exactly which FB Pages or IG Accounts to connect. Saves selected
 * IDs + names (and, for IG, only the IG id+username) into the extension.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState('processing'); // 'processing' | 'selecting_pages' | 'success' | 'error'
  const [message, setMessage] = useState('Processing authentication…');

  // If platform === 'facebook': Array of { businessId, businessName, pages: [ { id, name } ] }
  // If platform === 'instagram': Array of { pageId, pageName, pages: [ { id, name } ] }
  const [businessesWithPages, setBusinessesWithPages] = useState([]);
  const [selectedPageIds, setSelectedPageIds] = useState([]);

  // Pending values until user clicks “Continue”
  const [pendingPlatform, setPendingPlatform] = useState(null);
  const [pendingClientId, setPendingClientId] = useState(null);
  const [pendingAccessToken, setPendingAccessToken] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        if (!window.location.hash) {
          setStatus('error');
          setMessage('No authentication data found in URL');
          return;
        }

        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          if (window.opener) {
            window.opener.postMessage(
              { type: 'META_AUTH_TOKEN', error: errorDescription || error },
              window.location.origin
            );
          } else {
            setTimeout(
              () =>
              (window.location.href = `/login?auth_error=true&error=${encodeURIComponent(
                errorDescription || error
              )}`),
              3000
            );
          }
          return;
        }

        if (!accessToken) {
          setStatus('error');
          setMessage('No access token found in URL');
          return;
        }

        // Decode “state” for platform + clientId
        const stateParam = params.get('state');
        let platform = 'facebook';
        let clientId = null;
        try {
          if (stateParam) {
            const stateObj = JSON.parse(atob(stateParam));
            platform = stateObj.platform || 'facebook';
            clientId = stateObj.clientId || null;
          }
        } catch (err) {
          console.error('Error parsing state parameter:', err);
          platform = stateParam || 'facebook';
        }

        // Store raw token + platform
        sessionStorage.setItem('metaAuthToken', accessToken);
        sessionStorage.setItem('metaAuthPlatform', platform);

        if (!clientId) {
          // No clientId ⇒ simply postMessage and close
          if (window.opener) {
            window.opener.postMessage(
              { type: 'META_AUTH_TOKEN', token: accessToken },
              window.location.origin
            );
            setStatus('success');
            setMessage('Authentication successful! You can close this window.');
            return;
          } else {
            setStatus('success');
            setMessage('Authentication successful! You can close this window.');
            return;
          }
        }

        // We have a clientId → fetch businesses → pages (then IG accounts if needed)
        setPendingPlatform(platform);
        setPendingClientId(clientId);
        setPendingAccessToken(accessToken);
        setStatus('processing');
        setMessage('Fetching your businesses and pages…');

        // First: get ALL businesses for this user
        const businessResponse = await facebookService.getBusiness(accessToken);
        if (!businessResponse.pages || businessResponse.pages.length === 0) {
          throw new Error('No businesses found under your Meta account.');
        }

        if (platform.toLowerCase() === 'instagram') {
          // --- Instagram flow: for each FB Page under each Business, check for linked IG account ---
          // We will accumulate buckets: [{ pageId, pageName, pages: [ { id, name } ] }, ...]
          const gathered = [];

          for (const business of businessResponse.pages) {
            try {
              // Fetch every FB Page under this business
              const pagesFromBusiness = await facebookService.getBusinessPages(
                business.id,
                accessToken
              );
              if (
                pagesFromBusiness.success &&
                Array.isArray(pagesFromBusiness.pages) &&
                pagesFromBusiness.pages.length > 0
              ) {
                // For each FB Page, see if it has an IG account
                for (const fbPage of pagesFromBusiness.pages) {
                  try {
                                    const accountsResponse = await instagramService.getAccounts(
                                      // fbPage.access_token,
                                      accessToken,
                                      fbPage.id
                                    );
                    if (
                      accountsResponse.success &&
                      accountsResponse.instagramAccounts &&
                      accountsResponse.instagramAccounts.length > 0
                    ) {
                      // If there are IG accounts, group them under that FB Page
                      const igList = accountsResponse.instagramAccounts.map((ig) => ({
                        id: ig.id,
                        name: ig.username
                      }));
                      gathered.push({
                        pageId: fbPage.id,
                        pageName: fbPage.name,
                        pages: igList
                      });
                    }
                  } catch (innerErr) {
                    console.error(
                      `Error fetching Instagram accounts for page ${fbPage.name}:`,
                      innerErr
                    );
                    // continue to next FB Page if one fails
                  }
                }
              }
            } catch (innerErr2) {
              console.error(
                `Error fetching pages for business ${business.id}:`,
                innerErr2
              );
              // continue to next business
            }
          }

          if (gathered.length === 0) {
            throw new Error(
              'No Instagram business accounts found under your Facebook pages. ' +
              'Make sure you have an Instagram Business/Creator connected to at least one Page.'
            );
          }

          setBusinessesWithPages(gathered);
          setStatus('selecting_pages');
          setMessage(
            'Select which Instagram accounts you want to connect, then click Continue.'
          );
        } else {
          // --- Facebook flow: group FB Pages by Business (so you see every page that lives under each business) ---
          const gathered = [];

          for (const business of businessResponse.pages) {
            try {
              const pagesFromBusiness = await facebookService.getBusinessPages(
                business.id,
                accessToken
              );
              if (
                pagesFromBusiness.success &&
                Array.isArray(pagesFromBusiness.pages) &&
                pagesFromBusiness.pages.length > 0
              ) {
                const pageList = pagesFromBusiness.pages.map((p) => ({
                  id: p.id,
                  name: p.name
                }));
                gathered.push({
                  businessId: business.id,
                  businessName: business.name,
                  pages: pageList
                });
              }
            } catch (innerErr) {
              console.error(
                `Error fetching pages for business ${business.id}:`,
                innerErr
              );
            }
          }

          if (gathered.length === 0) {
            throw new Error(
              'No pages found under any of your businesses. Ensure you have pages created.'
            );
          }

          setBusinessesWithPages(gathered);
          setStatus('selecting_pages');
          setMessage(
            'Select which Facebook pages you want to connect, then click Continue.'
          );
        }
      } catch (err) {
        console.error('Error during initial page fetch:', err);
        setStatus('error');
        setMessage(`Error processing authentication: ${err.message}`);
      }
    };

    const timer = setTimeout(processAuth, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePageSelectionConfirm = async () => {
    if (selectedPageIds.length === 0) {
      toast.error('Please select at least one item to proceed.');
      return;
    }

    setStatus('processing');
    setMessage('Finalizing your integration…');

    try {
      const platform = pendingPlatform;
      const clientId = pendingClientId;
      const accessToken = pendingAccessToken;

      // Build an array of selected items, each with { id, name }
      // For FB: `pages` are simply { id, name }
      // For IG: `pages` are IG accounts { id, name }, but keep in mind we need the parent FB Page too
      const selectedPages = [];
      if (platform.toLowerCase() === 'instagram') {
        // businessesWithPages = [ { pageId, pageName, pages: [ { id, name } ] }, ... ]
        for (const bucket of businessesWithPages) {
          for (const ig of bucket.pages) {
            if (selectedPageIds.includes(ig.id)) {
              selectedPages.push({
                id: ig.id,
                name: ig.name,
                parentPageId: bucket.pageId,
                parentPageName: bucket.pageName
              });
            }
          }
        }
      } else {
        // Facebook flow: businessesWithPages = [ { businessId, businessName, pages: [ { id, name } ] }, ... ]
        for (const biz of businessesWithPages) {
          for (const page of biz.pages) {
            if (selectedPageIds.includes(page.id)) {
              selectedPages.push({ id: page.id, name: page.name });
            }
          }
        }
      }

      if (selectedPages.length === 0) {
        throw new Error('Selected items not found in the list.');
      }

      // Build the exchange payload using the first selected
      let exchangePayload = {};
      if (platform.toLowerCase() === 'instagram') {
        const first = selectedPages[0];
        exchangePayload = {
          pageId: first.parentPageId,
          pageName: first.parentPageName,
          accessToken: accessToken,
          instagramAccountId: first.id,
          instagramAccountName: first.name
        };
      } else {
        const first = selectedPages[0];
        exchangePayload = {
          pageId: first.id,
          pageName: first.name,
          accessToken: accessToken
        };
      }

      const exchangeResponse = await metaAuthService.exchangeToken(exchangePayload);
      if (!exchangeResponse.success || !exchangeResponse.longLivedToken) {
        throw new Error(exchangeResponse.message || 'Failed to exchange token.');
      }
      const longLivedToken = exchangeResponse.longLivedToken;

      // Now save the selected items into the extension.
      // We only store { id, name } for each chosen page/IG account.
      // The call below is identical whether FB or IG:
      const pagesToStoreForExtension = selectedPages.map((p) => ({
        id: p.id,
        name: p.name
      }));
      await createOrUpdateExtension(
        platform,
        clientId,
        longLivedToken,
        accessToken,
        pagesToStoreForExtension
      );

      // Finally, subscribe each selected item (IG id or FB page id)
      for (const item of selectedPages) {
        try {
          if (platform.toLowerCase() === 'instagram') {
            await metaAuthService.subscribeInstagramPage(longLivedToken, item.id, item.parentPageId);
          } else {
            await metaAuthService.subscribePage(longLivedToken, item.id);
          }
        } catch (subErr) {
          console.error(`Error subscribing to ${item.id}:`, subErr);
        }
      }

      setStatus('success');
      setMessage(
        `${platform} connected successfully! You can close this window and return to the main tab.`
      );
      if (window.opener) {
        window.opener.postMessage(
          { type: 'META_AUTH_TOKEN', token: longLivedToken },
          window.location.origin
        );
      }
    } catch (err) {
      console.error('Error finalizing integration:', err);
      setStatus('error');
      setMessage(`Error connecting: ${err.message}`);
    }
  };

  // Toggle a checkbox on/off
  const handleCheckboxToggle = (e, itemId) => {
    if (e.target.checked) {
      setSelectedPageIds((prev) => [...prev, itemId]);
    } else {
      setSelectedPageIds((prev) => prev.filter((id) => id !== itemId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {(status === 'processing' || status === 'success' || status === 'error') && (
            <div className="p-8 text-center">
              {status === 'processing' && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-brand mb-4"></div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Authentication</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              )}
              {status === 'success' && (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Connected!</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              )}
              {status === 'error' && (
                <div className="flex flex-col items-center">
                  <XCircle className="w-12 h-12 text-red-600 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              )}
            </div>
          )}

          {status === 'selecting_pages' && (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                {pendingPlatform?.toLowerCase() === 'instagram' ? (
                  <Instagram className="w-6 h-6 text-pink-600" />
                ) : (
                  <Facebook className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {pendingPlatform?.toLowerCase() === 'instagram'
                      ? 'Select Instagram Accounts'
                      : 'Select Facebook Pages'}
                  </h2>
                  <p className="text-sm text-gray-600">Choose which accounts to connect</p>
                </div>
              </div>

              {/* Business/Page Cards */}
              {pendingPlatform?.toLowerCase() === 'instagram' ? (
                // Instagram-specific compact design
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {businessesWithPages.map((bucket) => (
                    <div
                      key={bucket.pageId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Page Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{bucket.pageName}</h3>
                      </div>

                      {/* Instagram Accounts */}
                      <div className="space-y-2">
                        {bucket.pages.map((item) => (
                          <label
                            key={item.id}
                            htmlFor={`item-${item.id}`}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                              selectedPageIds.includes(item.id)
                                ? 'border-brand bg-brand/10'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`item-${item.id}`}
                              className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                              checked={selectedPageIds.includes(item.id)}
                              onChange={(e) => handleCheckboxToggle(e, item.id)}
                            />
                            <Instagram className="w-3 h-3 text-pink-500" />
                            <span className="text-sm font-medium text-gray-900 flex-1">{item.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Facebook-specific design
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  {businessesWithPages.map((bucket) => (
                    <div
                      key={bucket.businessId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Business Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{bucket.businessName}</h3>
                      </div>

                      {/* Facebook Pages */}
                      <div className="space-y-2">
                        {bucket.pages.map((item) => (
                          <label
                            key={item.id}
                            htmlFor={`item-${item.id}`}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                              selectedPageIds.includes(item.id)
                                ? 'border-brand bg-brand/10'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`item-${item.id}`}
                              className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                              checked={selectedPageIds.includes(item.id)}
                              onChange={(e) => handleCheckboxToggle(e, item.id)}
                            />
                            <Facebook className="w-3 h-3 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900 flex-1">{item.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={handlePageSelectionConfirm}
                  disabled={!selectedPageIds.length}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-brand hover:bg-brand-dark text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Connect {selectedPageIds.length} {pendingPlatform?.toLowerCase() === 'instagram' ? 'Account' : 'Page'}{selectedPageIds.length !== 1 ? 's' : ''}
                </button>
              </div>

              {/* Selection Summary */}
              {selectedPageIds.length > 0 && (
                <div className="mt-4 p-3 bg-brand/10 rounded-lg border border-brand/20">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>{selectedPageIds.length} {pendingPlatform?.toLowerCase() === 'instagram' ? 'account' : 'page'}{selectedPageIds.length !== 1 ? 's' : ''} selected</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper to create or update a client extension, accepting an array of selected pages/accounts.
 */
async function createOrUpdateExtension(
  platformName,
  clientId,
  token,
  accessToken,
  selectedPages
) {
  if (!clientId) {
    console.error('Client ID is required to create/update extension');
    return;
  }
  if (!accessToken) {
    console.error('Access Token is required here!');
    return;
  }

  // Build pageIds array of { id, name } from selectedPages
  const pageIds = selectedPages.map((p) => ({
    id: p.id,
    name: p.name
  }));

  const getExtensionId = (platform) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return '9e9de118-8aa5-408a-960c-74074c66cd8e';
      case 'instagram':
        return 'c32aeec7-50d7-4469-99a5-4235870d16a7';
      case 'widget':
        return '38b88988-58ce-4f49-b2ca-412bd8fa4b0f';
      default:
        return null;
    }
  };

  try {
    const existingExtensions =
      await clientExtensionService.getClientExtensionsByClientId(clientId);

    if (existingExtensions && !existingExtensions.status) {
      const extensionId = getExtensionId(platformName);
      const existingExtension = existingExtensions.find(
        (ext) =>
          ext.extension_name?.toLowerCase() === platformName.toLowerCase() ||
          ext.extension_id === extensionId
      );
      if (existingExtension) {
        // Update the existing extension
        const updateData = {
          is_connected: true,
          connected_at: new Date().toISOString(),
          long_lived_token: token,
          token_expires_at: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ).toISOString(), // 60 days from now
          access_token: accessToken,
          page_ids: pageIds
        };

        const response = await clientExtensionService.updateClientExtension(
          existingExtension.client_extension_id,
          updateData
        );
        if (response && !response.status) {
          return response;
        } else {
          throw new Error(
            response.message || `Failed to update ${platformName} extension`
          );
        }
      }
    }

    // No existing extension found → create a new one
    const extensionData = {
      client_id: clientId,
      extension_name: platformName.toLowerCase(),
      extension_id: getExtensionId(platformName),
      is_connected: true,
      connected_at: new Date().toISOString(),
      long_lived_token: token,
      token_expires_at: new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(), // 60 days
      access_token: accessToken,
      page_ids: pageIds
    };

    const response = await clientExtensionService.createClientExtension(
      extensionData
    );

    // Some API versions return without “access_token”—fallback to update
    if (!response.access_token) {
      const fallbackUpdate = {
        access_token: accessToken,
        page_ids: pageIds
      };
      const updateResponse =
        await clientExtensionService.updateClientExtension(
          response.client_extension_id,
          fallbackUpdate
        );
      if (updateResponse && !updateResponse.status) {
        return updateResponse;
      }
    }

    if (response && !response.status) {
      return response;
    } else {
      throw new Error(
        response.message || `Failed to create ${platformName} extension`
      );
    }
  } catch (error) {
    console.error(`Error creating/updating ${platformName} extension:`, error);
    throw error;
  }
}
