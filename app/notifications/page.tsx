"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, MapPin, MessageSquare, CheckCircle, ChevronRight, Send, User, Trash2 } from 'lucide-react';

function formatTimeAgo(dateString: string | Date) {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "À l’instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR');
}
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface Reply {
    senderId: string;
    content: string;
    createdAt: string;
}

interface Notification {
    _id: string;
    recipientId: string;
    senderId?: string;
    title: string;
    content: string;
    type: 'reservation_new' | 'reservation_confirmed' | 'message';
    isRead: boolean;
    createdAt: string;
    reservationId?: any;
    replies: Reply[];
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeNotification, notifications]);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                if (data.length > 0 && !activeNotification) {
                    setActiveNotification(data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Erreur lors du chargement des notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [API_BASE]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeNotification || !replyContent.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch(`${API_BASE}/notifications/${activeNotification._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent }),
                credentials: 'include'
            });

            if (res.ok) {
                const updated = await res.json();
                setNotifications(notifications.map(n => n._id === updated._id ? updated : n));
                setActiveNotification(updated);
                setReplyContent('');
                toast.success('Message envoyé');
            }
        } catch (error) {
            toast.error('Erreur lors de l\'envoi');
        } finally {
            setIsSending(false);
        }
    };

    const getMapsLink = (content: string) => {
        const match = content.match(/https:\/\/www\.google\.com\/maps\?q=[^ ]+/);
        return match ? match[0] : null;
    };

    const getIcon = (type: string, isRead: boolean) => {
        switch (type) {
            case 'reservation_new': return <Bell className={isRead ? 'text-gray-400' : 'text-blue-500'} size={20} />;
            case 'reservation_confirmed': return <CheckCircle className={isRead ? 'text-gray-400' : 'text-green-500'} size={20} />;
            case 'message': return <MessageSquare className={isRead ? 'text-gray-400' : 'text-purple-500'} size={20} />;
            default: return <Bell className="text-gray-400" size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Centre de Notifications</h1>
                    <p className="text-gray-500 mt-2">Gérez vos réservations et vos échanges avec l’équipe AutoDrive.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Notifications List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
                                Messages récents
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => {
                                                setActiveNotification(n);
                                                if (!n.isRead) markAsRead(n._id);
                                            }}
                                            className={`p-4 cursor-pointer transition-all hover:bg-blue-50/50 relative ${activeNotification?._id === n._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1">{getIcon(n.type, n.isRead)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-gray-900 truncate`}>{n.title}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{n.content}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2">
                                                        {formatTimeAgo(n.createdAt)}
                                                    </p>
                                                </div>
                                                {!n.isRead && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400">
                                        <Bell className="mx-auto mb-3 opacity-20" size={48} />
                                        <p>Aucune notification</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notification Content & Conversation */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeNotification ? (
                            <Card className="rounded-2xl border-none shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                                {/* Header */}
                                <div className="p-6 bg-white border-b border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                                {getIcon(activeNotification.type, false)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">{activeNotification.title}</h2>
                                                <p className="text-sm text-gray-500">
                                                    {formatTimeAgo(activeNotification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body / Conversation */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
                                    {/* Initial Message */}
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Bell className="text-blue-600" size={18} />
                                        </div>
                                        <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                            <p className="text-gray-800 leading-relaxed">{activeNotification.content}</p>

                                            {getMapsLink(activeNotification.content) && (
                                                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="text-green-600" />
                                                        <div>
                                                            <p className="text-sm font-bold text-green-800">Localisation de l’agence</p>
                                                            <p className="text-xs text-green-600">Ouvrir dans Google Maps</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={getMapsLink(activeNotification.content)!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                                    >
                                                        Y ALLER
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {activeNotification.replies.map((reply, idx) => {
                                        const isCurrentUser = reply.senderId === activeNotification.recipientId;
                                        return (
                                            <div key={idx} className={`flex gap-4 items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} overflow-hidden`}>
                                                    <User size={18} />
                                                </div>
                                                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm border transition-all ${isCurrentUser
                                                    ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none'
                                                    : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">{reply.content}</p>
                                                    <p className={`text-[10px] mt-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                                        {formatTimeAgo(reply.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Footer / Reply Input */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleReply} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Votre réponse..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={isSending || !replyContent.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                                        >
                                            {isSending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send size={18} />}
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
                                <Bell size={64} className="mb-4 opacity-10" />
                                <p className="text-lg">Sélectionnez une notification pour voir les détails et répondre.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
