"use client";

import { useEffect, useRef, useState } from "react";
import { WordData, WordCloudOptions } from "./types";
import { useWordCloudData } from "./useWordCloudData";
import { useWordFiltering } from "./useWordFiltering";
import { useWordCloudVisualization } from "./useWordCloudVisualization";
import OptionsModal from "./modals/OptionsModal";
import ListEditModal from "./modals/ListEditModal";
import WordDetailPanel from "./WordDetailPanel";
import ChartError from "../ChartError";
import debounce from "lodash/debounce";

const WordCloud = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxWords, setMaxWords] = useState(100);
  
  // Selected word state
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const selectedWordRef = useRef<WordData | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const isPanelVisibleRef = useRef(false);
  
  // Refs to track state that shouldn't trigger re-renders
  const shouldUpdateLayoutRef = useRef(false);
  const windowDimensionsRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const modalsOpenRef = useRef(false);
  
  // Options state
  const [options, setOptions] = useState<WordCloudOptions>({
    stopwordsOption: "Auto-detect",
    whitelistOption: "None",
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true
  });
  
  // Temp options state for the modal
  const [tempOptions, setTempOptions] = useState<WordCloudOptions>({
    stopwordsOption: "Auto-detect",
    whitelistOption: "None",
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true
  });
  
  // Modal state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isStopwordsModalOpen, setIsStopwordsModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  
  // List edit modal states
  const [stopwordsEditText, setStopwordsEditText] = useState("");
  const [whitelistEditText, setWhitelistEditText] = useState("");
  const [originalStopwordsText, setOriginalStopwordsText] = useState("");
  const [originalWhitelistText, setOriginalWhitelistText] = useState("");

  // Fetch data hook
  const { words, isLoading, error, fetchData } = useWordCloudData();

  // Word filtering hook
  const {
    filteredWords,
    customStopwords,
    setCustomStopwords,
    customWhitelist,
    setCustomWhitelist,
    autoDetectedStopwords,
  } = useWordFiltering({
    words,
    searchTerm,
    minFrequency,
    maxWords,
    stopwordsOption: options.stopwordsOption,
    whitelistOption: options.whitelistOption,
    modalsOpen: modalsOpenRef.current,
  });

  // Handle word selection
  const handleWordSelect = (word: WordData) => {
    // Store selected word in ref to avoid unnecessary re-renders
    selectedWordRef.current = word;

    // Explicitly set update flag to false - we don't want to relayout when showing details
    shouldUpdateLayoutRef.current = false;

    // Only update panel visibility if it's changing
    if (!isPanelVisibleRef.current) {
      isPanelVisibleRef.current = true;

      // Set panel visible state BEFORE setting the selected word
      setIsPanelVisible(true);

      // Use timeout to ensure panel visibility change is processed first
      setTimeout(() => {
        setSelectedWord(word);
      }, 50);
    } else {
      // Just update the selected word without triggering layout recalculation
      setSelectedWord(word);
    }
  };

  // Handle panel close
  const handlePanelClose = () => {
    // Force prevent layout update
    shouldUpdateLayoutRef.current = false;

    // Update refs immediately
    selectedWordRef.current = null;
    isPanelVisibleRef.current = false;

    // Clear selected word
    setSelectedWord(null);

    // Wait a bit before changing panel visibility to avoid triggering relayout
    setTimeout(() => {
      setIsPanelVisible(false);
    }, 20);
  };

  // Word cloud visualization hook
  const { isUpdating, resetZoom, debouncedUpdate } = useWordCloudVisualization({
    svgRef,
    words: filteredWords,
    dimensions,
    fontFamily: options.fontFamily,
    colorSelection: options.colorSelection,
    isLoading,
    selectedWordRef,
    isPanelVisibleRef,
    shouldUpdateLayoutRef,
    modalsOpenRef,
    onWordSelect: handleWordSelect,
  });

  // Update dimensions when window size changes
  useEffect(() => {
    const handleResize = debounce(() => {
      const container = svgRef.current?.parentElement;
      if (!container) return;

      // If selectedWordRef was just cleared (panel closing), force prevent relayout
      if (selectedWordRef.current === null && !isPanelVisibleRef.current) {
        shouldUpdateLayoutRef.current = false;
      }

      const containerWidth = container.clientWidth;
      const effectiveWidth = isPanelVisibleRef.current
        ? containerWidth - 256 - 16
        : containerWidth;

      const newWidth = Math.max(effectiveWidth - 32, 400);
      const newHeight = Math.min(550, window.innerHeight * 0.6);

      // Update window dimensions ref
      windowDimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    }, 250);

    // Only add resize listener on client side
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Reset zoom when search/filter changes
  useEffect(() => {
    // If this is a slider change (detected by shouldUpdateLayoutRef flag),
    // we DO want to reset zoom
    const isSliderChange = shouldUpdateLayoutRef.current === true;

    // Skip zoom reset if this update was triggered by panel visibility change
    // BUT don't skip for slider changes or search term changes
    if (
      !isSliderChange &&
      (selectedWordRef.current !== null || !shouldUpdateLayoutRef.current)
    ) {
      return;
    }

    // Reset zoom when filtered words change (search, filter, etc.)
    resetZoom();
  }, [filteredWords, minFrequency, maxWords, searchTerm, resetZoom]);

  // Prevent page scrolling when modals are open
  useEffect(() => {
    const anyModalOpen =
      isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen;

    // Update the ref for modal state
    modalsOpenRef.current = anyModalOpen;

    if (anyModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOptionsModalOpen, isStopwordsModalOpen, isWhitelistModalOpen]);

  // Min/max count for sliders
  const minCount =
    words.length > 0 ? Math.min(...words.map((w) => w.count)) : 0;
  const maxCount =
    words.length > 0 ? Math.max(...words.map((w) => w.count)) : 100;

  // Handle opening the options modal
  const handleOpenOptions = () => {
    // Store current settings to temp state
    setTempOptions({...options});
    setIsOptionsModalOpen(true);
  };

  // Handle closing the options modal without saving
  const handleCloseOptions = () => {
    // Revert to previous settings
    setTempOptions({...options});
    setIsOptionsModalOpen(false);
  };

  // Handle saving options
  const handleSaveOptions = () => {
    const optionsChanged = JSON.stringify(tempOptions) !== JSON.stringify(options);

    // Font family change requires a layout update
    // Stopwords/whitelist changes also require layout update
    const requiresLayoutUpdate =
      tempOptions.fontFamily !== options.fontFamily ||
      tempOptions.stopwordsOption !== options.stopwordsOption ||
      tempOptions.whitelistOption !== options.whitelistOption;

    shouldUpdateLayoutRef.current = requiresLayoutUpdate;

    // Save current search term if we changed filter options
    const currentSearchTerm = searchTerm;
    const stopwordsChanged = tempOptions.stopwordsOption !== options.stopwordsOption;
    const whitelistChanged = tempOptions.whitelistOption !== options.whitelistOption;

    // Apply the new settings
    setOptions({...tempOptions});
    setIsOptionsModalOpen(false);

    // Force update if options changed
    if (optionsChanged) {
      // Short timeout to ensure modal is closed first
      setTimeout(() => {
        // If we changed stopwords or whitelist options and have an active search term,
        // we need to reapply the search to see the filters take effect
        if ((stopwordsChanged || whitelistChanged) && currentSearchTerm) {
          // Temporarily clear search term to ensure filter changes are applied
          setSearchTerm('');
          // Then reapply the search term after a brief delay
          setTimeout(() => {
            setSearchTerm(currentSearchTerm);
          }, 100);
        } else {
          // Always update regardless of layout flag
          debouncedUpdate(filteredWords);
        }
      }, 50);
    }
  };

  // Handle opening the stopwords edit modal
  const handleOpenStopwordsModal = () => {
    // If no custom stopwords have been set yet, initialize with English stopwords
    let currentText = "";
    if (customStopwords.length === 0) {
      // Show the relevant stopwords based on current option
      if (options.stopwordsOption === "English") {
        currentText = customStopwords.join("\n");
      } else if (options.stopwordsOption === "Auto-detect") {
        currentText = autoDetectedStopwords.join("\n");
      } else {
        // Default example if no specific stopwords are selected
        currentText = [
          "a", "an", "the", "and", "or", "but", "if", "then",
          "else", "when", "to", "at", "in", "on", "by"
        ].join("\n");
      }
    } else {
      currentText = customStopwords.join("\n");
    }
    setStopwordsEditText(currentText);
    setOriginalStopwordsText(currentText);
    setIsStopwordsModalOpen(true);
  };

  // Handle saving stopwords
  const handleSaveStopwords = () => {
    // Only process if changes were made
    const changesWereMade = stopwordsEditText !== originalStopwordsText;

    // Set the flag to update only if changes were made
    shouldUpdateLayoutRef.current = changesWereMade;

    if (changesWereMade) {
      const newStopwords = stopwordsEditText
        .split("\n")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);

      setCustomStopwords(newStopwords);
      
      // Update options to use custom mode
      setOptions({
        ...options,
        stopwordsOption: "Custom"
      });

      // Save current search term to reapply it
      const currentSearchTerm = searchTerm;

      // Force update after modal closes
      setTimeout(() => {
        // Temporarily clear search term to ensure stopwords filter is applied
        if (currentSearchTerm) {
          setSearchTerm('');
          // Then reapply the search term after a brief delay
          setTimeout(() => {
            setSearchTerm(currentSearchTerm);
          }, 100);
        } else {
          debouncedUpdate(filteredWords);
        }
      }, 50);
    }

    setIsStopwordsModalOpen(false);
  };

  // Handle opening the whitelist edit modal
  const handleOpenWhitelistModal = () => {
    // Show some example entries if whitelist is empty
    let currentText = "";
    if (customWhitelist.length === 0) {
      // Example whitelist terms
      currentText = ["important", "keyword", "significant", "relevant"].join("\n");
    } else {
      currentText = customWhitelist.join("\n");
    }
    setWhitelistEditText(currentText);
    setOriginalWhitelistText(currentText);
    setIsWhitelistModalOpen(true);
  };

  // Handle saving whitelist
  const handleSaveWhitelist = () => {
    // Only process if changes were made
    const changesWereMade = whitelistEditText !== originalWhitelistText;

    // Set the flag to update only if changes were made
    shouldUpdateLayoutRef.current = changesWereMade;

    if (changesWereMade) {
      const newWhitelist = whitelistEditText
        .split("\n")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);

      setCustomWhitelist(newWhitelist);
      
      // Update options to use custom mode
      setOptions({
        ...options,
        whitelistOption: "Custom"
      });

      // Save current search term to reapply it
      const currentSearchTerm = searchTerm;

      // Force update after modal closes
      setTimeout(() => {
        // Temporarily clear search term to ensure whitelist filter is applied
        if (currentSearchTerm) {
          setSearchTerm('');
          // Then reapply the search term after a brief delay
          setTimeout(() => {
            setSearchTerm(currentSearchTerm);
          }, 100);
        } else {
          debouncedUpdate(filteredWords);
        }
      }, 50);
    }

    setIsWhitelistModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 pb-2">Word Cloud</h2>
        <button
          onClick={handleOpenOptions}
          className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          Options
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search terms
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              // Set flag to force update layout on search term change
              shouldUpdateLayoutRef.current = true;
              
              // Clear the search input to re-apply all filters including stopwords
              // when search input changes
              if (e.target.value === '') {
                setSearchTerm('');
              } else {
                // For non-empty searches, create a new search (which will apply all filters)
                setSearchTerm(e.target.value);
              }
            }}
            placeholder="Filter words..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-10"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum frequency: {minFrequency}
          </label>
          <div className="flex items-center h-10">
            <input
              type="range"
              min={minCount}
              max={maxCount}
              value={minFrequency}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                // We always want to update when user interacts with slider
                shouldUpdateLayoutRef.current = true;
                setMinFrequency(newValue);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max words: {maxWords}
          </label>
          <div className="flex items-center h-10">
            <input
              type="range"
              min={10}
              max={300}
              value={maxWords}
              onChange={(e) => {
                // Set flag to force update layout on max words change
                shouldUpdateLayoutRef.current = true;
                setMaxWords(Number(e.target.value));
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Word cloud visualization with minimum width */}
        <div
          className="flex-1 h-[550px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden relative wordcloud-container"
          style={{ minWidth: selectedWord ? "400px" : "auto" }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">Loading...</span>
              </div>
            </div>
          )}
          
          {error ? (
            <ChartError 
              message={error} 
              onRetry={fetchData}
            />
          ) : isUpdating ? (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">Updating...</span>
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                minWidth: selectedWord ? "400px" : "auto",
                cursor: "grab",
              }}
              className={isUpdating ? "opacity-50" : "opacity-100"}
            />
          )}
          
          <style jsx>{`
            .wordcloud-container svg:active {
              cursor: grabbing;
            }
            .cloud-word {
              user-select: none;
            }
          `}</style>
        </div>

        {/* Word details panel */}
        {selectedWord && (
          <WordDetailPanel
            selectedWord={selectedWord}
            onClose={handlePanelClose}
            onFilterToWord={(word) => {
              // Set flag to force update layout on filter change
              shouldUpdateLayoutRef.current = true;
              setSearchTerm(word);
              // Close the panel since we're now filtering to this word
              handlePanelClose();
            }}
            maxCount={maxCount}
            allWords={words}
          />
        )}
      </div>

      {/* Word frequency summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        Showing {filteredWords.length} of {words.length} words.
        {filteredWords.length > 0 && (
          <span>
            {" "}
            Frequency range: {Math.min(
              ...filteredWords.map((w) => w.count)
            )} to {Math.max(...filteredWords.map((w) => w.count))}
          </span>
        )}
      </div>

      {/* Options Modal */}
      <OptionsModal
        isOpen={isOptionsModalOpen}
        options={options}
        tempOptions={tempOptions}
        setTempOptions={setTempOptions}
        onClose={handleCloseOptions}
        onSave={handleSaveOptions}
        onOpenStopwordsModal={handleOpenStopwordsModal}
        onOpenWhitelistModal={handleOpenWhitelistModal}
      />

      {/* Stopwords Edit Modal */}
      <ListEditModal
        isOpen={isStopwordsModalOpen}
        onClose={() => setIsStopwordsModalOpen(false)}
        title="Edit Stoplist"
        value={stopwordsEditText}
        onChange={setStopwordsEditText}
        onSave={handleSaveStopwords}
      />

      {/* Whitelist Edit Modal */}
      <ListEditModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        title="Edit Whitelist"
        value={whitelistEditText}
        onChange={setWhitelistEditText}
        onSave={handleSaveWhitelist}
      />
    </div>
  );
};

export default WordCloud; 