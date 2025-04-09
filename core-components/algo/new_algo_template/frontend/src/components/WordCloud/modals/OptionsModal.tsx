import React from "react";
import { StopwordsOption, WhitelistOption, WordCloudOptions } from "../types";
import { STOPWORDS_OPTIONS, WHITELIST_OPTIONS, FONT_FAMILIES } from "../constants";

interface OptionsModalProps {
  isOpen: boolean;
  options: WordCloudOptions;
  tempOptions: WordCloudOptions;
  setTempOptions: (options: WordCloudOptions) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenStopwordsModal: () => void;
  onOpenWhitelistModal: () => void;
}

const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  options,
  tempOptions,
  setTempOptions,
  onClose,
  onSave,
  onOpenStopwordsModal,
  onOpenWhitelistModal,
}) => {
  if (!isOpen) return null;

  // Determine if the modal should be blurred (when stoplist/whitelist modal is open)
  const shouldBlur = false; // This would be passed down or determined based on other modal states

  const updateOption = <K extends keyof WordCloudOptions>(
    key: K,
    value: WordCloudOptions[K]
  ) => {
    setTempOptions({
      ...tempOptions,
      [key]: value,
    });
  };

  const resetDefaults = () => {
    setTempOptions({
      stopwordsOption: "Auto-detect",
      whitelistOption: "None",
      fontFamily: "Palatino",
      colorSelection: "random",
      applyGlobally: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-lg w-full max-w-[500px] transition-all duration-200 overflow-hidden ${
          shouldBlur ? "filter blur-xs" : ""
        }`}
      >
        <div className="px-8 py-3 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Options</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer"
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
                value={tempOptions.stopwordsOption}
                onChange={(e) => 
                  updateOption('stopwordsOption', e.target.value as StopwordsOption)
                }
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
              className="ml-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer"
              onClick={onOpenStopwordsModal}
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
                value={tempOptions.whitelistOption}
                onChange={(e) => 
                  updateOption('whitelistOption', e.target.value as WhitelistOption)
                }
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
              className="ml-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer"
              onClick={onOpenWhitelistModal}
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
                value={tempOptions.fontFamily}
                onChange={(e) => 
                  updateOption('fontFamily', e.target.value)
                }
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
                value={tempOptions.colorSelection}
                onChange={(e) => 
                  updateOption('colorSelection', e.target.value as "random" | "monochrome" | "category")
                }
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
              checked={tempOptions.applyGlobally}
              onChange={(e) => 
                updateOption('applyGlobally', e.target.checked)
              }
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="applyGlobally" className="text-gray-700">
              apply globally
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 py-3 bg-gray-50">
          <button
            onClick={resetDefaults}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionsModal; 