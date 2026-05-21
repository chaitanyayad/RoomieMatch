import { useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'
import InitialsAvatar from './InitialsAvatar'

export default function AvatarUpload() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB'); return }
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/uploads/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser({ ...user!, avatar_url: data.avatar_url })
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="avatar"
          className="w-14 h-14 rounded-full object-cover ring-2 ring-neon-purple/50" />
      ) : (
        <InitialsAvatar name={user?.name ?? '?'} size={56} />
      )}
      <div>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="btn-ghost text-sm">
          {uploading ? 'Uploading...' : 'Upload photo'}
        </button>
        <p className="text-muted text-xs mt-1">JPEG / PNG · max 2 MB</p>
        {error && <p className="text-neon-pink text-xs mt-1">{error}</p>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handleFile} />
      </div>
    </div>
  )
}
