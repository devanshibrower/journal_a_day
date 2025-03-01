import React, { useEffect, useRef } from 'react';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
  initialText?: string;
}

const TextModal: React.FC<TextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialText = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = React.useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-md p-2 w-50"
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-2 border rounded mb-1 font-['Cedarville_Cursive'] text-xs text-zinc-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your text..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
          <button
            onClick={() => {
              if (text.trim()) {
                onSave(text);
              }
            }}
            className="px-2 py-1 text-xs bg-white border border-zinc-900 text-zinc-900 rounded hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextModal; 