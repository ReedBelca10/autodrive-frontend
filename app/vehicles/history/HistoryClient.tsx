"use client";

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Rental = {
  id: string
  vehicleName: string
  startDate: string
  endDate?: string
  status: 'finished' | 'ongoing' | 'cancelled' | string
}

export default function HistoryClient() {
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState<Rental[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        // Try to get profile to obtain user id
        const profileRes = await fetch(`${API_BASE}/auth/profile`, { credentials: 'include' })
        if (!profileRes.ok) {
          setError('Connectez-vous pour voir votre historique')
          return
        }
        const profile = await profileRes.json()
        const userId = profile._id || profile.id
        if (!userId) {
          setError('Utilisateur introuvable')
          return
        }
        // Try to fetch rentals for userId. Backend endpoint may not exist yet.
        const res = await fetch(`${API_BASE}/users/${userId}/rentals`, { credentials: 'include' })
        if (!res.ok) {
          // fallback: no backend endpoint yet
          setError('Aucun historique trouvé (endpoint backend non disponible)')
          return
        }
        const data = await res.json()
        if (!mounted) return
        setRentals(data)
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen py-12 px-6 bg-slate-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Historique des locations</h1>
        {loading ? (
          <div>Chargement…</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : rentals && rentals.length ? (
          <div className="space-y-4">
            {rentals.map(r => (
              <div key={r.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.vehicleName}</div>
                  <div className="text-sm text-muted-foreground">{r.startDate} — {r.endDate ?? 'En cours'}</div>
                </div>
                <div className={`px-3 py-1 rounded text-sm ${r.status === 'finished' ? 'bg-green-100 text-green-800' : r.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded shadow text-center">
            <p>Aucune location trouvée.</p>
            <div className="mt-4">
              <Button onClick={() => window.location.assign('/reservation')}>Réserver un véhicule</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
