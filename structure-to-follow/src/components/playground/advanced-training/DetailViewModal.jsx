import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Trash2,
  FileText,
  Globe,
  HelpCircle,
  Download,
  Code,
  FileJson,
  AlignLeft,
  Link2,
  X
} from "lucide-react";

// Detail View Modal Component
const DetailViewModal = ({ isOpen, onClose, item, handleDeleteItem }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!item) return null;

  // Format JSON for display
  const formatJSON = (json) => {
    if (typeof json === 'string') {
      try {
        return JSON.stringify(JSON.parse(json), null, 2);
      } catch (e) {
        return json;
      }
    }
    return JSON.stringify(json, null, 2);
  };
  const handleDeleteOnModal = () => {
    handleDeleteItem(item, item.scrape_id);
    onClose();
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "border-none shadow-lg",
        backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/30",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.type === 'webpage' ? <Globe size={20} className="text-brand" /> :
                    item.type === 'pdf' ? <FileText size={20} className="text-brand" /> :
                      item.type === 'faq' ? <HelpCircle size={20} className="text-brand" /> :
                        <FileText size={20} className="text-brand" />}
                  <h3 className="text-xl font-semibold text-gray-900">{item.source_url}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Content details and information
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    item.type === 'webpage' ? 'primary' :
                      item.type === 'faq' ? 'warning' :
                        item.type === 'pdf' ? 'secondary' :
                          'default'
                  }
                >
                  {item.type}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    item.status === 'processed' ? 'success' :
                      item.status === 'pending' ? 'warning' :
                        item.status === 'failed' ? 'danger' :
                          item.status === 'training' ? 'primary' :
                            'default'
                  }
                >
                  {item.status}
                </Chip>
                <span className="text-xs text-gray-500">
                  ID: {item.scrape_id}
                </span>
              </div>
            </ModalHeader>

            <ModalBody>
              <Tabs
                aria-label="Detail tabs"
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
              >
                {/* Overview tab - shown for all content types */}
                <Tab
                  key="overview"
                  title={
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-brand" />
                      <span>Overview</span>
                    </div>
                  }
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <h3 className="text-sm font-medium mb-2">Basic Information</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Source URL</span>
                            <p className="text-sm">{item.source_url}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Type</span>
                            <p className="text-sm">{item.type}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Status</span>
                            <p className="text-sm">{item.status}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Word Count</span>
                            <p className="text-sm">{item.word_count ? item.word_count.toLocaleString() : 'Loading...'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Status Code</span>
                            <p className="text-sm">{item.statusCode}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <h3 className="text-sm font-medium mb-2">Timestamps</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Created At</span>
                            <p className="text-sm">{new Date(item.created_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Updated At</span>
                            <p className="text-sm">{new Date(item.updated_at).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Agent ID</span>
                            <p className="text-sm">{item.agent_id}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card shadow="none" className="border border-gray-200 col-span-2">
                      <CardBody>
                        <h3 className="text-sm font-medium mb-2">Content Preview</h3>
                        <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap">
                            {item.content || 'Loading content...'}
                          </pre>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </Tab>

                {/* Content tab - shown for all content types */}
                <Tab
                  key="content"
                  title={
                    <div className="flex items-center gap-2">
                      <AlignLeft size={16} className="text-brand" />
                      <span>Content</span>
                    </div>
                  }
                >
                  <Card shadow="none" className="border border-gray-200">
                    <CardBody>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">
                          {item.type === 'faq' ? 'Questions & Answers' : 'Full Content'}
                        </h3>
                        <span className="text-xs text-gray-500">{item.word_count ? item.word_count.toLocaleString() : '...'} words</span>
                      </div>

                      {item.type === 'faq' ? (
                        <div className="space-y-6">
                          {/* Display FAQ content in a clear Q&A format */}
                          {item.content ? item.content.split('\n\n').map((qa, index) => {
                            const parts = qa.split('\n');
                            const question = parts[0];
                            const answer = parts.slice(1).join('\n');

                            return (
                              <div key={index} className="border border-gray-200 rounded-md p-4">
                                <div className="mb-3">
                                  <span className="text-xs font-semibold text-brand uppercase mb-1 block">Question:</span>
                                  <h4 className="text-sm font-medium text-gray-900">{question}</h4>
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-brand uppercase mb-1 block">Answer:</span>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
                                </div>
                              </div>
                            );
                          }) : <p className="text-sm text-gray-500">Loading content...</p>}
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap">{item.content || 'Loading content...'}</pre>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Tab>

                {/* HTML tab - only shown for webpage type */}
                {item.type === 'webpage' && item.html_content && (
                  <Tab
                    key="html"
                    title={
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-brand" />
                        <span>HTML</span>
                      </div>
                    }
                  >
                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">HTML Content</h3>
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand text-white"
                            startContent={<Download size={14} />}
                          >
                            Download HTML
                          </Button>
                        </div>
                        <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto bg-gray-50">
                          <pre className="text-sm whitespace-pre-wrap">{item.html_content || 'Loading HTML content...'}</pre>
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>
                )}

                {/* Markdown tab - only shown for webpage type */}
                {item.type === 'webpage' && item.markdown && (
                  <Tab
                    key="markdown"
                    title={
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-brand" />
                        <span>Markdown</span>
                      </div>
                    }
                  >
                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium">Markdown Content</h3>
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand text-white"
                            startContent={<Download size={14} />}
                          >
                            Download Markdown
                          </Button>
                        </div>
                        <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto bg-gray-50">
                          <pre className="text-sm whitespace-pre-wrap">{item.markdown || 'Loading markdown content...'}</pre>
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>
                )}

                {/* Links tab - only shown for webpage type */}
                {item.type === 'webpage' && item.page_links && (
                  <Tab
                    key="links"
                    title={
                      <div className="flex items-center gap-2">
                        <Link2 size={16} className="text-brand" />
                        <span>Links</span>
                      </div>
                    }
                  >
                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <h3 className="text-sm font-medium mb-2">Page Links</h3>
                        <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto">
                          {item.page_links && item.page_links.length > 0 ? (
                            <ul className="space-y-2">
                              {item.page_links.map((link, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Link2 size={14} className="text-gray-400" />
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">
                              {item.page_links === undefined ? 'Loading page links...' : 'No links found'}
                            </p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>
                )}

                {/* Metadata tab - only shown for webpage type */}
                {item.type === 'webpage' && item.metadata && (
                  <Tab
                    key="metadata"
                    title={
                      <div className="flex items-center gap-2">
                        <FileJson size={16} className="text-brand" />
                        <span>Metadata</span>
                      </div>
                    }
                  >
                    <Card shadow="none" className="border border-gray-200">
                      <CardBody>
                        <h3 className="text-sm font-medium mb-2">Metadata</h3>
                        <div className="border border-gray-200 rounded-md p-3 max-h-96 overflow-y-auto bg-gray-50">
                          <pre className="text-sm whitespace-pre-wrap">
                            {item.metadata ? formatJSON(item.metadata) : 'Loading metadata...'}
                          </pre>
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>
                )}
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <div className="w-full flex justify-between items-center">
                <div>
                  <Button
                    variant="light"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <Button
                    color="danger"
                    variant="bordered"
                    startContent={<Trash2 size={16} />}
                    onPress={() => handleDeleteOnModal(item, item.scrape_id)}
                  >
                    Delete
                  </Button>
                  {/* <Button
                    className="bg-brand text-white"
                    onPress={onClose}
                  >
                    Add To Training
                  </Button> */}
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DetailViewModal;
