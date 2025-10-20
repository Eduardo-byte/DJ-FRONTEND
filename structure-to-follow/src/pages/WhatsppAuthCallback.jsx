import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Shield, AlertTriangle, Phone, Building2, Verified, ExternalLink, HelpCircle } from 'lucide-react';
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

                // 2) verify each account and attach result
                const verifiedAccounts = await Promise.all(
                    biz.accounts.map(async acct => {
                        const verifyResult = await whatsappService.verifyPartner(acct.business_account_id);
                        return {
                            ...acct,
                            verifyStatus: verifyResult, // Attach result to the account
                        };
                    })
                );

                // 3) group by business_name
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
                        verifyStatus: acct.verifyStatus,
                        business_account_id: acct.business_account_id,
                    });
                    return acc;
                }, []);

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

    // --- Helpers to check verification status of selection

    function anySelectedNotVerified() {
        return businesses.some(biz =>
            biz.wabas.some(waba =>
                waba.phone_numbers.some(n =>
                    selectedIds.includes(n.display_phone_number_id) && !waba.verifyStatus?.success
                )
            )
        );
    }

    function getUnverifiedSelectedBusinessAccountIds() {
        return Array.from(
            new Set(
                businesses.flatMap(biz =>
                    biz.wabas
                        .filter(waba =>
                            waba.phone_numbers.some(n =>
                                selectedIds.includes(n.display_phone_number_id)
                            ) && !waba.verifyStatus?.success
                        )
                        .map(waba => waba.business_account_id)
                )
            )
        );
    }

    const handleVerify = async () => {
        const idsToVerify = getUnverifiedSelectedBusinessAccountIds();
        if (!idsToVerify.length) return;

        setStatus('processing');
        setMessage('Verifying business account(s)…');

        try {
            const results = await Promise.all(
                idsToVerify.map(async id => {
                    const verifyResult = await whatsappService.verifyPartner(id);
                    return { id, verifyResult };
                })
            );

            setBusinesses(prev =>
                prev.map(biz => ({
                    ...biz,
                    wabas: biz.wabas.map(waba => {
                        const found = results.find(res => res.id === waba.business_account_id);
                        return found
                            ? { ...waba, verifyStatus: found.verifyResult }
                            : waba;
                    }),
                }))
            );

            const failed = results.filter(res => !res.verifyResult?.success);

            if (failed.length) {
                setStatus('selecting');
                setMessage(
                    `Some business accounts could not be verified. Please try again after granting partner access, or contact support.`
                );
            } else {
                setStatus('selecting');
                setMessage('Verification complete. You can now continue.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Verification failed: ' + err.message);
        }
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

    // --- RENDER ---

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

                    {status === 'selecting' && (
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Select WhatsApp Numbers</h2>
                                    <p className="text-sm text-gray-600">Choose which business numbers to connect</p>
                                </div>
                            </div>

                            {/* Verification Warning */}
                            {selectedIds.length > 0 && anySelectedNotVerified() && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-amber-900 mb-2">Verification Required</h3>
                                            <div className="text-sm text-amber-800 space-y-2">
                                                <p>Some accounts need verification. Follow these steps:</p>
                                                <ol className="list-decimal ml-4 space-y-1">
                                                    <li>
                                                        Visit <a 
                                                            href="https://business.facebook.com/settings/partners" 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            Facebook Business Settings <ExternalLink className="w-3 h-3 inline" />
                                                        </a>
                                                    </li>
                                                    <li>Click <strong>Add</strong> → <strong>Give a partner access to your assets</strong></li>
                                                    <li>Enter Partner ID: <code className="bg-white px-2 py-1 rounded text-xs font-mono">617553217823523</code></li>
                                                    <li>Select <strong>WhatsApp accounts</strong> and grant <strong>Manage WhatsApp business accounts</strong> permission</li>
                                                </ol>
                                                <p className="text-xs">
                                                    Need help? <a href="mailto:support@olivianetowrk.ai" className="font-medium hover:underline">Contact Olivia AI support team</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Business Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                {businesses.map(biz => (
                                    <div
                                        key={biz.business_account_id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        {/* Business Header */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">{biz.business_name}</h3>
                                        </div>

                                        {/* WABA Sections */}
                                        <div className="space-y-3">
                                            {biz.wabas.map(waba => (
                                                <div key={waba.waba_id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Shield className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs font-medium text-gray-700">{waba.waba_name}</span>
                                                        {waba.verifyStatus?.success ? (
                                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                ✓ Verified
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                                                ⚠ Needs Verification
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Phone Numbers */}
                                                    <div className="space-y-1">
                                                        {waba.phone_numbers.map(n => (
                                                            <label
                                                                key={n.display_phone_number_id}
                                                                htmlFor={`wa-${n.display_phone_number_id}`}
                                                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                                                    selectedIds.includes(n.display_phone_number_id)
                                                                        ? 'border-brand bg-brand/10'
                                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    id={`wa-${n.display_phone_number_id}`}
                                                                    className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                                                                    checked={selectedIds.includes(n.display_phone_number_id)}
                                                                    onChange={() => toggle(n.display_phone_number_id)}
                                                                />
                                                                <Phone className="w-3 h-3 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-900 flex-1">{n.display_phone_number}</span>
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    waba.verifyStatus?.success ? 'bg-green-500' : 'bg-amber-500'
                                                                }`} />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {selectedIds.length > 0 && anySelectedNotVerified() ? (
                                    <button
                                        onClick={handleVerify}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Verify Selected
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!selectedIds.length}
                                        className="flex items-center justify-center gap-2 px-6 py-2 bg-brand hover:bg-brand-dark text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Connect {selectedIds.length} Number{selectedIds.length !== 1 ? 's' : ''}
                                    </button>
                                )}
                            </div>

                            {/* Selection Summary */}
                            {selectedIds.length > 0 && (
                                <div className="mt-4 p-3 bg-brand/10 rounded-lg border border-brand/20">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle2 className="w-4 h-4 text-brand" />
                                        <span>{selectedIds.length} number{selectedIds.length !== 1 ? 's' : ''} selected</span>
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

// identical to your meta helper
async function createOrUpdateExtension(clientId, token, selectedPhones) {
    const extData = {
        client_id: clientId,
        extension_id: 'a2a83703-8c62-4216-b94d-9ecfdfc32438',
        is_connected: true,
        extension_name: 'whatsapp',
        connected_at: new Date().toISOString(),
        long_lived_token: token,
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
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
