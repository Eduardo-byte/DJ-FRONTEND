import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
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
                    await metaAuthService.subscribePage(longLivedToken, item.id);
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center justify-center">
                    {(status === 'processing' || status === 'success' || status === 'error') && (
                        <>
                            {status === 'processing' && (
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mb-4" />
                            )}
                            {status === 'success' && (
                                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                            )}
                            {status === 'error' && (
                                <XCircle className="w-12 h-12 text-red-500 mb-4" />
                            )}
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">
                                {status === 'processing'
                                    ? 'Processing…'
                                    : status === 'success'
                                        ? 'Authentication Successful'
                                        : 'Authentication Failed'}
                            </h1>
                            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
                        </>
                    )}

                    {status === 'selecting_pages' && (
                        <>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                                {pendingPlatform.toLowerCase() === 'instagram'
                                    ? 'Select Instagram Accounts to Connect'
                                    : 'Select Facebook Pages to Connect'}
                            </h1>
                            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                {businessesWithPages.map((bucket) => (
                                    <div
                                        key={
                                            pendingPlatform.toLowerCase() === 'instagram'
                                                ? bucket.pageId
                                                : bucket.businessId
                                        }
                                        className="border rounded-lg p-4 shadow-sm"
                                    >
                                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                                            {pendingPlatform.toLowerCase() === 'instagram'
                                                ? bucket.pageName
                                                : bucket.businessName}
                                        </h2>
                                        <ul>
                                            {bucket.pages.map((item) => (
                                                <li key={item.id} className="flex items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`item-${item.id}`}
                                                        className="mr-2"
                                                        onChange={(e) => handleCheckboxToggle(e, item.id)}
                                                    />
                                                    <label
                                                        htmlFor={`item-${item.id}`}
                                                        className="text-gray-700"
                                                    >
                                                        {item.name}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handlePageSelectionConfirm}
                                className="mt-6 w-full py-2 px-4 bg-brand text-white rounded hover:bg-brand-dark"
                            >
                                Continue
                            </button>
                        </>
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
