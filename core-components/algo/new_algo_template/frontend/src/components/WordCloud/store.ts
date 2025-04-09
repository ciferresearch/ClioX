import { create } from 'zustand';
import { 
  WordData, 
  WordCloudOptions, 
} from './types';
import { 
  ENGLISH_STOPWORDS, 
  DEFAULT_CUSTOM_STOPWORDS,
  CUSTOM_COLORS
} from './constants';
import { Language } from './useStoplistManager';

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
  isWordSelectionAction: boolean;
  
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
  
  // Stoplist/Whitelist management
  selectedLanguage: Language;
  stoplistActive: boolean;
  whitelistActive: boolean;
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
  
  // Stoplist/Whitelist actions
  setLanguage: (language: Language) => void;
  toggleStoplist: () => void;
  toggleWhitelist: () => void;
  
  // Utility actions
  updateTempOptions: <K extends keyof WordCloudOptions>(key: K, value: WordCloudOptions[K]) => void;
  resetOptionsToDefaults: () => void;
  setStopwordsEditText: (text: string) => void;
  setWhitelistEditText: (text: string) => void;
  filterWords: () => void;
  autoDetectStopwords: () => void;
  getActiveStopwords: () => string[];
  getActiveWhitelist: () => string[];
  getWordColor: (word: string) => string;
  fetchData: () => Promise<void>;
}

// Local storage keys
const STORAGE_KEYS = {
  LANGUAGE: 'wordcloud_language',
  CUSTOM_STOPLIST: 'wordcloud_custom_stoplist',
  STOPLIST_ACTIVE: 'wordcloud_stoplist_active',
  WHITELIST: 'wordcloud_whitelist',
  WHITELIST_ACTIVE: 'wordcloud_whitelist_active',
  MIN_FREQUENCY: 'wordcloud_min_frequency',
  MAX_WORDS: 'wordcloud_max_words',
};

// Helper function to safely parse JSON from localStorage
const safeJsonParse = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) as T : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

