import React, { useRef, useState } from 'react'
import { supabase, HAS_CREDENTIALS } from '../lib/supabase'

interface PhotoUploadProps {
  onPhotoSelected: (file: File, previewUrl: string) => void
  currentImage?: string
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelected, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Read file as data URL for preview
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      onPhotoSelected(file, dataUrl)

      // Upload to Supabase Storage if credentials are available
      if (HAS_CREDENTIALS) {
        setUploading(true)
        try {
          const ext = file.name.split('.').pop() || 'jpg'
          const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
          const { error } = await supabase.storage
            .from('photos')
            .upload(path, file, { cacheControl: '3600', upsert: false })

          if (error) {
            setUploadError(error.message || 'Erreur de téléversement')
          }
        } catch (err: any) {
          setUploadError(err.message || 'Erreur de téléversement')
        } finally {
          setUploading(false)
        }
      }
    }
    reader.readAsDataURL(file)

    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  const handleRemove = () => {
    setPreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Camera / upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          width: '100%', padding: '0.85rem 1rem',
          background: uploading ? 'var(--gray-200)' : 'var(--blue-100)',
          color: uploading ? 'var(--gray-500)' : 'var(--blue-600)',
          border: '2px dashed var(--blue-400)',
          borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: uploading ? 'not-allowed' : 'pointer',
          minHeight: 48, // big touch target
        }}
      >
        {uploading ? '⏳ Téléversement…' : '📷 Prendre une photo'}
      </button>

      {/* Preview thumbnail */}
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="Aperçu"
            style={{
              width: 100, height: 100, objectFit: 'cover',
              borderRadius: 12, border: '2px solid var(--gray-200)',
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Supprimer la photo"
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 24, height: 24, borderRadius: '50%',
              background: '#F44336', color: '#fff', border: 'none',
              fontSize: 14, lineHeight: '24px', textAlign: 'center',
              cursor: 'pointer', fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <p style={{ fontSize: 12, color: '#C62828', margin: 0 }}>
          ⚠️ {uploadError}
        </p>
      )}
    </div>
  )
}

export default PhotoUpload
