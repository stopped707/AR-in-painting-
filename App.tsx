import React, { useState, useRef, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageEditor, { type ImageEditorRef } from './components/ImageEditor';
import Controls from './components/Controls';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import { generateEditedImage } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';

interface OriginalImage {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
}

export type Tool = 'brush' | 'eraser';

const App: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [brushSize, setBrushSize] = useState<number>(40);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });


  const editorRef = useRef<ImageEditorRef>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in the prompt
      if (e.target instanceof HTMLTextAreaElement) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (isCtrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === '[') {
        e.preventDefault();
        setBrushSize(s => Math.max(5, s - 2));
      } else if (e.key === ']') {
        e.preventDefault();
        setBrushSize(s => Math.min(100, s + 2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setOriginalImage({
          dataUrl,
          mimeType: file.type,
          width: img.width,
          height: img.height,
        });
        setEditedImage(null);
        setError(null);
        editorRef.current?.clearMask();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage || !prompt || !editorRef.current) {
      setError("Please upload an image, draw a mask, and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const maskDataUrl = editorRef.current.getMaskDataUrl();
      if (!maskDataUrl) {
        setError("Could not generate mask. Please try drawing on the image.");
        setIsLoading(false);
        return;
      }

      const resultBase64 = await generateEditedImage(
        originalImage.dataUrl,
        originalImage.mimeType,
        maskDataUrl,
        prompt
      );
      setEditedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const handleClearMask = () => editorRef.current?.clearMask();
  const handleUndo = () => editorRef.current?.undo();
  const handleRedo = () => editorRef.current?.redo();
  const handleHistoryChange = useCallback((state: { canUndo: boolean, canRedo: boolean }) => {
    setHistoryState(state);
  }, []);
  
  const handleStartOver = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
  }

  const Panel: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({ title, children, className }) => (
    <div className={`bg-surface rounded-lg shadow-md border border-border-color p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-text-primary">{title}</h2>
        {children}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme={theme} onThemeToggle={handleThemeToggle} />
      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {!originalImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-surface rounded-lg shadow-md p-4 flex flex-col items-center justify-center relative border border-border-color min-h-[400px]">
              <ImageEditor
                ref={editorRef}
                image={originalImage}
                brushSize={brushSize}
                tool={tool}
                onHistoryChange={handleHistoryChange}
              />
            </div>

            <div className="flex flex-col gap-8">
              <Panel title="Controls">
                 <Controls
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  onClearMask={handleClearMask}
                  tool={tool}
                  onToolChange={setTool}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyState.canUndo}
                  canRedo={historyState.canRedo}
                />
              </Panel>

              <Panel title="Prompt & Generate" className="flex-grow flex flex-col">
                <PromptInput
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </Panel>

              {(isLoading || editedImage || error) && (
                <Panel title="Result">
                  <ResultDisplay
                    editedImage={editedImage}
                    isLoading={isLoading}
                    error={error}
                    onStartOver={handleStartOver}
                  />
                </Panel>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;