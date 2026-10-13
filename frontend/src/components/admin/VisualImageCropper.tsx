import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Move,
  Save,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { formatImageUrl, parsePositionCoordinates } from '../../utils/cms';

export interface VisualImageCropperProps {
  label?: string;
  imageUrl: string;
  onImageUrlChange: (newUrl: string) => void;
  metadata?: {
    image_position?: string;
    image_position_x?: number;
    image_position_y?: number;
    zoom?: number;
    object_fit?: string;
    [key: string]: any;
  };
  onChange: (updatedMetadata: any) => void;
  onSave?: () => void;
  cardType?: 'journey' | 'path' | 'nursing' | 'hero' | 'guest' | 'article' | 'default';
  cardTitle?: string;
  badge?: string;
  badgeClass?: string;
  hasPlayOverlay?: boolean;
}

export const VisualImageCropper: React.FC<VisualImageCropperProps> = ({
  label = 'Încadrare și Focalizare Imagine (Visual Cropper)',
  imageUrl,
  onImageUrlChange,
  metadata = {},
  onChange,
  onSave,
  cardType = 'default',
  cardTitle,
  badge,
  badgeClass = 'badge-mint',
  hasPlayOverlay = false,
}) => {
  // Parse initial coordinates from metadata or image_position string
  const initialCoords = parsePositionCoordinates(metadata.image_position, metadata);
  const [posX, setPosX] = useState<number>(initialCoords.x);
  const [posY, setPosY] = useState<number>(initialCoords.y);
  const [zoom, setZoom] = useState<number>(
    typeof metadata.zoom === 'number' ? metadata.zoom : (metadata.zoom ? parseFloat(metadata.zoom) : 1)
  );

  // Sync internal state if metadata changes externally
  useEffect(() => {
    const coords = parsePositionCoordinates(metadata.image_position, metadata);
    setPosX(coords.x);
    setPosY(coords.y);
    if (metadata.zoom !== undefined) {
      setZoom(Number(metadata.zoom) || 1);
    }
  }, [metadata.image_position, metadata.image_position_x, metadata.image_position_y, metadata.zoom]);

  // Image load validation
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const formattedUrl = formatImageUrl(imageUrl);

  useEffect(() => {
    if (!formattedUrl) {
      setImageValid(null);
      return;
    }

    setIsValidating(true);
    const img = new Image();
    img.src = formattedUrl;
    img.onload = () => {
      setImageValid(true);
      setIsValidating(false);
    };
    img.onerror = () => {
      setImageValid(false);
      setIsValidating(false);
    };
  }, [formattedUrl]);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const emitChanges = (newX: number, newY: number, newZoom: number) => {
    const roundedX = Math.round(newX);
    const roundedY = Math.round(newY);
    const roundedZoom = Number(newZoom.toFixed(2));

    const updated = {
      ...(metadata || {}),
      image_position_x: roundedX,
      image_position_y: roundedY,
      zoom: roundedZoom,
      image_position: `${roundedX}% ${roundedY}%`,
      object_fit: 'cover',
    };
    onChange(updated);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: posX,
      startY: posY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startMouseX;
    const deltaY = e.clientY - dragStartRef.current.startMouseY;

    // Moving mouse to the right shifts focal point left
    const sensitivity = 100 / zoom;
    const percentDeltaX = (deltaX / rect.width) * sensitivity;
    const percentDeltaY = (deltaY / rect.height) * sensitivity;

    const nextX = Math.min(100, Math.max(0, dragStartRef.current.startX - percentDeltaX));
    const nextY = Math.min(100, Math.max(0, dragStartRef.current.startY - percentDeltaY));

    setPosX(nextX);
    setPosY(nextY);
    emitChanges(nextX, nextY, zoom);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      startMouseX: e.touches[0].clientX,
      startMouseY: e.touches[0].clientY,
      startX: posX,
      startY: posY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !previewContainerRef.current || e.touches.length !== 1) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const deltaX = e.touches[0].clientX - dragStartRef.current.startMouseX;
    const deltaY = e.touches[0].clientY - dragStartRef.current.startMouseY;

    const sensitivity = 100 / zoom;
    const percentDeltaX = (deltaX / rect.width) * sensitivity;
    const percentDeltaY = (deltaY / rect.height) * sensitivity;

    const nextX = Math.min(100, Math.max(0, dragStartRef.current.startX - percentDeltaX));
    const nextY = Math.min(100, Math.max(0, dragStartRef.current.startY - percentDeltaY));

    setPosX(nextX);
    setPosY(nextY);
    emitChanges(nextX, nextY, zoom);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handlePresetSelect = (x: number, y: number) => {
    setPosX(x);
    setPosY(y);
    emitChanges(x, y, zoom);
  };

  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(2.5, Math.max(1, Number(newZoom.toFixed(2))));
    setZoom(clamped);
    emitChanges(posX, posY, clamped);
  };

  const handleReset = () => {
    setPosX(50);
    setPosY(15);
    setZoom(1);
    emitChanges(50, 15, 1);
  };

  // 9 Direction Presets
  const gridDirections = [
    { label: '↖ Sus Stg', x: 0, y: 0 },
    { label: '⬆ Sus', x: 50, y: 0 },
    { label: '↗ Sus Dr', x: 100, y: 0 },
    { label: '⬅ Stânga', x: 0, y: 50 },
    { label: '⏺ Centru', x: 50, y: 50 },
    { label: '➡️ Dreapta', x: 100, y: 50 },
    { label: '↙ Jos Stg', x: 0, y: 100 },
    { label: '⬇ Jos', x: 50, y: 100 },
    { label: '↘ Jos Dr', x: 100, y: 100 },
  ];

  const facePresets = [
    { label: 'Față Sus (10%)', x: 50, y: 10 },
    { label: 'Față / Bust (15%)', x: 50, y: 15 },
    { label: 'Portret Centrat (25%)', x: 50, y: 25 },
    { label: 'Centru 50%', x: 50, y: 50 },
    { label: 'Jos 75%', x: 50, y: 75 },
  ];

  // Determine container styling matching frontend card
  const getContainerHeightClass = () => {
    switch (cardType) {
      case 'journey':
        return 'h-44 sm:h-48';
      case 'path':
        return 'h-52 sm:h-56';
      case 'hero':
        return 'h-56 sm:h-64';
      case 'nursing':
        return 'h-52 sm:h-60';
      case 'guest':
      case 'article':
        return 'h-52 sm:h-56';
      default:
        return 'h-48 sm:h-52';
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
      
      {/* Header: Label and current position & zoom summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
        <label className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
          <Sliders className="w-4 h-4 text-brand-green" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-brand-navy font-semibold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            X: {Math.round(posX)}% | Y: {Math.round(posY)}%
          </span>
          <span className="text-[11px] font-mono text-brand-green font-semibold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Editable Image Path Input with Validation Feedback */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-brand-green" />
            <span>Cale imagine (ex: /images/journey_theory.jpg)</span>
          </span>
          {imageValid === true && (
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Imagine validă
            </span>
          )}
          {imageValid === false && (
            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Imaginea nu poate fi încărcată
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="/images/journey_theory.jpg"
            className={`w-full p-2.5 text-xs font-mono rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 ${
              imageValid === false
                ? 'border-red-300 focus:ring-red-200'
                : 'border-slate-200 focus:ring-brand-green/30'
            }`}
          />
        </div>
      </div>

      {/* Main Interactive Grid: Left Controls (5 cols) | Right Live Card Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Direction Grid & Presets */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* 9 Direction Grid */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Punct focal direct (9 direcții):
            </span>
            <div className="grid grid-cols-3 gap-1.5 max-w-[220px]">
              {gridDirections.map((dir) => {
                const isSelected = Math.round(posX) === dir.x && Math.round(posY) === dir.y;
                return (
                  <button
                    key={dir.label}
                    type="button"
                    onClick={() => handlePresetSelect(dir.x, dir.y)}
                    className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-brand-green text-white border-brand-green shadow-xs scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {dir.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Face Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Presetări nivel chip (Fețe):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facePresets.map((p) => {
                const isSelected = Math.round(posX) === p.x && Math.round(posY) === p.y;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetSelect(p.x, p.y)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-brand-navy text-white border-brand-navy font-bold'
                        : 'bg-white text-slate-600 hover:text-brand-green hover:bg-emerald-50 border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom Slider and buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-brand-green" />
                <span>Zoom / Scară:</span>
              </span>
              <span className="font-mono text-brand-navy">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.1)}
                disabled={zoom <= 1}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-40"
                title="Micșorează zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 accent-brand-green cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.1)}
                disabled={zoom >= 2.5}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-40"
                title="Mărește zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action buttons: Reset & Save */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetează</span>
            </button>
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvează acum</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Card Preview matching frontend design */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-brand-navy font-semibold">
              <Move className="w-3.5 h-3.5 text-brand-green" />
              <span>Trage cu mouse-ul pe imagine pentru poziționare fină</span>
            </span>
            <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full font-mono text-slate-700">
              Card Aspect: {cardType}
            </span>
          </div>

          {/* Live Simulated Frontend Card */}
          <div
            ref={previewContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative ${getContainerHeightClass()} w-full rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md select-none ${
              isDragging ? 'cursor-grabbing ring-2 ring-brand-green' : 'cursor-grab hover:ring-2 hover:ring-brand-green/40'
            } transition-shadow`}
          >
            {formattedUrl ? (
              <img
                src={formattedUrl}
                alt={cardTitle || 'Preview'}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                style={{
                  objectPosition: `${Math.round(posX)}% ${Math.round(posY)}%`,
                  transform: zoom > 1 ? `scale(${zoom})` : undefined,
                  transformOrigin: `${Math.round(posX)}% ${Math.round(posY)}%`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Fără imagine configurată
              </div>
            )}

            {/* Simulated Badge if available */}
            {badge && (
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className={badgeClass}>{badge}</span>
              </div>
            )}

            {/* Simulated Play Overlay if applicable */}
            {hasPlayOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/15">
                <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-brand-navy shadow-sm">
                  <div className="w-0 h-0 border-t-5 border-t-transparent border-l-8 border-l-brand-navy border-b-5 border-b-transparent ml-0.5" />
                </div>
              </div>
            )}

            {/* Crosshair indicator while dragging */}
            {isDragging && (
              <div
                className="absolute w-6 h-6 border-2 border-white rounded-full bg-brand-green/60 shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}

            {/* Live Indicator Pill */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-[9px] text-white px-2 py-0.5 rounded-md font-mono flex items-center gap-1 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Card Preview</span>
            </div>
          </div>

          {/* Micro-instructions */}
          <p className="text-[10px] text-slate-400 italic">
            * Clic și trage direct pe imagine pentru a ajusta încadrarea orizontală și verticală. Rezultatul salvat este aplicat 1:1 pe cardul corespunzător de pe site.
          </p>
        </div>

      </div>

    </div>
  );
};
