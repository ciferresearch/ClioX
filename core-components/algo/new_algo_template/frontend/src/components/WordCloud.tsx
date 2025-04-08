"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import debounce from "lodash/debounce";

interface WordData {
  value: string;
  count: number;
}

interface CloudWord {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
  originalData?: WordData;
}

interface Word {
  text: string;
  size: number;
  originalData?: WordData;
}

const TRANSITION_DURATION = 750;
const DEBOUNCE_DELAY = 300;

// Available options for the settings panel
const STOPWORDS_OPTIONS = ["Auto-detect", "None", "English", "Custom"];
const WHITELIST_OPTIONS = ["None", "Custom"];
const FONT_FAMILIES = [
  "Palatino",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
];

// English stopwords list
const ENGLISH_STOPWORDS = [
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "don",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "now",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "s",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "t",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
];

// Custom stopwords (can be edited by user)
const DEFAULT_CUSTOM_STOPWORDS: string[] = [];

const WordCloud = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [words, setWords] = useState<WordData[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const selectedWordRef = useRef<WordData | null>(null);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxWords, setMaxWords] = useState(100);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const previousWordsRef = useRef<CloudWord[]>([]);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const isPanelVisibleRef = useRef(false);
  const windowDimensionsRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Modal state ref to prevent layout recalculation on modal open/close
  const modalsOpenRef = useRef(false);

  // Flag to trigger intentional updates only when options truly change
  const shouldUpdateLayoutRef = useRef(false);

  // Options panel state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [stopwordsOption, setStopwordsOption] = useState("Auto-detect");
  const [whitelistOption, setWhitelistOption] = useState("None");
  const [fontFamily, setFontFamily] = useState("Palatino");
  const [colorSelection, setColorSelection] = useState("random");
  const [applyGlobally, setApplyGlobally] = useState(true);

  // Temp options state to track changes
  const [tempOptions, setTempOptions] = useState({
    stopwordsOption: "Auto-detect",
    whitelistOption: "None",
    fontFamily: "Palatino",
    colorSelection: "random",
    applyGlobally: true,
  });

  // List edit modal states
  const [isStopwordsModalOpen, setIsStopwordsModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [stopwordsEditText, setStopwordsEditText] = useState("");
  const [whitelistEditText, setWhitelistEditText] = useState("");
  const [originalStopwordsText, setOriginalStopwordsText] = useState("");
  const [originalWhitelistText, setOriginalWhitelistText] = useState("");

  // Custom lists
  const [customStopwords, setCustomStopwords] = useState<string[]>(
    DEFAULT_CUSTOM_STOPWORDS
  );
  const [customWhitelist, setCustomWhitelist] = useState<string[]>([]);
  const [autoDetectedStopwords, setAutoDetectedStopwords] = useState<string[]>(
    []
  );

  // Store dimensions in a ref to avoid unnecessary rerenders
  const dimensionsRef = useRef({
    width: dimensions.width,
    height: dimensions.height,
    lastUpdate: 0,
  });

  // Color schemes
  const customColors = [
    "#ff6b6b",
    "#4ecdc4",
    "#1a535c",
    "#ffe66d",
    "#ff9f1c",
    "#6a0572",
    "#ab83a1",
    "#1a936f",
    "#114b5f",
    "#88d498",
  ];

  // Use a ref to store random color assignments for consistency
  const wordColorsRef = useRef<Record<string, string>>({});

  // Helper function to get active stopwords based on current option
  const getActiveStopwords = useCallback((): string[] => {
    switch (stopwordsOption) {
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
  }, [stopwordsOption, autoDetectedStopwords, customStopwords]);

  // Helper function to get active whitelist based on current option
  const getActiveWhitelist = useCallback((): string[] => {
    switch (whitelistOption) {
      case "Custom":
        return customWhitelist;
      case "None":
      default:
        return [];
    }
  }, [whitelistOption, customWhitelist]);

  // Auto-detect stopwords based on word frequencies
  useEffect(() => {
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

      setAutoDetectedStopwords(potentialStopwords);
    }
  }, [words]);

  // Filter words
  useEffect(() => {
    // Skip filtering if modals are open
    if (modalsOpenRef.current) return;

    let filtered = [...words];

    if (searchTerm) {
      filtered = filtered.filter((word) =>
        word.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stopwords filter
    const stopwords = getActiveStopwords();
    if (stopwords.length > 0) {
      filtered = filtered.filter(
        (word) => !stopwords.includes(word.value.toLowerCase())
      );
    }

    // Apply whitelist filter
    const whitelist = getActiveWhitelist();
    if (whitelist.length > 0) {
      filtered = filtered.filter((word) =>
        whitelist.includes(word.value.toLowerCase())
      );
    }

    filtered = filtered
      .filter((word) => word.count >= minFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);

    setFilteredWords(filtered);
  }, [
    words,
    searchTerm,
    minFrequency,
    maxWords,
    getActiveStopwords,
    getActiveWhitelist,
  ]);

  const getWordColor = useCallback(
    (d: CloudWord) => {
      // For random colors, ensure consistency by storing in ref
      if (colorSelection === "random") {
        if (!wordColorsRef.current[d.text]) {
          wordColorsRef.current[d.text] =
            customColors[Math.floor(Math.random() * customColors.length)];
        }
        return wordColorsRef.current[d.text];
      }

      const maxCount = Math.max(...filteredWords.map((w) => w.count));
      const ratio = (d.originalData?.count || 0) / maxCount;

      switch (colorSelection) {
        case "monochrome":
          return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
        case "category":
          // Use the selected color palette for categorical coloring
          const colorIndex = Math.floor(ratio * customColors.length);
          return customColors[Math.min(colorIndex, customColors.length - 1)];
        default:
          return wordColorsRef.current[d.text] || "#333333";
      }
    },
    [colorSelection, filteredWords, customColors]
  );

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/temp/processed_wordcloud.json");
        const data = await response.json();
        setWords(data.wordCloudData);
        setFilteredWords(data.wordCloudData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching word cloud data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create word cloud layout
  const createWordCloudLayout = useCallback(
    (words: WordData[]): Promise<CloudWord[]> => {
      return new Promise((resolve) => {
        const fontScale = d3
          .scaleLog()
          .domain([
            Math.min(...words.map((w) => w.count)),
            Math.max(...words.map((w) => w.count)),
          ])
          .range([12, 50]);

        const layout = cloud<Word>()
          .size([dimensions.width, dimensions.height])
          .words(
            words.map((w) => ({
              text: w.value,
              size: fontScale(w.count),
              originalData: w,
            }))
          )
          .padding(3)
          .rotate((d: Word) => {
            // Only use 90-degree multiples for rotation (0, 90, 270)
            // Long words (more than 5 characters) always display horizontally (0 degrees)
            if (d.text.length > 5) return 0;

            // For short words, randomly select one of the 90-degree multiples
            const rotations = [0, 90, 270];
            return rotations[Math.floor(Math.random() * rotations.length)];
          })
          .font(fontFamily) // Use selected font family
          .fontSize((d: Word) => d.size);

        layout.on("end", resolve);
        layout.start();
      });
    },
    [dimensions, fontFamily]
  );

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (words: WordData[]) => {
      if (!svgRef.current) return;

      // Don't update if we're not visible
      if (svgRef.current.closest("div")?.offsetParent === null) return;

      // Skip updates if modals are open, except when called directly from save handlers
      // which explicitly set modalsOpenRef.current = false before calling this
      if (modalsOpenRef.current) {
        console.log("Skipping update because modals are open");
        return;
      }

      // If panel just opened/closed, don't do a full relayout
      // This is critical to prevent relayout when details panel appears
      // Use refs instead of state to ensure we have the most up-to-date values
      if (!shouldUpdateLayoutRef.current && selectedWordRef.current !== null) {
        console.log("Panel visibility change detected, skipping layout update");

        // Just update colors without relayout
        const svg = d3.select(svgRef.current);
        const wordsContainer = svg.select(".words-container");
        if (!wordsContainer.empty()) {
          const wordsGroup = wordsContainer.select(".words-group");
          if (!wordsGroup.empty()) {
            // Update colors for existing words without changing positions
            wordsGroup
              .selectAll<SVGTextElement, CloudWord>("text")
              .style("fill", getWordColor)
              .style("font-family", fontFamily);
          }
        }
        return;
      }

      setIsUpdating(true);
      const cloudWords = await createWordCloudLayout(words);
      const svg = d3.select(svgRef.current);

      // Update words group - need to access words-group inside words-container
      const wordsContainer = svg.select(".words-container");
      if (wordsContainer.empty()) return;

      const wordsGroup = wordsContainer.select(".words-group");
      if (wordsGroup.empty()) return;

      // Update existing words and add new ones
      const wordElements = wordsGroup
        .selectAll<SVGTextElement, CloudWord>("text")
        .data(cloudWords, (d) => d.text);

      // Remove words that are no longer present with fade out
      wordElements
        .exit()
        .transition()
        .duration(TRANSITION_DURATION / 2)
        .style("opacity", 0)
        .remove();

      // Add new words
      const enterWords = wordElements
        .enter()
        .append("text")
        .style("opacity", 0)
        .style("font-family", fontFamily) // Use selected font family
        .style("cursor", "pointer")
        .attr("text-anchor", "middle")
        .text((d) => d.text)
        .attr("class", "cloud-word"); // Add class for styling

      // Single transition for all words
      wordElements
        .merge(enterWords)
        .style("fill", getWordColor)
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", 1)
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", fontFamily) // Update font family for existing words
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
        );

      // Add interaction handlers
      wordElements
        .merge(enterWords)
        .on("click", (event, d) => {
          if (d.originalData) {
            handleWordSelect(d.originalData);
          }
        })
        .on("mouseover", function () {
          d3.select(this).transition().duration(200).style("opacity", 0.7);
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).style("opacity", 1);
        });

      // Ensure words are centered in the SVG
      const svgWidth = parseInt(svg.style("width"));
      const svgHeight = parseInt(svg.style("height"));
      wordsGroup.attr(
        "transform",
        `translate(${svgWidth / 2},${svgHeight / 2})`
      );

      setIsUpdating(false);

      // Reset zoom to identity transform
      if (zoomRef.current && typeof window !== "undefined") {
        // Small delay to ensure words are properly positioned
        setTimeout(() => {
          svg.call(zoomRef.current!.transform, d3.zoomIdentity);
        }, 100);
      }
    }, DEBOUNCE_DELAY),
    [createWordCloudLayout, getWordColor, fontFamily] // Remove isPanelVisible from dependencies
  );

  // Force initial render after data is loaded
  useEffect(() => {
    // Only execute this when loading completes and we have data
    if (!isLoading && filteredWords.length > 0 && svgRef.current) {
      console.log("Triggering initial word cloud render");
      shouldUpdateLayoutRef.current = true;

      // Give time for the SVG to initialize
      const timer = setTimeout(() => {
        debouncedUpdate(filteredWords);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, filteredWords, debouncedUpdate]);

  /*
   * WORD CLOUD LAYOUT UPDATE RULES
   *
   * The word cloud should update its layout (re-generate the cloud) ONLY in these cases:
   * 1. Initial render after data is loaded (handled by the useEffect above)
   * 2. When filter settings change (minFrequency, maxWords, search term)
   * 3. When style settings change (font family, color scheme)
   * 4. When stopwords or whitelist settings change
   * 5. When window size changes significantly (not due to panel visibility changes)
   *
   * The word cloud should NOT update its layout in these cases:
   * 1. When the details panel opens or closes
   * 2. When a word is selected or deselected
   * 3. When any modal dialog opens or closes
   * 4. During small resize events that don't significantly change the container
   * 5. When window resize is caused by the details panel appearing/disappearing
   *
   * These rules are enforced using:
   * - shouldUpdateLayoutRef.current flag to explicitly control updates
   * - Detecting panel visibility changes in resize handler
   * - Skip updates when selectedWordRef.current is not null
   * - Skipping updates when modalsOpenRef.current is true
   */

  // Update word cloud when filtered words change or control settings change
  useEffect(() => {
    // Skip updates while loading
    if (isLoading || filteredWords.length === 0) {
      return;
    }

    // Skip updates if any modal is open
    if (modalsOpenRef.current) {
      return;
    }

    // Always update on slider changes (frequency and max words) or search term changes
    const isSliderChange = shouldUpdateLayoutRef.current === true;

    // Skip updates when panel visibility changes or a word is selected/deselected
    // This covers both panel opening and closing cases
    // BUT don't skip if it's a slider change (which should always update)
    if (
      (selectedWordRef.current !== null || !shouldUpdateLayoutRef.current) &&
      !isSliderChange
    ) {
      console.log(
        "Skipping layout update due to panel change or word selection"
      );
      return;
    }

    // Only perform update if this is an intentional update or not modal-related
    if (
      shouldUpdateLayoutRef.current ||
      (!isOptionsModalOpen && !isStopwordsModalOpen && !isWhitelistModalOpen)
    ) {
      console.log(
        "Updating layout because of intentional change or control setting change"
      );
      shouldUpdateLayoutRef.current = false;
      debouncedUpdate(filteredWords);
    }
  }, [
    filteredWords,
    isLoading,
    debouncedUpdate,
    isOptionsModalOpen,
    isStopwordsModalOpen,
    isWhitelistModalOpen,
    minFrequency,
    maxWords,
    searchTerm,
  ]);

  // Initialize client-side only variables
  useEffect(() => {
    // Set window dimensions on client side
    windowDimensionsRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    dimensionsRef.current = {
      width: dimensions.width,
      height: dimensions.height,
      lastUpdate: Date.now(),
    };
  }, [dimensions]);

  // Update dimensions only when window size changes
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

      // Only update dimensions if:
      // 1. They actually changed significantly
      // 2. It's been at least 300ms since the last update
      const now = Date.now();
      const significant =
        Math.abs(newWidth - dimensionsRef.current.width) > 5 ||
        Math.abs(newHeight - dimensionsRef.current.height) > 5;
      const timeElapsed = now - dimensionsRef.current.lastUpdate > 300;

      if (significant && timeElapsed) {
        // If this resize is due to a panel open/close, don't trigger a relayout
        const isDetailsPanelToggle =
          Math.abs(newWidth - dimensionsRef.current.width) < 300 &&
          Math.abs(newHeight - dimensionsRef.current.height) < 10 &&
          isPanelVisibleRef.current !==
            dimensionsRef.current.width < containerWidth - 200;

        dimensionsRef.current = {
          width: newWidth,
          height: newHeight,
          lastUpdate: now,
        };

        // Ensure we NEVER update layout when panel is closing
        if (!isPanelVisibleRef.current && selectedWordRef.current === null) {
          shouldUpdateLayoutRef.current = false;
        } else {
          // Otherwise use the toggle detection logic
          shouldUpdateLayoutRef.current = !isDetailsPanelToggle;
        }

        setDimensions({
          width: newWidth,
          height: newHeight,
        });
      }
    }, 250);

    // Only add resize listener on client side
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty dependency array - only run on mount

  // Initialize SVG with responsive container - only run on mount or when dimensions actually change
  const svgInitializedRef = useRef(false);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Avoid repeated initialization of SVG structure when not needed
    if (
      svgInitializedRef.current &&
      // Only reinitialize if dimensions actually changed significantly
      Math.abs(dimensions.width - svgRef.current.width.baseVal.value) < 5 &&
      Math.abs(dimensions.height - svgRef.current.height.baseVal.value) < 5
    ) {
      return;
    }

    svgInitializedRef.current = true;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add gradient background
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "cloud-background")
      .attr("gradientTransform", "rotate(45)");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f8f9fa");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#e9ecef");

    // Add background rect
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#cloud-background)")
      .attr("class", "zoom-background"); // Add class for zoom target

    // Add group for words with responsive centering - using g.words-container > g.words-group structure
    // Container handles zoom transform, words-group handles initial centering
    const wordsContainer = svg.append("g").attr("class", "words-container");

    const wordsGroup = wordsContainer.append("g").attr("class", "words-group");

    // Calculate initial transform to center
    const width = parseInt(svg.style("width"));
    const height = parseInt(svg.style("height"));

    // Set initial translation for words group to center of svg
    wordsGroup.attr("transform", `translate(${width / 2},${height / 2})`);

    // Add zoom behavior
    if (typeof window !== "undefined") {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 5]) // Allow more zoom range: 0.3x to 5x
        .on("zoom", (event) => {
          wordsContainer.attr("transform", event.transform);

          // Update cursor based on scale
          if (event.transform.k > 1.5) {
            svg.style("cursor", "move");
          } else {
            svg.style("cursor", "grab");
          }
        });

      // Store zoom behavior in ref for external control
      zoomRef.current = zoom;

      // Add zoom behavior to SVG
      svg
        .call(zoom)
        .on("dblclick.zoom", null) // Disable double-click zoom
        .style("cursor", "grab")
        .on("mousedown", function () {
          d3.select(this).style("cursor", "grabbing");
        })
        .on("mouseup", function () {
          d3.select(this).style("cursor", "grab");
        });

      // Add zoom controls with tooltips for better UX
      const zoomControls = svg
        .append("g")
        .attr("class", "zoom-controls")
        .attr("transform", `translate(20, ${height - 130})`); // Moved up for more bottom margin

      // Add transparent background to controls with shadow effect - more transparent
      zoomControls
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 40)
        .attr("height", 120) // Adjusted height for better spacing
        .attr("rx", 6)
        .attr("fill", "rgba(255, 255, 255, 0.7)") // More transparent
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.15))"); // Lighter shadow

      // Helper function for button hover effect
      const setupButtonHover = (
        button: d3.Selection<SVGCircleElement, unknown, null, undefined>
      ) => {
        button
          .on("mouseover", function () {
            d3.select(this)
              .transition()
              .duration(150)
              .attr("stroke", "#666")
              .attr("fill", "#f8f8f8");
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke", "#aaa")
              .attr("fill", "#ffffff80"); // Semi-transparent white
          })
          .on("mousedown", function () {
            d3.select(this).attr("fill", "#e8e8e8");
          })
          .on("mouseup", function () {
            d3.select(this).attr("fill", "#f8f8f8");
          });
      };

      // Calculate even spacing between buttons
      const buttonSpacing = 35; // Increased spacing
      const topPadding = 25; // Padding from top of panel

      // Zoom in button (top)
      const zoomInButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding)
        .attr("r", 14)
        .attr("fill", "#ffffff80") // Semi-transparent white
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("cursor", "pointer")
        .attr("title", "Zoom In")
        .on("click", () => {
          if (zoomRef.current) {
            svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
          }
        });

      setupButtonHover(zoomInButton);

      // Ensure "+" is perfectly centered by using a viewport
      const plusIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding})`) // Centered
        .attr("pointer-events", "none");

      plusIcon
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central") // This properly centers text vertically
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "#555")
        .text("+");

      // Zoom out button (middle)
      const zoomOutButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding + buttonSpacing)
        .attr("r", 14)
        .attr("fill", "#ffffff80") // Semi-transparent white
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("cursor", "pointer")
        .attr("title", "Zoom Out")
        .on("click", () => {
          if (zoomRef.current) {
            svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
          }
        });

      setupButtonHover(zoomOutButton);

      // Ensure "-" is perfectly centered by using a viewport
      const minusIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding + buttonSpacing})`) // Centered
        .attr("pointer-events", "none");

      minusIcon
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central") // This properly centers text vertically
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#555")
        .text("−");

      // Reset zoom button (bottom) with home icon
      const resetButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding + buttonSpacing * 2)
        .attr("r", 14)
        .attr("fill", "#ffffff80") // Semi-transparent white
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("cursor", "pointer")
        .attr("title", "Reset View")
        .on("click", () => {
          if (zoomRef.current) {
            // Reset to identity transform
            svg
              .transition()
              .duration(300)
              .call(zoomRef.current.transform, d3.zoomIdentity);
          }
        });

      setupButtonHover(resetButton);

      // Home icon (simplified) for reset - improved centering
      const resetIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding + buttonSpacing * 2})`) // Centered
        .attr("pointer-events", "none");

      // Draw a simple house shape - centered
      resetIcon
        .append("path")
        .attr("d", "M-6,-4 L0,-8 L6,-4 L6,4 L2,4 L2,0 L-2,0 L-2,4 L-6,4 Z")
        .attr("fill", "#555")
        .attr("stroke", "#555")
        .attr("stroke-width", 0.5);
    }

    // Add resize observer for responsive centering
    const resizeObserver = new ResizeObserver(() => {
      // Update the words group transform for centering
      const svgWidth = parseInt(svg.style("width"));
      const svgHeight = parseInt(svg.style("height"));
      wordsGroup.attr(
        "transform",
        `translate(${svgWidth / 2},${svgHeight / 2})`
      );

      // Update zoom controls position to stay at left bottom with the adjusted margin
      svg
        .select(".zoom-controls")
        .attr("transform", `translate(20, ${svgHeight - 130})`);
    });

    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [dimensions]);

  // Add a function to reset zoom when search/filter changes
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
    if (zoomRef.current && svgRef.current && typeof window !== "undefined") {
      // Reset to identity transform (no translation/scaling)
      const svg = d3.select(svgRef.current);

      // Small delay to ensure words are rendered before transform
      setTimeout(() => {
        svg
          .transition()
          .duration(300)
          .call(zoomRef.current!.transform, d3.zoomIdentity);
      }, 50);
    }
  }, [filteredWords, minFrequency, maxWords, searchTerm]);

  const minCount =
    words.length > 0 ? Math.min(...words.map((w) => w.count)) : 0;
  const maxCount =
    words.length > 0 ? Math.max(...words.map((w) => w.count)) : 100;

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
      // This ensures the isPanelVisible state is updated before any SVG updates
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

  // Handle opening the options modal
  const handleOpenOptions = () => {
    // Store current settings to temp state
    setTempOptions({
      stopwordsOption,
      whitelistOption,
      fontFamily,
      colorSelection,
      applyGlobally,
    });
    setIsOptionsModalOpen(true);
  };

  // Handle closing the options modal without saving
  const handleCloseOptions = () => {
    // Revert to previous settings
    setStopwordsOption(tempOptions.stopwordsOption);
    setWhitelistOption(tempOptions.whitelistOption);
    setFontFamily(tempOptions.fontFamily);
    setColorSelection(tempOptions.colorSelection);
    setApplyGlobally(tempOptions.applyGlobally);
    setIsOptionsModalOpen(false);
  };

  // Handle saving options
  const handleSaveOptions = () => {
    const optionsChanged =
      tempOptions.stopwordsOption !== stopwordsOption ||
      tempOptions.whitelistOption !== whitelistOption ||
      tempOptions.fontFamily !== fontFamily ||
      tempOptions.colorSelection !== colorSelection ||
      tempOptions.applyGlobally !== applyGlobally;

    // Font family change requires a layout update
    // Stopwords/whitelist changes also require layout update
    const requiresLayoutUpdate =
      tempOptions.fontFamily !== fontFamily ||
      tempOptions.stopwordsOption !== stopwordsOption ||
      tempOptions.whitelistOption !== whitelistOption;

    shouldUpdateLayoutRef.current = requiresLayoutUpdate;

    // Save current search term if we changed filter options
    const currentSearchTerm = searchTerm;
    const stopwordsChanged = tempOptions.stopwordsOption !== stopwordsOption;
    const whitelistChanged = tempOptions.whitelistOption !== whitelistOption;

    // Apply the new settings
    setStopwordsOption(tempOptions.stopwordsOption);
    setWhitelistOption(tempOptions.whitelistOption);
    setFontFamily(tempOptions.fontFamily);
    setColorSelection(tempOptions.colorSelection);
    setApplyGlobally(tempOptions.applyGlobally);

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
          // Always update regardless of layout flag - the debounced update will
          // decide whether to relayout or just recolor based on shouldUpdateLayoutRef
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
      // Show the actual English stopwords instead of just a sample
      if (stopwordsOption === "English") {
        currentText = ENGLISH_STOPWORDS.join("\n");
      } else if (stopwordsOption === "Auto-detect") {
        currentText = autoDetectedStopwords.join("\n");
      } else {
        // Default example if no specific stopwords are selected
        currentText = [
          "a",
          "an",
          "the",
          "and",
          "or",
          "but",
          "if",
          "then",
          "else",
          "when",
          "to",
          "at",
          "in",
          "on",
          "by",
          "for",
          "with",
          "about",
          "against",
          "between",
          "into",
          "through",
          "during",
          "before",
          "after",
          "above",
          "below",
          "from",
          "up",
          "down",
          "of",
          "off",
          "over",
          "under",
          "again",
          "further",
          "then",
          "once",
          "here",
          "there",
          "all",
          "any",
          "both",
          "each",
          "few",
          "more",
          "most",
          "other",
          "some",
          "such",
          "no",
          "nor",
          "not",
          "only",
          "own",
          "same",
          "so",
          "than",
          "too",
          "very",
          "can",
          "will",
          "just",
          "should",
          "now",
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
      setStopwordsOption("Custom"); // Switch to custom mode

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

  // Handle closing stopwords modal without saving
  const handleCloseStopwordsModal = () => {
    setIsStopwordsModalOpen(false);
  };

  // Handle opening the whitelist edit modal
  const handleOpenWhitelistModal = () => {
    // Show some example entries if whitelist is empty
    let currentText = "";
    if (customWhitelist.length === 0) {
      // Example whitelist terms
      currentText = ["important", "keyword", "significant", "relevant"].join(
        "\n"
      );
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
      setWhitelistOption("Custom"); // Switch to custom mode

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

  // Handle closing whitelist modal without saving
  const handleCloseWhitelistModal = () => {
    setIsWhitelistModalOpen(false);
  };

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

  // Options Modal Component
  const OptionsModal = () => {
    if (!isOptionsModalOpen) return null;

    // Determine if the modal should be blurred (when stoplist/whitelist modal is open)
    const shouldBlur = isStopwordsModalOpen || isWhitelistModalOpen;

    return (
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-xs flex items-center justify-center z-50">
        <div
          className={`bg-white rounded shadow-lg w-[500px] transition-all duration-200 ${
            shouldBlur ? "filter blur-xs" : ""
          }`}
        >
          <div className="border-b p-4 bg-gray-50">
            <h3 className="text-xl font-medium">Options</h3>
            <button
              onClick={handleCloseOptions}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Stopwords */}
            <div className="flex items-center">
              <label className="text-gray-700 w-36 text-right pr-4">
                Stopwords:
              </label>
              <div className="flex-1">
                <select
                  value={stopwordsOption}
                  onChange={(e) => {
                    // Update tempOptions to track the change
                    setTempOptions({
                      ...tempOptions,
                      stopwordsOption: e.target.value,
                    });
                    // This requires layout update
                    shouldUpdateLayoutRef.current = true;
                    setStopwordsOption(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {STOPWORDS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="ml-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                onClick={handleOpenStopwordsModal}
              >
                Edit List
              </button>
            </div>

            {/* White List */}
            <div className="flex items-center">
              <label className="text-gray-700 w-36 text-right pr-4">
                White List:
              </label>
              <div className="flex-1">
                <select
                  value={whitelistOption}
                  onChange={(e) => {
                    // Update tempOptions to track the change
                    setTempOptions({
                      ...tempOptions,
                      whitelistOption: e.target.value,
                    });
                    // This requires layout update
                    shouldUpdateLayoutRef.current = true;
                    setWhitelistOption(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {WHITELIST_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="ml-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50"
                onClick={handleOpenWhitelistModal}
              >
                Edit List
              </button>
            </div>

            {/* Font Family */}
            <div className="flex items-center">
              <label className="text-gray-700 w-36 text-right pr-4">
                Font family:
              </label>
              <div className="flex-1">
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    // Update tempOptions to track the change
                    setTempOptions({
                      ...tempOptions,
                      fontFamily: e.target.value,
                    });
                    // Font change requires layout update
                    shouldUpdateLayoutRef.current = true;
                    setFontFamily(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="flex items-center">
              <label className="text-gray-700 w-36 text-right pr-4">
                Color scheme:
              </label>
              <div className="flex-1">
                <select
                  value={colorSelection}
                  onChange={(e) => {
                    // Update tempOptions to track the change
                    setTempOptions({
                      ...tempOptions,
                      colorSelection: e.target.value,
                    });
                    // Color scheme change doesn't need layout update, just style update
                    shouldUpdateLayoutRef.current = false;
                    setColorSelection(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="random">Colorful (Random)</option>
                  <option value="monochrome">Monochrome (Blue)</option>
                  <option value="category">Categorical (by frequency)</option>
                </select>
              </div>
            </div>

            {/* Apply Globally */}
            <div className="flex items-center justify-end mt-6 mb-2 pr-2">
              <input
                type="checkbox"
                id="applyGlobally"
                checked={applyGlobally}
                onChange={(e) => {
                  // Update tempOptions to track the change
                  setTempOptions({
                    ...tempOptions,
                    applyGlobally: e.target.checked,
                  });
                  setApplyGlobally(e.target.checked);
                }}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="applyGlobally" className="text-gray-700">
                apply globally
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                // Reset to defaults
                setStopwordsOption("Auto-detect");
                setWhitelistOption("None");
                setFontFamily("Palatino");
                setColorSelection("random");
                setApplyGlobally(true);
              }}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleCloseOptions}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOptions}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit List Modal Component
  const ListEditModal = ({
    isOpen,
    onClose,
    title,
    value,
    onChange,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
  }) => {
    if (!isOpen) return null;

    const isStoplist =
      title.includes("Stopwords") || title.includes("Stoplist");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Prevent event propagation to parent elements
    const handleContentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    // Update onChange handler to sync textarea content with state
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    // Handle save - directly use the value from state
    const handleSaveClick = () => {
      onSave();
    };

    // Focus textarea when modal opens and position cursor at end
    useEffect(() => {
      if (isOpen && textareaRef.current) {
        // Set focus
        textareaRef.current.focus();

        // Position cursor at the end
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, [isOpen]);

    // Count words from value (not from local state)
    const wordCount = value
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    return (
      <div
        className="fixed inset-0 bg-opacity-20 backdrop-blur-xs flex items-center justify-center z-[60]"
        onClick={onClose}
      >
        <div
          className="bg-white rounded shadow-xl max-w-[400px] w-full"
          onClick={handleContentClick}
        >
          <div className="border-b p-3 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-4">
            {isStoplist && (
              <div className="flex items-center mb-2">
                <div className="mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  This is the stoplist, one term per line.
                </p>
              </div>
            )}
            {!isStoplist && (
              <p className="text-xs text-gray-600 mb-2">
                Enter one word per line. All entries will be converted to
                lowercase.
              </p>
            )}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextChange}
                placeholder="Enter one word per line"
                className="w-full h-48 border border-gray-300 rounded p-2 font-mono text-sm resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {wordCount} words
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-3 border-t">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
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
          {(isLoading || isUpdating) && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-500">
                  {isLoading ? "Loading..." : "Updating..."}
                </span>
              </div>
            </div>
          )}
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
          <div className="w-full md:w-64 bg-gray-50 rounded p-4 border-l border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedWord.value}</h3>
              <button
                onClick={handlePanelClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Frequency:</span>
                <span className="ml-2 font-medium">{selectedWord.count}</span>
              </div>

              <div>
                <span className="text-gray-600">Relative Frequency:</span>
                <span className="ml-2 font-medium">
                  {((selectedWord.count / maxCount) * 100).toFixed(2)}%
                </span>
              </div>

              <div>
                <span className="text-gray-600">Rank:</span>
                <span className="ml-2 font-medium">
                  {words
                    .sort((a, b) => b.count - a.count)
                    .findIndex((w) => w.value === selectedWord.value) + 1}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Set flag to force update layout on filter change
                    shouldUpdateLayoutRef.current = true;
                    setSearchTerm(selectedWord.value);
                    // Close the panel since we're now filtering to this word
                    handlePanelClose();
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                >
                  Filter to this word
                </button>
              </div>
            </div>
          </div>
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
      <OptionsModal />

      {/* Stopwords Edit Modal */}
      <ListEditModal
        isOpen={isStopwordsModalOpen}
        onClose={handleCloseStopwordsModal}
        title="Edit Stoplist"
        value={stopwordsEditText}
        onChange={setStopwordsEditText}
        onSave={handleSaveStopwords}
      />

      {/* Whitelist Edit Modal */}
      <ListEditModal
        isOpen={isWhitelistModalOpen}
        onClose={handleCloseWhitelistModal}
        title="Edit Whitelist"
        value={whitelistEditText}
        onChange={setWhitelistEditText}
        onSave={handleSaveWhitelist}
      />
    </div>
  );
};

export default WordCloud;
