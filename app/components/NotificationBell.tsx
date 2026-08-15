"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
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

interface Notification {
    _id: string;
    recipientId: string;
    senderId?: string;
    title: string;
    content: string;
    type: 'reservation_new' | 'reservation_confirmed' | 'message';
    isRead: boolean;
    createdAt: string;
    reservationId?: string | undefined;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [API_BASE]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include'
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'reservation_new': return <Bell className="text-blue-500" size={18} />;
            case 'reservation_confirmed': return <CheckCircle className="text-green-500" size={18} />;
            case 'message': return <MessageSquare className="text-purple-500" size={18} />;
            default: return <Bell className="text-gray-500" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => {
                                            if (!notification.isRead) markAsRead(notification._id);
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">{getIcon(notification.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.isRead ? 'font-bold' : 'font-medium'} text-gray-900 truncate`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                    {notification.content}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto text-gray-300 mb-3" size={32} />
                                <p className="text-sm text-gray-500">Aucune notification pour le moment</p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 border-t border-gray-100 bg-gray-50/30 transition-colors"
                    >
                        Voir toutes les notifications
                    </Link>
                </div>
            )}
        </div>
    );
}
