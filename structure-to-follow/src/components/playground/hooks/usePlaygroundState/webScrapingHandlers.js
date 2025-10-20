import { useRef } from "react";
import { webScraperService } from "../../../../api/services/webscraper.service";
import { setValueAtPath } from "../../../../utils/chatUtils";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { contentScraperService } from "../../../../api/services/content-scraper.service";
import { chatService } from "../../../../api/services/chat.service";
import { pineconeMicroService } from "../../../../api/services/pineconeMicroservie.service";

export const useWebScrapingHandlers = (
  websiteUrl,
  setIsCrawling,
  setCrawlStatus,
  setCrawlProgress,
  setCrawlResults,
  setScrapingUrl,
  setCrawlJobId,
  setModalUrls,
  setShowUrlModal,
  crawlResults,
  modalUrls,
  scrapingUrl,
  singlePageUrl,
  setModalContent,
  setShowContentModal,
  selectedAgent,
  userData,
  setScrapedUrls,
  setSelectedAgent,
  handleApplyChanges,
  setFaqAnswer,
  setFaqQuestion,
) => {

  const scrapingUrlRef = useRef(null)

  // Helper function to update modalUrls from status result
  const updateModalUrlsFromResult = (result) => {
    if (!result || !result.data || !Array.isArray(result.data)) return;

    // Extract all URLs from the result
    const extractedUrls = [];
    const uniqueUrls = new Set();

    // Helper function to check if a URL is valid
    const isValidUrl = (url) => {
      try {
        // Make sure it's a valid URL string
        if (!url || typeof url !== 'string') return false;

        // Filter out non-HTTP protocols
        if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

        return true;
      } catch (e) {
        return false;
      }
    };

    // First ensure the original URL is included
    if (scrapingUrlRef.current && isValidUrl(scrapingUrlRef.current)) {
      extractedUrls.push({
        url: scrapingUrlRef.current,
        selected: true
      });
      uniqueUrls.add(scrapingUrlRef.current);
    }

    // Extract URLs from the data
    result.data.forEach(page => {
      // Extract from links array
      if (page.links && Array.isArray(page.links)) {
        page.links.forEach(url => {
          if (isValidUrl(url) && !uniqueUrls.has(url)) {
            uniqueUrls.add(url);
            extractedUrls.push({
              url,
              selected: false
            });
          }
        });
      }

      // Extract from metadata
      if (page.metadata) {
        // From sourceURL
        if (page.metadata.sourceURL && isValidUrl(page.metadata.sourceURL) && !uniqueUrls.has(page.metadata.sourceURL)) {
          uniqueUrls.add(page.metadata.sourceURL);
          extractedUrls.push({
            url: page.metadata.sourceURL,
            selected: false
          });
        }

        // From url property
        if (page.metadata.url && isValidUrl(page.metadata.url) && !uniqueUrls.has(page.metadata.url)) {
          uniqueUrls.add(page.metadata.url);
          extractedUrls.push({
            url: page.metadata.url,
            selected: false
          });
        }

        // From links array in metadata
        if (page.metadata.links && Array.isArray(page.metadata.links)) {
          page.metadata.links.forEach(url => {
            if (isValidUrl(url) && !uniqueUrls.has(url)) {
              uniqueUrls.add(url);
              extractedUrls.push({
                url,
                selected: false
              });
            }
          });
        }
      }
    });


    // Update modalUrls if we found any new URLs
    if (extractedUrls.length > 0) {
      // Preserve selection state of existing URLs
      const existingUrls = new Map(modalUrls.map(item => [item.url, item.selected]));

      const newUrls = extractedUrls.map(item => ({
        url: item.url,
        selected: existingUrls.has(item.url) ? existingUrls.get(item.url) : item.url === scrapingUrlRef.current
      }));

      setModalUrls(newUrls);
    }
  };

  // Function to check the status of a crawl job
  const checkCrawlStatus = async (jobId) => {
    try {
      const result = await webScraperService.getCrawlJobStatus(jobId);

      if (result) {
        setCrawlStatus(result.status);
        setCrawlProgress(result.totalCount || 0);

        // If the crawl is completed, store the results
        if (result.status === "completed" && result.data) {
          setCrawlResults(result);

          // Extract domain from the original crawled URL
          let domainPattern = '';
          let hostname = '';
          try {
            // Extract the domain from the scraping URL
            const urlObj = new URL(scrapingUrlRef.current);
            hostname = urlObj.hostname; // Gets just the hostname part (e.g., www.example.com)
            domainPattern = urlObj.origin; // Gets protocol + hostname (e.g., https://www.example.com)
            //console.log(`Extracted hostname: ${hostname}, domain pattern: ${domainPattern}`);
          } catch (e) {
            console.error("Error parsing URL:", e);
            domainPattern = scrapingUrlRef.current; // Fallback to the full URL
          }

          //console.log(`Filtering URLs by domain: ${domainPattern}`);

          // Extract all URLs from the crawl results that match the domain
          const extractedUrls = [];

          // Ultra forgiving helper function - accept any HTTP URL at this point
          // It's better to show unrelated URLs than no URLs at all
          const isValidDomainUrl = (url) => {
            try {
              // Make sure it's a valid URL first
              if (!url || typeof url !== 'string') return false;

              // Filter out non-HTTP protocols like tel: or mailto:
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                //console.log(`❌ Skipping non-HTTP URL: ${url}`);
                return false;
              }

              // Just accept all HTTP URLs for now
              //console.log(`✅ Accepted URL: ${url}`);
              return true;
            } catch (e) {
              // If it's not a valid URL, return false
              console.error(`Invalid URL: ${url}`, e);
              return false;
            }
          };

          // Log all URLs for debugging
          const allUrls = new Set();
          result.data.forEach(page => {
            if (page.links && Array.isArray(page.links)) {
              page.links.forEach(url => {
                allUrls.add(url);
              });
            }
          });
          //console.log(`Total links found: ${allUrls.size}`);

          // First add the original URL to make sure we have at least one
          if (scrapingUrlRef.current && scrapingUrlRef.current.startsWith('http')) {
            extractedUrls.push({
              url: scrapingUrlRef.current,
              selected: false
            });
            //console.log(`Added original URL: ${scrapingUrlRef.current}`);
          }

          // Then collect all unique valid URLs
          const uniqueUrls = new Set();

          // Extract URLs from the metadata and links in the API response
          result.data.forEach(page => {
            // Add URLs from the links array
            if (page.links && Array.isArray(page.links)) {
              page.links.forEach(url => {
                // Only add URLs that are valid HTTP URLs and aren't already added
                if (isValidDomainUrl(url) && !uniqueUrls.has(url)) {
                  uniqueUrls.add(url);
                }
              });
            }

            // Also add the source URL from metadata if available
            if (page.metadata && page.metadata.sourceURL) {
              const sourceURL = page.metadata.sourceURL;
              if (isValidDomainUrl(sourceURL) && !uniqueUrls.has(sourceURL)) {
                uniqueUrls.add(sourceURL);
              }
            }

            // Add URLs from the url property in metadata
            if (page.metadata && page.metadata.url) {
              const metaUrl = page.metadata.url;
              if (isValidDomainUrl(metaUrl) && !uniqueUrls.has(metaUrl)) {
                uniqueUrls.add(metaUrl);
              }
            }

            // Add all URLs from the metadata links if available
            if (page.metadata && page.metadata.links && Array.isArray(page.metadata.links)) {
              page.metadata.links.forEach(url => {
                if (isValidDomainUrl(url) && !uniqueUrls.has(url)) {
                  uniqueUrls.add(url);
                }
              });
            }
          });

          // Log the number of URLs found for debugging

          // Convert to the format needed for the UI
          uniqueUrls.forEach(url => {
            // Don't add duplicates
            if (!extractedUrls.some(existing => existing.url === url)) {
              extractedUrls.push({
                url,
                selected: false
              });
            }
          });

          //console.log(`Found ${extractedUrls.length} URLs matching domain ${hostname} from ${result.data.length} pages`);

          // Update the modal URLs
          setModalUrls(extractedUrls);
        }

        return result;
      }

      return null;
    } catch (error) {
      console.error("Error checking crawl status:", error);
      setCrawlStatus("error");
      return null;
    }
  };

  // Function to handle single page URL addition ->  this is for single URL scrape
  const handleAddUrl = async () => {
    if (!singlePageUrl) return;

    try {
      // Set loading state
      setScrapingUrl(singlePageUrl);
      scrapingUrlRef.current = singlePageUrl
      setModalContent(""); // Clear any previous content
      setShowContentModal(true);

      // Process the URL using the web scraper service
      // const processedData = await webScraperService.processUrl(singlePageUrl);
      const processedData = await webScraperService.processUrlV2(selectedAgent.id, userData?.client_id, singlePageUrl);

      if (processedData && processedData.success) {
        // Call handleAddToAiBrain with the processed data - no longer needed because all is being done on the backend now
        //handleAddToAiBrain(processedData);

        // Update the agent's training data if needed
        let updatedOriginalData = selectedAgent.originalData;

        //instead of this need to fetch from the DB because user might have done the scrape full website and is not set
        // const currentTrainingData = updatedOriginalData.training_data || [];
        const selectedChat = await chatService.fetchChatbyId(selectedAgent.id);
        // console.log("selectedChat", selectedChat);
        const currentTrainingData = selectedChat?.training_data || []
        // Add the new training data reference to the agent
        // Build one entry per trainingId
        const newTrainingEntries = processedData.trainingIds.map(trainingId => ({
          id: trainingId,
          url: singlePageUrl,
          isTrained: true,
          created_at: new Date().toISOString(),
          chunks_count: processedData.chunksCount,
          pinecone_insertion_id: processedData.trainingIds || null,
          last_time_trained_at: new Date().toISOString()
        }));

        // Merge into your existing training_data array
        updatedOriginalData = setValueAtPath(
          updatedOriginalData,
          'training_data',
          [
            ...currentTrainingData,
            ...newTrainingEntries
          ]
        );

        setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
        handleApplyChanges();
        setShowContentModal(false);
        toast.success(`Content successfully added to AI Brain! (${processedData.chunksCount} chunks inserted into your agent`);
      } else {
        toast.error(`Failed to process URL: ${processedData?.error || "Unknown error"}`)
        setShowContentModal(false);
        throw new Error("Failed to process URL: " + (processedData?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error processing URL:", error);
      setModalContent(`Error processing, please make sure you type a valid URL`);
    }
  };

  // Function to add content to AI Brain and Pinecone -> this is for single URL scrap
  // This is no longer  in USE because all is being done on the backend now
  // BUT DO NOT DELETE YET - not sure  if its not in use somewhere else on the project
  const handleAddToAiBrain = async (processedData) => {
    if (!processedData) return;

    try {


      // Prepare documents for insertion
      const documents = processedData.chunksWithEmbeddings.map(chunk => ({
        // Include the content of each chunk
        content: chunk.content,
        // Pass the pre-generated embeddings in the expected format
        embeddings: chunk.embedding,
        // Include token count
        tokenCount: chunk.token_count,
        // Include metadata about the chunk
        metadata: {
          url: processedData.url,
          chunksCount: processedData.chunksCount,
          charCount: chunk.char_count,
          charsPerToken: chunk.chars_per_token,
          chunkIndex: chunk.index,
          documentChunkSize: processedData.chunksCount // Total number of chunks in the document
        },
        // Include source and title
        source: processedData.url,
        title: `Content from ${processedData.url} (Chunk ${chunk.index + 1} of ${chunk.total_chunks})`
      }));

      // Only proceed with insertDocuments if we have a selected agent
      if (selectedAgent) {
        // Determine the agent ID to use as namespace
        const agentId = selectedAgent.id;
        const clientId = selectedAgent.clientId || userData?.client_id;

        // Insert documents into Pinecone with the expected format
        const result = await webScraperService.insertDocuments(
          documents,
          clientId,
          agentId,
          {
            source: 'web-scrape',
            title: `Content from ${processedData.url}`,
            documentChunkSize: processedData.chunksCount // Also include in options
          }
        );

        // Check if result is null or doesn't have trainingIds and provide fallback
        let trainingIds = [];
        if (!result || !result.trainingIds) {
          console.error("insertDocuments returned null or missing trainingIds:", result);
          // Generate a fallback UID to prevent failure
          trainingIds = [`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`];
        } else {
          trainingIds = result.trainingIds.map(id => id);
        }

        // grab the raw URL
        let raw = processedData.originalScraper.metadata.sourceURL;

        // strip off any leading "http://" or "https://"
        const withoutProtocol = raw.replace(/^https?:\/\//i, "");

        // build your normalized https URL
        const sourceUrl = `https://${withoutProtocol}`;

        //console.log("using normalized sourceUrl:", sourceUrl);


        // add to assistant as well:
        const uploadPage = await pineconeMicroService.uploadContent(
          agentId, sourceUrl, processedData.htmlContent
        )

        let createRecordDbPayload

        if (uploadPage.success && uploadPage.data.data.uploadResult && uploadPage.data.data.uploadResult.status === "Available") {
          // Add to db
          createRecordDbPayload = {
            agent_id: agentId,
            // source_url: processedData.originalScraper.metadata.sourceURL,
            source_url: sourceUrl,
            status: "trained",
            word_count: processedData.htmlContentLength,
            content: processedData.htmlContent,
            html_content: processedData.originalScraper.html,
            page_links: processedData.originalScraper.links,
            markdown: processedData.originalScraper.markdown,
            type: "webpage",
            metadata: processedData.originalScraper.metadata,
            statusCode: processedData.originalScraper.metadata.statusCode,
            scraping_status: true,
            training_ids: trainingIds,
            pine_assist_data: {
              data: {
                assistant: {
                  host: "",
                  name: agentId,
                  status: "Ready",
                  createdAt: "",
                  updatedAt: "",
                  instructions: "You are an assistant of your supervisor, where your supervisor is trying to find the best answer for the customer and your goal is to respond to the user query the best you can based on the knowledge you have. Provide full instructions don't omit any step. Don't sumarise anything provide the full context of the document relevant to the user query. Give EVERY word on the document back verbatim"
                },
                uploadResult: uploadPage.data.data.uploadResult
              },
              type: "single_page_scrape",
              success: true
            }
          }
        } else {
          // Add to db
          createRecordDbPayload = {
            agent_id: agentId,
            // source_url: processedData.originalScraper.metadata.sourceURL,
            source_url: sourceUrl,
            status: "failed",
            word_count: processedData.htmlContentLength,
            content: processedData.htmlContent,
            html_content: processedData.originalScraper.html,
            page_links: processedData.originalScraper.links,
            markdown: processedData.originalScraper.markdown,
            type: "webpage",
            metadata: processedData.originalScraper.metadata,
            statusCode: processedData.originalScraper.metadata.statusCode,
            scraping_status: true,
            training_ids: trainingIds,
            pine_assist_data: {}
          }

          // delete pinecone document
          await webScraperService.deleteDocumentFromPineconeAssistant(agentId, uploadPage.data.data.uploadResult.id);
        }

        const scraperContentDb = await contentScraperService.createScrapedContent(createRecordDbPayload)
        // console.log("result", result);
        if (result && result.success) {
          // Create a new scraped URL entry for display in the UI
          const newScrapedUrl = {
            id: Date.now(), // Use timestamp as temporary ID
            url: processedData.url,
            scrapedAt: new Date().toLocaleString(),
            fileType: "URL",
            chunksCount: processedData.chunksCount || 1,
            // Reference the Pinecone insertion data
            pineconeInsertionId: result.insertionId || null,
            // Optional: keep a reference to the content for display purposes
            contentSummary: `${processedData.chunksCount} chunks, ${processedData.tokenStats?.originalContent?.tokens || 0} tokens total`
          };

          // Add the new scraped URL to the list
          setScrapedUrls(prev => [newScrapedUrl, ...prev]);

          // Update the agent's training data if needed
          let updatedOriginalData = selectedAgent.originalData;

          //instead of this need to fetch from the DB because user might have done the scrape full website and is not set
          // const currentTrainingData = updatedOriginalData.training_data || [];
          const selectedChat = await chatService.fetchChatbyId(selectedAgent.id);
          // console.log("selectedChat", selectedChat);
          const currentTrainingData = selectedChat?.training_data || []
          // Add the new training data reference to the agent
          // Build one entry per trainingId
          const newTrainingEntries = result.trainingIds.map(trainingId => ({
            id: trainingId,
            url: newScrapedUrl.url,
            isTrained: true,
            created_at: new Date().toISOString(),
            chunks_count: processedData.chunksCount,
            pinecone_insertion_id: result.insertionId || null,
            last_time_trained_at: new Date().toISOString()
          }));

          // Merge into your existing training_data array
          updatedOriginalData = setValueAtPath(
            updatedOriginalData,
            'training_data',
            [
              ...currentTrainingData,
              ...newTrainingEntries
            ]
          );


          setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
          handleApplyChanges();
          // Show loading indicator
          setShowContentModal(false);
          // Show success message
          toast.success(`Content successfully added to AI Brain! (${processedData.chunksCount} chunks inserted into your agent`);
        } else if (result === null && scraperContentDb.data.success) {
          // Create a new scraped URL entry for display in the UI
          const newScrapedUrl = {
            id: Date.now(), // Use timestamp as temporary ID
            url: processedData.url,
            scrapedAt: new Date().toLocaleString(),
            fileType: "URL",
            chunksCount: processedData.chunksCount || 1,
            // Reference the Pinecone insertion data - use null since result is null
            pineconeInsertionId: null,
            // Optional: keep a reference to the content for display purposes
            contentSummary: `${processedData.chunksCount} chunks, ${processedData.tokenStats?.originalContent?.tokens || 0} tokens total`
          };

          // Add the new scraped URL to the list
          setScrapedUrls(prev => [newScrapedUrl, ...prev]);

          // Update the agent's training data if needed
          let updatedOriginalData = selectedAgent.originalData;

          //instead of this need to fetch from the DB because user might have done the scrape full website and is not set
          // const currentTrainingData = updatedOriginalData.training_data || [];
          const selectedChat = await chatService.fetchChatbyId(selectedAgent.id);
          // console.log("selectedChat", selectedChat);
          const currentTrainingData = selectedChat?.training_data || []
          // Add the new training data reference to the agent
          // Build one entry per trainingId - use the fallback trainingIds since result is null
          const newTrainingEntries = trainingIds.map(trainingId => ({
            id: trainingId,
            url: newScrapedUrl.url,
            isTrained: true,
            created_at: new Date().toISOString(),
            chunks_count: processedData.chunksCount,
            pinecone_insertion_id: null, // Use null since result is null
            last_time_trained_at: new Date().toISOString()
          }));

          // Merge into your existing training_data array
          updatedOriginalData = setValueAtPath(
            updatedOriginalData,
            'training_data',
            [
              ...currentTrainingData,
              ...newTrainingEntries
            ]
          );

          setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
          handleApplyChanges();
          // Show loading indicator
          setShowContentModal(false);
          // Show success message
          toast.success(`Content successfully added to AI Brain! (${processedData.chunksCount} chunks inserted into your agent`);
        }

        else {
          throw new Error('Failed to insert documents into the agent. Plase try again!');
        }

        if (createRecordDbPayload.status !== "failed") {
          // Update Status to trained
          await contentScraperService.updateScrapedContentById(scraperContentDb.data.data.scrape_id, { status: "trained" })
        }

      } else {
        // If no agent is selected, just display in UI without Pinecone insertion
        const combinedContent = processedData.chunksWithEmbeddings.length > 1
          ? processedData.chunksWithEmbeddings.map((chunk, i) =>
            `--- Chunk ${i + 1} of ${processedData.chunksWithEmbeddings.length} ---\n${chunk.content}`
          ).join('\n\n')
          : processedData.chunksWithEmbeddings[0]?.content || "No content available";

        // Create a new scraped URL entry for UI only
        const newScrapedUrl = {
          id: Date.now(),
          url: processedData.url,
          scrapedAt: new Date().toLocaleString(),
          fileType: "URL",
          content: combinedContent,
          chunksCount: processedData.chunksCount || 1,
          processedData: processedData
        };

        // Add to UI list
        setScrapedUrls(prev => [newScrapedUrl, ...prev]);

        toast.success(`Content processed but not saved to agent (no agent selected). (${processedData.chunksCount} chunks)`);
      }
    } catch (error) {
      console.error("Error adding content to AI Brain:", error);
      toast.warning(`Error adding content to AI Brain: ${error.message}`);
      // Reopen modal in case of error
      setShowContentModal(true);
    }
  };

  // Function to add FAQ to AI Brain
  const handleAddFaq = async (faqQuestion, faqAnswer) => {
    if (!faqQuestion || !faqAnswer) {
      toast.warning("Please provide both a question and an answer");
      return;
    }

    try {
      if (!selectedAgent) {
        // If no agent is selected, just add to UI without saving to Pinecone
        const newFaq = {
          id: Date.now() + Math.random(),
          url: `Q: ${faqQuestion}`,
          scrapedAt: new Date().toLocaleString(),
          fileType: "FAQ",
          content: `Q: ${faqQuestion}\nA: ${faqAnswer}`,
        };

        setScrapedUrls(prev => [newFaq, ...prev]);
        // alert("FAQ added to list. Select an agent to save to AI Brain.");

        return;
      }

      // Determine the agent ID to use as namespace
      const agentId = selectedAgent.id;
      const clientId = selectedAgent.clientId || userData?.client_id;

      // Insert Q&A document into Pinecone
      //const result = await webScraperService.insertQADocument(
      const result = await webScraperService.insertQADocumentV2(
        faqQuestion,
        faqAnswer,
        clientId,
        agentId,
        {
          title: "FAQ Entry",
          source: "manual-entry"
        }
      );
      // Update the agent's training data if needed
      let updatedOriginalData = selectedAgent.originalData;
      // const currentTrainingData = updatedOriginalData.training_data || [];
      const selectedChat = await chatService.fetchChatbyId(selectedAgent.id);
      // console.log("selectedChat", selectedChat);
      const currentTrainingData = selectedChat?.training_data || []

      // Add the new training data reference to the agent
      updatedOriginalData = setValueAtPath(
        updatedOriginalData,
        "training_data",
        [
          ...currentTrainingData,
          {
            id: result.data.trainingId,
            url: result.data.content,
            isTrained: true,
            last_time_trained_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            pinecone_insertion_id: result.data.trainingIds,
          }
        ]
      );

      setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });

      handleApplyChanges()
      // Show success message
      toast.success("FAQ successfully added to AI Brain!");
      setFaqAnswer("")
      setFaqQuestion("")
    } catch (error) {
      console.error("Error adding FAQ to AI Brain:", error);
      toast.warning(`Error adding FAQ to AI Brain: ${error.message}`);
    }
  };

  // Function to bulk add FAQs from JSON
  const handleBulkAddFaqs = async (jsonString) => {
    if (!jsonString.trim()) {
      toast.warning("Please provide JSON data");
      return;
    }

    try {
      // Parse the JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        toast.error("Invalid JSON format. Please check your JSON syntax.");
        return;
      }

      // Validate the JSON structure
      if (!parsedData.faqs || !Array.isArray(parsedData.faqs)) {
        toast.error("JSON must contain a 'faqs' array");
        return;
      }

      // Validate each FAQ item
      const validFaqs = parsedData.faqs.filter(faq => {
        if (!faq.question || !faq.answer) {
          console.warn("Skipping FAQ with missing question or answer:", faq);
          return false;
        }
        return true;
      });

      if (validFaqs.length === 0) {
        toast.error("No valid FAQs found. Each FAQ must have both 'question' and 'answer' fields.");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`Processing ${validFaqs.length} FAQs...`);

      let successCount = 0;
      let errorCount = 0;

      // Process each FAQ
      for (let i = 0; i < validFaqs.length; i++) {
        const faq = validFaqs[i];
        
        try {
          // Add a small delay between requests to avoid overwhelming the server
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          await handleAddFaq(faq.question, faq.answer);
          successCount++;
        } catch (error) {
          console.error(`Error adding FAQ ${i + 1}:`, error);
          errorCount++;
        }
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show result
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully added ${successCount} FAQs to AI Brain!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Added ${successCount} FAQs successfully. ${errorCount} failed.`);
      } else {
        toast.error("Failed to add any FAQs. Please try again.");
      }

    } catch (error) {
      console.error("Error in bulk FAQ import:", error);
      toast.error(`Error importing FAQs: ${error.message}`);
    }
  };


  const uploadFileToSupabase = async (file, filename) => {
    // console.log("file", file);
    // console.log("filename", filename);
    const { data, error } = await supabase.storage
      .from('pdfs') // Ensure this is the correct bucket name
      .upload(filename, file, { upsert: true }); // Enable upsert

    if (error) {
      throw new Error(error.message);
    }

    const url = `https://sasrqcnrvbodywiqeueb.supabase.co/storage/v1/object/public/pdfs/${filename}`;
    return url;
  };

  // Function to delete a file from Supabase storage
  const deleteFileFromSupabase = async (filename) => {
    const { error, data } = await supabase.storage
      .from('pdfs') // Use the same bucket name
      .remove([filename]); // Supabase expects an array of filenames to remove

    if (error) {
      console.error('Error deleting file from Supabase:', error);
      // Optionally, you could alert the user or handle the error accordingly
    }
    // else {
    //   console.log('File successfully deleted from Supabase:', data);
    // }
  };

  // Helper function to create database record payload -> for documents(pdf, etc)
  // This is no longer  in USE because all is being done on the backend now
  const createDbRecordPayload = (agentId, status, result, pineconeDocumentDownload = null, fileName) => {
    const trainingIds = Array.isArray(result.trainingIds) ? result.trainingIds.map(id => id) : [];

    return {
      agent_id: agentId,
      source_url: fileName,
      status: status,
      word_count: result.totalWords,
      content: result.fullContent,
      html_content: "",
      page_links: [],
      markdown: "",
      type: "Document",
      metadata: "",
      statusCode: 200,
      scraping_status: true,
      training_ids: trainingIds,
      ...(pineconeDocumentDownload && { pine_assist_data: pineconeDocumentDownload }),
      client_id: selectedAgent.clientId
    };
  };

  // Function to handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      toast.warning('Please upload a PDF file');
      return;
    }

    // Check file size (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.warning('File size exceeds 50MB limit');
      return;
    }

    // Only proceed if we have a selected agent
    if (!selectedAgent) {
      toast.warning('Please select an agent before uploading a PDF');
      return;
    }

    let filename = null;

    try {
      // Show loading indicator
      toast.info('Processing PDF file. This may take a while...');

      // Determine the agent ID to use as namespace
      const agentId = selectedAgent.id;
      const clientId = selectedAgent.clientId || userData?.client_id;

      // Generate a unique filename by appending a timestamp to the original file name
      const timestamp = Date.now();
      filename = `${timestamp}-${file.name}`;

      // Upload file to Supabase
      const fileUrl = await uploadFileToSupabase(file, filename);

      // Process and insert the PDF
      const result = await webScraperService.processPdfAndInsertV2(
        fileUrl,
        clientId,
        agentId
      );

      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to process PDF');
      }

      // // Upload document to Pinecone Assistant
      // const pineconeDocumentDownload = await webScraperService.uploadDocumentToPineconeAssistant({
      //   agentId: agentId,
      //   documentUrl: fileUrl,
      //   instructions: "You are an assistant of your supervisor, where your supervisor is trying to find the best answer for the customer and your goal is to respond to the user query the best you can based on the knowledge you have. Provide full instructions don't omit any step. Don't sumarise anything provide the full context of the document relevant to the user query. Give EVERY word on the document back verbatim",
      //   region: "eu",
      //   pollingOptions: {
      //     maxAttempts: 15,
      //     interval: 4000
      //   }
      // });

      // // Check if Pinecone processing failed
      // const processingFailed = pineconeDocumentDownload?.data?.uploadResult?.status === "ProcessingFailed";

      // if (processingFailed) {
      //   // Handle processing failure
      //   const createRecordDbPayload = createDbRecordPayload(agentId, "failed", result, pineconeDocumentDownload, file.name);

      //   try {
      //     await contentScraperService.createScrapedContent(createRecordDbPayload);
      //   } catch (error) {
      //     console.error("Error Creating Scraped Content:", error.message, error);
      //   }

      //   // Clean up training IDs
      //   const trainingIds = Array.isArray(result.trainingIds) ? result.trainingIds : [];
      //   for (const trainingId of trainingIds) {
      //     try {
      //       await webScraperService.deleteByTrainingId(trainingId);
      //     } catch (error) {
      //       console.error("Error Deleting Document:", error.message, error);
      //     }
      //   }

      //   toast.warning('Error processing PDF, the document might be corrupted or invalid');
      //   return;
      // }

      // Handle successful processing
      // const createRecordDbPayload = createDbRecordPayload(agentId, "trained", result, pineconeDocumentDownload, file.name);
      // const scraperContentDb = await contentScraperService.createScrapedContent(createRecordDbPayload);

      // Create a new entry for display in the UI
      const newPdfEntry = {
        id: Date.now(),
        url: file.name,
        scrapedAt: new Date().toLocaleString(),
        fileType: "PDF",
        chunksCount: result.chunksCount || 1,
        pineconeInsertionId: result.insertionId || null,
        contentSummary: `${result.chunksCount || 0} chunks, ${result.tokenCount || 0} tokens total`,
        source: "pdf-upload"
      };

      // Add the new entry to the list
      setScrapedUrls(prev => [newPdfEntry, ...prev]);

      // Update the agent's training data
      let updatedOriginalData = selectedAgent.originalData;
      const selectedChat = await chatService.fetchChatbyId(selectedAgent.id);
      const currentTrainingData = selectedChat.training_data || [];

      // Build one entry per trainingId
      const trainingIds = Array.isArray(result.trainingIds) ? result.trainingIds : [];
      const newTrainingEntries = trainingIds.map(trainingId => ({
        id: trainingId,
        url: result.source,
        isTrained: true,
        created_at: new Date().toISOString(),
        chunks_count: result.chunksCount,
        pinecone_insertion_id: result.insertionId || null,
        last_time_trained_at: new Date().toISOString()
      }));

      // Merge into existing training_data array
      updatedOriginalData = setValueAtPath(
        updatedOriginalData,
        'training_data',
        [...currentTrainingData, ...newTrainingEntries]
      );

      setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
      handleApplyChanges();

      // Show success message
      toast.success(`PDF successfully added to AI Brain! (${result.chunksCount || 0} chunks inserted into your agent)`);

    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.warning(`Error processing PDF: ${error.message}`);
    } finally {
      // Clean up resources
      if (filename) {
        try {
          await deleteFileFromSupabase(filename);
        } catch (error) {
          console.error("Error deleting file from Supabase:", error);
        }
      }

      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return {
    checkCrawlStatus,
    handleAddUrl,
    handleAddToAiBrain,
    handleAddFaq,
    handleBulkAddFaqs,
    handlePdfUpload
  };
};
