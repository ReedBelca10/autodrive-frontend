"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from '@/app/components/AvatarUpload'
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
  avatarUrl?: string
  avatarPath?: string
}

export default function ProfileClient() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return router.push('/login')
        throw new Error(`Erreur ${res.status}`)
      }
      const data = await res.json()
      // backend returns { user } shape; handle both possibilities
      const userData = (data && (data as any).user) ? (data as any).user : data
      setUser(userData)
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [API_BASE, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
              {/* Avatar upload section */}
              <AvatarUpload
                key={user?.avatarUrl}
                avatarUrl={user?.avatarUrl}
                fullName={user?.fullName}
                onAvatarChange={(avatarUrl) => {
                  setUser((u) => (u ? { ...u, avatarUrl } : null))
                  // Force refetch après 500ms pour s'assurer que le serveur a tout enregistré
                  setTimeout(() => {
                    fetchProfile()
                  }, 500)
                }}
                apiBase={API_BASE}
              />

              <div className="mt-4">
                <h2 className="text-xl font-semibold">{user?.fullName || 'Utilisateur'}</h2>
                <p className="text-sm text-muted-foreground">{user?.role || 'Membre'}</p>
              </div>
              <div className="mt-6 text-left">
                <p className="text-xs text-muted-foreground">Adresse e-mail</p>
                <p className="font-medium text-sm break-all">{user?.email || '—'}</p>
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
