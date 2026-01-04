import React, { useRef, useCallback, useState } from 'react'
import { useAvatarUpload } from '@/app/hooks/useAvatarUpload'
import { AvatarDisplay } from './AvatarDisplay'

interface AvatarUploadProps {
  avatarUrl?: string
  fullName?: string
  onAvatarChange?: (avatarUrl: string) => void
  apiBase: string
  disabled?: boolean
}

export function AvatarUpload({
  avatarUrl,
  fullName,
  onAvatarChange,
  apiBase,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [displayUrl, setDisplayUrl] = useState(avatarUrl)

  const { uploading, uploadError, preview, uploadAvatar, clearError } = useAvatarUpload({
    apiBase,
    onSuccess: (url) => {
      // Mettre à jour l'URL affichée IMMÉDIATEMENT
      setDisplayUrl(url)
      onAvatarChange?.(url)
    },
  })

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        await uploadAvatar(file)
      }
      // Reset input
      e.target.value = ''
    },
    [uploadAvatar]
  )

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Utiliser le preview pendant le téléchargement, sinon utiliser displayUrl
  const currentUrl = preview || displayUrl

  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <AvatarDisplay
          avatarUrl={currentUrl}
          fullName={fullName}
          size="md"
          className="transition-transform hover:scale-105"
        />

        {/* Upload button */}
        <button
          onClick={triggerFileInput}
          disabled={uploading || disabled}
          title={uploading ? 'Téléchargement en cours...' : "Modifier l'avatar"}
          className="absolute bottom-0 right-0 -mb-1 -mr-1 w-9 h-9 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-blue-600 shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Error message */}
      {uploadError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {uploadError}
        </div>
      )}
    </div>
  )
}
