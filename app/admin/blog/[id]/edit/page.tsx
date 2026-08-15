"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, AlertCircle, FileUp, Image as ImageIcon, Film, Music, X } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl: string;
  published: boolean;
  media?: { url: string; type: string; name: string }[];
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [form, setForm] = useState<BlogPost>({
    _id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'AutoDrive Team',
    category: 'guides',
    tags: [],
    imageUrl: '/assets/blog-default.jpg',
    published: false,
    media: [],
  });

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE}/blog/id/${postId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement');
        }

        const data = await response.json();
        setForm(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, API_BASE]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10 MB)');
      return;
    }

    setUploadingMedia(true);
    setError('');

    try {
      console.log('[BlogEdit] Uploading media:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/blog/upload/media`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[BlogEdit] Media upload failed:', response.status, errData);
        throw new Error(errData.message || 'Erreur lors de l\'upload du média');
      }

      const data = await response.json();
      console.log('[BlogEdit] Media uploaded successfully:', data.publicUrl);
      setForm(prev => ({
        ...prev,
        media: [...(prev.media || []), {
          url: data.publicUrl,
          type: data.type,
          name: file.name
        }]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'upload');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleMarkdownImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      console.log('[BlogEdit] Markdown imported, content length:', content.length);
      setForm(prev => ({ ...prev, content }));
    };
    reader.readAsText(file);
  };

  const removeMedia = (index: number) => {
    setForm(prev => ({
      ...prev,
      media: (prev.media || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    if (!form.slug.trim()) {
      setError('Le slug est obligatoire');
      return;
    }
    if (!form.excerpt.trim()) {
      setError('L\'extrait est obligatoire');
      return;
    }
    if (!form.content.trim()) {
      setError('Le contenu est obligatoire');
      return;
    }

    setSubmitting(true);

    try {
      console.log('[BlogEdit] Submitting form:', form);
      const tagsString = Array.isArray(form.tags) ? form.tags.join(', ') : (form.tags || '');
      const tags = (tagsString as string).split(',').map(t => t.trim()).filter(t => t.length > 0);

      const response = await fetch(`${API_BASE}/blog/${form._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          author: form.author,
          category: form.category,
          tags,
          imageUrl: form.imageUrl,
          published: form.published,
          media: form.media,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('[BlogEdit] Response error:', response.status, data);
        throw new Error(data.message || `Erreur serveur (${response.status})`);
      }

      console.log('[BlogEdit] Success! Redirecting...');
      // Success - redirect to blog management
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Éditer l'article</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extrait *
            </label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contenu *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".md"
                  onChange={handleMarkdownImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="markdown-import"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileUp size={16} />
                  Importer .md
                </Button>
              </div>
            </div>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Contenu complet de l'article (supports Markdown)"
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Vous pouvez utiliser Markdown pour formater</p>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Médias associés (Images, Vidéos, Audios - Max 10MB)
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(form.media || []).map((item, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50 aspect-video flex items-center justify-center">
                  {item.type.startsWith('image/') ? (
                    <div className="relative w-full h-full">
                      <Image src={item.url} alt={item.name} fill className="object-cover" />
                    </div>
                  ) : item.type.startsWith('video/') ? (
                    <Film size={32} className="text-blue-500" />
                  ) : (
                    <Music size={32} className="text-purple-500" />
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-white/80 px-2 py-1 text-[10px] truncate">
                    {item.name}
                  </div>
                </div>
              ))}

              <label className={`border-2 border-dashed rounded-lg aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition ${uploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  onChange={handleMediaUpload}
                  className="hidden"
                  accept="image/*,video/*,audio/*"
                />
                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                  <FileUp size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {uploadingMedia ? 'Upload...' : 'Ajouter un média'}
                </span>
              </label>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auteur
            </label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="guides">Guides</option>
              <option value="conseils">Conseils</option>
              <option value="news">Actualités</option>
              <option value="tutoriels">Tutoriels</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              name="tags"
              value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
              onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Published */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-3 text-sm font-medium text-gray-700">
              Publié
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2"
            >
              <Save size={20} />
              {submitting ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </Button>
            <Link href="/admin/blog" className="flex-1">
              <Button
                type="button"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
