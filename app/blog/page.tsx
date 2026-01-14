'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchIcon, Calendar, User, Tag } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
  media?: { url: string; type: string; name: string }[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

  const categories = ['actualités', 'conseils', 'guides', 'tutoriels'];

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      const response = await fetch(
        `${API_BASE_URL}/blog?page=${page}&limit=6${categoryParam}`
      );
      const data = await response.json();
      setPosts(data.data);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du blog */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Blog AutoDrive</h1>
          <p className="text-lg text-orange-100">
            Conseils, actualités et guides pour vos trajets en véhicule de location
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          {/* Recherche */}
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full font-medium transition ${selectedCategory === null
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-600'
                }`}
            >
              Tous
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full font-medium transition capitalize ${selectedCategory === cat
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Affichage des articles */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun article trouvé.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer group"
                >
                  {/* Image */}
                  {(() => {
                    const firstMediaImage = post.media?.find(m => m.type.startsWith('image/'))?.url;
                    const displayImage = (post.imageUrl === '/assets/blog-default.jpg' && firstMediaImage)
                      ? firstMediaImage
                      : (post.imageUrl || '/assets/blog-default.jpg');

                    return (
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={displayImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full capitalize">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Métadonnées */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bouton */}
                    <button className="text-orange-600 font-semibold hover:text-orange-700 group-hover:translate-x-1 transition">
                      Lire l'article →
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-600"
                >
                  ← Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${p === page
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 hover:border-orange-600'
                      }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-600"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
