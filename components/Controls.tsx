import React from 'react';
import { type Tool } from '../App';

interface ControlsProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClearMask: () => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// FIX: Added `disabled` prop to ToolButton to allow disabling the button, and added disabled styles.
const ToolButton: React.FC<{isActive: boolean, onClick: () => void, children: React.ReactNode, title: string, className?: string, disabled?: boolean}> = 
({ isActive, onClick, children, title, className, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`relative flex-1 px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border-color'}
        ${className}`}
    >
        {children}
    </button>
);


const Controls: React.FC<ControlsProps> = ({ 
    brushSize, onBrushSizeChange, onClearMask,
    tool, onToolChange,
    onUndo, onRedo, canUndo, canRedo
}) => {
  return (
    <div className="space-y-6">
       <div>
         <label className="block mb-2 text-sm font-medium text-text-secondary">
           Tool
         </label>
        <div className="flex rounded-md shadow-sm border border-border-color" role="group">
          <ToolButton isActive={tool === 'brush'} onClick={() => onToolChange('brush')} title="Brush Tool (B)" className="rounded-l-md">
            Brush
          </ToolButton>
          <ToolButton isActive={tool === 'eraser'} onClick={() => onToolChange('eraser')} title="Eraser Tool (E)" className="-ml-px rounded-r-md">
            Eraser
          </ToolButton>
        </div>
      </div>
      <div>
        <label htmlFor="brush-size" className="block mb-2 text-sm font-medium text-text-secondary">
          Brush Size: <span className="text-primary font-bold">{brushSize}px</span>
        </label>
        <input
          id="brush-size"
          type="range"
          min="5"
          max="100"
          title="Adjust Brush Size (use [ and ])"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value, 10))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
         <ToolButton onClick={onUndo} isActive={false} disabled={!canUndo} title="Undo (Ctrl+Z)">Undo</ToolButton>
         <ToolButton onClick={onRedo} isActive={false} disabled={!canRedo} title="Redo (Ctrl+Y)">Redo</ToolButton>
      </div>

      <button
        onClick={onClearMask}
        title="Clear the entire mask"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-destructive rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-destructive transition-opacity"
      >
        Clear Mask
      </button>
    </div>
  );
};

export default Controls;