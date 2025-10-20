// src/components/WhatsAppTemplates.jsx
import { useEffect, useState, useContext } from 'react';
import {
    Button,
    Spinner,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from '@heroui/react';
import { Trash2, RefreshCw, Edit2 } from 'lucide-react';
import { UserDataContext } from '../context/UserDataContext';
import { clientExtensionService } from '../api';
import { whatsappService } from '../api/services/meta';
import { toast } from 'sonner';

function TemplateCard({ wabaId, accessToken, template, onDeleted, onEdit }) {
    const [busy, setBusy] = useState(false);
    const canEdit = ['APPROVED', 'REJECTED'].includes(template.status)

    const handleDelete = async () => {
        setBusy(true);
        try {
            const resp = await whatsappService.deleteWhatsappTemplates(
                wabaId,
                accessToken,
                template.name,
                template.language
            );
            if (resp.success) onDeleted(template.id);
            else console.error('Delete failed:', resp.message);
        } catch (err) {
            console.error('Error deleting template:', err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-5 hover:shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                        {template.name}
                        <span className="ml-2 text-sm text-gray-500">
                            ({template.language})
                        </span>
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className={`w-2 h-2 rounded-full ${template.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                        />
                        <p className="text-sm text-gray-500">
                            {template.status === 'APPROVED' ? 'Approved' : template.status}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canEdit ? (
                        <Tooltip content="Edit template">
                            <Button size="sm" variant="light" onPress={() => onEdit(template)}>
                                <Edit2 className="w-5 h-5 text-blue-500" />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip content="Only Approved or Rejected templates can be edited">
                            <Button size="sm" variant="light" disabled>
                                <Edit2 className="w-5 h-5 text-gray-300" />
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip content="Delete template">
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={handleDelete}
                            disabled={busy}
                        >
                            {busy ? <Spinner size="sm" /> : <Trash2 className="w-5 h-5 text-red-500" />}
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <ul className="text-sm text-gray-700 space-y-2">
                    {(template.components || []).map((c, i) => (
                        <li key={i}>
                            <strong className="capitalize">{c.type.toLowerCase()}</strong>:{' '}
                            {c.type === 'BUTTONS' ? (
                                c.buttons.map((b, j) => (
                                    <div key={j} className="ml-2 space-y-1">
                                        <p>
                                            <span className="font-medium">Text:</span> {b.text}
                                        </p>
                                        <p>
                                            <span className="font-medium">Link:</span>{' '}
                                            <a
                                                href={b.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                {b.url}
                                            </a>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {c.format && <span className="font-medium">{c.format} — </span>}
                                    {c.text || '—'}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function WhatsAppTemplates() {
    const { userData } = useContext(UserDataContext);

    const [connectedExtensions, setConnectedExtensions] = useState([]);
    const [whatsappAccounts, setWhatsappAccounts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    // Create‐modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createGroup, setCreateGroup] = useState(null);
    const [form, setForm] = useState({
        name: '',
        language: '',
        category: '',
        headerText: '',
        bodyText: '',
        footerText: '',
        buttonText: '',
        buttonUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    // Edit‐modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTpl, setEditTpl] = useState(null);
    const [editComps, setEditComps] = useState([]);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // 1) Load extensions
    useEffect(() => {
        if (!userData) return;
        clientExtensionService
            .getClientExtensionsByClientId(userData.client_id)
            .then((exts) => setConnectedExtensions(exts.filter((e) => e.is_connected)))
            .catch(console.error);
    }, [userData]);

    // 2) Extract WABAs
    useEffect(() => {
        const wtExt = connectedExtensions.find(
            (e) => e.extension_id === 'a2a83703-8c62-4216-b94d-9ecfdfc32438'
        );
        if (!wtExt) return setWhatsappAccounts([]);
        setWhatsappAccounts(
            (wtExt.page_ids || []).map((p) => ({
                account_id: p.business_account_id,
                waba_name: p.waba_name,
                business_name: p.business_name,
                accessToken: wtExt.long_lived_token,
            }))
        );
    }, [connectedExtensions]);

    // 3) Fetch templates
    useEffect(() => {
        if (whatsappAccounts.length === 0) {
            setTemplates([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all(
            whatsappAccounts.map(({ account_id, waba_name, business_name, accessToken }) =>
                whatsappService
                    .getWhatsappTemplates(account_id, accessToken)
                    .then((r) =>
                        (r.templates || []).map((tpl) => ({
                            ...tpl,
                            account_id,
                            waba_name,
                            business_name,
                            accessToken,
                        }))
                    )
            )
        )
            .then((arr) => setTemplates(arr.flat()))
            .catch((err) => {
                console.error(err);
                setError(err.message || 'Failed to fetch templates');
            })
            .finally(() => setLoading(false));
    }, [whatsappAccounts]);

    // Group by account
    const templatesByAccount = templates.reduce((acc, tpl) => {
        const key = tpl.account_id;
        if (!acc[key]) {
            acc[key] = {
                account_id: key,
                waba_name: tpl.waba_name,
                business_name: tpl.business_name,
                accessToken: tpl.accessToken,
                templates: [],
            };
        }
        acc[key].templates.push(tpl);
        return acc;
    }, {});

    // Delete handler
    const handleDeleted = (deletedId) =>
        setTemplates((prev) => prev.filter((t) => t.id !== deletedId));

    // ───────── CREATE ──────────────────────────────────────────
    const openCreateModal = (group) => {
        setCreateGroup(group);
        setForm({
            name: '',
            language: '',
            category: '',
            headerText: '',
            bodyText: '',
            footerText: '',
            buttonText: '',
            buttonUrl: '',
        });
        setIsCreateOpen(true);
    };

    function slugifyName(name) {
        return name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')       // spaces → underscores
            .replace(/[^a-z0-9_]/g, ''); // strip anything but a–z, 0–9, and _
    }

    const handleCreate = async (e, onClose) => {
        e.preventDefault();
        setSubmitting(true);
        const { account_id, accessToken } = createGroup;

        const comps = [
            form.headerText && { type: 'HEADER', format: 'TEXT', text: form.headerText },
            form.bodyText && { type: 'BODY', text: form.bodyText },
            form.footerText && { type: 'FOOTER', text: form.footerText },
        ].filter(Boolean);

        if (form.buttonText && form.buttonUrl) {
            comps.push({
                type: 'BUTTONS',
                buttons: [{ type: 'URL', text: form.buttonText, url: form.buttonUrl }],
            });
        }

        try {
            const lowerName = slugifyName(form.name);
            const resp = await whatsappService.createTemplate({
                wabaId: account_id,
                accessToken,
                name: form.name,
                language: form.language,
                components: comps,
                category: form.category || undefined,
            });

            if (resp.success) {
                setTemplates((prev) => [
                    ...prev,
                    {
                        id: resp.data.template.id,
                        name: form.name,
                        language: form.language,
                        status: resp.data.template.status || "Pending",
                        components: comps,
                        account_id,
                        waba_name: createGroup.waba_name,
                        business_name: createGroup.business_name,
                        accessToken,
                    },
                ]);
                onClose();
            } else {
                console.log("theres been an error");
                console.log(resp.details.data.message);
                toast.error(resp.details.data.message)
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // ───────── EDIT ────────────────────────────────────────────
    const openEditModal = (tpl) => {
        setEditTpl(tpl);
        setEditComps([...tpl.components]);
        setIsEditOpen(true);
    };

    const handleEdit = async (e, onClose) => {
        e.preventDefault();
        setEditSubmitting(true);

        try {
            const resp = await whatsappService.editTemplate({
                templateId: editTpl.id,
                accessToken: editTpl.accessToken,
                components: editComps,
            });
            if (resp.success) {
                setTemplates((prev) =>
                    prev.map((t) =>
                        t.id === editTpl.id
                            ? { ...t, components: editComps, status: "Pending" }
                            : t
                    )
                );
                onClose();
            } else {
                console.log("theres been an error");
                console.log(resp.details.data.message);
                toast.error(resp.details.data.message)
            }
        } catch (err) {
            console.error("error:", err);
        } finally {
            setEditSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Loading templates…</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            {/* Global Refresh */}
            <div className="flex justify-end mb-6">
                <Tooltip content="Refresh all templates">
                    <Button variant="ghost" onPress={() => window.location.reload()}>
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </Tooltip>
            </div>

            {/* Sections */}
            <div className="space-y-8">
                {Object.values(templatesByAccount).map((group) => (
                    <section key={group.account_id}>
                        <header className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {group.waba_name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {group.business_name}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className="bg-brand text-white hover:bg-brand/90"
                                onPress={() => openCreateModal(group)}
                            >
                                New Template
                            </Button>
                        </header>

                        {group.templates.length === 0 ? (
                            <p className="text-gray-600">No templates for this account.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.templates.map((tpl) => (
                                    <TemplateCard
                                        key={tpl.id}
                                        wabaId={group.account_id}
                                        accessToken={tpl.accessToken}
                                        template={tpl}
                                        onDeleted={handleDeleted}
                                        onEdit={openEditModal}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <ModalContent>{(onClose) => (
                    <>
                        <ModalHeader>New WhatsApp Template</ModalHeader>
                        <ModalBody>
                            <form className="space-y-4" onSubmit={(e) => handleCreate(e, onClose)}>
                                {[
                                    { key: 'name', req: true },
                                    { key: 'language', req: true },
                                    { key: 'category', req: false },
                                    { key: 'headerText', req: true },
                                    { key: 'bodyText', req: true },
                                    { key: 'footerText', req: false },
                                    { key: 'buttonText', req: false },
                                    { key: 'buttonUrl', req: false },
                                ].map(({ key, req }) => (
                                    <div key={key}>
                                        <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                                            {key.charAt(0).toUpperCase() +
                                                key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                        <Input
                                            id={key}
                                            name={key}
                                            type="text"
                                            required={req}
                                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                                            value={form[key]}
                                            variant="bordered"
                                        />
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <Button
                                        fullWidth
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-zinc-950 text-white"
                                    >
                                        {submitting ? <Spinner size="sm" /> : 'Create Template'}
                                    </Button>
                                </div>
                            </form>
                        </ModalBody>
                        <ModalFooter />
                    </>
                )}</ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
                <ModalContent>{(onClose) => (
                    <>
                        <ModalHeader>Edit WhatsApp Template</ModalHeader>
                        <ModalBody>
                            <form className="space-y-4" onSubmit={(e) => handleEdit(e, onClose)}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <p className="p-2 bg-gray-50 rounded">{editTpl?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Language</label>
                                    <p className="p-2 bg-gray-50 rounded">{editTpl?.language}</p>
                                </div>
                                {editComps.map((c, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="font-semibold">{c.type}</p>
                                        {c.type === 'BUTTONS' ? (
                                            c.buttons.map((b, j) => (
                                                <div key={j} className="flex gap-2">
                                                    <Input
                                                        value={b.text}
                                                        onChange={(e) => {
                                                            const cp = [...editComps];
                                                            cp[i].buttons[j].text = e.target.value;
                                                            setEditComps(cp);
                                                        }}
                                                        placeholder="Button text"
                                                    />
                                                    <Input
                                                        value={b.url}
                                                        onChange={(e) => {
                                                            const cp = [...editComps];
                                                            cp[i].buttons[j].url = e.target.value;
                                                            setEditComps(cp);
                                                        }}
                                                        placeholder="Button URL"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <Input
                                                value={c.text}
                                                onChange={(e) => {
                                                    const cp = [...editComps];
                                                    cp[i].text = e.target.value;
                                                    setEditComps(cp);
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <Button
                                        fullWidth
                                        type="submit"
                                        disabled={editSubmitting}
                                        className="bg-zinc-950 text-white"
                                    >
                                        {editSubmitting ? <Spinner size="sm" /> : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </ModalBody>
                        <ModalFooter />
                    </>
                )}</ModalContent>
            </Modal>
        </>
    );
}
