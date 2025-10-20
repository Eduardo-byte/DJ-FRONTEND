import React, { useState, useEffect, useMemo, useContext } from "react";
import { Card, CardBody, Input, Button, Chip, Spinner, Progress, Badge } from "@heroui/react";
import { Search, ChevronDown, ChevronUp, ExternalLink, RotateCw, Trash2, FileText, Globe, HelpCircle } from "lucide-react";
import { webScraperService } from "../../../api/services/webscraper.service";
import { toast } from "sonner";
import { UserDataContext } from "../../../context/UserDataContext";

const ContentTable = ({
  scrapedUrls,
  handleApplyContentChanges,
  selectedAgent,
  setScrapedUrls, // Add this prop to update the scrapedUrls state after deletion
}) => {
  const [pineconeDocuments, setPineconeDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const { loggedInUser, userData } = useContext(UserDataContext);
  // Fetch documents from Pinecone when the component mounts or when the selected agent changes
  useEffect(() => {
    const fetchPineconeDocuments = async () => {
      // console.log(" on the useEffect", scrapedUrls);
      // console.log("im triggerfed", userData);
      if (!selectedAgent || !selectedAgent.id) return;

      try {
        setIsLoadingDocuments(true);
        // Use the agent ID as the namespace
        const namespace = selectedAgent.id;
        const result = await webScraperService.listNamespaceRecords(namespace);

        if (result && result.success && result.results && result.count > 0) {
          //console.log("Pinecone documents:", result);
          setPineconeDocuments(result.results);
          // console.log("im result", result);
        } else {
          setPineconeDocuments([])
        }
      } catch (error) {
        console.error("Error fetching Pinecone documents:", error);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchPineconeDocuments();
  }, [selectedAgent, userData]);

  // Handle deleting an item
  const handleDeleteItem = async (item) => {
    if (!item || !item.singlePineconeDocument) return;

    try {
      // Set deleting state for this item
      setIsDeleting(prev => ({ ...prev, [item.id]: true }));

      //console.log("Full item:", item);

      if (!item.singlePineconeDocument) {
        console.error("No singlePineconeDocument found in item");
        // alert("Error: No document data found for this item");
        toast.warning("No document data found for this item");
        return;
      }

      const metadata = item.singlePineconeDocument.metadata || {};
      //console.log("Item metadata:", metadata);

      // Check for training_id in different possible locations
      let trainingId = metadata.training_id;

      if (!trainingId) {
        // Try alternate property names
        trainingId = metadata.trainingId || metadata.training_id || metadata.trainingID;

        // If still not found, try to extract from the ID
        if (!trainingId && item.id) {
          // The ID format is: clientID-trainingID-chunkIndex
          // Example: edd02a7c-a48b-46b5-a321-9efb400edb43-360082b4-4a3c-42b8-b67b-bac157caaa54-0
          //console.log("Trying to extract training_id from item.id:", item.id);

          try {
            // Split by '-' and reconstruct the UUID format
            const idParts = item.id.split('-');
            //console.log("ID parts:", idParts);

            if (idParts.length >= 8) {
              // Reconstruct the training_id (which is a UUID)
              // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
              trainingId = `${idParts[4]}-${idParts[5]}-${idParts[6]}-${idParts[7]}-${idParts[8]}`;
            } else if (idParts.length >= 3) {
              // Simpler format, just use the middle part
              trainingId = idParts[1];
            }
          } catch (error) {
            console.error("Error extracting training_id from ID:", error);
          }
        }
      }

      //console.log("Extracted training ID:", trainingId);

      if (!trainingId) {
        console.error("No training_id found for item:", item);
        // alert("Error: Could not find training ID for this item");
        toast.warning("Error: Could not find training ID for this item");
        return;
      }

      if (!selectedAgent || !selectedAgent.id) {
        console.error("No agent ID available for namespace");
        // alert("Error: No agent ID available");
        toast.warning("Error: No agent ID available");
        return;
      }

      //console.log("Deleting item with training ID:", trainingId, "in namespace:", selectedAgent.id);

      // Delete the item from Pinecone
      // Pass the agent ID as the namespace and the training_id in the payload
      const result = await webScraperService.deleteByTrainingId(trainingId, {
        namespace: selectedAgent.id
      });

      //console.log("Delete result:", result);

      if (result && result.success) {
        //console.log("Successfully deleted item:", result);

        // Remove from local state
        if (setScrapedUrls) {
          setScrapedUrls(prev => prev.filter(url =>
            !(url.singlePineconeDocument &&
              url.singlePineconeDocument.metadata &&
              url.singlePineconeDocument.metadata.training_id === trainingId)
          ));
        }

        // Refresh Pinecone documents
        setPineconeDocuments(prev => prev.filter(doc =>
          !(doc.metadata && doc.metadata.training_id === trainingId)
        ));
      } else {
        console.error("Failed to delete item:", result);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      // Clear deleting state for this item
      setIsDeleting(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const [expandedItems, setExpandedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle expanded state for an item
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Process items to show each chunk individually
  const combinedItems = useMemo(() => {
    // First, include all scraped URLs as individual items
    //console.log("scrapedUrls", scrapedUrls);
    const items = [...scrapedUrls];

    // Then, add each Pinecone document as a separate item
    pineconeDocuments.forEach(doc => {
      const metadata = doc.metadata || {};

      // Check if this is a FAQ item
      if (metadata.type === "faq") {
        items.push({
          id: doc.id, // Use the Pinecone document ID as the item ID
          url: `Q: ${metadata.question || "Unknown Question"}`,
          originalUrl: metadata.url || "FAQ Entry",
          scrapedAt: metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : 'Unknown',
          fileType: 'FAQ',
          isPineconeOnly: true,
          hasPineconeContent: true,
          singlePineconeDocument: doc, // Store the single document
          content: metadata.content, // Use the content directly
          question: metadata.question || "",
          answer: metadata.answer || "",
          tokenCount: metadata.token_count || 0,
          isFaq: true,
          title: metadata.title || "FAQ Entry"
        });
      }
      // Check if this is a PDF item
      else if (metadata.source === "pdf" || metadata.source.toLowerCase().endsWith('.pdf') || (metadata.url && metadata.url.toLowerCase().endsWith('.pdf'))) {
        const chunkIndex = metadata.chunk_index || metadata.chunkIndex || 0;
        const totalChunks = metadata.total_chunks || metadata.totalChunks || 1;

        items.push({
          id: doc.id, // Use the Pinecone document ID as the item ID
          url: metadata.url || `PDF Document (Chunk ${chunkIndex + 1} of ${totalChunks})`,
          originalUrl: metadata.url,
          scrapedAt: metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : 'Unknown',
          fileType: 'PDF',
          isPineconeOnly: true,
          hasPineconeContent: true,
          singlePineconeDocument: doc, // Store the single document
          content: metadata.content, // Use the content directly
          tokenCount: metadata.token_count || 0,
          chunkIndex: chunkIndex,
          totalChunks: totalChunks,
          title: metadata.title || `PDF Content (Chunk ${chunkIndex + 1} of ${totalChunks})`
        });
      }
      // Regular URL content
      else if (metadata.url) {
        const chunkIndex = metadata.chunk_index || metadata.chunkIndex || 0;
        const totalChunks = metadata.total_chunks || metadata.totalChunks || 1;

        items.push({
          id: doc.id, // Use the Pinecone document ID as the item ID
          url: `${metadata.url} (Chunk ${chunkIndex + 1} of ${totalChunks})`,
          originalUrl: metadata.url,
          scrapedAt: metadata.timestamp ? new Date(metadata.timestamp).toLocaleString() : 'Unknown',
          fileType: 'URL',
          isPineconeOnly: true,
          hasPineconeContent: true,
          singlePineconeDocument: doc, // Store the single document
          content: metadata.content, // Use the content directly
          tokenCount: metadata.token_count || 0,
          chunkIndex: chunkIndex,
          totalChunks: totalChunks,
          title: metadata.title || `Content from ${metadata.url}`
        });
      }
    });

    return items;
  }, [scrapedUrls, pineconeDocuments]);

  // Filter items based on search query
  const filteredUrls = combinedItems.filter(item =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.pineconeDocuments && item.pineconeDocuments.some(doc =>
      doc.metadata && doc.metadata.content &&
      doc.metadata.content.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Calculate training data stats
  const totalItems = combinedItems.length;
  const processingItems = combinedItems.filter(item => item.processing).length;
  const completedItems = totalItems - processingItems;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Get icon based on file type
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'URL':
        return <Globe size={14} />;
      case 'FAQ':
        return <HelpCircle size={14} />;
      case 'PDF':
        return <FileText size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-100 bg-white" shadow="none">
        <CardBody className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Training Data Progress</h3>
            <Badge color="primary" variant="flat">{completedItems}/{totalItems} items</Badge>
          </div>
          <Progress
            value={completionPercentage}
            color="success"
            size="sm"
            className="mb-2"
            aria-label="Training data progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionPercentage}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{processingItems} items processing</span>
            <span>{completionPercentage.toFixed(0)}% complete</span>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search training data..."
            startContent={<Search className="text-gray-400" size={16} />}
            size="sm"
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            aria-label="Search training data"
          />
          <Chip size="sm" variant="flat" color="primary">
            {filteredUrls.length} results
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select
            className="border border-gray-200 rounded-md px-2 py-1 text-sm"
            aria-label="Select rows per page"
          >
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUrls.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No training data found matching your search.</p>
          </div>
        ) : (
          filteredUrls.map((item) => (
            <Card key={item.id} className="border border-gray-100 bg-white" shadow="none">
              <CardBody className="p-0">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={() => toggleExpand(item.id)}
                      aria-label={expandedItems[item.id] ? `Collapse item ${item.url}` : `Expand item ${item.url}`}
                      aria-expanded={expandedItems[item.id] || false}
                    >
                      {expandedItems[item.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Chip
                            startContent={getFileTypeIcon(item.fileType)}
                            size="sm"
                            variant="flat"
                            color={
                              item.fileType === 'URL' ? 'primary' :
                                item.fileType === 'FAQ' ? 'warning' :
                                  item.fileType === 'PDF' ? 'secondary' :
                                    'default'
                            }
                          >
                            {item.fileType}
                          </Chip>
                          {item.isPineconeOnly && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="success"
                            >
                              AI Brain
                            </Chip>
                          )}
                        </div>
                        <span className="font-medium">{item.url}</span>
                        {item.url.startsWith('http') && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${item.url} in new tab`}
                          >
                            <ExternalLink size={14} className="text-gray-400 hover:text-gray-600" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Scraped at: {item.scrapedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.processing || isDeleting[item.id] ? (
                      <Chip color="primary" size="sm" variant="flat" startContent={<Spinner size="sm" />}>
                        {isDeleting[item.id] ? "Deleting..." : "Processing"}
                      </Chip>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          aria-label={`Refresh ${item.url}`}
                        >
                          <RotateCw size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          aria-label={`Delete ${item.url}`}
                          onPress={() => handleDeleteItem(item)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {expandedItems[item.id] && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Content</span>
                      <span className="text-xs text-gray-500">File Type: {item.fileType}</span>
                    </div>

                    {item.processing ? (
                      <div className="h-20 flex items-center justify-center">
                        <Spinner size="sm" color="primary" />
                        <span className="ml-2 text-sm text-gray-500">Processing content...</span>
                      </div>
                    ) : item.fileType === "FAQ" && item.isFaq && item.singlePineconeDocument ? (
                      // Display editable FAQ from Pinecone
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="success" variant="flat">AI Brain FAQ</Badge>
                          <span className="text-xs text-gray-500">
                            {item.tokenCount} tokens
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Question</label>
                            <Input
                              readOnly
                              placeholder="Question"
                              aria-label="FAQ question"
                              defaultValue={item.question}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Answer</label>
                            <Input
                              readOnly
                              placeholder="Answer"
                              aria-label="FAQ answer"
                              defaultValue={item.answer}
                            />
                          </div>
                        </div>
                      </div>
                    ) : item.fileType === "FAQ" ? (
                      // Display regular FAQ form
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Question</label>
                          <Input
                            readOnly
                            placeholder="Question"
                            aria-label="FAQ question"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Answer</label>
                          <Input
                            readOnly
                            placeholder="Answer"
                            aria-label="FAQ answer"
                          />
                        </div>
                      </div>
                    ) : isLoadingDocuments ? (
                      <div className="h-20 flex items-center justify-center">
                        <Spinner size="sm" color="primary" />
                        <span className="ml-2 text-sm text-gray-500">Loading content from AI Brain...</span>
                      </div>
                    ) : item.singlePineconeDocument ? (
                      // Display single Pinecone document
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="success" variant="flat">AI Brain Content</Badge>
                          <span className="text-xs text-gray-500">
                            Chunk {item.chunkIndex + 1} of {item.totalChunks}
                          </span>
                        </div>
                        <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{item.title}</span>
                            <span>{item.tokenCount} tokens</span>
                          </div>
                          <pre className="text-sm whitespace-pre-wrap">{item.content}</pre>
                        </div>
                      </div>
                    ) : item.hasPineconeContent && item.pineconeDocuments ? (
                      // Display multiple Pinecone documents (for backward compatibility)
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="success" variant="flat">AI Brain Content</Badge>
                          <span className="text-xs text-gray-500">
                            {item.pineconeDocuments.length} chunks in Pinecone
                          </span>
                        </div>
                        <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                          {item.pineconeDocuments.map((doc, index) => (
                            <div key={doc.id} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Chunk {index + 1} of {item.pineconeDocuments.length}</span>
                                <span>{doc.metadata.token_count || 0} tokens</span>
                              </div>
                              <pre className="text-sm whitespace-pre-wrap">{doc.metadata.content}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : item.content ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="warning" variant="flat">Local Content</Badge>
                          <span className="text-xs text-gray-500">Not yet in AI Brain</span>
                        </div>
                        <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap">{item.content}</pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No content available for this URL.</p>
                        <p className="text-xs mt-1">Try refreshing or re-processing this URL.</p>
                      </div>
                    )}

                    {/* {!item.processing && (
                      <div className="flex justify-end mt-4">
                        <Button
                          size="sm"
                          className="bg-brand text-gray-900"
                          onPress={() => handleApplyContentChanges(item.id)}
                          aria-label={`Update changes to ${item.url}`}
                        >
                          Update Changes
                        </Button>
                      </div>
                    )} */}
                  </div>
                )}
              </CardBody>
            </Card>
          ))
        )}

        {filteredUrls.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="light"
                aria-label="Go to page 1"
              >1</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentTable;
