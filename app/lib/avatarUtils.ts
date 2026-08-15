/**
 * Avatar utilities for profile management
 */

/**
 * Add or update cache buster on URL to force browser refresh
 */
export function addCacheBuster(url: string, timestamp?: number): string {
  if (!url) return url

  const ts = timestamp || Date.now()

  // Remove existing cache-buster if present
  const cleanUrl = url.replace(/[&?]v=\d+/, '')

  // Add new cache-buster
  const separator = cleanUrl.includes('?') ? '&' : '?'
  return `${cleanUrl}${separator}v=${ts}`
}

/**
 * Get avatar URL with cache busting
 */
export function getAvatarUrl(avatarUrl: string | undefined): string | null {
  if (!avatarUrl) return null
  
  // Always add/update cache-buster to ensure fresh image
  return addCacheBuster(avatarUrl)
}

/**
 * Get initials from full name
 */
export function getInitials(fullName: string | undefined): string {
  if (!fullName) return 'AD'
  
  const parts = fullName.trim().split(' ')
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.',
    }
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux. Maximum 5MB.',
    }
  }
  
  return { valid: true }
}
