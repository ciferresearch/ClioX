import { create } from 'zustand';
import { 
  WordData, 
  WordCloudOptions, 
  StopwordsOption, 
  WhitelistOption 
} from './types';
import { 
  ENGLISH_STOPWORDS, 
  DEFAULT_CUSTOM_STOPWORDS,
  CUSTOM_COLORS
} from './constants';

// Define the store type
interface WordCloudStore {
  // Data states
  words: WordData[];
  filteredWords: WordData[];
  isLoading: boolean;
  error: string | null;
  
  // UI states
  searchTerm: string;
  minFrequency: number;
  maxWords: number;
  dimensions: { width: number; height: number };
  
  // Selected word states
  selectedWord: WordData | null;
  isPanelVisible: boolean;
  
  // Options states
  options: WordCloudOptions;
  tempOptions: WordCloudOptions;
  
  // Modal states
  isOptionsModalOpen: boolean;
  isStopwordsModalOpen: boolean;
  isWhitelistModalOpen: boolean;
  
  // List edit states
  stopwordsEditText: string;
  whitelistEditText: string;
  originalStopwordsText: string;
  originalWhitelistText: string;
  
  // Custom word lists
  customStopwords: string[];
  customWhitelist: string[];
  autoDetectedStopwords: string[];
  
  // Refs equivalents (flags)
  shouldUpdateLayout: boolean;
  isUpdating: boolean;
  modalsOpen: boolean;
  
  // Random word colors map
  wordColors: Record<string, string>;
  
