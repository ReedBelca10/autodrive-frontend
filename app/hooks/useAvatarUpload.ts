import { useState, useCallback } from 'react'

interface UseAvatarUploadOptions {
  apiBase: string
  onSuccess?: (avatarUrl: string) => void
  onError?: (error: string) => void
}

export function useAvatarUpload({ apiBase, onSuccess, onError }: UseAvatarUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = useCallback((file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.'
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'Le fichier est trop volumineux. Maximum 5MB.'
    }

    return null
  }, [])

  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      // Validation
      const validationError = validateFile(file)
      if (validationError) {
        setUploadError(validationError)
        onError?.(validationError)
        return null
      }

      // Preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        setPreview(previewUrl)
      }
      reader.readAsDataURL(file)

      setUploading(true)
      setUploadError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${apiBase}/users/avatar`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const errorMsg = errorData.message || `Upload échoué (${res.status})`
          setUploadError(errorMsg)
          onError?.(errorMsg)
          return null
        }

        const data = await res.json()
        const avatarUrl = data?.avatarUrl

        if (!avatarUrl) {
          setUploadError('Pas de URL d\'avatar retournée du serveur')
          onError?.('Pas de URL d\'avatar retournée du serveur')
          return null
        }

        // Ne pas ajouter de cache-buster ici - laissez ça à AvatarDisplay
        setPreview(null)
        onSuccess?.(avatarUrl)
        return avatarUrl
      } catch (err: any) {
        const errorMsg = err.message || 'Erreur lors de l\'upload'
        setUploadError(errorMsg)
        onError?.(errorMsg)
        console.error('Avatar upload error:', err)
        return null
      } finally {
        setUploading(false)
      }
    },
    [validateFile, apiBase, onSuccess, onError]
  )

  const clearError = useCallback(() => {
    setUploadError(null)
  }, [])

  const clearPreview = useCallback(() => {
    setPreview(null)
  }, [])

  return {
    uploading,
    uploadError,
    preview,
    uploadAvatar,
    clearError,
    clearPreview,
  }
}
