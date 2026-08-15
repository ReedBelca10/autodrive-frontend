"use client";

import Image from 'next/image';
import { useState, CSSProperties } from 'react';
import { ImageOff } from 'lucide-react';

interface VehicleImageProps {
  src?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
  onError?: () => void;
}

/**
 * Composant pour afficher les images des véhicules avec fallback
 * Gère les erreurs de chargement et affiche un placeholder si nécessaire
 */
export const VehicleImage = ({
  src,
  alt,
  fill = false,
  className = '',
  sizes,
  priority = false,
  style,
  onError
}: VehicleImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Si pas d’URL ou erreur, afficher le placeholder
  if (!src || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-300 w-full h-full ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageOff size={32} className="text-gray-500" />
          <span className="text-sm text-gray-600 text-center">Pas d’image</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && fill && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {isLoading && !fill && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={`${fill ? 'absolute inset-0' : ''} ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        style={style}
        onError={handleError}
        onLoadingComplete={handleLoadingComplete}
      />
    </>
  );
};
