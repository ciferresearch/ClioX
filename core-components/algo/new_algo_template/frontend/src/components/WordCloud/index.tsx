"use client";

import { useEffect, useRef, useState } from "react";
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
    isWordSelectionAction,
    
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
  const isWordSelectionActionRef = useRef(isWordSelectionAction);
  
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

  useEffect(() => {
    isWordSelectionActionRef.current = isWordSelectionAction;
  }, [isWordSelectionAction]);

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
    isWordSelectionActionRef,
    onWordSelect: (word) => {
      // Let the store handle all state updates
      setSelectedWord(word);
      
      console.log("Word selected:", word.value);
    },
  });

  // Update dimensions when window size changes
  useEffect(() => {
    const handleResize = debounce(() => {
      const container = svgRef.current?.parentElement;
      if (!container) return;

      // Calculate dimensions based on container size only
      // Panel state will be handled by CSS flex layout
      const containerWidth = container.clientWidth;
      
      // Set new dimensions (with minimum width guarantee)
      const newWidth = Math.max(containerWidth - 32, 400); // account for padding
      const newHeight = Math.min(550, window.innerHeight * 0.6);

      // Update dimensions in store
      setDimensions({
        width: newWidth,
        height: newHeight,
      });
      
      console.log(`Dimensions updated: ${newWidth}x${newHeight}`);
    }, 250);

    // Only add resize listener on client side
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [setDimensions]);

  // Reset zoom when search/filter changes
  useEffect(() => {
    // If this is a slider change, we DO want to reset zoom
    const isSliderChange = shouldUpdateLayout === true;

    // Skip zoom reset if:
    // - This is a panel state change (isPanelVisible changed)
    // - OR a word selection/deselection 
    // BUT don't skip for slider changes or search term changes
    if (
      !isSliderChange &&
      (selectedWord !== null || isWordSelectionAction || !shouldUpdateLayout)
    ) {
      return;
    }

    // Reset zoom when filtered words change (search, filter, etc.)
    resetZoom();
  }, [filteredWords, minFrequency, maxWords, searchTerm, resetZoom, selectedWord, isWordSelectionAction, shouldUpdateLayout]);

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

    // When a word is selected or panel is closed:
    // - Both are marked as isWordSelectionAction = true in the store
    // - Allow update but mark it as a word selection to prevent relayout
    // - The debouncedUpdate function will handle this correctly
    if (isWordSelectionAction) {
      console.log("Panel state change detected (open/close), allowing update with isWordSelectionAction flag");
      debouncedUpdate(filteredWords);
      return;
    }

    // For all other updates, proceed normally
    console.log("Normal layout update");
    debouncedUpdate(filteredWords);
  }, [
    filteredWords, 
    isLoading, 
    modalsOpenRef, 
    isWordSelectionAction, 
    debouncedUpdate
  ]);

  // Min/max count for sliders - initialize with defaults for SSR
  const minCount = words.length > 0 
    ? Math.min(...words.map((w: { count: number }) => w.count)) 
    : 0;
  
  const maxCount = words.length > 0 
    ? Math.max(...words.map((w: { count: number }) => w.count)) 
    : 100;

  // Initialize minFrequency based on data available at render time
  useEffect(() => {
    if (words.length > 0 && minFrequency === 0) {
      // Only set if not already set and we have data
      setMinFrequency(minCount);
    }
  }, [words.length, minCount, minFrequency, setMinFrequency]);

  // Handle panel close with smooth transition
  const handlePanelClose = () => {
    // Let the store handle the state updates
    // The store will set isWordSelectionAction to true, preventing layout
    setSelectedWord(null);
    
    // Record panel close in console for debugging
    console.log("Panel closed with smooth transition");
  };

  // When panel state changes (appearing or disappearing),
  // ensure the container adjusts properly but doesn't trigger relayout
  useEffect(() => {
    const container = svgRef.current?.parentElement?.parentElement;
    if (!container) return;

    // Force container to adjust its size without triggering wordcloud relayout
    const adjustContainerSize = () => {
      requestAnimationFrame(() => {
        // Just accessing clientWidth can sometimes trigger reflow 
        // without causing full recalculation
        const _ = container.clientWidth;
      });
    };
    
    adjustContainerSize();
    
    // After transition completes (300ms is our transition duration)
    const timer = setTimeout(() => {
      adjustContainerSize();
    }, 350);
    
    return () => clearTimeout(timer);
  }, [isPanelVisible]);

  // Handle filtering to a selected word
  const handleFilterToWord = (word: string) => {
    // This is explicitly NOT a word selection action
    // but rather a search action, so we need to:
    // 1. Make sure isWordSelectionAction is reset
    // 2. Force layout update since we're filtering to a specific word
    
    // Close the panel first
    handlePanelClose();
    
    // Short delay to ensure panel close is registered
    setTimeout(() => {
      // Now set search term with force update
      shouldUpdateLayoutRef.current = true;
      
      // Reset word selection flag via store action
      // This ensures the layout is fully recomputed
      setShouldUpdateLayout(true);
      
      // Set the search term to filter to this word
      setSearchTerm(word);
      
      console.log("Filtering to word:", word);
    }, 50);
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
            Minimum frequency: {typeof window !== 'undefined' ? minFrequency : ''}
          </label>
          <div className="flex items-center h-10">
            {typeof window !== 'undefined' && (
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
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max words: {typeof window !== 'undefined' ? maxWords : ''}
          </label>
          <div className="flex items-center h-10">
            {typeof window !== 'undefined' && (
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
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Main container - using CSS Grid for smoother transitions */}
        <div 
          className={`grid transition-all duration-300 ease-in-out gap-4 ${
            isPanelVisible ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr]'
          }`}
          style={{ width: '100%' }}
        >
          {/* Word cloud visualization - will automatically adjust with CSS Grid */}
          <div
            className="h-[550px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden relative wordcloud-container"
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

          {/* Word details panel - conditional rendering with CSS Grid */}
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
      </div>

      {/* Word frequency summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div>
            {typeof window !== 'undefined' ? (
              <>
                Showing {filteredWords.length} of {words.length} words.
                {filteredWords.length > 0 && (
                  <span>
                    {" "}
                    Frequency range: {Math.min(
                      ...filteredWords.map((w: { count: number }) => w.count)
                    )} to {Math.max(...filteredWords.map((w: { count: number }) => w.count))}
                  </span>
                )}
              </>
            ) : (
              <>Loading word statistics...</>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            {stoplistActive ? (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                {selectedLanguage === 'custom' ? 'Custom Stopwords' : `${selectedLanguage} Stopwords`}
              </span>
            ) : null}
            
            {whitelistActive ? (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
                Whitelist Active
              </span>
            ) : null}
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