// Create the store
export const useWordCloudStore = create<WordCloudStore>((set, get) => ({
  // Initial states
  words: [],
  filteredWords: [],
  isLoading: true,
  error: null,
  
  searchTerm: "",
  minFrequency: typeof window !== 'undefined' ? Number(localStorage.getItem(STORAGE_KEYS.MIN_FREQUENCY) || 0) : 0,
  maxWords: typeof window !== 'undefined' ? Number(localStorage.getItem(STORAGE_KEYS.MAX_WORDS) || 100) : 100,
  dimensions: { width: 800, height: 500 },
  
  selectedWord: null,
  isPanelVisible: false,
  isWordSelectionAction: false,
  
  options: {
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true
  },
  tempOptions: {
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
  
  // Initialize stoplist/whitelist from localStorage
  selectedLanguage: (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language : 'english') || 'english',
  stoplistActive: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.STOPLIST_ACTIVE) !== 'false' : true,
  whitelistActive: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.WHITELIST_ACTIVE) === 'true' : false,
  customStopwords: safeJsonParse<string[]>(STORAGE_KEYS.CUSTOM_STOPLIST, []),
  customWhitelist: safeJsonParse<string[]>(STORAGE_KEYS.WHITELIST, []),
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
      shouldUpdateLayout: true,
      isWordSelectionAction: false // Not a word selection action
    });
    
    // After setting search term, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setMinFrequency: (minFrequency) => {
    set({ 
      minFrequency,
      shouldUpdateLayout: true,
      isWordSelectionAction: false // Not a word selection action
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MIN_FREQUENCY, minFrequency.toString());
    }
    
    // After setting min frequency, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setMaxWords: (maxWords) => {
    set({ 
      maxWords,
      shouldUpdateLayout: true,
      isWordSelectionAction: false // Not a word selection action
    });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MAX_WORDS, maxWords.toString());
    }
    
    // After setting max words, filter words
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  setDimensions: (dimensions) => set({ dimensions }),
  setSelectedWord: (selectedWord) => {
    // When selecting a word or closing panel, mark this as a word selection action
    // This flag helps prevent layout updates during panel interactions
    set({ 
      selectedWord,
      isPanelVisible: selectedWord !== null,
      shouldUpdateLayout: false,
      isWordSelectionAction: true // Always flag this as a word selection action, even when closing panel
    });
  },
  setShouldUpdateLayout: (shouldUpdateLayout) => set({ 
    shouldUpdateLayout,
    isWordSelectionAction: false // Reset word selection flag
  }),
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
    
    // Font family change requires layout update
    const requiresLayoutUpdate = tempOptions.fontFamily !== options.fontFamily;
    
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
        get().filterWords();
      }, 50);
    }
  },
  openStopwordsModal: () => {
    const { customStopwords, selectedLanguage, autoDetectedStopwords } = get();
    
    // Prepare text content for the modal
    let currentText = "";
    
    if (selectedLanguage === 'custom' && customStopwords.length > 0) {
      currentText = customStopwords.join("\n");
    } else if (selectedLanguage === 'english') {
      currentText = ENGLISH_STOPWORDS.join("\n");
    } else if (selectedLanguage === 'auto-detect') {
      currentText = autoDetectedStopwords.join("\n");
    } else {
      // Default example if no specific stopwords are selected
      currentText = [
        "a", "an", "the", "and", "or", "but", "if", "then",
        "else", "when", "to", "at", "in", "on", "by"
      ].join("\n");
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
      
      // Update custom stopwords and change language to custom
      set({
        customStopwords: newStopwords,
        selectedLanguage: 'custom',
        stoplistActive: true,
        shouldUpdateLayout: true,
        isStopwordsModalOpen: false,
        modalsOpen: false
      });
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.CUSTOM_STOPLIST, JSON.stringify(newStopwords));
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'custom');
      localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, 'true');
      
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
      
      // Update whitelist settings
      set({
        customWhitelist: newWhitelist,
        whitelistActive: true,
        shouldUpdateLayout: true,
        isWhitelistModalOpen: false,
        modalsOpen: false
      });
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(newWhitelist));
      localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, 'true');
      
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
  
  // Language selection and toggles for stoplist/whitelist
  setLanguage: (language) => {
    set({
      selectedLanguage: language,
      shouldUpdateLayout: true,
    });
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    
    // Update filters after language change
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  
  toggleStoplist: () => {
    const { stoplistActive } = get();
    const newValue = !stoplistActive;
    
    set({
      stoplistActive: newValue,
      shouldUpdateLayout: true,
    });
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, String(newValue));
    
    // Update filters after toggle
    setTimeout(() => {
      get().filterWords();
    }, 0);
  },
  
  toggleWhitelist: () => {
    const { whitelistActive } = get();
    const newValue = !whitelistActive;
    
    set({
      whitelistActive: newValue,
      shouldUpdateLayout: true,
    });
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, String(newValue));
    
    // Update filters after toggle
    setTimeout(() => {
      get().filterWords();
    }, 0);
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
    const { selectedLanguage, autoDetectedStopwords, customStopwords, stoplistActive } = get();
    
    // If stoplist is not active, return empty list
    if (!stoplistActive) return [];
    
    switch (selectedLanguage) {
      case "auto-detect":
        return autoDetectedStopwords;
      case "english":
        return ENGLISH_STOPWORDS;
      case "custom":
        return customStopwords;
      default:
        // For other languages (like spanish), this would come from an API
        // but for now we'll just return the English list
        return ENGLISH_STOPWORDS;
    }
  },
  
  // Helper function to get active whitelist based on current option
  getActiveWhitelist: (): string[] => {
    const { customWhitelist, whitelistActive } = get();
    
    // If whitelist is not active, return empty list
    if (!whitelistActive) return [];
    
    return customWhitelist;
  },
  
  // Filter words based on current search term, frequency, and options
  filterWords: () => {
    const { 
      words, 
      searchTerm, 
      minFrequency, 
      maxWords,
      modalsOpen,
      isWordSelectionAction // Get the word selection action flag
    } = get();
    
    // Skip filtering if modals are open
    if (modalsOpen) return;
    
    let filtered = [...words];
    
    // Apply search term filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter((word) =>
        word.value.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply stopwords filter using Sets for better performance
    const stopwords = get().getActiveStopwords();
    if (stopwords.length > 0) {
      const stopwordsSet = new Set(stopwords.map(word => word.toLowerCase()));
      filtered = filtered.filter(
        (word) => !stopwordsSet.has(word.value.toLowerCase())
      );
    }
    
    // Apply whitelist filter using Sets for better performance
    const whitelist = get().getActiveWhitelist();
    if (whitelist.length > 0) {
      const whitelistSet = new Set(whitelist.map(word => word.toLowerCase()));
      filtered = filtered.filter((word) =>
        whitelistSet.has(word.value.toLowerCase())
      );
    }
    
    // Apply frequency filter and limit to max words
    filtered = filtered
      .filter((word) => word.count >= minFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
    
    // Calculate if layout update is needed
    // If this was a word selection action, we want to avoid layout updates
    // except for transitions between having words and not having words
    const hadWords = get().filteredWords.length > 0;
    const hasWords = filtered.length > 0;
    
    // Force update only when transitioning between having/not having words
    // AND it's not a word selection action
    const needsForceUpdate = (hadWords !== hasWords) && !isWordSelectionAction;
    
    set({ 
      filteredWords: filtered,
      // Only update layout if needed and not a word selection action
      shouldUpdateLayout: isWordSelectionAction ? false : 
                          needsForceUpdate ? true : get().shouldUpdateLayout
    });
  },
  
  // Auto-detect stopwords based on word frequencies
  autoDetectStopwords: () => {
    const { words } = get();
    
    if (words.length > 10) {
      // Find common words that likely are stopwords based on frequency analysis
      const totalWords = words.reduce((sum, word) => sum + word.count, 0);
      const averageFrequency = totalWords / words.length;
      
      const excludedWords = ["name", "year", "data", "info"];
      
      // Words that appear much more frequently than average might be stopwords
      const potentialStopwords = words
        .filter(
          (word) =>
            word.count > averageFrequency * 3 && // Much more frequent than average
            word.value.length <= 4 && // Short words are often stopwords
            !excludedWords.includes(word.value.toLowerCase()) // Exclude common meaningful short words
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
      case "category": {
        // Use the selected color palette for categorical coloring
        const colorIndex = Math.floor(ratio * CUSTOM_COLORS.length);
        return CUSTOM_COLORS[Math.min(colorIndex, CUSTOM_COLORS.length - 1)];
      }
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
      
      // Calculate the minimum frequency in the dataset
      const minCount = Math.min(...data.wordCloudData.map((w: WordData) => w.count));
      
      // Get current min frequency
      const { minFrequency } = get();
      
      // If minFrequency is 0, set it to the minimum value from the dataset
      const newMinFrequency = minFrequency === 0 ? minCount : minFrequency;
      
      // Set the words data and update minimum frequency if needed
      set({ 
        words: data.wordCloudData,
        filteredWords: data.wordCloudData,
        minFrequency: newMinFrequency,
        isLoading: false
      });
      
      // Save min frequency to localStorage if it was updated
      if (newMinFrequency !== minFrequency && typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MIN_FREQUENCY, newMinFrequency.toString());
      }
      
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