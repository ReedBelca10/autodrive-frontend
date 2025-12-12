"use client"

import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

type UserProfile = {
  _id?: string
  fullName?: string
  email?: string
  role?: string
}

export default function ProfileClient() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

  async function fetchProfile() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return router.push('/login')
        throw new Error(`Erreur ${res.status}`)
      }
      const data = await res.json()
      setUser(data)
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      // ignore
    }
    router.push('/login')
  }

  async function handleRefresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Refresh failed')
      await fetchProfile()
    } catch (e: any) {
      setError(e.message || 'Impossible de rafraîchir')
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold">Mon profil</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push('/vehicles/history')}>Mes véhicules</Button>
            <Button variant="outline" onClick={handleRefresh}>Rafraîchir</Button>
            <Button variant="destructive" onClick={handleLogout}>Se déconnecter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="p-6 text-center">
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarPreview ? (
                    // preview selected file
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="preview" className="w-28 h-28 object-cover" />
                  ) : user && (user as any).avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(user as any).avatarUrl} alt="avatar" className="w-28 h-28 object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0,2).join('') : 'AD'}
                    </div>
                  )}
                </div>
                <div className="relative mt-4 flex flex-col items-center gap-2">
                  <label className="text-sm text-muted-foreground">Modifier la photo</label>
                  {/* hidden file input triggered by overlay icon */}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0] ?? null
                    if (!f) return
                    // preview
                    const url = URL.createObjectURL(f)
                    setAvatarPreview(url)
                    setUploading(true)
                    try {
                      const fd = new FormData()
                      fd.append('file', f)
                      const res = await fetch(`${API_BASE}/users/avatar`, {
                        method: 'POST',
                        body: fd,
                        credentials: 'include',
                      })
                      if (!res.ok) throw new Error('Upload failed')
                      const data = await res.json()
                      setUser((u) => ({ ...(u as any), avatarUrl: data.avatarUrl }))
                      try { localStorage.setItem('profile_updated_at', Date.now().toString()) } catch (e) {}
                    } catch (err: any) {
                      setError(err.message || 'Échec de l\'upload')
                    } finally {
                      setUploading(false)
                      // revoke preview URL after a short delay so UI updates
                      setTimeout(() => {
                        if (url) URL.revokeObjectURL(url)
                        setAvatarPreview(null)
                      }, 500)
                    }
                  }} />

                  {/* overlay upload icon */}
                  <button onClick={() => fileInputRef.current?.click()} title="Modifier la photo" className="absolute bottom-0 right-0 -mb-1 -mr-1 w-9 h-9 rounded-full bg-white border flex items-center justify-center text-blue-600 shadow">
                    {uploading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 010 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-6a4 4 0 00-4-4h-3l-2-2H10L8 5H5a4 4 0 00-2 8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l-3 3m0 0l-3-3m3 3V3" />
                      </svg>
                    )}
                  </button>
                </div>
                {avatarPreview && (
                  <div>
                    {/* release object URL when component unmounts or preview cleared */}
                  </div>
                )}
              <div className="mt-4">
                <h2 className="text-xl font-semibold">{user?.fullName || 'Utilisateur'}</h2>
                <p className="text-sm text-muted-foreground">{user?.role || 'Membre'}</p>
              </div>
              <div className="mt-6 text-left">
                <p className="text-xs text-muted-foreground">Adresse e-mail</p>
                <p className="font-medium">{user?.email || '—'}</p>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Gérez vos informations de compte et préférences.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                    <div className="py-12 text-center">Chargement du profil…</div>
                ) : error ? (
                  <div className="py-6 text-center text-destructive">{error}</div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Nom complet</label>
                      <div className="mt-1 text-lg font-medium">{user?.fullName}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">E-mail</label>
                      <div className="mt-1 text-lg font-medium">{user?.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Rôle</label>
                      <div className="mt-1 text-lg font-medium">{user?.role || 'Membre'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => router.push('/reservation')}>Nouvelle réservation</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
