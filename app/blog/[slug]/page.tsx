'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, User, Tag, ArrowLeft, Eye } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
}

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blog/${slug}`);
        const data = await response.json();
        setPost(data);

        // Charger les articles de même catégorie
        const categoryResponse = await fetch(
          `${API_BASE_URL}/blog?category=${data.category}&limit=3`
        );
        const categoryData = await categoryResponse.json();
        setRelatedPosts(
          categoryData.data.filter((p: RelatedPost) => p.slug !== slug).slice(0, 3)
        );
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
        <Link href="/blog" className="text-orange-600 hover:text-orange-700">
          Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </div>
      </div>

      {/* Article principal */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* En-tête */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-orange-600 text-white text-sm px-3 py-1 rounded-full capitalize font-medium">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>

          {/* Métadonnées */}
          <div className="flex flex-wrap gap-6 text-gray-600 border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Par</p>
                <p className="font-semibold text-gray-900">{post.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Publié le</p>
                <p className="font-semibold text-gray-900">
                  {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Lectures</p>
                <p className="font-semibold text-gray-900">{post.views}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Image de couverture */}
        {post.imageUrl && (
          <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Contenu */}
        <div className="prose prose-lg max-w-none mb-12">
          <div
            className="bg-white p-8 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="flex items-center gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-full transition"
                >
                  <Tag className="w-4 h-4" />
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Séparateur */}
        <hr className="my-12" />

        {/* Articles connexes */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Articles connexes</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group"
                >
                  {relatedPost.imageUrl && (
                    <div className="relative h-40 bg-gray-200 overflow-hidden">
                      <img
                        src={relatedPost.imageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Appel à l'action */}
      <section className="bg-orange-600 text-white py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à louer un véhicule ?</h2>
          <p className="text-lg text-orange-100 mb-8">
            Découvrez notre large gamme de véhicules et réservez en quelques clics
          </p>
          <Link
            href="/vehicles/search"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-orange-50 transition"
          >
            RÉSERVER UN VÉHICULE
          </Link>
        </div>
      </section>
    </div>
  );
}
