import { useEffect, useRef, useCallback, MutableRefObject, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import debounce from 'lodash/debounce';
import { WordData, CloudWord, Word, Dimensions, ColorScheme } from './types';
import { TRANSITION_DURATION, DEBOUNCE_DELAY, CUSTOM_COLORS } from './constants';

interface UseWordCloudVisualizationProps {
  svgRef: MutableRefObject<SVGSVGElement | null>;
  words: WordData[];
  dimensions: Dimensions;
  fontFamily: string;
  colorSelection: ColorScheme;
  isLoading: boolean;
  selectedWordRef: MutableRefObject<WordData | null>;
  isPanelVisibleRef: MutableRefObject<boolean>;
  shouldUpdateLayoutRef: MutableRefObject<boolean>;
  modalsOpenRef: MutableRefObject<boolean>;
  isWordSelectionActionRef: MutableRefObject<boolean>;
  onWordSelect: (word: WordData) => void;
}

export const useWordCloudVisualization = ({
  svgRef,
  words,
  dimensions,
  fontFamily,
  colorSelection,
  isLoading,
  selectedWordRef,
  isPanelVisibleRef,
  shouldUpdateLayoutRef,
  modalsOpenRef,
  isWordSelectionActionRef,
  onWordSelect,
}: UseWordCloudVisualizationProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const wordColorsRef = useRef<Record<string, string>>({});
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgInitializedRef = useRef(false);
  const previousWordsRef = useRef<CloudWord[]>([]);
  const dimensionsRef = useRef({
    width: dimensions.width,
    height: dimensions.height,
    lastUpdate: 0,
  });

  // Get color for a word
  const getWordColor = useCallback(
    (d: CloudWord) => {
      // For random colors, ensure consistency by storing in ref
      if (colorSelection === "random") {
        if (!wordColorsRef.current[d.text]) {
          wordColorsRef.current[d.text] =
            CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)];
        }
        return wordColorsRef.current[d.text];
      }

      const maxCount = Math.max(...words.map((w) => w.count));
      const ratio = (d.originalData?.count || 0) / maxCount;

      switch (colorSelection) {
        case "monochrome":
          return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
        case "category":
          // Use the selected color palette for categorical coloring
          const colorIndex = Math.floor(ratio * CUSTOM_COLORS.length);
          return CUSTOM_COLORS[Math.min(colorIndex, CUSTOM_COLORS.length - 1)];
        default:
          return wordColorsRef.current[d.text] || "#333333";
      }
    },
    [colorSelection, words]
  );

  // Create word cloud layout
  const createWordCloudLayout = useCallback(
    (words: WordData[]): Promise<CloudWord[]> => {
      return new Promise((resolve) => {
        // Make sure we have valid dimensions before creating layout
        const width = dimensions?.width || 500;
        const height = dimensions?.height || 400;
        
        const fontScale = d3
          .scaleLog()
          .domain([
            Math.min(...words.map((w) => w.count)),
            Math.max(...words.map((w) => w.count)),
          ])
          .range([12, 50]);

        const layout = cloud<Word>()
          .size([width, height])
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
          .font(fontFamily)
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

      // Skip updates if modals are open
      if (modalsOpenRef.current) {
        console.log("Skipping update because modals are open");
        return;
      }

      // There are two cases where we want to avoid complete relayout:
      // 1. Word selection/panel interaction (tracked by isWordSelectionActionRef)
      // 2. Panel visibility change (opening or closing panel)
      const isPanelClosing = selectedWordRef.current === null && isWordSelectionActionRef.current;
      const isWordSelecting = isWordSelectionActionRef.current && selectedWordRef.current !== null;
      const isWordSelectionOrPanelAction = isWordSelecting || isPanelClosing;
      
      if (isPanelClosing) {
        console.log("Panel is closing, skipping layout update");
      }
      
      // Check if SVG needs readjustment after container size changes
      // (like when panel opens/closes)
      const needsSvgCentering = isPanelVisibleRef.current !== undefined && 
                               svgRef.current && 
                               svgRef.current.parentElement;
      
      // Special case: if there are no words to display, clear the word cloud
      if (words.length === 0) {
        setIsUpdating(true);
        const svg = d3.select(svgRef.current);
        const wordsContainer = svg.select(".words-container");
        if (!wordsContainer.empty()) {
          const wordsGroup = wordsContainer.select(".words-group");
          if (!wordsGroup.empty()) {
            // Remove all existing words with fade out animation
            wordsGroup
              .selectAll<SVGTextElement, CloudWord>("text")
              .transition()
              .duration(TRANSITION_DURATION / 2)
              .style("opacity", 0)
              .remove();
          }
        }
        previousWordsRef.current = [];
        setIsUpdating(false);
        return;
      }
      
      // For panel changes or word selections:
      // - Don't relayout the cloud (preserve positions)
      // - But still update colors/fonts, ensure words are visible, and recenter if needed
      if (isWordSelectionOrPanelAction) {
        console.log(isPanelClosing ? "Panel closing detected" : "Word selection detected");
        console.log("Skipping layout update");

        // Check if we already have words displayed
        const svg = d3.select(svgRef.current);
        const wordsContainer = svg.select(".words-container");
        
        if (wordsContainer.empty()) {
          // If container is empty, we need to do a full render anyway
          console.log("No existing words found, doing full render despite panel action");
        } else {
          const wordsGroup = wordsContainer.select(".words-group");
          const existingWords = wordsGroup.selectAll<SVGTextElement, CloudWord>("text");
          
          // If we have words already displayed, just update colors/fonts without relayout
          if (!existingWords.empty() && existingWords.size() > 0) {
            // 1. Update existing words' styling
            existingWords
              .style("fill", getWordColor)
              .style("font-family", fontFamily);
            
            // 2. If panel state changed, recenter the visualization
            if (needsSvgCentering || isPanelClosing) {
              // Recenter words - make sure they're in the middle of the new container size
              const svgWidth = parseInt(svg.style("width"));
              const svgHeight = parseInt(svg.style("height"));
              
              // Smoothly transition to new center position
              wordsGroup
                .transition()
                .duration(300)
                .attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
              
              console.log("Recentered words after panel state change");
            }
            
            return;
          } else {
            console.log("No existing words found in group, proceeding with full render");
          }
        }
      }

      // Proceed with full render
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
        .style("font-family", fontFamily)
        .style("cursor", "pointer")
        .attr("text-anchor", "middle")
        .text((d) => d.text)
        .attr("class", "cloud-word");

      // Single transition for all words
      wordElements
        .merge(enterWords)
        .style("fill", getWordColor)
        .transition()
        .duration(TRANSITION_DURATION)
        .style("opacity", 1)
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", fontFamily)
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
        );

      // Add interaction handlers
      wordElements
        .merge(enterWords)
        .on("click", (event, d) => {
          if (d.originalData) {
            onWordSelect(d.originalData);
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

      // Save previous words state
      previousWordsRef.current = cloudWords;

      // Reset zoom to identity transform
      if (zoomRef.current && typeof window !== "undefined") {
        // Small delay to ensure words are properly positioned
        setTimeout(() => {
          svg.call(zoomRef.current!.transform, d3.zoomIdentity);
        }, 100);
      }
    }, DEBOUNCE_DELAY),
    [createWordCloudLayout, getWordColor, fontFamily, onWordSelect]
  );

  // Initialize SVG with responsive container
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
      .attr("class", "zoom-background");

    // Add group for words with responsive centering
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
        .scaleExtent([0.3, 5])
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

      // Add zoom controls
      const zoomControls = svg
        .append("g")
        .attr("class", "zoom-controls")
        .attr("transform", `translate(20, ${height - 130})`);

      // Add transparent background to controls
      zoomControls
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 40)
        .attr("height", 120)
        .attr("rx", 6)
        .attr("fill", "rgba(255, 255, 255, 0.7)")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("filter", "drop-shadow(0px 2px 3px rgba(0,0,0,0.15))");

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
              .attr("fill", "#ffffff80");
          })
          .on("mousedown", function () {
            d3.select(this).attr("fill", "#e8e8e8");
          })
          .on("mouseup", function () {
            d3.select(this).attr("fill", "#f8f8f8");
          });
      };

      // Calculate spacing between buttons
      const buttonSpacing = 35;
      const topPadding = 25;

      // Zoom in button
      const zoomInButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding)
        .attr("r", 14)
        .attr("fill", "#ffffff80")
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

      // Plus icon
      const plusIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding})`)
        .attr("pointer-events", "none");

      plusIcon
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "#555")
        .text("+");

      // Zoom out button
      const zoomOutButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding + buttonSpacing)
        .attr("r", 14)
        .attr("fill", "#ffffff80")
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

      // Minus icon
      const minusIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding + buttonSpacing})`)
        .attr("pointer-events", "none");

      minusIcon
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#555")
        .text("−");

      // Reset zoom button
      const resetButton = zoomControls
        .append("circle")
        .attr("cx", 20)
        .attr("cy", topPadding + buttonSpacing * 2)
        .attr("r", 14)
        .attr("fill", "#ffffff80")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1)
        .attr("cursor", "pointer")
        .attr("title", "Reset View")
        .on("click", () => {
          if (zoomRef.current) {
            svg.transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity);
          }
        });

      setupButtonHover(resetButton);

      // Home icon for reset
      const resetIcon = zoomControls
        .append("g")
        .attr("transform", `translate(20, ${topPadding + buttonSpacing * 2})`)
        .attr("pointer-events", "none");

      // Draw a simple house shape
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

      // Update zoom controls position
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

  // Reset zoom when search/filter changes
  const resetZoom = useCallback(() => {
    if (zoomRef.current && svgRef.current && typeof window !== "undefined") {
      const svg = d3.select(svgRef.current);
      
      // Small delay to ensure words are rendered before transform
      setTimeout(() => {
        svg
          .transition()
          .duration(300)
          .call(zoomRef.current!.transform, d3.zoomIdentity);
      }, 50);
    }
  }, []);

  // Update word cloud when filtered words change
  useEffect(() => {
    // Skip updates while loading
    if (isLoading || words.length === 0) {
      return;
    }

    // Skip updates if any modal is open
    if (modalsOpenRef.current) {
      return;
    }

    // Always update on slider changes or search term changes
    const isSliderChange = shouldUpdateLayoutRef.current === true;

    // Skip updates when panel visibility changes or a word is selected/deselected
    // BUT don't skip if it's a slider change (which should always update)
    if (
      (selectedWordRef.current !== null || !shouldUpdateLayoutRef.current) &&
      !isSliderChange
    ) {
      console.log("Skipping layout update due to panel change or word selection");
      return;
    }

    console.log("Updating layout");
    shouldUpdateLayoutRef.current = false;
    debouncedUpdate(words);
  }, [words, isLoading, debouncedUpdate]);

  // Force initial render after data is loaded
  useEffect(() => {
    // Only execute this when loading completes and we have data
    if (!isLoading && words.length > 0 && svgRef.current) {
      console.log("Triggering initial word cloud render");
      shouldUpdateLayoutRef.current = true;

      // Give time for the SVG to initialize
      const timer = setTimeout(() => {
        debouncedUpdate(words);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, words, debouncedUpdate]);

  // Monitor panel visibility changes and recenter visualization when needed
  useEffect(() => {
    if (!svgRef.current || !svgRef.current.parentElement) return;
    
    // Use a MutationObserver to detect container size changes
    // This will handle cases like panel opening/closing
    const container = svgRef.current.parentElement;
    const observer = new ResizeObserver(() => {
      // Only proceed if we have words already and it's not during initial load
      if (previousWordsRef.current.length === 0 || isLoading || modalsOpenRef.current) {
        return;
      }
      
      // Update centering without relayout
      const svg = d3.select(svgRef.current!);
      const wordsContainer = svg.select(".words-container");
      
      if (!wordsContainer.empty()) {
        const wordsGroup = wordsContainer.select(".words-group");
        
        if (!wordsGroup.empty()) {
          // Get current size
          const svgWidth = parseInt(svg.style("width"));
          const svgHeight = parseInt(svg.style("height"));
          
          // Smoothly transition to new center
          wordsGroup
            .transition()
            .duration(300)
            .attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
          
          console.log("Container resized, recentering words");
        }
      }
    });
    
    // Start observing the container
    observer.observe(container);
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  return {
    isUpdating,
    zoomRef,
    resetZoom,
    debouncedUpdate
  };
}; 