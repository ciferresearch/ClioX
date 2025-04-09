// Define types for Word Cloud component

export interface WordData {
  value: string;
  count: number;
}

export interface CloudWord {
  text: string;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
  originalData?: WordData;
}

export interface Word {
  text: string;
  size: number;
  originalData?: WordData;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type ColorScheme = "random" | "monochrome" | "category";

export type StopwordsOption = "Auto-detect" | "None" | "English" | "Custom";
export type WhitelistOption = "None" | "Custom";

export interface WordCloudOptions {
  stopwordsOption: StopwordsOption;
  whitelistOption: WhitelistOption;
  fontFamily: string;
  colorSelection: ColorScheme;
  applyGlobally: boolean;
}

export interface ModalState {
  isOptionsModalOpen: boolean;
  isStopwordsModalOpen: boolean; 
  isWhitelistModalOpen: boolean;
} 