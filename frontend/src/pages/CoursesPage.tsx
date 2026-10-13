import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, Award, Star, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Course, Category } from '../types';
import { formatImageUrl, getImageStyle } from '../utils/cms';
import { usePageCMS } from '../utils/usePageCMS';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pageCms = usePageCMS('page_courses', {
    kicker: 'Catalog Educațional Medical',
    title: 'Cursuri Online pentru Asistenți Medicali',
    subtitle: 'De la proceduri fundamentale de recoltare până la protocoale avansate de terapie intensivă și resuscitare cardio-respiratorie.',
  });

  const selectedCategory = searchParams.get('category') || '';
  const isFreeOnly = searchParams.get('free') === 'true';
  const rawSearch = searchParams.get('search') || '';
  const searchQuery = rawSearch.trim();

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (isFreeOnly) params.is_free = 'true';
    if (searchQuery) params.search = searchQuery;

    api.getCourses(params)
      .then(setCourses)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, isFreeOnly, searchQuery]);

  const handleCategoryClick = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleFreeToggle = () => {
    const next = new URLSearchParams(searchParams);
    if (!isFreeOnly) {
      next.set('free', 'true');
    } else {
      next.delete('free');
    }
    setSearchParams(next);
  };

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          {pageCms.kicker && (
            <span className="text-xs font-bold tracking-widest text-brand-green uppercase font-sans">
              {pageCms.kicker}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {pageCms.title}
          </h1>
          {pageCms.subtitle && (
            <p className="text-base sm:text-lg text-slate-600">
              {pageCms.subtitle}
            </p>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search input */}
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams);
                  if (e.target.value) next.set('search', e.target.value);
                  else next.delete('search');
                  setSearchParams(next);
                }}
                placeholder="Caută după titlu, tehnică sau manevră clinică..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
              />
            </div>

            {/* Free only pill & Clear */}
            <div className="md:col-span-5 flex items-center justify-end gap-3">
              <button
                onClick={handleFreeToggle}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isFreeOnly
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Doar cursuri gratuite
              </button>

              {(selectedCategory || isFreeOnly || searchQuery) && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium transition-colors"
                >
                  Resetează filtrele
                </button>
              )}
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleCategoryClick('')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !selectedCategory
                  ? 'bg-brand-navy text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Toate Categoriile
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryClick(c.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === c.slug
                    ? 'bg-brand-navy text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            Se încarcă cursurile medicale...
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-serif font-bold text-brand-navy">Nu am găsit niciun curs</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Încearcă să modifici termenii de căutare sau resetează filtrele pentru a vizualiza toate cursurile disponibile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={formatImageUrl(course.cover_image || '/images/journey_theory.jpg')}
                    alt={course.title}
                    style={getImageStyle(course.metadata_json)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {course.is_free ? (
                      <span className="badge-mint">GRATUIT</span>
                    ) : (
                      <span className="badge-coral">CU PLATĂ</span>
                    )}
                    {course.featured && (
                      <span className="bg-brand-navy/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Recomandat
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>{course.category_name || 'Practică Medicală'}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.estimated_hours} ore</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors leading-snug">
                      <Link to={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {course.short_description}
                    </p>
                  </div>

                  {/* Footer & CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {course.is_free ? (
                        <span className="text-base font-bold text-brand-green">Gratuit</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-brand-navy">{course.price}</span>
                          <span className="text-xs font-semibold text-slate-500">{course.currency}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-green group-hover:text-brand-green-dark"
                    >
                      <span>Detalii curs</span>
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
