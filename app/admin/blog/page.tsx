"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Edit, Trash2, Plus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  published: boolean;
  publishedAt: string;
  views: number;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  // Fetch blog posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/blog`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des articles');
      }

      const responseData = await response.json();
      // L'API retourne { data, total, pages } ou juste un tableau
      const postsData = Array.isArray(responseData) ? responseData : responseData.data || [];
      setPosts(postsData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Delete a post
  const handleDelete = async (id: string, skipConfirm = false) => {
    if (!skipConfirm) {
      toast("Confirmation de suppression", {
        description: "Êtes-vous sûr de vouloir supprimer cet article ?",
        action: {
          label: "Supprimer",
          onClick: () => handleDelete(id, true),
        },
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setPosts(posts.filter(post => post._id !== id));
      toast.success('Article supprimé avec succès');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setPosts(posts.map(post =>
        post._id === id ? { ...post, published: !currentStatus } : post
      ));
      toast.success(currentStatus ? 'Article archivé' : 'Article publié');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
          <p className="text-gray-600 mt-2">Gérez tous les articles du blog AutoDrive</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={20} />
            Nouvel Article
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Chargement des articles...</div>
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Aucun article trouvé</p>
          <Link href="/admin/blog/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Créer le premier article
            </Button>
          </Link>
        </Card>
      ) : (
        /* Blog posts table */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Auteur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vues</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.author}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(post._id, post.published)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${post.published
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {post.published ? (
                        <>
                          <Eye size={16} />
                          Publié
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          Brouillon
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.views}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blog/${post._id}/edit`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
