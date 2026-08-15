import React, { useState, useEffect } from 'react'
import { getInitials } from '@/app/lib/avatarUtils'

interface AvatarDisplayProps {
  avatarUrl?: string
  fullName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-12 h-12 text-base',
  md: 'w-28 h-28 text-3xl',
  lg: 'w-40 h-40 text-5xl',
}

export function AvatarDisplay({
  avatarUrl,
  fullName,
  size = 'md',
  className = '',
}: AvatarDisplayProps) {
  const sizeClass = sizeClasses[size]
  const [imageKey, setImageKey] = useState(0)
  const [currentUrl, setCurrentUrl] = useState(avatarUrl)
  const [imageLoadError, setImageLoadError] = useState(false)

  // Chaque fois que avatarUrl change, forcer un re-render complet avec cache-buster
  useEffect(() => {
    if (avatarUrl && avatarUrl !== currentUrl) {
      
      // Ajouter un cache-buster pour s’assurer que le navigateur
      // recharge l’image plutôt que de la servir depuis le cache
      let urlWithCacheBuster = avatarUrl
      
      // Détecter le séparateur approprié (?  ou &)
      const sep = avatarUrl.includes('?') ? '&' : '?'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      
      urlWithCacheBuster = `${avatarUrl}${sep}cb=${timestamp}-${random}`
      
      setCurrentUrl(urlWithCacheBuster)
      setImageLoadError(false)
      setImageKey((prev) => prev + 1)
    }
  }, [avatarUrl, currentUrl])

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg flex-shrink-0 ${sizeClass} ${className}`}
    >
      {currentUrl && !imageLoadError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={imageKey}
          src={currentUrl}
          alt="avatar"
          className={`w-full h-full object-cover`}
          onError={() => {
            setImageLoadError(true)
          }}
          onLoad={() => {
            // Avatar loaded
          }}
        />
      ) : (
        <span>{getInitials(fullName)}</span>
      )}
    </div>
  )
}
