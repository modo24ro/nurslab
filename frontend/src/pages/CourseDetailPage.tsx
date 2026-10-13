import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, ShieldCheck, PlayCircle, CheckCircle2, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { CourseDetail } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl, getImageStyle } from '../utils/cms';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      api.getCourseDetail(slug)
        .then(setCourse)
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  const handleEnrollFree = async () => {
    if (!user) {
      navigate('/login?redirect=/courses/' + slug);
      return;
    }
    if (!course) return;

    setEnrolling(true);
    try {
      await api.enrollCourse(course.id);
      // Navigate to first lesson
      const firstSection = course.sections[0];
      const firstLesson = firstSection?.lessons[0];
      if (firstLesson) {
        navigate(`/lessons/${firstLesson.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Eroare la înscriere');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyCourse = () => {
    if (!user) {
      navigate('/login?redirect=/checkout?course_id=' + course?.id);
    } else {
      navigate(`/checkout?course_id=${course?.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-24 text-center text-slate-500 bg-brand-sand">
        Se încarcă detaliile cursului...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen py-24 text-center bg-brand-sand space-y-4">
        <h2 className="text-2xl font-serif font-bold text-brand-navy">Cursul nu a fost găsit</h2>
        <Link to="/courses" className="btn-primary">Înapoi la cursuri</Link>
      </div>
    );
  }

  // Find first lesson to start/continue
  const firstLessonId = course.sections[0]?.lessons[0]?.id;

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-12">
        
        {/* Top Hero Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                {course.category?.name || 'Practică Clinică'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 capitalize">{course.difficulty}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {course.short_description}
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-2">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4 text-brand-green" />
                <span>{course.estimated_hours} ore de instruire</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Award className="w-4 h-4 text-brand-green" />
                <span>Certificat Atestat NursLab</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Acces pe viață</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm">
                {course.instructor_name?.charAt(0) || 'E'}
              </div>
              <div>
                <p className="text-xs text-slate-400">Formator clinic</p>
                <p className="text-sm font-bold text-brand-navy">{course.instructor_name || 'Echipa NursLab'}</p>
              </div>
            </div>
          </div>

          {/* Right Card / Media Box */}
          <div className="lg:col-span-5 bg-[#F8FAF9] p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 border border-slate-200">
              <img
                src={formatImageUrl(course.cover_image || '/images/journey_theory.jpg')}
                alt={course.title}
                style={getImageStyle(course.metadata_json)}
                className="w-full h-full object-cover"
              />
              {course.preview_video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/95 text-brand-navy flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-8 h-8 fill-brand-navy text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Price & Action */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-500">Preț acces:</span>
                {course.is_free ? (
                  <span className="text-2xl font-bold text-brand-green">Gratuit</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-brand-navy">{course.price}</span>
                    <span className="text-sm font-bold text-slate-500">{course.currency}</span>
                  </div>
                )}
              </div>

              {course.is_enrolled ? (
                <Link
                  to={`/lessons/${firstLessonId}`}
                  className="btn-primary w-full text-base py-3 justify-center shadow-md"
                >
                  <span>Continuă învățarea ({course.progress_percent || 0}%)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              ) : course.is_free ? (
                <button
                  onClick={handleEnrollFree}
                  disabled={enrolling}
                  className="btn-primary w-full text-base py-3 justify-center shadow-md"
                >
                  {enrolling ? 'Se înscrie...' : 'Înscrie-te gratuit la curs'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleBuyCourse}
                    className="btn-primary w-full text-base py-3 justify-center shadow-md"
                  >
                    <span>Cumpără cursul ({course.price} RON)</span>
                  </button>
                  <Link
                    to="/pricing"
                    className="block text-center text-xs font-semibold text-brand-green hover:underline"
                  >
                    sau activează un abonament complet NursLab Pro →
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Course Description & Curriculum Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main: Full Description */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-2xl font-serif font-bold text-brand-navy">Despre acest curs</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {course.full_description}
              </div>
            </div>

            {/* Curriculum Syllabus Accordion */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Programa cursului</h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {course.sections.length} module • {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lecții
                </span>
              </div>

              <div className="space-y-4">
                {course.sections.map((section, sIndex) => (
                  <div key={section.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 p-4 flex items-center justify-between font-medium text-brand-navy">
                      <span className="font-semibold text-sm sm:text-base">{section.title}</span>
                      <span className="text-xs text-slate-500">{section.lessons.length} lecții</span>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-sm hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <PlayCircle className="w-4 h-4 text-brand-green shrink-0" />
                            <span className="font-medium text-slate-800">{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {lesson.is_preview && (
                              <span className="badge-mint text-[10px] px-2 py-0.5">Previzualizare</span>
                            )}
                            <span className="text-xs text-slate-400">{lesson.duration_minutes} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-brand-navy">Ce vei învăța</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {course.metadata_json?.outcomes && course.metadata_json.outcomes.length > 0 ? (
                  course.metadata_json.outcomes.map((out: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>Protocoale clinice validate conform ghidurilor europene</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>Tehnici corecte de manipulare a dispozitivelor medicale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>Prevenirea complicațiilor iatrogene și a incidentelor clinice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                      <span>Test de autoevaluare cu certificat de perfecționare la final</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
