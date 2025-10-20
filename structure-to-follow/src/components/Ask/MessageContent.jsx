import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, Play, Copy, Check, Download, Loader2 } from 'lucide-react';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";

// Global CSV cache to persist rendered tables
const csvCache = new Map();
let cacheCounter = 0;

// CSV parsing function with column normalization
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n').filter(line => line.trim().length > 0);
  const result = [];
  
  for (let line of lines) {
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    row.push(current.trim());
    result.push(row);
  }
  
  // Normalize all rows to have the same number of columns as the header
  if (result.length > 0) {
    const headerLength = result[0].length;
    
    for (let i = 1; i < result.length; i++) {
      const row = result[i];
      
      // If row has fewer columns than header, pad with empty strings
      while (row.length < headerLength) {
        row.push('');
      }
      
      // If row has more columns than header, truncate
      if (row.length > headerLength) {
        result[i] = row.slice(0, headerLength);
      }
    }
  }
  
  return result;
};

// Memoized CSV table that prevents re-rendering once stable
const MemoizedCSVTable = React.memo(({ csvData }) => {
  // Function to download CSV data
  const downloadCSV = React.useCallback(() => {
    if (!csvData) return;
    
    const csvContent = csvData.map(row => 
      row.map(cell => 
        // Escape cells that contain commas, quotes, or newlines
        /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [csvData]);

  if (!csvData || csvData.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-center text-gray-500 my-4">
        No CSV data to display
      </div>
    );
  }

  const [headers, ...rows] = csvData;
  
  return (
    <div className="my-4">
      {/* Download button above the table */}
      <div className="flex justify-end mb-2">
        <button
          onClick={downloadCSV}
          className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200"
          title="Download CSV"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="rounded-xl overflow-hidden">
        <Table 
          aria-label="CSV data table"
          className="rounded-xl"
          classNames={{
            wrapper: "rounded-xl shadow-sm border border-gray-200",
            table: "rounded-xl",
            thead: "bg-gray-50 rounded-t-xl",
            tbody: "rounded-b-xl",
          }}
        >
          <TableHeader>
            {headers.map((header, index) => (
              <TableColumn key={index} className="text-left font-semibold text-gray-900">
                {header}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-gray-700">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

// Global cache-based CSV component that never re-renders once stable
const CachedCSVTable = ({ csvText, isComplete = false }) => {
  // Create a stable hash for the CSV content
  const csvHash = React.useMemo(() => {
    if (!csvText) return '';
    // Create a more stable hash based on content and completion
    const contentHash = csvText.replace(/\s+/g, ' ').trim();
    return `${contentHash.length}-${contentHash.slice(0, 50)}-${isComplete}`;
  }, [csvText, isComplete]);

  // Check if we have this table cached
  const cachedTable = csvCache.get(csvHash);
  
  // Always call hooks before any early returns
  const [tableComponent, setTableComponent] = React.useState(cachedTable?.component || null);
  const [isProcessing, setIsProcessing] = React.useState(!cachedTable);

  React.useEffect(() => {
    // If we already have a complete cached version, don't process
    if (cachedTable && cachedTable.isComplete) {
      if (!tableComponent) {
        setTableComponent(cachedTable.component);
        setIsProcessing(false);
      }
      return;
    }

    const processCSV = () => {
      if (!csvText || csvText.trim().length === 0) {
        setIsProcessing(true);
        return;
      }

      try {
        const parsedData = parseCSV(csvText);
        
        if (parsedData && parsedData.length > 0) {
          // Check if CSV appears complete
          const isCSVComplete = isComplete || 
            (parsedData.length > 1 && 
             csvText.trim().split('\n').length >= 2 && 
             !csvText.trim().endsWith(','));

          // Create the table component
          const component = <MemoizedCSVTable csvData={parsedData} />;
          
          // Cache the component
          csvCache.set(csvHash, {
            component,
            isComplete: isCSVComplete,
            timestamp: Date.now()
          });

          setTableComponent(component);
          setIsProcessing(false);

          // If complete, this will be the final version
          if (isCSVComplete) {
            console.log('CSV table cached as complete:', csvHash);
          }
        } else {
          setIsProcessing(true);
        }
      } catch (err) {
        console.error('CSV parsing error:', err);
        setIsProcessing(true);
      }
    };

    // Only process if we don't have a complete cached version
    if (!cachedTable || !cachedTable.isComplete) {
      const timer = setTimeout(processCSV, 300);
      return () => clearTimeout(timer);
    }
  }, [csvHash, csvText, isComplete, cachedTable, tableComponent]);

  // If we have a cached table and it's marked as complete, return it
  if (cachedTable && cachedTable.isComplete && tableComponent) {
    return tableComponent;
  }

  // If we have a table component (cached or newly created), return it
  if (tableComponent) {
    return tableComponent;
  }

  // Show loading state
  if (isProcessing) {
    return (
      <div className="my-4 p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          <span className="text-gray-600 font-medium">Building table...</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Processing CSV data</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-center text-gray-500 my-4">
      No CSV data to display
    </div>
  );
};

// Alias for backward compatibility
const StreamingCSVTable = CachedCSVTable;

// Legacy CSVTable component for backward compatibility
const CSVTable = ({ csvData }) => {
  if (!csvData || csvData.length === 0) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl text-center text-gray-500 my-4">
        No CSV data to display
      </div>
    );
  }

  const [headers, ...rows] = csvData;
  
  // Function to download CSV data
  const downloadCSV = () => {
    const csvContent = csvData.map(row => 
      row.map(cell => 
        // Escape cells that contain commas, quotes, or newlines
        /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="my-4">
      {/* Download button above the table */}
      <div className="flex justify-end mb-2">
        <button
          onClick={downloadCSV}
          className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-colors duration-200"
          title="Download CSV"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="rounded-xl overflow-hidden">
        <Table 
          aria-label="CSV data table"
          className="rounded-xl"
          classNames={{
            wrapper: "rounded-xl shadow-sm border border-gray-200",
            table: "rounded-xl",
            thead: "bg-gray-50 rounded-t-xl",
            tbody: "rounded-b-xl",
          }}
        >
          <TableHeader>
            {headers.map((header, index) => (
              <TableColumn key={index} className="text-left font-semibold text-gray-900">
                {header}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-gray-700">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// CodeBlock component with copy functionality
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative mb-6">
      {/* Main content container */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        {/* Header with simple styling */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Simple dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
              </div>
              
              {/* Language label */}
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                {language || 'code'}
              </span>
            </div>
            
            {/* Simple copy button */}
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                copied 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              }`}
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Code content with darker background */}
        <div className="bg-gray-800">
          <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
            <code className="text-gray-100">{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const MessageContent = ({ content, role, onVideosDetected, isComplete = false }) => {
  // Function to detect video URLs
  const detectVideoUrls = (text) => {
    const videoPatterns = [
      // YouTube patterns - more specific
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
      // Vimeo patterns
      /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g,
      // Direct video file patterns - more specific to avoid matching image URLs
      /https?:\/\/[^\s]+\.(?:mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)(?:\?[^\s]*)?$/gi,
      // Loom patterns
      /(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)/g,
      // Wistia patterns
      /(?:https?:\/\/)?[^.\s]+\.wistia\.com\/medias\/([a-zA-Z0-9]+)/g
    ];

    const videos = [];
    const seenUrls = new Set();
    const seenIds = new Set();

    videoPatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const url = match[0];
        const id = match[1] || null;
        
        console.log(`Pattern ${patternIndex} matched:`, { url, id, pattern: pattern.source });
        
        // Skip if this is actually an image URL
        if (isImageUrl(url)) {
          console.log('Skipping URL - detected as image:', url);
          continue;
        }
        
        const type = getVideoType(url);
        console.log('Video type determined:', { url, type });
        
        // Only add valid video types
        if (type === 'unknown') {
          console.log('Skipping URL - unknown video type:', url);
          continue;
        }
        
        // Create unique identifier for the video
        const uniqueId = id || url;
        
        // Only add if we haven't seen this video before
        if (!seenUrls.has(url) && !seenIds.has(uniqueId)) {
          videos.push({
            url,
            id,
            type
          });
          seenUrls.add(url);
          if (id) seenIds.add(id);
          console.log('Added video:', { url, id, type });
        } else {
          console.log('Skipping URL - already seen:', url);
        }
      }
    });

    return videos;
  };

  // Function to detect image URLs
  const detectImageUrls = (text) => {
    const imagePattern = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|ico)/gi;
    const images = [];
    const seenUrls = new Set();

    let match;
    while ((match = imagePattern.exec(text)) !== null) {
      const url = match[0];
      
      // Only add if we haven't seen this image before
      if (!seenUrls.has(url)) {
        images.push({ url });
        seenUrls.add(url);
      }
    }

    return images;
  };

  // Function to check if URL is an image
  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff|ico)(\?|$)/i.test(url);
  };

  // Function to determine video type
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('loom.com')) return 'loom';
    if (url.includes('wistia.com')) return 'wistia';
    if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i)) return 'direct';
    return 'unknown';
  };

  // Function to get YouTube video ID
  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Function to get Vimeo video ID
  const getVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  // Function to get Loom video ID
  const getLoomId = (url) => {
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Function to render video embed with animations
  const renderVideoEmbed = (video, index) => {
    const { url, type } = video;
    
    // Calculate staggered delay (200ms between each video)
    const delay = index * 200;
    const animationClasses = `animate-fade-in-up opacity-0`;
    const animationStyle = {
      animationDelay: `${delay}ms`,
      animationFillMode: 'forwards'
    };

    switch (type) {
      case 'youtube':
        const youtubeId = getYouTubeId(url);
        if (youtubeId) {
          return (
            <div 
              key={index} 
              className={`my-4 ${animationClasses}`}
              style={animationStyle}
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'vimeo':
        const vimeoId = getVimeoId(url);
        if (vimeoId) {
          return (
            <div 
              key={index} 
              className={`my-4 ${animationClasses}`}
              style={animationStyle}
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  title="Vimeo video"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'loom':
        const loomId = getLoomId(url);
        if (loomId) {
          return (
            <div 
              key={index} 
              className={`my-4 ${animationClasses}`}
              style={animationStyle}
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-sm"
                  src={`https://www.loom.com/embed/${loomId}`}
                  title="Loom video"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }
        break;

      case 'direct':
        return (
          <div 
            key={index} 
            className={`my-4 ${animationClasses}`}
            style={animationStyle}
          >
            <video
              className="w-full max-w-full rounded-lg shadow-sm"
              controls
              preload="metadata"
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      default:
        return (
          <div 
            key={index} 
            className={`my-4 p-3 bg-gray-50 border border-gray-200 rounded-lg ${animationClasses}`}
            style={animationStyle}
          >
            <div className="flex items-center gap-2 text-gray-700">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Video Link:</span>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-gray-800 hover:text-gray-900 rounded-lg border border-brand/30 hover:border-brand/50 transition-all duration-200 text-sm font-medium no-underline"
            >
              <span>Open Video</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        );
    }

    return null;
  };

  // Function to render image embed with animations
  const renderImageEmbed = (image, index) => {
    const { url } = image;
    
    // Calculate staggered delay (200ms between each image)
    const delay = index * 200;
    const animationClasses = `animate-fade-in-up opacity-0`;
    const animationStyle = {
      animationDelay: `${delay}ms`,
      animationFillMode: 'forwards'
    };

    return (
      <div 
        key={index} 
        className={`my-4 overflow-hidden rounded-lg ${animationClasses}`}
        style={animationStyle}
      >
        <img
          src={url}
          alt="Embedded image"
          className="w-full h-auto object-cover shadow-sm"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            e.target.style.display = 'none';
            // Show a fallback text or broken image indicator
            const fallback = document.createElement('div');
            fallback.className = 'bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500';
            fallback.innerHTML = `<span>Image could not be loaded: ${url}</span>`;
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>
    );
  };

  // Custom components for markdown rendering
  const components = {
    // Style headings
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>
    ),
    
    // Style paragraphs
    p: ({ children }) => (
      <p className="mb-2 last:mb-0">{children}</p>
    ),
    
    // Style lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="ml-2">{children}</li>
    ),
    
    // Style code blocks
    code: ({ inline, children, className }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }

      // Extract language from className (e.g., "language-javascript" -> "javascript")
      const language = className ? className.replace('language-', '') : 'text';
      const codeString = String(children).replace(/\n$/, '');

      // Handle CSV data specially - render as streaming-aware table instead of code block
      if (language === 'csv') {
        return <StreamingCSVTable csvText={codeString} isComplete={isComplete} />;
      }

      return <CodeBlock code={codeString} language={language} />;
    },
    
    // Style blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2 text-gray-700">
        {children}
      </blockquote>
    ),
    
    // Style links as buttons with external link icon using brand colors
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-gray-800 hover:text-gray-900 rounded-lg border border-brand/30 hover:border-brand/50 transition-all duration-200 text-sm font-medium no-underline my-1"
        title="Opens in new tab"
      >
        <span>{children}</span>
        <ExternalLink className="w-4 h-4 flex-shrink-0" />
      </a>
    ),
    
    // Style tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full border border-gray-300 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-3 py-2 text-gray-700">
        {children}
      </td>
    ),
    
    // Style horizontal rules
    hr: () => (
      <hr className="border-gray-300 my-4" />
    ),
    
    // Style images
    img: ({ src, alt }) => (
      <div className="my-3">
        <img
          src={src}
          alt={alt || 'Image'}
          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
          style={{ maxHeight: '400px' }}
          onError={(e) => {
            e.target.style.display = 'none';
            // Show a fallback text or broken image indicator
            const fallback = document.createElement('div');
            fallback.className = 'bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500';
            fallback.innerHTML = `<span>Image could not be loaded: ${alt || src}</span>`;
            e.target.parentNode.appendChild(fallback);
          }}
        />
      </div>
    ),
    
    // Style strong and emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
  };

  // For user messages, just render as plain text
  if (role === 'user') {
    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }

  // Detect video URLs in the content - memoize to prevent recalculation
  const videoUrls = React.useMemo(() => {
    const videos = detectVideoUrls(content);
    // console.log('Video detection:', { content, detectedVideos: videos });
    return videos;
  }, [content]);

  // Detect image URLs in the content - memoize to prevent recalculation
  const imageUrls = React.useMemo(() => {
    const images = detectImageUrls(content);
    // console.log('Image detection:', { content, detectedImages: images });
    return images;
  }, [content]);

  // Use ref to track if we've already notified about these videos
  const lastNotifiedVideos = React.useRef(null);

  // State to control animation trigger
  const [showVideos, setShowVideos] = React.useState(false);
  const [showImages, setShowImages] = React.useState(false);

  // Trigger video animations after component mounts
  React.useEffect(() => {
    if (videoUrls.length > 0) {
      // Small delay to ensure DOM is ready, then trigger animations
      const timer = setTimeout(() => {
        setShowVideos(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoUrls.length]);

  // Trigger image animations after component mounts
  React.useEffect(() => {
    if (imageUrls.length > 0) {
      // Small delay to ensure DOM is ready, then trigger animations
      const timer = setTimeout(() => {
        setShowImages(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imageUrls.length]);

  // For assistant messages, render with markdown and videos
  if (role === 'assistant') {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown components={components}>
          {content}
        </ReactMarkdown>
        
        {/* Render images directly in the component */}
        {imageUrls.length > 0 && showImages && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {imageUrls.map((image, index) => renderImageEmbed(image, index))}
          </div>
        )}

        {/* Render videos directly in the component */}
        {videoUrls.length > 0 && showVideos && (
          <div className={`mt-4 ${videoUrls.length === 1 ? 'space-y-3' : 'grid grid-cols-2 gap-3'}`}>
            {videoUrls.map((video, index) => renderVideoEmbed(video, index))}
          </div>
        )}
      </div>
    );
  }

  // For other messages, just render the content
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContent;
