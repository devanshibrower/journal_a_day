import React, { useEffect } from 'react';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText?: string;
}

const TextModal: React.FC<TextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialText = ''
}) => {
  const [text, setText] = React.useState(initialText);

  // Reset text when modal opens with new initial text
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      
      // Enter or Cmd/Ctrl + Enter to save
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (text.trim()) {
          onSave(text);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, text, onClose, onSave]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-md p-4 w-[400px]">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 p-4 border rounded mb-2 font-['Cedarville_Cursive'] text-lg text-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your text..."
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-base bg-white border border-zinc-200 text-zinc-600 rounded hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => text.trim() && onSave(text)}
            className="px-4 py-2 text-base bg-white border border-zinc-900 text-zinc-900 rounded hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextModal; 