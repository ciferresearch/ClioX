"use client";

import { useEffect, useRef } from "react";
import { useWordCloudVisualization } from "./useWordCloudVisualization";
import OptionsModal from "./modals/OptionsModal";
import ListEditModal from "./modals/ListEditModal";
import WordDetailPanel from "./WordDetailPanel";
import ChartError from "../ChartError";
import debounce from "lodash/debounce";
import { useWordCloudStore } from "./store";

const WordCloud = () => {
  // Get SVG ref for d3 visualization
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Get state and actions from store
  const {
    // Data states
    words,
    filteredWords,
    isLoading,
    error,
    
    // UI states
    searchTerm,
    minFrequency,
    maxWords,
    dimensions,
    selectedWord,
    isPanelVisible,
    
    // Options and modal states
    options,
    tempOptions,
    isOptionsModalOpen,
    isStopwordsModalOpen,
    isWhitelistModalOpen,
    
    // List edit states
    stopwordsEditText,
    whitelistEditText,
    
    // Stoplist/Whitelist states
    selectedLanguage,
    stoplistActive,
    whitelistActive,
    
    // Flags
    shouldUpdateLayout,
    isUpdating,
    
    // Actions
    setSearchTerm,
    setMinFrequency,
    setMaxWords,
    setDimensions,
    setSelectedWord,
    setShouldUpdateLayout,
    setIsUpdating,
    
    // Modal actions
    openOptionsModal,
    closeOptionsModal,
    saveOptions,
    openStopwordsModal,
    closeStopwordsModal,
    saveStopwords,
    openWhitelistModal,
    closeWhitelistModal,
    saveWhitelist,
    
    // Stoplist/Whitelist actions
    setLanguage,
    toggleStoplist,
    toggleWhitelist,
    
    // Option actions
    updateTempOptions,
    resetOptionsToDefaults,
    setStopwordsEditText,
    setWhitelistEditText,
    
    // Data actions
    fetchData
  } = useWordCloudStore();

  // References for controlling the wordcloud visualization
  const shouldUpdateLayoutRef = useRef(shouldUpdateLayout);
  const selectedWordRef = useRef(selectedWord);
  const isPanelVisibleRef = useRef(isPanelVisible);
  const modalsOpenRef = useRef(isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen);
  
  // Keep refs in sync with store state
  useEffect(() => {
    shouldUpdateLayoutRef.current = shouldUpdateLayout;
  }, [shouldUpdateLayout]);
  
  useEffect(() => {
    selectedWordRef.current = selectedWord;
  }, [selectedWord]);
  
  useEffect(() => {
    isPanelVisibleRef.current = isPanelVisible;
  }, [isPanelVisible]);
  
  useEffect(() => {
    modalsOpenRef.current = isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen;
  }, [isOptionsModalOpen, isStopwordsModalOpen, isWhitelistModalOpen]);

  // Word cloud visualization hook (using our store state through refs)
  const { resetZoom, debouncedUpdate } = useWordCloudVisualization({
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
    onWordSelect: (word) => {
      // Don't trigger layout update when selecting a word
      setShouldUpdateLayout(false);
      
      // Set selected word and show panel
      setSelectedWord(word);
    },
  });

  // Update dimensions when window size changes
  useEffect(() => {
    const handleResize = debounce(() => {
      const container = svgRef.current?.parentElement;
      if (!container) return;

      // If user just closed the panel, force prevent relayout
      if (selectedWord === null && !isPanelVisible) {
        shouldUpdateLayoutRef.current = false;
      }

      const containerWidth = container.clientWidth;
      const effectiveWidth = isPanelVisible
        ? containerWidth - 256 - 16
        : containerWidth;

      const newWidth = Math.max(effectiveWidth - 32, 400);
      const newHeight = Math.min(550, window.innerHeight * 0.6);

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
  }, [setDimensions, selectedWord, isPanelVisible]);

  // Reset zoom when search/filter changes
  useEffect(() => {
    // If this is a slider change, we DO want to reset zoom
    const isSliderChange = shouldUpdateLayout === true;

    // Skip zoom reset if this update was triggered by panel visibility change
    // BUT don't skip for slider changes or search term changes
    if (
      !isSliderChange &&
      (selectedWord !== null || !shouldUpdateLayout)
    ) {
      return;
    }

    // Reset zoom when filtered words change (search, filter, etc.)
    resetZoom();
  }, [filteredWords, minFrequency, maxWords, searchTerm, resetZoom, selectedWord, shouldUpdateLayout]);

  // Fetch data on initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Force initial render after data is loaded
  useEffect(() => {
    // Only execute this when loading completes and we have data
    if (!isLoading && filteredWords.length > 0 && svgRef.current) {
      console.log("Triggering initial word cloud render");
      
      // Give time for the SVG to initialize
      const timer = setTimeout(() => {
        // Set the flag before debounced update
        shouldUpdateLayoutRef.current = true;
        debouncedUpdate(filteredWords);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, filteredWords, debouncedUpdate]);

  // Update word cloud when filtered words change
  useEffect(() => {
    // Skip updates while loading
    if (isLoading) {
      return;
    }

    // Skip updates if any modal is open
    if (modalsOpenRef.current) {
      return;
    }

    // Always update on slider changes, search term changes, or when filtered words is empty
    const isSliderChange = shouldUpdateLayoutRef.current === true;
    const hasNoFilteredWords = filteredWords.length === 0;

    // Skip updates when panel visibility changes or a word is selected/deselected
    // BUT don't skip if it's a slider change or there are no filtered words (which should always update)
    if (
      (selectedWordRef.current !== null || !shouldUpdateLayoutRef.current) &&
      !isSliderChange && 
      !hasNoFilteredWords
    ) {
      console.log("Skipping layout update due to panel change or word selection");
      return;
    }

    console.log("Updating layout");
    
    // Queue this for next tick to avoid re-renders during rendering
    if (shouldUpdateLayoutRef.current) {
      requestAnimationFrame(() => {
        shouldUpdateLayoutRef.current = false;
      });
    }
    
    debouncedUpdate(filteredWords);
  }, [filteredWords, isLoading, debouncedUpdate]);

  // Min/max count for sliders
  const minCount =
    words.length > 0 ? Math.min(...words.map((w: { count: number }) => w.count)) : 0;
  const maxCount =
    words.length > 0 ? Math.max(...words.map((w: { count: number }) => w.count)) : 100;

  // Handle panel close
  const handlePanelClose = () => {
    // Force prevent layout update
    shouldUpdateLayoutRef.current = false;
    
    // Clear selected word
    setSelectedWord(null);
  };

  // Handle filtering to a selected word
  const handleFilterToWord = (word: string) => {
    // Set flag to force update layout on filter change
    shouldUpdateLayoutRef.current = true;
    setSearchTerm(word);
    // Close the panel since we're now filtering to this word
    handlePanelClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 pb-2">Word Cloud</h2>
        <button
          onClick={openOptionsModal}
          className="px-3 py-1 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          Options
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search terms
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              if (e.target.value === '') {
                setSearchTerm('');
              } else {
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
            onFilterToWord={handleFilterToWord}
            maxCount={maxCount}
            allWords={words}
          />
        )}
      </div>

      {/* Word frequency summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div>
            Showing {filteredWords.length} of {words.length} words.
            {filteredWords.length > 0 && (
              <span>
                {" "}
                Frequency range: {Math.min(
                  ...filteredWords.map((w: { count: number }) => w.count)
                )} to {Math.max(...filteredWords.map((w: { count: number }) => w.count))}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            {stoplistActive && (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                {selectedLanguage === 'custom' ? 'Custom Stopwords' : `${selectedLanguage} Stopwords`}
              </span>
            )}
            
            {whitelistActive && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
                Whitelist Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Options Modal */}
      <OptionsModal
        isOpen={isOptionsModalOpen}
        options={options}
        tempOptions={tempOptions}
        setTempOptions={(newOptions) => {
          // Update each option individually
          Object.entries(newOptions).forEach(([key, value]) => {
            updateTempOptions(key as keyof typeof options, value);
          });
        }}
        onClose={closeOptionsModal}
        onSave={saveOptions}
        
        // Stoplist/Whitelist related props
        selectedLanguage={selectedLanguage}
        stoplistActive={stoplistActive}
        whitelistActive={whitelistActive}
        setLanguage={setLanguage}
        toggleStoplist={toggleStoplist}
        toggleWhitelist={toggleWhitelist}
        onOpenStopwordsModal={openStopwordsModal}
        onOpenWhitelistModal={openWhitelistModal}
      />

      {/* Stopwords Edit Modal */}
      <ListEditModal
        isOpen={isStopwordsModalOpen}
        onClose={closeStopwordsModal}
        title="Edit Stoplist"
        value={stopwordsEditText}
        onChange={setStopwordsEditText}
        onSave={saveStopwords}
        language={selectedLanguage}
      />

      {/* Whitelist Edit Modal */}
      <ListEditModal
        isOpen={isWhitelistModalOpen}
        onClose={closeWhitelistModal}
        title="Edit Whitelist"
        value={whitelistEditText}
        onChange={setWhitelistEditText}
        onSave={saveWhitelist}
      />
    </div>
  );
};

export default WordCloud; 