  // Actions
  setWords: (words: WordData[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilteredWords: (filteredWords: WordData[]) => void;
  setSearchTerm: (term: string) => void;
  setMinFrequency: (frequency: number) => void;
  setMaxWords: (maxWords: number) => void;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  setSelectedWord: (word: WordData | null) => void;
  setShouldUpdateLayout: (shouldUpdate: boolean) => void;
  setIsUpdating: (isUpdating: boolean) => void;
  
  // Modal actions
  openOptionsModal: () => void;
  closeOptionsModal: () => void;
  saveOptions: () => void;
  openStopwordsModal: () => void;
  closeStopwordsModal: () => void;
  saveStopwords: () => void;
  openWhitelistModal: () => void;
  closeWhitelistModal: () => void;
  saveWhitelist: () => void;
  
  // Utility actions
  updateTempOptions: <K extends keyof WordCloudOptions>(key: K, value: WordCloudOptions[K]) => void;
  resetOptionsToDefaults: () => void;
  setStopwordsEditText: (text: string) => void;
  setWhitelistEditText: (text: string) => void;
  filterWords: () => void;
  autoDetectStopwords: () => void;
  getWordColor: (word: string) => string;
  fetchData: () => Promise<void>;
}

// Create the store
export const useWordCloudStore = create<WordCloudStore>((set, get) => ({
  // Initial states
  words: [],
  filteredWords: [],
  isLoading: true,
  error: null,
  
  searchTerm: "",
  minFrequency: 0,
  maxWords: 100,
  dimensions: { width: 800, height: 500 },
  
  selectedWord: null,
  isPanelVisible: false,
  
  options: {
    stopwordsOption: "Auto-detect",
    whitelistOption: "None",
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true
  },
  tempOptions: {
    stopwordsOption: "Auto-detect",
    whitelistOption: "None",
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true
  },
  
  isOptionsModalOpen: false,
  isStopwordsModalOpen: false,
  isWhitelistModalOpen: false,
  
  stopwordsEditText: "",
  whitelistEditText: "",
  originalStopwordsText: "",
  originalWhitelistText: "",
  
  customStopwords: DEFAULT_CUSTOM_STOPWORDS,
  customWhitelist: [],
  autoDetectedStopwords: [],
  
  shouldUpdateLayout: false,
  isUpdating: false,
  modalsOpen: false,
  
  wordColors: {},
  
  // Basic setters
  setWords: (words) => set({ words }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilteredWords: (filteredWords) => set({ filteredWords }),
  setSearchTerm: (searchTerm) => {
    // Set flag to force update layout on search term change
    set({ 
      searchTerm,
      shouldUpdateLayout: true 
    });
    
    // After setting search term, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setMinFrequency: (minFrequency) => {
    set({ 
      minFrequency,
      shouldUpdateLayout: true
    });
    
    // After setting min frequency, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setMaxWords: (maxWords) => {
    set({ 
      maxWords,
      shouldUpdateLayout: true 
    });
    
    // After setting max words, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setDimensions: (dimensions) => set({ dimensions }),
  setSelectedWord: (selectedWord) => {
    // Don't trigger layout update when selecting a word
    set({ 
      selectedWord,
      shouldUpdateLayout: false,
      isPanelVisible: selectedWord !== null
    });
  },
  setShouldUpdateLayout: (shouldUpdateLayout) => set({ shouldUpdateLayout }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  
  // Modal actions
  openOptionsModal: () => {
    const { options } = get();
    set({ 
      isOptionsModalOpen: true,
      tempOptions: { ...options },
      modalsOpen: true
    });
  },
  closeOptionsModal: () => {
    set({ 
      isOptionsModalOpen: false,
      modalsOpen: false
    });
  },
  saveOptions: () => {
    const { tempOptions, options, searchTerm } = get();
    
    // Check if options actually changed
    const optionsChanged = JSON.stringify(tempOptions) !== JSON.stringify(options);
    
    // Font family change or stopwords/whitelist changes require layout update
    const requiresLayoutUpdate = 
      tempOptions.fontFamily !== options.fontFamily ||
      tempOptions.stopwordsOption !== options.stopwordsOption ||
      tempOptions.whitelistOption !== options.whitelistOption;
    
    // Save current search term to reapply it if needed
    const currentSearchTerm = searchTerm;
    const stopwordsChanged = tempOptions.stopwordsOption !== options.stopwordsOption;
    const whitelistChanged = tempOptions.whitelistOption !== options.whitelistOption;
    
    // Apply the new settings
    set({ 
      options: { ...tempOptions },
      isOptionsModalOpen: false,
      modalsOpen: false,
      shouldUpdateLayout: requiresLayoutUpdate
    });
    
    // Handle filter updates if options changed
    if (optionsChanged) {
      setTimeout(() => {
        // If we changed stopwords or whitelist options and have an active search term,
        // we need to reapply the search to see the filters take effect
        if ((stopwordsChanged || whitelistChanged) && currentSearchTerm) {
          set({ searchTerm: '' });
          
          setTimeout(() => {
            set({ searchTerm: currentSearchTerm });
            get().filterWords();
          }, 100);
        } else {
          // Just filter words without clearing search term
          get().filterWords();
        }
      }, 50);
    }
  },
  openStopwordsModal: () => {
    const { customStopwords, options, autoDetectedStopwords } = get();
    
    // Prepare text content for the modal
    let currentText = "";
    if (customStopwords.length === 0) {
      // Show the relevant stopwords based on current option
      if (options.stopwordsOption === "English") {
        currentText = ENGLISH_STOPWORDS.join("\n");
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
    
    set({
      stopwordsEditText: currentText,
      originalStopwordsText: currentText,
      isStopwordsModalOpen: true,
      modalsOpen: true
    });
  },
  closeStopwordsModal: () => {
    set({ 
      isStopwordsModalOpen: false,
      modalsOpen: false
    });
  },
  saveStopwords: () => {
    const { stopwordsEditText, originalStopwordsText, searchTerm } = get();
    
    // Only process if changes were made
    const changesWereMade = stopwordsEditText !== originalStopwordsText;
    
    if (changesWereMade) {
      // Parse the new stopwords from text
      const newStopwords = stopwordsEditText
        .split("\n")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);
      
      // Update options to use custom mode
      set({
        customStopwords: newStopwords,
        options: {
          ...get().options,
          stopwordsOption: "Custom"
        },
        shouldUpdateLayout: true,
        isStopwordsModalOpen: false,
        modalsOpen: false
      });
      
      // Save current search term to reapply it
      const currentSearchTerm = searchTerm;
      
      // Force update after modal closes
      setTimeout(() => {
        // Temporarily clear search term to ensure stopwords filter is applied
        if (currentSearchTerm) {
          set({ searchTerm: '' });
          
          // Then reapply the search term after a brief delay
          setTimeout(() => {
            set({ searchTerm: currentSearchTerm });
            get().filterWords();
          }, 100);
        } else {
          get().filterWords();
        }
      }, 50);
    } else {
      // Just close the modal without changes
      set({ 
        isStopwordsModalOpen: false,
        modalsOpen: false
      });
    }
  },
  openWhitelistModal: () => {
    const { customWhitelist } = get();
    
    // Show some example entries if whitelist is empty
    let currentText = "";
    if (customWhitelist.length === 0) {
      // Example whitelist terms
      currentText = ["important", "keyword", "significant", "relevant"].join("\n");
    } else {
      currentText = customWhitelist.join("\n");
    }
    
    set({
      whitelistEditText: currentText,
      originalWhitelistText: currentText,
      isWhitelistModalOpen: true,
      modalsOpen: true
    });
  },
  closeWhitelistModal: () => {
    set({ 
      isWhitelistModalOpen: false,
      modalsOpen: false
    });
  },
  saveWhitelist: () => {
    const { whitelistEditText, originalWhitelistText, searchTerm } = get();
    
    // Only process if changes were made
    const changesWereMade = whitelistEditText !== originalWhitelistText;
    
    if (changesWereMade) {
      // Parse the new whitelist from text
      const newWhitelist = whitelistEditText
        .split("\n")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0);
      
      // Update options to use custom mode
      set({
        customWhitelist: newWhitelist,
        options: {
          ...get().options,
          whitelistOption: "Custom"
        },
        shouldUpdateLayout: true,
        isWhitelistModalOpen: false,
        modalsOpen: false
      });
      
      // Save current search term to reapply it
      const currentSearchTerm = searchTerm;
      
      // Force update after modal closes
      setTimeout(() => {
        // Temporarily clear search term to ensure whitelist filter is applied
        if (currentSearchTerm) {
          set({ searchTerm: '' });
          
          // Then reapply the search term after a brief delay
          setTimeout(() => {
            set({ searchTerm: currentSearchTerm });
            get().filterWords();
          }, 100);
        } else {
          get().filterWords();
        }
      }, 50);
    } else {
      // Just close the modal without changes
      set({ 
        isWhitelistModalOpen: false,
        modalsOpen: false
      });
    }
  },
  
  // Utility actions
  updateTempOptions: (key, value) => {
    set({
      tempOptions: {
        ...get().tempOptions,
        [key]: value
      }
    });
  },
  resetOptionsToDefaults: () => {
    set({
      tempOptions: {
        stopwordsOption: "Auto-detect",
        whitelistOption: "None",
        fontFamily: "Palatino",
        colorSelection: "random",
        applyGlobally: true
      }
    });
  },
  setStopwordsEditText: (text) => set({ stopwordsEditText: text }),
  setWhitelistEditText: (text) => set({ whitelistEditText: text }),
  
  // Helper function to get active stopwords based on current option
  getActiveStopwords: (): string[] => {
    const { options, autoDetectedStopwords, customStopwords } = get();
    
    switch (options.stopwordsOption) {
      case "Auto-detect":
        return autoDetectedStopwords;
      case "English":
        return ENGLISH_STOPWORDS;
      case "Custom":
        return customStopwords;
      case "None":
      default:
        return [];
    }
  },
  
  // Helper function to get active whitelist based on current option
  getActiveWhitelist: (): string[] => {
    const { options, customWhitelist } = get();
    
    switch (options.whitelistOption) {
      case "Custom":
        return customWhitelist;
      case "None":
      default:
        return [];
    }
  },
  
  // Filter words based on current search term, frequency, and options
  filterWords: () => {
    const { 
      words, 
      searchTerm, 
      minFrequency, 
      maxWords,
      modalsOpen
    } = get();
    
    // Skip filtering if modals are open
    if (modalsOpen) return;
    
    let filtered = [...words];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((word) =>
        word.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply stopwords filter
    const stopwords = get().getActiveStopwords();
    if (stopwords.length > 0) {
      filtered = filtered.filter(
        (word) => !stopwords.includes(word.value.toLowerCase())
      );
    }
    
    // Apply whitelist filter
    const whitelist = get().getActiveWhitelist();
    if (whitelist.length > 0) {
      filtered = filtered.filter((word) =>
        whitelist.includes(word.value.toLowerCase())
      );
    }
    
    // Apply frequency filter and limit to max words
    filtered = filtered
      .filter((word) => word.count >= minFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
    
    // Update filtered words
    set({ filteredWords: filtered });
  },
  
  // Auto-detect stopwords based on word frequencies
  autoDetectStopwords: () => {
    const { words } = get();
    
    if (words.length > 10) {
      // Find common words that likely are stopwords based on frequency analysis
      const totalWords = words.reduce((sum, word) => sum + word.count, 0);
      const averageFrequency = totalWords / words.length;
      
      // Words that appear much more frequently than average might be stopwords
      const potentialStopwords = words
        .filter(
          (word) =>
            word.count > averageFrequency * 3 && // Much more frequent than average
            word.value.length <= 4 && // Short words are often stopwords
            !["name", "year", "data", "info"].includes(word.value.toLowerCase()) // Exclude common meaningful short words
        )
        .map((word) => word.value.toLowerCase());
      
      set({ autoDetectedStopwords: potentialStopwords });
    }
  },
  
  // Get color for a word
  getWordColor: (word) => {
    const { options, wordColors, filteredWords } = get();
    
    // For random colors, ensure consistency by storing in state
    if (options.colorSelection === "random") {
      if (!wordColors[word]) {
        // Create a new colors object to avoid mutating state directly
        const newColors = { ...wordColors };
        newColors[word] = CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)];
        set({ wordColors: newColors });
      }
      return wordColors[word] || "#333333";
    }
    
    // For other color schemes, find the word data to get its count
    const wordData = filteredWords.find(w => w.value === word);
    if (!wordData) return "#333333";
    
    const maxCount = Math.max(...filteredWords.map(w => w.count));
    const ratio = wordData.count / maxCount;
    
    switch (options.colorSelection) {
      case "monochrome":
        return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
      case "category":
        // Use the selected color palette for categorical coloring
        const colorIndex = Math.floor(ratio * CUSTOM_COLORS.length);
        return CUSTOM_COLORS[Math.min(colorIndex, CUSTOM_COLORS.length - 1)];
      default:
        return wordColors[word] || "#333333";
    }
  },
  
  // Fetch word cloud data
  fetchData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Replace with real API endpoint
      const response = await fetch("/data/temp/processed_wordcloud.json");
      
      if (response.status === 503) {
        throw new Error('Data is being processed. Please try again in a moment.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load word cloud data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Set the words data
      set({ 
        words: data.wordCloudData,
        filteredWords: data.wordCloudData,
        isLoading: false
      });
      
      // Auto-detect stopwords after loading data
      setTimeout(() => {
        get().autoDetectStopwords();
        get().filterWords();
      }, 0);
      
    } catch (error: any) {
      console.error('Error fetching word cloud data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      });
    }
  }
})); 