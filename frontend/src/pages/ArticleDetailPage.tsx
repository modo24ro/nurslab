import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, ArrowLeft, User, Share2 } from 'lucide-react';
import { api } from '../services/api';
import { Article } from '../types';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      api.getArticleBySlug(slug)
        .then(setArticle)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading) {
    return <div className="py-24 text-center text-slate-500 bg-brand-sand">Se încarcă articolul...</div>;
  }

  if (!article) {
    return (
      <div className="py-24 text-center bg-brand-sand space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-navy">Articolul nu a fost găsit</h2>
        <Link to="/articles" className="btn-primary">Înapoi la articole</Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link to="/articles" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-green">
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Lumea Medicală</span>
        </Link>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
          
          <div className="space-y-4">
            <span className="badge-mint text-xs">
              {article.category_name || 'Publicație NursLab'}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <span>Autor: <strong>{article.author_name}</strong></span>
              <span>•</span>
              <span>Publicat: {new Date(article.published_at).toLocaleDateString('ro-RO')}</span>
              <span>•</span>
              <span>{article.reading_time_minutes} min lectură</span>
            </div>
          </div>

          {article.cover_image && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
              <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base">
            {article.content_markdown || article.excerpt}
          </div>

        </article>

      </div>
    </div>
  );
};
