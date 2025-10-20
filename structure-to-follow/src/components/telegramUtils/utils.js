import { integrationService } from "../../api";

// helper to generate code
export const generateTelegramRefCode = async (agent) => {
    // always prefix with 'RF' followed by 8 uppercase alphanumeric chars
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const code = `@olivia RF${randomPart}`;
    const payload = {
        chat_id: agent.id,
        integration_type: [{ "type": "telegram" }],
        status: false,
        client_id: agent.clientId,
        is_active: false,
        ref_code_telegram: `RF${randomPart}`
    }
    try {
        const clientIntegration = await integrationService.createIntegration(payload)
    } catch (error) {
        console.log(error);
        return
    }
    return code
};

// helper to copy
export const copyToClipboard = (refCode, onCopied) => {
    if (!refCode) return;
    navigator.clipboard.writeText(refCode);
    onCopied?.();                // e.g. toast.success(...)
};

export const verifyTelegram = async (refCode) => {
    try {
        const clientIntegration = await integrationService.getIntegrationsByRefCode(refCode)
        if (clientIntegration.page_id) {
            return { verified: true, pageId: clientIntegration.page_id, pageName: clientIntegration.integration_details?.Chat_name, integrationId: clientIntegration.integration_id }
        } else {
            return false
        }
    } catch (error) {
        return false
    }

}

export function normalizeTelegramRef(refCode) {
    // Remove any leading “@olivia” (case-insensitive) plus any whitespace after it
    return refCode.replace(/^@olivia\s*/i, "");
}