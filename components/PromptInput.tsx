import React from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, onPromptChange, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col h-full">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="e.g., 'Change the shirt to blue' or 'Add a cat sitting on the bench'"
        className="w-full flex-grow p-3 text-sm bg-background border border-border-color rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder-text-secondary/80"
        rows={4}
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !prompt.trim()}
        className="mt-4 w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-primary rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate'
        )}
      </button>
    </div>
  );
};

export default PromptInput;