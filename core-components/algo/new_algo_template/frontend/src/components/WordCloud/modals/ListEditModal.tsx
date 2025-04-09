import React, { useRef, useEffect } from "react";

interface ListEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

const ListEditModal: React.FC<ListEditModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  onChange,
  onSave,
}) => {
  if (!isOpen) return null;

  const isStoplist = title.includes("Stopwords") || title.includes("Stoplist");
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

  // Count words from value
  const wordCount = value
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  return (
    <div
      className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-[400px] w-full overflow-hidden"
        onClick={handleContentClick}
      >
        <div className="px-8 py-3 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer"
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

        <div className="flex justify-end gap-3 px-8 py-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListEditModal; 