import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Eye, Clock, Award, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getCourses()
      .then(setCourses)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">LMS Management</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Gestionare Cursuri & Module</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configurează curriculumul, lecțiile video, testele grilă și prețurile cursurilor.
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Titlu Curs</th>
                <th className="p-4">Categorie</th>
                <th className="p-4">Dificultate</th>
                <th className="p-4">Preț</th>
                <th className="p-4">Status Publicare</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-brand-navy max-w-xs">
                    <p className="truncate text-sm">{c.title}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{c.slug}</p>
                  </td>
                  <td className="p-4 text-slate-600">
                    {c.category_name || 'Practică'}
                  </td>
                  <td className="p-4 capitalize text-slate-600">
                    {c.difficulty}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {c.is_free ? (
                      <span className="text-brand-green font-bold">Gratuit</span>
                    ) : (
                      `${c.price} ${c.currency}`
                    )}
                  </td>
                  <td className="p-4">
                    {c.is_published ? (
                      <span className="badge-mint text-[10px] px-2 py-0.5">Publicat</span>
                    ) : (
                      <span className="badge-coral text-[10px] px-2 py-0.5">Ciornă</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/courses/${c.slug}`}
                      className="text-brand-green font-bold hover:underline"
                    >
                      Vezi curs
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
