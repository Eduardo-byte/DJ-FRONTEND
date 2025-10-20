//This Component  is not in use we can delete later
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Spinner,
  Progress,
  Chip,
  Input
} from "@heroui/react";
import { X, ExternalLink, AlertOctagon, CheckCircle, Clock, Search, Globe } from "lucide-react";

const UrlModal = ({
  isOpen,
  onClose,
  scrapingUrl,
  modalUrls,
  setModalUrls,
  handleAddToTraining,
  crawlStatus,
  crawlProgress,
  isCrawling
}) => {
  // Add state for domain filtering and search
  const [showDomainOnly, setShowDomainOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Function to select all visible URLs (respects domain filter and search)
  const selectAllUrls = () => {
    // Get the currently filtered URLs
    const visibleUrls = getFilteredUrls();
    const visibleUrlSet = new Set(visibleUrls.map(url => url.url));

    // Update selection state for all URLs
    const newUrls = modalUrls.map(url => ({
      ...url,
      selected: visibleUrlSet.has(url.url) ? true : url.selected
    }));

    setModalUrls(newUrls);
  };

  // Function to deselect all URLs
  const deselectAllUrls = () => {
    const newUrls = modalUrls.map(url => ({
      ...url,
      selected: false
    }));
    setModalUrls(newUrls);
  };

  // Function to check if a URL is from the same domain as the scraping URL
  const isSameDomain = (url) => {
    if (!url || !scrapingUrl || typeof url !== 'string' || typeof scrapingUrl !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      const scrapingUrlObj = new URL(scrapingUrl);

      // Extract domain by removing 'www.' if present
      const urlDomain = urlObj.hostname.replace(/^www\./, '');
      const scrapingDomain = scrapingUrlObj.hostname.replace(/^www\./, '');

      return urlDomain === scrapingDomain;
    } catch (e) {
      console.error("Error comparing domains:", e);
      return false;
    }
  };

  // Function to get filtered URLs based on domain setting and search query
  const getFilteredUrls = () => {
    let filtered = modalUrls;

    // Apply domain filter if enabled
    if (showDomainOnly) {
      filtered = filtered.filter(url => isSameDomain(url.url));
    }

    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(url =>
        url.url.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Get filtered URLs
  const filteredUrls = getFilteredUrls();

  return (
    <Modal size="5xl" scrollBehavior="inside" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h3>Scraped URLs {modalUrls.length > 0 && <span className="text-sm font-normal ml-2">({modalUrls.length} found)</span>}</h3>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            Confirm the urls that you want to train your Agent.
          </p>
        </ModalHeader>
        <ModalBody>
          {/* Custom status display that matches the screenshots */}
          {crawlStatus === "completed" && (
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-green-500" />
              <span>Completed crawl of {scrapingUrl}</span>
              <Chip size="sm" className="bg-green-100 text-green-700 ml-2">Found {modalUrls.length} URLs</Chip>
            </div>
          )}

          {crawlStatus === "scraping" && (
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="primary" />
                <span>Crawling website: {scrapingUrl}</span>
              </div>
              <div>
                <p className="text-sm">Found {modalUrls.length} URLs so far</p>
                <Progress
                  aria-label="Crawling progress"
                  value={Math.min(modalUrls.length, 100)}
                  maxValue={100}
                  color="primary"
                  className="max-w-md"
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Show spinner when starting or if we have no URLs yet */}
          {(isCrawling && !modalUrls.length) || crawlStatus === "starting" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner color="primary" size="lg" className="mb-4" />
              <p>Scraping Website</p>
              <p className="text-sm text-gray-500">{scrapingUrl}</p>
            </div>
          ) : (
            <div>
              {modalUrls.length > 0 && (
                <>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Button
                      size="sm"
                      className="bg-blue-50 text-blue-600"
                      onPress={selectAllUrls}
                    >
                      Select All
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-100 text-gray-700"
                      onPress={deselectAllUrls}
                    >
                      Deselect All
                    </Button>
                    <div className="flex items-center ml-auto">
                      <Checkbox
                        isSelected={showDomainOnly}
                        onChange={() => setShowDomainOnly(!showDomainOnly)}
                        size="sm"
                        color="success"
                      />
                      <label className="text-sm ml-2 cursor-pointer" onClick={() => setShowDomainOnly(!showDomainOnly)}>
                        Show only same domain
                      </label>
                    </div>
                    <Chip size="sm" className="bg-blue-100 text-blue-700 font-medium">
                      {filteredUrls.length} of {modalUrls.length} URLs
                    </Chip>
                  </div>

                  {/* Search input */}
                  <div className="mb-3">
                    <Input
                      placeholder="Search URLs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startContent={<Search size={16} className="text-gray-400" />}
                      clearable
                      onClear={() => setSearchQuery("")}
                      size="sm"
                    />
                  </div>
                </>
              )}
              <Table removeWrapper aria-label="Scraped URLs">
                <TableHeader>
                  <TableColumn width={50}></TableColumn>
                  <TableColumn>URL</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredUrls.length > 0 ? (
                    filteredUrls.map((url, index) => (
                      <TableRow key={index} className={url.selected ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            isSelected={url.selected}
                            onChange={() => {
                              // Find the actual index in the original array
                              const originalIndex = modalUrls.findIndex(item => item.url === url.url);
                              if (originalIndex !== -1) {
                                const newUrls = [...modalUrls];
                                newUrls[originalIndex].selected = !newUrls[originalIndex].selected;
                                setModalUrls(newUrls);
                              }
                            }}
                            color="success"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <a
                                href={url.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                              >
                                {url.url}
                                <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                              </a>
                              {url.url === scrapingUrl && (
                                <Chip size="sm" className="bg-green-100 text-green-700 ml-2">Original</Chip>
                              )}
                              {isSameDomain(url.url) && url.url !== scrapingUrl && (
                                <Chip size="sm" className="bg-blue-100 text-blue-700 ml-2">Same Domain</Chip>
                              )}
                            </div>
                            {url.selected && (
                              <div className="text-xs text-gray-500 mt-1">
                                Selected for training
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <div className="text-center py-4 text-gray-500">
                          {showDomainOnly && modalUrls.length > 0
                            ? `No URLs from domain "${new URL(scrapingUrl).hostname}" found. Try unchecking "Show only same domain".`
                            : "No URLs found. Try scraping a different URL or adding single URLs directly."}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </ModalBody>
        {/* Footer with buttons in the style from the screenshots */}
        <ModalFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {modalUrls.filter(url => url.selected).length} URLs selected
          </div>

          {isCrawling && crawlStatus !== "completed" ? (
            <Button
              variant="flat"
              className="bg-gray-100 text-gray-600"
              isDisabled={true}
            >
              <Spinner size="sm" className="mr-2" />
              Scraping...
            </Button>
          ) : (
            <Button
              className="bg-gray-600 text-white"
              onPress={handleAddToTraining}
              isDisabled={!modalUrls.some(url => url.selected)}
            >
              Add to AI Brain
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UrlModal;
