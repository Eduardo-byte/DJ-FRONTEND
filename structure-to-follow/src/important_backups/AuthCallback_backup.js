import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { clientExtensionService, facebookService, instagramService, metaAuthService } from '../api/index.js';
import { toast } from 'sonner';

/**
 * AuthCallback page handles the OAuth callback from Meta platforms
 * It extracts the access token from the URL hash and sends it back to the parent window
 */
export default function AuthCallback() {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        // Create or update client extension
        const createOrUpdateExtension = async (platformName, clientId, token, accessToken) => {
            if (!clientId) {
                console.error('Client ID is required to create/update extension');
                return;
            }

            if (!accessToken) {
                console.error('Access Token Is required here!')
                return;
            }

            // console.log("PLAT NAME: ", platformName);

            try {
                // Get extension ID based on platform name
                //here is the magic 
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

                let pageIds = [];

                if (platformName.toLowerCase() === "facebook") {
                    // console.log("PLAT NAME: ", platformName);
                    const getfbPages = await facebookService.getPages(accessToken);

                    if (getfbPages.success && getfbPages.pages.length > 0) {
                        // Use a traditional for loop to iterate through each page
                        // Extract just the essential information from each page
                        for (let i = 0; i < getfbPages.pages.length; i++) {
                            const page = getfbPages.pages[i];
                            // Create a simplified page object with just id and name
                            pageIds.push({
                                id: page.id,
                                name: page.name
                            });
                        }
                    }
                } else if (platformName.toLowerCase() === "instagram") {
                    const pagesResponse = await facebookService.getPages(token);
                    //console.log("pagesResponse", pagesResponse);
                    for (const page of pagesResponse.pages) {
                        try {
                            const accountsResponse = await instagramService.getAccounts(
                                token,
                                page.id
                            );
                            //console.log("accountsResponse", accountsResponse);
                            // console.log("accountsResponse:", accountsResponse);
                            if (accountsResponse.success &&
                                accountsResponse.instagramAccounts &&
                                accountsResponse.instagramAccounts.length > 0) {
                                // Add page info to each account for reference
                                for (const page of accountsResponse.instagramAccounts) {
                                    pageIds.push({
                                        id: page.id,
                                        name: page.name,
                                        username: page.username
                                    })
                                }
                                // for (let i = 0; i < accountsResponse.instagramAccounts.length; i++) {
                                //   pageIds.push({
                                //     id: page.id,
                                //     name: page.name
                                //   })
                                // };
                            }
                        } catch (err) {
                            console.error(`Error checking Instagram accounts for page ${page.name}:`, err);
                        }
                    }
                }

                //console.log("pageIds: ", pageIds);

                // console.log("pageIds: ", JSON.stringify(pageIds, null, 2));
                // console.log("accessToken: ", accessToken);

                // First check if an extension already exists for this platform
                const existingExtensions = await clientExtensionService.getClientExtensionsByClientId(clientId);

                if (existingExtensions && !existingExtensions.status) {
                    // Find if there's an existing extension for this platform, regardless of connection status
                    const extensionId = getExtensionId(platformName);
                    const existingExtension = existingExtensions.find(ext =>
                        ext.extension_name?.toLowerCase() === platformName.toLowerCase() ||
                        ext.extension_id === extensionId
                    );

                    if (existingExtension) {
                        //console.log(`Found existing ${platformName} extension:`, existingExtension);

                        // Update the existing extension, whether it's connected or not
                        const updateData = {
                            is_connected: true,
                            connected_at: new Date().toISOString(),
                            long_lived_token: token,
                            token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
                            access_token: accessToken,
                            page_ids: pageIds
                        };

                        const response = await clientExtensionService.updateClientExtension(
                            existingExtension.client_extension_id,
                            updateData
                        );

                        if (response && !response.status) {
                            //console.log(`${platformName} extension updated:`, response);
                            return response;
                        } else {
                            throw new Error(response.message || `Failed to update ${platformName} extension`);
                        }
                    }
                }

                // Create a new extension if none exists (connected or disconnected)
                const extensionData = {
                    client_id: clientId,
                    extension_name: platformName.toLowerCase(),
                    extension_id: getExtensionId(platformName), // Use the fixed extension ID
                    is_connected: true,
                    connected_at: new Date().toISOString(),
                    long_lived_token: token,
                    token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
                    access_token: accessToken,
                    page_ids: pageIds
                };

                // console.log("Creating extension with data:", JSON.stringify(extensionData, null, 2));
                const response = await clientExtensionService.createClientExtension(extensionData);
                // console.log("Create extension response:", JSON.stringify(response, null, 2));

                if (!response.access_token) {
                    // console.log("ENTERED", response)
                    // Update the existing extension, whether it's connected or not
                    const updateData = {
                        access_token: accessToken,
                        page_ids: pageIds
                    };
                    const updateResponse = await clientExtensionService.updateClientExtension(
                        response.client_extension_id,
                        updateData
                    );
                    // console.log("Update extension response:", JSON.stringify(updateResponse, null, 2));
                    // Use the update response for further operations if needed
                    if (updateResponse && !updateResponse.status) {
                        return updateResponse;
                    }
                }

                if (response && !response.status) {
                    //console.log(`${platformName} extension created:`, response);
                    return response;
                } else {
                    throw new Error(response.message || `Failed to create ${platformName} extension`);
                }
            } catch (error) {
                console.error(`Error creating/updating ${platformName} extension:`, error);
                throw error;
            }
        };

        // Extract the access token from the URL hash
        const processAuth = async () => {
            try {
                if (window.location.hash) {
                    //here -> after user connects starts this proccess
                    const params = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = params.get('access_token');
                    const error = params.get('error');
                    const errorDescription = params.get('error_description');
                    let userSelectedPageId;
                    let pagesIds = []
                    if (accessToken) {
                        // Get the state parameter and try to parse it
                        const stateParam = params.get('state');
                        let platform = 'facebook';
                        let clientId = null;

                        try {
                            // Try to parse the state parameter as a base64-encoded JSON string
                            if (stateParam) {
                                const stateObj = JSON.parse(atob(stateParam));
                                platform = stateObj.platform || 'facebook';
                                clientId = stateObj.clientId;
                            }
                        } catch (err) {
                            console.error('Error parsing state parameter:', err);
                            // If parsing fails, assume it's just the platform name
                            platform = stateParam || 'facebook';
                        }

                        // Store the token in sessionStorage
                        sessionStorage.setItem('metaAuthToken', accessToken);
                        sessionStorage.setItem('metaAuthPlatform', platform);

                        // If we have a client ID, create/update the client extension directly
                        if (clientId) {
                            setStatus('processing');
                            setMessage('Processing authentication and creating integration...');

                            try {
                                // Handle differently based on platform
                                if (platform.toLowerCase() === 'instagram') {
                                    // For Instagram, we first need to get Facebook pages, then Instagram accounts
                                    const pagesResponse = await facebookService.getPages(accessToken);

                                    if (!pagesResponse.success || !pagesResponse.pages || pagesResponse.pages.length === 0) {
                                        throw new Error('No Facebook pages found to connect Instagram');
                                    }

                                    // Check all pages for Instagram accounts
                                    let instagramAccount = null;
                                    let pageWithInstagram = null;
                                    let allInstagramResponses = [];

                                    // Try each page to find Instagram accounts
                                    for (const page of pagesResponse.pages) {
                                        try {
                                            const instagramAccountsResponse = await instagramService.getAccounts(accessToken, page.id);
                                            allInstagramResponses.push({
                                                page: page,
                                                response: instagramAccountsResponse.instagramAccounts
                                            });

                                            if (instagramAccountsResponse.success &&
                                                instagramAccountsResponse.instagramAccounts &&
                                                instagramAccountsResponse.instagramAccounts.length > 0) {
                                                instagramAccount = instagramAccountsResponse.instagramAccounts[0];
                                                pageWithInstagram = page;
                                                break; // Found an Instagram account, no need to check other pages
                                            }
                                        } catch (err) {
                                            console.error(`Error checking Instagram accounts for page ${page.name}:`, err);
                                            // Continue to next page even if this one fails
                                        }
                                    }

                                    if (!instagramAccount || !pageWithInstagram) {
                                        console.error('Instagram connection attempts:', allInstagramResponses);

                                        // Provide a more helpful error message with guidance
                                        throw new Error(
                                            'No Instagram business accounts found connected to your Facebook pages. ' +
                                            'Please make sure you have an Instagram Business or Creator account ' +
                                            'connected to one of your Facebook pages in Meta Business Suite.'
                                        );
                                    }

                                    // Exchange the token using the Facebook page that has the Instagram account
                                    var response = await metaAuthService.exchangeToken({
                                        pageId: pageWithInstagram.id,
                                        pageName: pageWithInstagram.name,
                                        accessToken: accessToken,
                                        // Include Instagram account info
                                        instagramAccountId: instagramAccount.id,
                                        instagramAccountName: instagramAccount.username
                                    });
                                } else {
                                    // Default to Facebook flow
                                    // Get the first page from the pages API to use for the exchange
                                    const pagesResponse = await facebookService.getPages(accessToken);
                                    // const businessResponse = await facebookService.getBusiness(accessToken);
                                    // for (const business of businessResponse.pages) {
                                    //     const pagesFromBusiness = await facebookService.getBusinessPages(business.id, accessToken)
                                    // }
                                    if (!pagesResponse.success || !pagesResponse.pages || pagesResponse.pages.length === 0) {
                                        throw new Error('No pages found to exchange token');
                                    }
                                    //array of pages ids to use on  the line 308
                                    const page = pagesResponse.pages[0];
                                    for (const p of pagesResponse.pages) {
                                        pagesIds.push(p.id)
                                    }
                                    userSelectedPageId = page.id
                                    // Exchange the token
                                    var response = await metaAuthService.exchangeToken({
                                        pageId: page.id,
                                        pageName: page.name,
                                        accessToken: accessToken
                                    });
                                }

                                if (response.success && response.longLivedToken) {
                                    // Create or update client extension
                                    await createOrUpdateExtension(platform, clientId, response.longLivedToken, accessToken);

                                    //here call the new method on api socials with esponse.longLivedToken and page.id
                                    for (const id of pagesIds) {
                                        try {
                                            await metaAuthService.subscribePage(response.longLivedToken, id)
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    }
                                    setStatus('success');
                                    setMessage(`${platform} connected successfully! You can close this window and return to the main tab.`);
                                } else {
                                    throw new Error(response.message || 'Failed to exchange token');
                                }
                            } catch (error) {
                                console.error('Error processing auth token:', error);
                                setStatus('error');
                                setMessage(`Error connecting ${platform}: ${error.message}`);
                            }
                        }

                        // Try to send the token back to the parent window
                        if (window.opener) {
                            try {
                                window.opener.postMessage({
                                    type: 'META_AUTH_TOKEN',
                                    token: accessToken
                                }, window.location.origin);

                                if (!clientId) {
                                    // Only set these if we haven't already set them during client extension creation
                                    setStatus('success');
                                    setMessage('Authentication successful! You can close this window.');
                                }

                                // Close this window after a delay
                                setTimeout(() => {
                                    window.close();
                                }, 3000);
                            } catch (err) {
                                console.error('Error posting message to opener:', err);
                                // Fall back to showing a success message
                                if (!clientId) {
                                    // Only set these if we haven't already set them during client extension creation
                                    setStatus('success');
                                    setMessage('Authentication successful! You can close this window and return to the main tab.');
                                }
                            }
                        } else if (!clientId) {
                            // If there's no opener and we haven't already set the status during client extension creation
                            setStatus('success');
                            setMessage('Authentication successful! You can close this window and return to the main tab.');
                        }
                    } else if (error) {
                        // Handle authentication error
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'META_AUTH_TOKEN',
                                error: errorDescription || error
                            }, window.location.origin);

                            setStatus('error');
                            setMessage(`Authentication failed: ${errorDescription || error}`);

                            // Close this window after a delay
                            setTimeout(() => {
                                window.close();
                            }, 3000);
                        } else {
                            setStatus('error');
                            setMessage(`Authentication failed: ${errorDescription || error}`);

                            // Redirect to the login page with error info
                            setTimeout(() => {
                                window.location.href = `/login?auth_error=true&error=${encodeURIComponent(errorDescription || error)}`;
                            }, 3000);
                        }
                    } else {
                        setStatus('error');
                        setMessage('No authentication data found in URL');
                    }
                } else {
                    setStatus('error');
                    setMessage('No authentication data found in URL');
                }
            } catch (error) {
                console.error('Error processing authentication:', error);
                setStatus('error');
                setMessage(`Error processing authentication: ${error.message}`);
            }
        };

        // Process the authentication after a short delay
        const timer = setTimeout(processAuth, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center justify-center">
                    {status === 'processing' && (
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mb-4"></div>
                    )}

                    {status === 'success' && (
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                    )}

                    {status === 'error' && (
                        <XCircle className="w-12 h-12 text-red-500 mb-4" />
                    )}

                    {status === 'redirecting' && (
                        <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                            <div className="animate-pulse mt-4">
                                <div className="h-2 w-24 bg-brand rounded"></div>
                            </div>
                        </div>
                    )}

                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        {status === 'success' ? 'Authentication Successful' :
                            status === 'error' ? 'Authentication Failed' :
                                status === 'redirecting' ? 'Authentication Successful' :
                                    'Processing Authentication'}
                    </h1>

                    <p className="text-sm text-gray-600 text-center">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
