import React, { useContext, useState, useRef, useEffect } from "react";
import { Card, CardBody, Tabs, Tab, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, ModalFooter, Textarea } from "@heroui/react";
import { FileText, Globe, Upload, HelpCircle as FAQ, RotateCw, FileJson } from "lucide-react";
import { webScraperService } from "../../../api/services/webscraper.service";
import { toast } from "sonner";
import { UserDataContext } from "../../../context/UserDataContext";
import { contentScraperService } from "../../../api/services/content-scraper.service";

const TrainingTabs = ({
  activeTrainingTab,
  setActiveTrainingTab,
  websiteUrl,
  setWebsiteUrl,
  singlePageUrl,
  setSinglePageUrl,
  faqQuestion,
  setFaqQuestion,
  faqAnswer,
  setFaqAnswer,
  handleAddUrl,
  handleAddFaq,
  handleBulkAddFaqs,
  handlePdfUpload,
  selectedAgent,
  setCrawlJobInProgress,
  crawlJobInProgress,
  setCrawlJobId
}) => {
  const [isCrawling, setIsCrawling] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bulkFaqJson, setBulkFaqJson] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const { userData, loggedInUser } = useContext(UserDataContext);
  const pollingRef = useRef(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  // helper that will try your domain in all the common permutations, one by one, until it finds something (or exhausts the list)
  /**
 * Try all common permutations of a domain (no paths, no queries).
 * @param {string} rawInput  e.g. "domain.com", "https://domain.com/blog?x=1", "www.domain.com/path"
 * @param {string} agentId
 */
  async function findScrapedContentForDomain(rawInput, agentId) {
    const svc = contentScraperService;

    // Normalize and parse
    let urlStr = rawInput.startsWith('http')
      ? rawInput
      : `https://${rawInput}`;
    let parsed;
    try {
      parsed = new URL(urlStr);
    } catch {
      // fallback if URL() blows up
      parsed = new URL(`https://${rawInput.split(/[/?#]/)[0]}`);
    }

    const base = parsed.hostname.replace(/^www\./, '');     // "domain.com"
    const path = parsed.pathname + (parsed.search || '');   // "/blog" or "/page?x=1"

    // build your origin variants
    const origins = [
      `https://${base}`,
      `https://www.${base}`,
      `http://${base}`,
      `http://www.${base}`,
      base,
      `www.${base}`
    ];

    // now _include_ path variants first…
    const variants = [
      // full‐URL variants with the path
      ...origins.map(origin => origin + path),
      // then the origin‐only variants
      ...origins,
      // and finally the raw input (in case user typed something unconventional)
      rawInput
    ];

    for (const domainVariant of variants) {
      try {
        const result = await svc.getScrapedContentBySourceUrl(agentId, domainVariant);
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          //console.log(`✅ Found on “${domainVariant}”`, result.data);
          return result.data;
        }
      } catch (err) {
        console.warn(`lookup failed for ${domainVariant}`, err);
      }
    }

    //console.log('❌ No scraped content found for any variant');
    return null;
  }


  async function checkUrlExists(source) {
    try {
      if (source == "multiple") {
        try {
          const data = await findScrapedContentForDomain(websiteUrl, selectedAgent.id);
          //console.log(data);
          if (data) {
            onOpen()
          } else {
            handleCrawlJob()
          }
        } catch (error) {

        }
      } else {
        console.log("single");
      }
    } catch (error) {
      toast.error("An Error occured")
    }
  }

  async function handleDeleteAndCrawl() {
    setIsDeleting(true);
    let domain = websiteUrl;
    if (!domain.startsWith('http')) {
      domain = `https://${domain}`;
    }
    try {
      const result = await webScraperService.deleteAndCrawl({
        url: domain,
        limit: 500,
        clinetId: userData.client_id,
        agent_id: selectedAgent.id
      });
      if (result.success) {
        //console.log(result);
        setIsDeleting(false);
        onOpenChange();
        handleCrawlJob();
      }
    } catch (error) {
      toast.error("Error deleting your website from AI brain")
      console.log("Error Deleting");
    }


  }

  // Function to handle crawl job
  //this is the one in use
  const handleCrawlJob = async () => {
    if (!websiteUrl) {
      toast.warning("Please enter a website URL");
      return;
    }

    if (!selectedAgent || !selectedAgent.id) {
      toast.warning("Please select an agent first");
      return;
    }

    setIsCrawling(true);

    try {
      // Extract domain from URL if needed
      // let domain = websiteUrl;
      // if (!domain.startsWith('http')) {
      //   domain = `https://${domain}`;
      // }
      let domain;
      try {
        // Ensure protocol so URL() will parse
        const tmp = websiteUrl.startsWith('http')
          ? websiteUrl
          : `https://${websiteUrl}`;
        const parsed = new URL(tmp);
        domain = parsed.origin;      // e.g. "https://example.com"
      } catch {
        // Fallback: drop everything after first slash
        domain = websiteUrl.split('/')[0];
        if (!domain.startsWith('http')) {
          domain = `https://${domain}`;
        }
      }

      // Set crawlJobInProgress to true to show the progress indicator
      setCrawlJobInProgress(true);

      // Call the startCrawlCronJob method with the agent ID
      //TODO: here -> Change limit based on plan -> /basic/pro/etc etc
      //here
      const result = await webScraperService.startCrawlCronJob(selectedAgent.id, {
        url: domain,
        limit: 500,
        clinetId: userData.client_id
      });

      // console.log("result", result);
      setCrawlJobId(result.jobId)
      if (result && result.success) {
        toast.success("Crawl job started successfully");

        // // Call the original handleScrapeWebsite to maintain existing functionality
        // handleScrapeWebsite();
      } else {
        throw new Error(result?.error || "Failed to start crawl job");
      }
    } catch (error) {
      console.error("Error starting crawl job:", error);
      toast.error(`Error scraping your website, please make sure you type a valid website url`);
      // Reset the crawlJobInProgress state on error
      setCrawlJobInProgress(false);
    } finally {
      setIsCrawling(false);

      // Set a timeout to reset the crawlJobInProgress state after some time
      // This allows the progress indicator to be shown for a while
      // setTimeout(() => {
      //   setCrawlJobInProgress(false);
      // }, 60000); // Reset after 1 minute - adjust as needed
    }
  };

  //useEffect to clear the crawlJob if active
  useEffect(() => {
    //console.log("timeout  called before verify if scrape in action");
    if (!crawlJobInProgress) return;
    pollingRef.current = window.setInterval(async () => {
      try {
        //console.log("timeout  called because scrape in action");
        const resp = await contentScraperService.getScrapedContentByAgentId(selectedAgent.id);
        if (!resp.success) return;
        const allDone = resp.data.data.every(i => i.scraping_status === true);
        if (allDone && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setCrawlJobInProgress(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 30_000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [crawlJobInProgress, selectedAgent.id]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragOver to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    // Filter for PDF files only
    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast.error("Please drop only PDF files");
      return;
    }

    if (pdfFiles.length > 1) {
      toast.error("Please drop only one PDF file at a time");
      return;
    }

    const file = pdfFiles[0];

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Create a synthetic event object to pass to handlePdfUpload
    const syntheticEvent = {
      target: {
        files: [file]
      }
    };

    handlePdfUpload(syntheticEvent);
  };

  // Handle bulk FAQ import
  const handleBulkImport = async () => {
    if (!bulkFaqJson.trim()) {
      toast.warning("Please enter JSON data");
      return;
    }

    setIsProcessingBulk(true);
    try {
      await handleBulkAddFaqs(bulkFaqJson);
      setBulkFaqJson(''); // Clear the textarea on success
    } catch (error) {
      console.error("Error in bulk import:", error);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <>
      <Card className="border border-gray-100 bg-white" shadow="none">
        <CardBody className="p-0">
          <div>
            <h2 className="text-xl font-semibold p-4 border-b border-gray-100">
              Train your Agent
            </h2>
            {/* <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium px-6 py-3">
              🚧 Our training feature is temporarily disabled for maintenance. Please check back later.
            </div> */}
            <div className="px-6 py-4">
              <div className="text-sm text-gray-600 leading-relaxed">
                <span className="block mb-1">Upload documents, add links to your knowledge base,</span>
                <span className="block">or simply provide your website URL to train your Agent with your own data!</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 w-full ">
            <Tabs
              aria-label="Training Options"
              selectedKey={activeTrainingTab}
              onSelectionChange={setActiveTrainingTab}
              defaultSelectedKey="content"
              classNames={{
                tabList: "gap-6  border-none rounded-t-xl rounded-b-none overflow-hidden w-[450px] flex justify-between item-center relative p-0 border-b border-gray-200",
                cursor: "w-full bg-brand",
                tab: " px-0 h-12",
                tabContent: "group-data-[selected=true]:text-gray-900"
              }}
            >
              <Tab
                key="content"
                className="py-2 rounded-b-xl rounded-tr-xl"
                title={
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    <span>Documents & Website</span>
                  </div>
                }
                textValue="Documents & Website"
              >
                <div className="py-6 grid grid-cols-2 gap-6">
                  {/* Website Section here disabled*/}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Website</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-medium mb-2">Scrape your website</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter your website url..."
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="flex-1 shadow-none"
                            aria-label="Website URL to scrape"
                            variant="bordered"
                            size="sm"
                          />
                          <Button
                            className="bg-gray-200 text-gray-700"
                            onPress={() => checkUrlExists("multiple")}
                            isLoading={isCrawling}
                            isDisabled={crawlJobInProgress}
                            aria-label="Scrape website"
                            size="sm"
                          >
                            Scrape
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium mb-2">Enter your website page url</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter single website url..."
                            value={singlePageUrl}
                            onChange={(e) => setSinglePageUrl(e.target.value)}
                            className="flex-1 shadow-none"
                            size="sm"
                            variant="bordered"
                            aria-label="Single page URL to add"
                          />
                          <Button
                            className="bg-gray-200 text-gray-700"
                            onPress={handleAddUrl}
                            isDisabled={crawlJobInProgress}
                            aria-label="Add URL"
                            size="sm"
                          >
                            Add Url
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section here disabled*/}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Documents</h3>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-[250px] transition-colors ${isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="mb-4">
                        <Upload size={28} className={isDragOver ? "text-blue-500" : "text-gray-400"} />
                      </div>
                      <h3 className={`text-base font-medium mb-1 ${isDragOver ? "text-blue-700" : ""}`}>
                        {isDragOver ? "Drop your PDF here" : "Click to upload or drag and drop"}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">PDF (Up to 50MB in size)</p>
                      <Button
                        variant="bordered"
                        startContent={<Upload className="w-4 h-4" />}
                        size="sm"
                        as="label"
                        htmlFor="document-upload"
                        aria-label="Upload document"
                        //isDisabled={true}
                      >
                        Upload PDF
                        <input
                          id="document-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          aria-label="Upload PDF file"
                          onChange={handlePdfUpload}
                        />
                      </Button>
                    </div>
                  </div>


                </div>
              </Tab>
              <Tab
                key="faqs"
                className=" py-2 rounded-b-xl rounded-tr-xl "
                title={
                  <div className="flex items-center gap-2">
                    <FAQ size={18} />
                    <span>FAQs</span>
                  </div>
                }
                textValue="FAQs"
              >
                <div className="py-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Individual FAQ Section */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Add Individual FAQ</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                          <Input
                            placeholder="Question"
                            variant="bordered"
                            size="sm"
                            value={faqQuestion}
                            onChange={(e) => setFaqQuestion(e.target.value)}
                            aria-label="FAQ question"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                          <Input
                            placeholder="Answer"
                            value={faqAnswer}
                            variant="bordered"
                            size="sm"
                            onChange={(e) => setFaqAnswer(e.target.value)}
                            aria-label="FAQ answer"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          className="bg-brand text-gray-900"
                          size="sm"
                          onPress={() => handleAddFaq(faqQuestion, faqAnswer)}
                          aria-label="Add FAQ to AI Brain"
                        >
                          Add to AI Brain
                        </Button>
                      </div>
                    </div>

                    {/* Bulk FAQ Import Section - Only for God Mode users */}
                    {loggedInUser?.role === "God Mode" && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <FileJson size={16} />
                          Bulk Import FAQs from JSON
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            God Mode Only
                          </span>
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              JSON Data
                            </label>
                            <Textarea
                              placeholder={`{\n  "faqs": [\n    {\n      "question": "Your question here",\n      "answer": "Your answer here"\n    },\n    {\n      "question": "Another question",\n      "answer": "Another answer"\n    }\n  ]\n}`}
                              variant="bordered"
                              value={bulkFaqJson}
                              onChange={(e) => setBulkFaqJson(e.target.value)}
                              minRows={8}
                              maxRows={12}
                              aria-label="Bulk FAQ JSON data"
                              classNames={{
                                input: "font-mono text-sm"
                              }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Paste your JSON data with FAQs. Each FAQ should have "question" and "answer" fields.
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => setBulkFaqJson('')}
                              aria-label="Clear JSON data"
                            >
                              Clear
                            </Button>
                            <Button
                              className="bg-purple-600 text-white"
                              size="sm"
                              onPress={handleBulkImport}
                              isLoading={isProcessingBulk}
                              startContent={!isProcessingBulk && <Upload size={16} />}
                              aria-label="Bulk import FAQs"
                            >
                              {isProcessingBulk ? "Processing..." : "Import All FAQs"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </CardBody>
      </Card>
      <Modal size="xl" scrollBehavior="inside" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isDeleting ? "Deleting & Crawling..." : "Existing Data Found"}
              </ModalHeader>

              <ModalBody>
                {isDeleting ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-4">
                    <RotateCw size={48} className="animate-spin" />
                    <p className="text-center">
                      Deleting existing content for <strong>{websiteUrl}</strong> and re-crawling.
                    </p>
                  </div>
                ) : (
                  <p>
                    We found previously scraped content for <strong>{websiteUrl}</strong>.
                    Do you want to delete it and start a fresh crawl?
                  </p>
                )}
              </ModalBody>

              <ModalFooter className="flex gap-2">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-brand"
                  onPress={handleDeleteAndCrawl}
                  isLoading={isDeleting}
                  isDisabled={isDeleting}
                >
                  Delete & Crawl
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>

  );
};

export default TrainingTabs;
