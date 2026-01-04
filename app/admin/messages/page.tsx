"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Trash2, CheckCircle } from 'lucide-react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/contact/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.map(m => m._id === id ? { ...m, read: true } : m));
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter(m => m._id !== id));
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Messages de Contact</h1>
        <p className="text-gray-400">{messages.length} messages ({unreadCount} non lus)</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <Card
            key={msg._id}
            className={`bg-gray-800 border-gray-700 p-4 ${
              !msg.read ? 'border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-white">{msg.name}</h3>
                  {!msg.read && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      Non lu
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{msg.email}</p>
                <p className="text-gray-200 mb-2">{msg.message}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2">
                {!msg.read && (
                  <button
                    onClick={() => markAsRead(msg._id)}
                    className="p-2 text-green-400 hover:text-green-300"
                    title="Marquer comme lu"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(msg._id)}
                  className="p-2 text-red-400 hover:text-red-300"
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
