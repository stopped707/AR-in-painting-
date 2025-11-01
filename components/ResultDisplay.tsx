import React from 'react';

interface ResultDisplayProps {
  editedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onStartOver: () => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
    <p className="text-text-secondary">AI is creating magic...</p>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ editedImage, isLoading, error, onStartOver }) => {
    const socialPresets = [
        { name: 'Post (1:1)', width: 1080, height: 1080, key: 'insta-square' },
        { name: 'Story (9:16)', width: 1080, height: 1920, key: 'insta-story' },
        { name: 'Landscape (16:9)', width: 1920, height: 1080, key: 'landscape-16-9' },
        { name: 'Portrait (4:5)', width: 1080, height: 1350, key: 'portrait-4-5' },
    ];

  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadImageWithPreset = (preset: { width: number, height: number, name: string, key: string }) => {
    if (!editedImage) return;

    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = preset.width;
        canvas.height = preset.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let sx, sy, sWidth, sHeight;

        if (imgAspectRatio > canvasAspectRatio) {
            sHeight = img.height;
            sWidth = img.height * canvasAspectRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = img.width;
            sHeight = img.width / canvasAspectRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `edited-image-${preset.key}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.src = editedImage;
};


  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {isLoading && <LoadingSpinner />}
      {error && !isLoading && (
        <div className="text-center p-4 bg-destructive/10 border border-destructive rounded-md w-full">
          <p className="font-semibold text-destructive">Error</p>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      )}
      {editedImage && !isLoading && (
        <div className="w-full space-y-4">
          <img src={editedImage} alt="Edited result" className="rounded-md w-full border border-border-color" />
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={downloadImage}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
            >
              Download
            </button>
            <button
              onClick={onStartOver}
              className="w-full px-4 py-2 text-sm font-medium text-text-secondary border border-border-color rounded-md hover:bg-border-color transition-colors"
            >
              Start Over
            </button>
          </div>
          <div>
            <p className="text-sm text-center text-text-secondary mb-2">Download for Social Media</p>
            <div className="grid grid-cols-2 gap-2">
                {socialPresets.map(preset => (
                    <button
                        key={preset.key}
                        onClick={() => downloadImageWithPreset(preset)}
                        className="w-full px-2 py-2 text-xs font-medium text-primary border border-primary/50 rounded-md hover:bg-primary/10 transition-colors"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;