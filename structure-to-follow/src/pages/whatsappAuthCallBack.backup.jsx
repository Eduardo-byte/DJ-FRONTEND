import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clientExtensionService } from '../api/index.js';
import { whatsappService } from '../api/services/meta/whatsapp.service.js';

export default function WhatsAppAuthCallback() {
    const [status, setStatus] = useState('processing'); // 'processing' | 'selecting' | 'success' | 'error'
    const [message, setMessage] = useState('Processing authentication…');
    const [accounts, setAccounts] = useState([]);       // raw API response
    const [businesses, setBusinesses] = useState([]);   // grouped by business_account_id
    const [selectedIds, setSelectedIds] = useState([]);
    const [pendingClientId, setPendingClientId] = useState(null);
    const [pendingAccessToken, setPendingAccessToken] = useState(null);
    const [verifiedBiz, setVerifiedBiz] = useState([]);
    const [unVerifiedBiz, setUnVerifiedBiz] = useState([]);

    useEffect(() => {
        const run = async () => {
            try {
                if (!window.location.hash) throw new Error('No data in URL');
                const params = new URLSearchParams(window.location.hash.substring(1));
                if (params.get('error')) {
                    throw new Error(params.get('error_description') || 'Auth Error');
                }
                const token = params.get('access_token');
                if (!token) throw new Error('No access token found');

                const clientId = params.get('state');
                if (!clientId) {
                    window.opener?.postMessage(
                        { type: 'WHATSAPP_AUTH_TOKEN', token },
                        window.location.origin
                    );
                    setStatus('success');
                    setMessage('Authentication successful! You can close this window.');
                    return;
                }

                setPendingClientId(clientId);
                setPendingAccessToken(token);
                setStatus('processing');
                setMessage('Fetching your WhatsApp Business numbers…');

                const biz = await whatsappService.getWhatsappBusiness(token);
                if (!biz.success || !biz.accounts?.length) {
                    throw new Error(biz.message || 'No WhatsApp Business Account found');
                }

                // 1) store raw
                setAccounts(biz.accounts);
                // 2) group by business_account_id
                // const grouped = biz.accounts.reduce((acc, acct) => {
                //     // let bucket = acc.find(b => b.business_account_id === acct.business_account_id);
                //     let bucket = acc.find(b => b.business_name === acct.business_name);
                //     if (!bucket) {
                //         bucket = {
                //             business_account_id: acct.business_account_id,
                //             business_name: acct.business_name,
                //             wabas: []
                //         };
                //         acc.push(bucket);
                //     }
                //     bucket.wabas.push({
                //         waba_id: acct.id,
                //         waba_name: acct.waba_name,
                //         phone_numbers: acct.phone_numbers
                //     });
                //     return acc;
                // }, []);

                const verifiedPartners = {};

                // Replace your reduce logic with this:
                const verifiedAccounts = await Promise.all(
                    biz.accounts.map(async acct => {
                        // Call verifyPartner for each account
                        const verifyResult = await whatsappService.verifyPartner(acct.business_account_id);

                        return {
                            ...acct,
                            verifyStatus: verifyResult, // Attach result to the account
                        };
                    })
                );

                // If you still want to group after, you can:
                const grouped = verifiedAccounts.reduce((acc, acct) => {
                    let bucket = acc.find(b => b.business_name === acct.business_name);
                    if (!bucket) {
                        bucket = {
                            business_account_id: acct.business_account_id,
                            business_name: acct.business_name,
                            wabas: []
                        };
                        acc.push(bucket);
                    }
                    bucket.wabas.push({
                        waba_id: acct.id,
                        waba_name: acct.waba_name,
                        phone_numbers: acct.phone_numbers,
                        verifyStatus: acct.verifyStatus, // Pass verifyStatus down if you want
                    });
                    return acc;
                }, []);


                // Now grouped contains your group info + the verifyStatus per business!

                setBusinesses(grouped);
                setStatus('selecting');
                setMessage('Select which number(s) to connect.');
            } catch (err) {
                console.error(err);
                window.opener?.postMessage(
                    { type: 'WHATSAPP_AUTH_ERROR', error: err.message },
                    window.location.origin
                );
                setStatus('error');
                setMessage(`Authentication failed: ${err.message}`);
            }
        };

        const timer = setTimeout(run, 300);
        return () => clearTimeout(timer);
    }, []);

    const toggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleConfirm = async () => {
        if (!selectedIds.length) {
            toast.error('Please select at least one number');
            return;
        }

        setStatus('processing');
        setMessage('Finalizing connection…');

        try {
            const selectedPhones = businesses.flatMap(biz =>
                biz.wabas.flatMap(waba =>
                    waba.phone_numbers
                        .filter(n => selectedIds.includes(n.display_phone_number_id))
                        .map(n => ({
                            business_account_id: biz.business_account_id,
                            business_name: biz.business_name,
                            waba_name: waba.waba_name,
                            phone_number_id: n.display_phone_number_id,
                            phone_number: n.display_phone_number.replace(/[+\s]/g, '')
                        }))
                )
            );
            const longLivedTokenResponse = await whatsappService.exchangeToken(pendingAccessToken)
            await createOrUpdateExtension(
                pendingClientId,
                longLivedTokenResponse.longLivedToken,
                selectedPhones
            );
            //in here need to change because it cannot subscribe straight away - need to first invite as partner give permission to my system  user token and then subscribe
            for (const item of selectedPhones) {
                try {
                    await whatsappService.subscribeWhatsappNumber(
                        longLivedTokenResponse.longLivedToken,
                        item.business_account_id
                    );
                } catch (subErr) {
                    console.error(`Error subscribing to ${item.business_account_id}:`, subErr);
                }
            }

            window.opener?.postMessage(
                { type: 'WHATSAPP_AUTH_TOKEN', token: pendingAccessToken },
                window.location.origin
            );
            setStatus('success');
            setMessage('WhatsApp connected! You can close this window.');
        } catch (err) {
            console.error(err);
            window.opener?.postMessage(
                { type: 'WHATSAPP_AUTH_ERROR', error: err.message },
                window.location.origin
            );
            setStatus('error');
            setMessage(`Error connecting: ${err.message}`);
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
                                        ? 'Connected!'
                                        : 'Authentication Failed'}
                            </h1>
                            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
                        </>
                    )}

                    {status === 'selecting' && (
                        <>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                                Select WhatsApp Number(s) to Connect
                            </h1>
                            <p className="text-sm text-gray-600 text-center mb-6">{message}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                {businesses.map(biz => (
                                    <div
                                        key={biz.business_account_id}
                                        className="border rounded-lg p-4 shadow-sm"
                                    >
                                        <h2 className="text-lg font-medium text-gray-800 mb-2">
                                            Business: {biz.business_name}
                                        </h2>
                                        {biz.wabas.map(waba => (
                                            <div key={waba.waba_id} className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    WABA: {waba.waba_name}
                                                </p>
                                                <ul className="space-y-2">
                                                    {/* {waba.phone_numbers.map(n => (
                                                        <li
                                                            key={n.display_phone_number_id}
                                                            className="flex items-center"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                id={`wa-${n.display_phone_number_id}`}
                                                                className="mr-2"
                                                                checked={selectedIds.includes(n.display_phone_number_id)}
                                                                onChange={() => toggle(n.display_phone_number_id)}
                                                            />
                                                            <label
                                                                htmlFor={`wa-${n.display_phone_number_id}`}
                                                                className="text-gray-700"
                                                            >
                                                                {n.display_phone_number}
                                                            </label>
                                                        </li>
                                                    ))} */}
                                                    {waba.phone_numbers.map(n => (
                                                        <li
                                                            key={n.display_phone_number_id}
                                                            className="flex items-center"
                                                        >
                                                            <span
                                                                className={`inline-block w-3 h-3 rounded-full mr-2 ${waba.verifyStatus?.success
                                                                    ? 'bg-green-500'
                                                                    : 'bg-red-500'
                                                                    }`}
                                                                title={waba.verifyStatus?.success ? 'Verified' : 'Not verified'}
                                                            ></span>
                                                            <input
                                                                type="checkbox"
                                                                id={`wa-${n.display_phone_number_id}`}
                                                                className="mr-2"
                                                                checked={selectedIds.includes(n.display_phone_number_id)}
                                                                onChange={() => toggle(n.display_phone_number_id)}
                                                            />
                                                            <label
                                                                htmlFor={`wa-${n.display_phone_number_id}`}
                                                                className="text-gray-700"
                                                            >
                                                                {n.display_phone_number}
                                                            </label>
                                                        </li>
                                                    ))}

                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedIds.length}
                                className="mt-6 w-full py-2 px-4 bg-brand text-white rounded hover:bg-brand-dark disabled:opacity-50"
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

// identical to your meta helper
async function createOrUpdateExtension(clientId, token, selectedPhones) {
    // const longLivedTokenResponse = await whatsappService.exchangeToken(token)
    const extData = {
        client_id: clientId,
        extension_id: 'a2a83703-8c62-4216-b94d-9ecfdfc32438',
        is_connected: true,
        extension_name: 'whatsapp',
        connected_at: new Date().toISOString(),
        long_lived_token: token,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        // access_token: longLivedTokenResponse.longLivedToken,
        access_token: token,
        page_ids: selectedPhones
    };

    const existingExtensions = await clientExtensionService.getClientExtensionsByClientId(clientId);
    if (existingExtensions && !existingExtensions.status) {
        const existing = existingExtensions.find(ext => ext.extension_id === extData.extension_id);
        if (existing) {
            const updateData = { ...extData };
            delete updateData.client_id;
            delete updateData.extension_name;
            const resp = await clientExtensionService.updateClientExtension(
                existing.client_extension_id,
                updateData
            );
            if (!resp.status) return resp;
            throw new Error(resp.message || 'Failed to update WhatsApp extension');
        }
    }

    return clientExtensionService.createClientExtension(extData);
}
