import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { type Tool } from '../App';

interface OriginalImage {
  dataUrl: string;
  width: number;
  height: number;
}

interface ImageEditorProps {
  image: OriginalImage;
  brushSize: number;
  tool: Tool;
  onHistoryChange: (state: { canUndo: boolean; canRedo: boolean; }) => void;
}

export interface ImageEditorRef {
  getMaskDataUrl: () => string | null;
  clearMask: () => void;
  undo: () => void;
  redo: () => void;
}

const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>(({ image, brushSize, tool, onHistoryChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [brushColor, setBrushColor] = useState('rgba(0, 229, 255, 0.7)');

  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);

  const getCanvasRelativePos = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    if (!drawingCanvasRef.current) return null;
    const canvas = drawingCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }

    return {
        x: (clientX - rect.left),
        y: (clientY - rect.top),
    };
  }, []);
  
  const updateHistoryState = useCallback(() => {
    onHistoryChange({
      canUndo: historyIndex.current > 0,
      canRedo: historyIndex.current < history.current.length - 1
    });
  }, [onHistoryChange]);

  const saveHistory = useCallback(() => {
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx || !drawingCanvasRef.current) return;
    
    // Clear any future history
    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }
    
    history.current.push(ctx.getImageData(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height));
    historyIndex.current++;
    updateHistoryState();
  }, [updateHistoryState]);

  useEffect(() => {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    if (primaryColor.startsWith('#')) {
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);
      setBrushColor(`rgba(${r}, ${g}, ${b}, 0.7)`);
    } else {
      setBrushColor(primaryColor);
    }
  }, []);

  // Responsive canvas scaling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      const { width: containerWidth, height: containerHeight } = entry.contentRect;
      
      const { width: imgWidth, height: imgHeight } = image;
      const aspectRatio = imgWidth / imgHeight;

      let newWidth = containerWidth;
      let newHeight = newWidth / aspectRatio;

      if (newHeight > containerHeight) {
          newHeight = containerHeight;
          newWidth = newHeight * aspectRatio;
      }
      
      setCanvasSize({ width: newWidth, height: newHeight });
      setScale(newWidth / imgWidth);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [image]);

  // Draw image and initialize history
  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;
    const imageCtx = imageCanvas?.getContext('2d');
    
    if (imageCanvas && imageCtx && canvasSize.width > 0) {
      const img = new Image();
      img.onload = () => {
        imageCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        imageCtx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        
        // Initialize drawing history
        const drawingCtx = drawingCanvasRef.current?.getContext('2d');
        if (drawingCtx) {
            drawingCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
            history.current = [];
            historyIndex.current = -1;
            saveHistory();
        }
      };
      img.src = image.dataUrl;
    }
  }, [image.dataUrl, canvasSize, saveHistory]);

  const draw = useCallback((x: number, y: number, isNewPath = false) => {
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor; // For eraser to work
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isNewPath || !lastPos) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    setLastPos({ x, y });
  }, [brushSize, lastPos, brushColor, tool]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasRelativePos(e);
    if (pos) {
      setIsDrawing(true);
      draw(pos.x, pos.y, true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cursorRef.current) {
      const pos = getCanvasRelativePos(e);
      if(pos) {
        cursorRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      }
    }
    if (isDrawing) {
      const pos = getCanvasRelativePos(e);
      if (pos) {
        draw(pos.x, pos.y);
      }
    }
  };
  
  const handleMouseUpOrLeave = () => {
    if (isDrawing) {
      saveHistory();
    }
    setIsDrawing(false);
    setLastPos(null);
  };
  
  useImperativeHandle(ref, () => ({
    getMaskDataUrl: () => {
      const drawingCanvas = drawingCanvasRef.current;
      const compositeCanvas = compositeCanvasRef.current;
      if (!drawingCanvas || !compositeCanvas) return null;

      compositeCanvas.width = image.width;
      compositeCanvas.height = image.height;
      const ctx = compositeCanvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, image.width, image.height);
      
      ctx.save();
      ctx.scale(1/scale, 1/scale);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(drawingCanvas, 0, 0);
      ctx.restore();
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;
      
      tempCtx.drawImage(compositeCanvas, 0, 0);
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, image.width, image.height);
      
      return tempCanvas.toDataURL('image/png');
    },
    clearMask: () => {
      const ctx = drawingCanvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        saveHistory();
      }
    },
    undo: () => {
      if (historyIndex.current > 0) {
        historyIndex.current--;
        const ctx = drawingCanvasRef.current?.getContext('2d');
        const imageData = history.current[historyIndex.current];
        if (ctx && imageData) {
          ctx.putImageData(imageData, 0, 0);
        }
        updateHistoryState();
      }
    },
    redo: () => {
       if (historyIndex.current < history.current.length - 1) {
        historyIndex.current++;
        const ctx = drawingCanvasRef.current?.getContext('2d');
        const imageData = history.current[historyIndex.current];
        if (ctx && imageData) {
          ctx.putImageData(imageData, 0, 0);
        }
        updateHistoryState();
      }
    },
  }));

  const cursorStyle = tool === 'eraser' ? {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'var(--color-text-secondary)',
  } : {
    backgroundColor: 'var(--color-primary-alpha, rgba(0, 229, 255, 0.3))',
    borderColor: 'var(--color-primary)',
  };

  return (
    <div 
      ref={containerRef} 
      className="relative touch-none brush-cursor w-full h-full flex items-center justify-center"
      onMouseLeave={handleMouseUpOrLeave}
    >
      <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
        <canvas ref={imageCanvasRef} width={canvasSize.width} height={canvasSize.height} className="absolute top-0 left-0 rounded-md" />
        <canvas
          ref={drawingCanvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute top-0 left-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
        />
        <div 
          ref={cursorRef}
          className="absolute top-0 left-0 rounded-full border-2 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-colors"
          style={{ width: brushSize, height: brushSize, ...cursorStyle }}
        />
        <canvas ref={compositeCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
});

export default ImageEditor;