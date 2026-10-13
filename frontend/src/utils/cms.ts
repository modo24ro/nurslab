import React from 'react';

/**
 * Normalizes image paths to ensure clean, consistent URLs.
 * Accepts:
 *  - '/images/journey_theory.jpg' -> '/images/journey_theory.jpg'
 *  - 'images/journey_theory.jpg'  -> '/images/journey_theory.jpg'
 *  - 'journey_theory.jpg'         -> '/images/journey_theory.jpg'
 *  - 'https://...'                -> 'https://...'
 */
export function formatImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  if (trimmed.startsWith('images/')) {
    return '/' + trimmed;
  }
  return '/images/' + trimmed;
}

/**
 * Parses a CSS object-position string (e.g. 'center 15%', '50% 20%', 'left top')
 * into X and Y percentages (0 - 100).
 */
export function parsePositionCoordinates(
  posStr?: string | null,
  metadata?: any
): { x: number; y: number } {
  if (metadata && typeof metadata.image_position_x === 'number' && typeof metadata.image_position_y === 'number') {
    return {
      x: Math.min(100, Math.max(0, metadata.image_position_x)),
      y: Math.min(100, Math.max(0, metadata.image_position_y)),
    };
  }

  if (!posStr) {
    return { x: 50, y: 15 };
  }

  const str = posStr.trim().toLowerCase();

  // Keyword mappings
  const keywords: Record<string, { x: number; y: number }> = {
    'left top': { x: 0, y: 0 },
    'top left': { x: 0, y: 0 },
    'center top': { x: 50, y: 0 },
    'top center': { x: 50, y: 0 },
    'top': { x: 50, y: 0 },
    'right top': { x: 100, y: 0 },
    'top right': { x: 100, y: 0 },
    'left center': { x: 0, y: 50 },
    'center left': { x: 0, y: 50 },
    'left': { x: 0, y: 50 },
    'center center': { x: 50, y: 50 },
    'center': { x: 50, y: 50 },
    'right center': { x: 100, y: 50 },
    'center right': { x: 100, y: 50 },
    'right': { x: 100, y: 50 },
    'left bottom': { x: 0, y: 100 },
    'bottom left': { x: 0, y: 100 },
    'center bottom': { x: 50, y: 100 },
    'bottom center': { x: 50, y: 100 },
    'bottom': { x: 50, y: 100 },
    'right bottom': { x: 100, y: 100 },
    'bottom right': { x: 100, y: 100 },
  };

  if (keywords[str]) {
    return keywords[str];
  }

  // Handle forms like "center 15%" or "50% 25%"
  const parts = str.split(/\s+/);
  if (parts.length === 2) {
    let x = 50;
    let y = 50;

    if (parts[0] === 'left') x = 0;
    else if (parts[0] === 'right') x = 100;
    else if (parts[0] === 'center') x = 50;
    else if (parts[0].endsWith('%')) x = parseFloat(parts[0]) || 50;

    if (parts[1] === 'top') y = 0;
    else if (parts[1] === 'bottom') y = 100;
    else if (parts[1] === 'center') y = 50;
    else if (parts[1].endsWith('%')) y = parseFloat(parts[1]) || 50;

    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }

  return { x: 50, y: 15 };
}

/**
 * Returns the CSS object-position string based on metadata or fallback.
 */
export function getImagePosition(metadata?: any, fallback = 'center 15%'): string {
  if (!metadata) return fallback;
  if (metadata.image_position_x !== undefined && metadata.image_position_y !== undefined) {
    return `${Math.round(metadata.image_position_x)}% ${Math.round(metadata.image_position_y)}%`;
  }
  return metadata.image_position || fallback;
}

/**
 * Returns complete CSS styling for image (object-position, transform scale, transform-origin).
 */
export function getImageStyle(metadata?: any, fallbackPos = 'center 15%'): React.CSSProperties {
  const position = getImagePosition(metadata, fallbackPos);
  const zoom = typeof metadata?.zoom === 'number' 
    ? metadata.zoom 
    : (metadata?.zoom ? parseFloat(metadata.zoom) : 1);

  const style: React.CSSProperties = {
    objectPosition: position,
  };

  if (zoom && zoom > 1) {
    style.transform = `scale(${zoom})`;
    style.transformOrigin = position;
  }

  return style;
}
