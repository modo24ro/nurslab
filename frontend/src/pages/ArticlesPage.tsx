import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Clock, Calendar, ArrowRight, User } from 'lucide-react';
import { api } from '../services/api';
import { Article } from '../types';

export const ArticlesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categorySlug = searchParams.get('cat') || searchParams.get('category') || '';

  useEffect(() => {
    setIsLoading(true);
    api.getArticles(categorySlug)
      .then(setArticles)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [categorySlug]);

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-green uppercase font-sans">
            Lumea Medicală
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            Articole, Ghiduri & Perspective Clinice
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Publicații dedicate comunității medicale: carieră în nursing, inovații tehnologice, studii de caz și interviuri din spitale.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !categorySlug ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toate Articolele
          </button>
          <button
            onClick={() => setSearchParams({ cat: 'oameni-din-lumea-medicala' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categorySlug === 'oameni-din-lumea-medicala' ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Oameni din lumea medicală
          </button>
          <button
            onClick={() => setSearchParams({ cat: 'educatie-si-cariera' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categorySlug === 'educatie-si-cariera' ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Educație și carieră
          </button>
          <button
            onClick={() => setSearchParams({ cat: 'tehnologie-in-ingrijire' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              categorySlug === 'tehnologie-in-ingrijire' ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tehnologie în îngrijire
          </button>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Se încarcă articolele...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <div
                key={art.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src={art.cover_image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80'}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{art.category_name || 'Lumea medicală'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.reading_time_minutes} min lectură</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors leading-snug">
                      <Link to={`/articles/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">{art.author_name}</span>
                    <Link
                      to={`/articles/${art.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-green group-hover:text-brand-green-dark"
                    >
                      <span>Citește articolul</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
