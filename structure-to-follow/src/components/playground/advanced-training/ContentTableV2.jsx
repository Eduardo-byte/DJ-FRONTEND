import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Chip,
  Progress,
  Badge,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Tooltip,
  Checkbox,
  Skeleton
} from "@heroui/react";
import {
  Search,
  ExternalLink,
  RotateCw,
  Trash2,
  FileText,
  Globe,
  HelpCircle,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../../context/UserDataContext";
import DetailViewModal from "./DetailViewModal";
import { supabase } from "../../../lib/supabase";
import { webScraperService } from "../../../api/services/webscraper.service";
import { contentScraperService } from "../../../api/services/content-scraper.service";
import { chatService } from "../../../api/services/chat.service";
import { setValueAtPath } from "../../../utils/chatUtils";

const ContentTableV2 = ({
  scrapedUrls,
  handleApplyContentChanges,
  selectedAgent,
  setSelectedAgent,
  setScrapedUrls,
  crawlJobInProgress,
  setCrawlJobInProgress,
  crawlJobId
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState({});
  const [isDeletingMultiples, setIsDeletingMultiples] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [scrapedContent, setScrapedContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAllAcross, setSelectAllAcross] = useState(false);

  const [isAddingToTraining, setIsAddingToTraining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useContext(UserDataContext);

  // Fetch scraped content data on component mount
  useEffect(() => {
    const fetchScrapedContent = async () => {
      try {
        setIsLoading(true);

        // Get the agent_id from selectedAgent if available
        const agentId = selectedAgent?.id;

        // fetch the payload
        const response = await contentScraperService.getScrapedContentByAgentId(agentId);

        if (response.success) {
          // pull out the raw array
          const items = response.data.data;

          // sort descending by created_at
          const sorted = items.sort((a, b) => {
            // parse the ISO dates into ms-since-epoch
            const aMs = new Date(a.created_at).getTime();
            const bMs = new Date(b.created_at).getTime();
            return bMs - aMs; // b before a => newest first
          });

          // now you can use sorted however you need
          setScrapedContent(sorted || []);
        } else {
          toast.error("Failed to load scraped content");
        }
      } catch (err) {
        console.error('Error in fetchScrapedContent:', err);
        toast.error('An error occurred while loading training data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScrapedContent();

    // Set up real-time subscription
    // const scrapedContentChannel = supabase
    //   .channel('scraped_content_changes')
    //   .on('postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'scraped_content',
    //       filter: `agent_id=eq.${selectedAgent.id}`, // <-- Filter only for this agent_id
    //     },
    //     handleScrapedContentChange
    //   )
    //   .subscribe();

    // // Cleanup function to remove the subscription
    // return () => {
    //   supabase.removeChannel(scrapedContentChannel);
    // };
    const channel = supabase
      .channel('scraped_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',           // still catch INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'scraped_content',
          // filter: `agent_id=eq.${selectedAgent.id}`,
        },
        (payload) => {
          const event = payload.eventType || payload.event;
          const newRow = payload.new;
          const oldRow = payload.old;

          switch (event) {
            case 'INSERT':
              // only add if it belongs to our agent
              if (newRow.agent_id === selectedAgent.id) {
                setScrapedContent(prev => [newRow, ...prev]);
              }
              break;

            case 'UPDATE':
              // only update if it belongs to our agent
              if (newRow.agent_id === selectedAgent.id) {
                setScrapedContent(prev =>
                  prev.map(item =>
                    item.scrape_id === newRow.scrape_id ? newRow : item
                  )
                );
              }
              break;

            case 'DELETE':
              // deletes only give you old.scrape_id, so just drop that ID
              setScrapedContent(prev =>
                prev.filter(item => item.scrape_id !== oldRow.scrape_id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedAgent]);

  // Handle real-time changes to scraped_content table
  // const handleScrapedContentChange = (payload) => {
  //   const { eventType, new: newRecord, old: oldRecord } = payload;

  //   // Handle different event types
  //   switch (eventType) {
  //     case 'INSERT':
  //       setScrapedContent(prev => [newRecord, ...prev]);
  //       // toast.success('New content added');
  //       break;

  //     case 'UPDATE':
  //       setScrapedContent(prev =>
  //         prev.map(item =>
  //           item.scrape_id === newRecord.scrape_id ? newRecord : item
  //         )
  //       );
  //       break;

  //     case 'DELETE':
  //       setScrapedContent(prev =>
  //         prev.filter(item => item.scrape_id !== oldRecord.scrape_id)
  //       );
  //       break;

  //     default:
  //       break;
  //   }
  // };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    return scrapedContent.filter(item =>
      (item.source_url && item.source_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [scrapedContent, searchQuery]);

  // Pagination
  const pages = Math.ceil(filteredData.length / rowsPerPage);

  //here
  //OLD ONE DONT DELETE BEFORE MAKE SURE IS WORKING FINE WITH THE NEW DELETE
  // const items = useMemo(() => {
  //   const start = (page - 1) * rowsPerPage;
  //   const end = start + rowsPerPage;

  //   return filteredData.slice(start, end);
  // }, [filteredData, page, rowsPerPage]);
  //OLD ONE DONT DELETE BEFORE MAKE SURE IS WORKING FINE WITH THE NEW DELETE
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredData
      .slice(start, end)
      .map(item => ({
        ...item,
        _isDeleting: deletingId === item.scrape_id
      }))
  }, [filteredData, page, rowsPerPage, deletingId])


  // Handle deleting an item
  const handleDeleteItem = async (item, id) => {
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    setDeletingId(id);

    try {
      let result
      let deleteFromDb
      try {
        //delete from pinecone
        for (const trainingId of item.training_ids) {
          result = await webScraperService.deleteByTrainingId(trainingId, {
            namespace: selectedAgent.id
          });
          // console.log(result);
        }
      } catch (error) {
        console.error("Error deleting from Pinecone: ", error)
      }

      // get document by id
      try {
        const documentDataPinecone = await contentScraperService.getScrapedContentById(id)
        if (documentDataPinecone.success) {
          try {
            const deleteDocument = await webScraperService.deleteDocumentFromPineconeAssistant(documentDataPinecone.data.assistantName, documentDataPinecone.data.assistantDocument.id);
          } catch (error) {
            console.log("Error Deleting Document from Assistant", error, error.message)
          }
        }
      } catch (error) {
        console.log("Error fetching Content", error.message, error)
      }

      //is deleting from  pinecone, now delete from scraped_content and then from the chat training_data field
      try {
        deleteFromDb = await contentScraperService.deleteScrapedContentById(id);
        // console.log(deleteFromDb);
      } catch (error) {
        console.log("Error deleting From the scraped_content Table: ", error);
      }

      try {
        const chat = await chatService.fetchChatbyId(selectedAgent.id)
        // console.log(chat);
        if (chat) {
          //here I need to go inside the field training_data and remove from the array the id
          // build a Set for O(1) lookups
          const toRemove = new Set(item.training_ids);
          // Filter out any training_data whose id is in the removal list
          const newTrainingData = chat.training_data.filter(td => !toRemove.has(td.id));
          // console.log("newTrainingData: ", newTrainingData);
          // If nothing changed, you can bail out early
          if (newTrainingData.length === chat.training_data.length) {
            console.log('No matching training_data entries to remove.');
            return;
          }
          // Assign and persist
          chat.training_data = newTrainingData;
          // const updatedChat = setValueAtPath(chat, "training_data", newTrainingData);
          // console.log("updatedChat: ", updatedChat);

          let updatedOriginalData = selectedAgent.originalData
          updatedOriginalData = setValueAtPath(
            updatedOriginalData,
            'training_data',
            newTrainingData
          );
          // console.log("updatedOriginalData: ", updatedOriginalData);
          setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
          handleApplyContentChanges()
        }
      } catch (error) {
        console.error("Error deleting from training_data: ", error)
      }
      if (result.success && deleteFromDb.success) {
        // Remove from local state (will also be updated by real-time subscription)
        // setScrapedContent(prev => prev.filter(item => item.scrape_id !== id));
        toast.success("Item deleted successfully");
      }
    } catch (err) {
      console.error('Error in handleDeleteItem:', err);
      toast.error('An error occurred while deleting the item');
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
      setDeletingId(null);
    }
  };

  const handleDeleteMultiples = async () => {
    if (selectedItems.size === 0) {
      toast.warning("Please select at least one item to delete");
      return;
    }
    setIsDeletingMultiples(true);

    try {
      // 1) figure out which rows we’re deleting
      const itemsToDelete = scrapedContent.filter(i =>
        selectedItems.has(i.scrape_id)
      );

      // 2) gather all the pinecone training IDs
      const allTrainingIds = itemsToDelete.flatMap(i => i.training_ids);

      // 3) delete all pinecone entries in parallel
      // await Promise.all(
      //   allTrainingIds.map(async (id) => {
      //     try {
      //       // First, try to get document data for assistant deletion
      //       try {
      //         const documentDataPinecone = await contentScraperService.getScrapedContentById(id);
      //         if (documentDataPinecone.success) {
      //           try {
      //             const deleteDocument = await webScraperService.deleteDocumentFromPineconeAssistant(
      //               documentDataPinecone.data.assistantName,
      //               documentDataPinecone.data.assistantDocument.id
      //             );
      //             console.log(deleteDocument);
      //           } catch (error) {
      //             console.log("Error Deleting Document from Assistant", error, error.message);
      //           }
      //         }
      //       } catch (error) {
      //         console.log("Error fetching Content", error.message, error);
      //       }

      //       // Then delete from Pinecone by training ID
      //       const deleteResult = await webScraperService.deleteByTrainingId(id, {
      //         namespace: selectedAgent.id
      //       });
      //       return deleteResult;
      //     } catch (error) {
      //       console.error(`Error deleting training ID ${id}:`, error);
      //       throw error; // Re-throw to be caught by Promise.all if needed
      //     }
      //   })
      // );

      // 4) delete from your scraped_content table
      await Promise.all(
        itemsToDelete.map(async (i) => { // ✅ Add 'async' here
          console.log("Deleting scraped content with ID:", i.scrape_id);

          // get document by id
          try {
            const documentDataPinecone = await contentScraperService.getScrapedContentById(i.scrape_id); // ✅ Use i.scrape_id instead of id
            if (documentDataPinecone.success) {
              try {
                const deleteDocument = await webScraperService.deleteDocumentFromPineconeAssistant(documentDataPinecone.data.assistantName, documentDataPinecone.data.assistantDocument.id)
                // console.log(deleteDocument)
              } catch (error) {
                console.log("Error Deleting Document from Assistant", error, error.message)
              }
            }
          } catch (error) {
            console.log("Error fetching Content", error.message, error)
          }
          return contentScraperService.deleteScrapedContentById(i.scrape_id);
        })
      );

      // 5) fetch the chat ONCE, strip out all those IDs, write it back
      const chat = await chatService.fetchChatbyId(selectedAgent.id);
      if (chat) {
        const toRemove = new Set(allTrainingIds);
        const newTrainingData = chat.training_data.filter(
          td => !toRemove.has(td.id)
        );
        // update your context / parent in one go
        const newOriginal = setValueAtPath(
          selectedAgent.originalData,
          "training_data",
          newTrainingData
        );
        setSelectedAgent({ ...selectedAgent, originalData: newOriginal });
        handleApplyContentChanges();
      }

      // 6) clear the local state//
      setScrapedContent(prev =>
        prev.filter(i => !selectedItems.has(i.scrape_id))
      );
      setSelectedItems(new Set());
      for (const trainingId of allTrainingIds) {
        await webScraperService.deleteByTrainingId(trainingId, {
          namespace: selectedAgent.id
        });
      }
      toast.success("Selected items deleted successfully");
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("An error occurred while deleting selected items");
    } finally {
      setIsDeletingMultiples(false);
    }
  };

  // Handle viewing item details
  const handleViewDetails = async (item) => {
    // Open modal immediately with basic data
    //setSelectedItem(item);
    setIsDetailModalOpen(true);

    try {
      // Fetch full content data for the modal
      const fullContentData = await contentScraperService.getScrapedContentByScrapeId(item.scrape_id);

      if (fullContentData && fullContentData.success !== false) {
        // Update selectedItem with full data
        setSelectedItem(fullContentData.data);
      } else {
        toast.error("Failed to load full content details");
        // Keep the basic item data if full fetch fails
      }
    } catch (error) {
      console.error('Error fetching full content details:', error);
      toast.error('Error loading content details');
      // Keep the basic item data if full fetch fails
    } finally {
      // Content has been loaded and modal updated
    }
  };


  // Handle adding selected items to training -> I believe this is not needed because I'm doing the saveChanges already when they scrape single url, and for full website is done on the backend
  //Talk with Fabio if we should just remove the add to Training button
  //This is the old button that is commented on the return to User click and add to trainging
  const handleAddToTraining = async () => {
    if (selectedItems.size === 0) {
      toast.warning("Please select at least one item to add to training");
      return;
    }

    setIsAddingToTraining(true);

    try {
      // Convert Set to Array for processing
      const selectedItemsArray = Array.from(selectedItems);

      // Update status of selected items to 'training'
      const promises = selectedItemsArray.map(id =>
        supabase
          .from('scraped_content')
          .update({ status: 'processing' })
          .eq('scrape_id', id)
      );

      await Promise.all(promises);

      // Local state will be updated by the real-time subscription
      setSelectedItems(new Set());
      toast.success(`${selectedItems.size} items added to training`);

      // Call the handleApplyContentChanges prop if provided
      if (handleApplyContentChanges) {
        handleApplyContentChanges();
      }
    } catch (err) {
      console.error('Error in handleAddToTraining:', err);
      toast.error('An error occurred while adding items to training');
    } finally {
      setIsAddingToTraining(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate training data stats
  //here
  const totalItems = scrapedContent.length;
  const processingItems = scrapedContent.filter(item => item.status === 'processing' || item.status === 'processing').length;
  const processedItems = scrapedContent.filter(item => item.status === 'processed' || item.status === 'processed').length;
  const failedItems = scrapedContent.filter(item => item.status === 'failed').length;
  const completedItems = scrapedContent.filter(item => item.status === 'trained' && item.job_id == crawlJobId).length + failedItems;

  // State to track if there's a crawl job in progress
  const [hasIncompleteScraping, setHasIncompleteScraping] = useState(false);

  // Update hasIncompleteScraping when crawlJobInProgress changes
  useEffect(() => {
    if (crawlJobInProgress) {
      setHasIncompleteScraping(true);
    } else {
      // Only set to false if there are no items with scraping_status = false
      const anyIncomplete = scrapedContent.some(item => item.scraping_status === false);
      setHasIncompleteScraping(anyIncomplete);
    }
  }, [crawlJobInProgress, scrapedContent]);

  const scrapingItems = scrapedContent.filter(item => item.scraping_status === false).length;

  // Calculate completion percentage based on processed items
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Only show progress card when there are items with scraping_status = false */}
      {hasIncompleteScraping && (
        <Card className="border border-gray-100 bg-white" shadow="none">
          <CardBody className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Crawling Data Progress</h3>
              <div className="flex gap-2">
                <Badge color="success" variant="flat">{completedItems} trained</Badge>
                {/* <Badge color="warning" variant="flat">{processingItems} processing</Badge> */}
                <Badge color="warning" variant="flat">{processedItems} processed</Badge>
                <Badge color="danger" variant="flat">{failedItems} failed</Badge>
                <Badge color="primary" variant="flat" className="animate-pulse">
                  {scrapingItems} scraping
                </Badge>
              </div>
            </div>

            <div className="relative">
              {/* Main progress bar */}
              <Progress
                value={completionPercentage}
                color="warning"
                size="sm"
                className="mb-2"
                aria-label="Training data progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={completionPercentage}
              />

              {/* Overlay indeterminate progress bar for scraping in progress */}
              <div className="absolute top-0 left-0 right-0">
                <Progress
                  isIndeterminate
                  color="primary"
                  size="sm"
                  className="opacity-40"
                  aria-label="Scraping in progress"
                />
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <RotateCw size={12} className="animate-spin mr-1" />
                Scraping in progress...
              </span>
              <span>
                {completionPercentage.toFixed(0)}% complete
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search training data..."
            startContent={<Search className="text-gray-400" size={16} />}
            size="sm"
            variant="bordered"
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            aria-label="Search training data"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            size="sm"
            variant="flat"
            className="bg-brand text-white"
            startContent={<Plus size={16} />}
            onPress={handleAddToTraining}
            isLoading={isAddingToTraining}
            isDisabled={selectedItems.size === 0}
          >
            Add to Training
          </Button> */}
          {
            selectedItems.size > 0 &&

            <Button
              size="sm"
              variant="flat"
              className="bg-red-600 text-white"
              startContent={<Trash2 size={16} />}
              onPress={handleDeleteMultiples}
              isLoading={isDeletingMultiples}
              isDisabled={selectedItems.size === 0 || crawlJobInProgress}

            >
              Delete Selected
            </Button>
          }
        </div>
      </div>

      <Card className="border border-gray-100 bg-white" shadow="none">
        <CardBody className="p-0">
          {/* “Select all” banner */}
          {selectedItems.size > 0
            && !selectAllAcross
            && filteredData.length > items.length && (
              <div className="p-2 bg-blue-50 text-sm flex justify-between items-center">
                <span>{selectedItems.size}/{items.length} items on this page are selected.</span>
                <button
                  className="underline"
                  onClick={() => {
                    const allIds = filteredData.map(i => i.scrape_id);
                    setSelectedItems(new Set(allIds));
                    setSelectAllAcross(true);
                  }}
                >
                  Select all {filteredData.length} items
                </button>
              </div>
            )}
          <Table
            aria-label="Training data table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  color="default"
                  showShadow
                  className="text-white"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[400px]",
            }}
            // selectionMode="multiple"
            selectionMode={isLoading ? "none" : "multiple"}
            selectedKeys={selectedItems}
            // onSelectionChange={setSelectedItems}
            onSelectionChange={(keys) => {
              // if (keys === "all") {
              //   // If you want to delete *only* the filtered rows, use filteredData here.
              //   // If you really want every row, use scrapedContent instead.
              //   const allIds = filteredData.map((item) => item.scrape_id);
              //   setSelectedItems(new Set(allIds));
              // } else {
              //   // keys will be a Set<string>
              //   setSelectedItems(keys);
              // }
              if (keys === "all") {
                // only page-visible IDs
                const pageIds = items.map(i => i.scrape_id);
                setSelectedItems(new Set(pageIds));
                setSelectAllAcross(false);
              } else {
                setSelectedItems(new Set(keys));
                setSelectAllAcross(false);
              }
            }}
            color="brand"
          >
            <TableHeader>
              <TableColumn>SOURCE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>WORD COUNT</TableColumn>
              <TableColumn>LAST UPDATED AT</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={isLoading ? "Loading training data..." : "No training data found matching your search."}
              items={items}
              loadingState={isLoading ? "loading" : "idle"}
            >
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-10 rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                (item) => (
                  <TableRow key={item.scrape_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === 'webpage' ? <Globe size={16} className="text-brand" /> :
                          item.type === 'faq' ? <HelpCircle size={16} className="text-brand" /> :
                            item.type === 'pdf' ? <FileText size={16} className="text-brand" /> :
                              <FileText size={16} className="text-brand" />}

                        {item.type === 'faq' ? (
                          <span className="text-gray-600">Internal FAQ</span>
                        ) : (
                          <>
                            <Tooltip content={item.source_url}>
                              <span className="truncate max-w-[200px]">{item.source_url}</span>
                            </Tooltip>
                            {item.type === 'document' ? (null) : (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${item.source_url} in new tab`}
                              >
                                <ExternalLink size={14} className="text-gray-400 hover:text-gray-600" />
                              </a>
                            )}

                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        className={
                          item.status === 'processing' ? 'bg-gray-900/10  text-gray-900 border-1 border-gray-900/20' :
                            item.status === 'processed' ? 'bg-primary/10  text-primary border-1 border-primary/20' :
                              item.status === 'pending' ? 'bg-warning/10 text-warning border-1 border-warning/20' :
                                item.status === 'failed' ? 'bg-danger/10 text-danger border-1 border-danger/20' :
                                  item.status === 'trained' ? 'bg-brand/10 text-brand-dark border-1 border-brand/20' :
                                    'bg-default text-white'
                        }
                      >
                        {item.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span>{item.word_count.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span>{formatDate(item.updated_at)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip content="View Details">
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            className="hover:text-brand bg-transparent hover:bg-transparent"
                            aria-label={`View details for ${item.source_url}`}
                            onPress={() => handleViewDetails(item)}
                          >
                            <Eye size={16} className="" />
                          </Button>
                        </Tooltip>
                        {/* <Tooltip content="Refresh">
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                          className="hover:text-brand bg-transparent hover:bg-transparent"
                          aria-label={`Refresh ${item.source_url}`}
                        >
                          <RotateCw size={16} className="" />
                        </Button>
                      </Tooltip> */}
                        <Tooltip content="Delete">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            aria-label={`Delete ${item.source_url}`}
                            onPress={() => handleDeleteItem(item, item.scrape_id)}
                            isDisabled={!!isDeleting[item.scrape_id]}
                            isLoading={!!isDeleting[item.scrape_id]}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Detail View Modal */}
      <DetailViewModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={selectedItem}
        handleDeleteItem={handleDeleteItem}
      />
    </div>
  );
};

export default ContentTableV2;
