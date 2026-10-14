import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Download, BookOpen, Clock, Award, HelpCircle, Check, X, Bookmark, StickyNote
} from 'lucide-react';
import { api } from '../services/api';
import { LessonDetail, CourseDetail, Quiz, QuizResult, Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

export const LessonPlayerPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'quiz' | 'resources'>('content');

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTime, setVideoTime] = useState(0);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const { user } = useAuth();
  const { showAlert } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (lessonId) {
      setIsLoading(true);
      setQuizResult(null);
      setSelectedAnswers({});
      api.getLessonDetail(lessonId)
        .then((lData) => {
          setLesson(lData);
          setIsCompleted(lData.is_completed || false);

          // Fetch Course detail for outline
          if (lData.course_id) {
            api.getCourseDetail(lData.slug) // or course detail
              .then(setCourse)
              .catch(() => {});
          }

          // Fetch Quiz if any
          api.getQuizByLesson(lessonId)
            .then(setQuiz)
            .catch(() => setQuiz(null));

          // Fetch notes
          api.getLessonNotes(lessonId)
            .then(setNotes)
            .catch(() => setNotes([]));
        })
        .catch(async (err) => {
          console.error(err);
          await showAlert(err.message || 'Nu aveți acces la această lecție', { type: 'error', title: 'Acces Refuzat' });
          navigate('/courses');
        })
        .finally(() => setIsLoading(false));
    }
  }, [lessonId]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleToggleComplete = async () => {
    if (!lesson) return;
    const nextCompleted = !isCompleted;
    setIsCompleted(nextCompleted);

    try {
      await api.updateLessonProgress(lesson.id, {
        is_completed: nextCompleted,
        last_position_seconds: videoTime,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !newNoteContent.trim()) return;

    try {
      const added = await api.createNote({
        lesson_id: lesson.id,
        timestamp_seconds: videoTime,
        content: newNoteContent.trim(),
      });
      setNotes((prev) => [...prev, added]);
      setNewNoteContent('');
    } catch (err: any) {
      showAlert(err.message || 'Eroare la adăugarea notiței', { type: 'error', title: 'Adăugare Notiță' });
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    setIsSubmittingQuiz(true);
    const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
      question_id: qId,
      selected_option_id: optId,
    }));

    try {
      const result = await api.submitQuiz(quiz.id, answersPayload);
      setQuizResult(result);
      if (result.passed) {
        setIsCompleted(true);
      }
    } catch (err: any) {
      showAlert(err.message || 'Eroare la trimiterea răspunsurilor', { type: 'error', title: 'Verificare Quiz' });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Se încarcă modulul de învățare NursLab...
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Classroom Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Înapoi la cursuri"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-brand-green font-semibold uppercase tracking-wider">{lesson.course_title}</p>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-lg">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCompleted
                ? 'bg-brand-green text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Finalizat' : 'Marchează ca finalizat'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player on left, Outline/Tabs on right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Video & Tabs (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-black">
          
          {/* Video Player */}
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {lesson.video_url ? (
              <video
                ref={videoRef}
                src={lesson.video_url}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain"
                controlsList="nodownload"
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <PlayCircle className="w-16 h-16 text-slate-700 mx-auto" />
                <p className="text-sm text-slate-400">Această lecție constă într-un protocol clinic scris sau test grilă.</p>
              </div>
            )}
          </div>

          {/* Navigation Controls Bar */}
          <div className="bg-slate-900 px-6 py-3 border-y border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
            {lesson.prev_lesson_id ? (
              <Link
                to={`/lessons/${lesson.prev_lesson_id}`}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Lecția anterioară</span>
              </Link>
            ) : <div />}

            <span className="text-slate-500 font-normal">Durată: {lesson.duration_minutes} minute</span>

            {lesson.next_lesson_id ? (
              <Link
                to={`/lessons/${lesson.next_lesson_id}`}
                className="flex items-center gap-1 text-brand-green hover:underline"
              >
                <span>Următoarea lecție</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : <div />}
          </div>

          {/* Lower Content Tabs */}
          <div className="bg-slate-900 flex-1 p-6 space-y-6 overflow-y-auto">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-3 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('content')}
                className={`pb-2 transition-colors ${
                  activeTab === 'content'
                    ? 'text-brand-green border-b-2 border-brand-green'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Descriere & Protocol
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'notes'
                    ? 'text-brand-green border-b-2 border-brand-green'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Notițe Personale</span>
                <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded-full">{notes.length}</span>
              </button>

              {quiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === 'quiz'
                      ? 'text-brand-green border-b-2 border-brand-green'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Test de Verificare</span>
                </button>
              )}
            </div>

            {/* Tab 1: Protocol / Markdown */}
            {activeTab === 'content' && (
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <h3 className="text-lg font-serif font-bold text-white">{lesson.title}</h3>
                <div className="whitespace-pre-line text-slate-300 bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                  {lesson.content_markdown || lesson.description || 'Consultați materialul video pentru detalii complete.'}
                </div>
              </div>
            )}

            {/* Tab 2: Personal Notes with Timestamp */}
            {activeTab === 'notes' && (
              <div className="space-y-5">
                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Notiță la minutul {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Adaugă o observație clinică sau o remarcă utilă..."
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-green"
                  />
                  <button type="submit" className="btn-primary text-xs px-4 py-2">
                    Salvează notița
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500">Nu ai adăugat încă notițe pentru această lecție.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-brand-green font-semibold">
                          <span>Minutul {Math.floor(n.timestamp_seconds / 60)}:{String(n.timestamp_seconds % 60).padStart(2, '0')}</span>
                        </div>
                        <p className="text-sm text-slate-200">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Interactive Quiz */}
            {activeTab === 'quiz' && quiz && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scor minim pentru promovare: {quiz.passing_score_percent}% din punctaj.
                  </p>
                </div>

                {quizResult ? (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        quizResult.passed ? 'bg-brand-green-mint text-brand-green' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {quizResult.score_percent}%
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">
                          {quizResult.passed ? 'Felicitări! Ai promovat testul!' : 'Punctaj insuficient'}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {quizResult.passed
                            ? 'Răspunsurile tale demonstrează însușirea corectă a noțiunilor clinice.'
                            : 'Recitește materialul teoretic și reia testul grilă.'}
                        </p>
                      </div>
                    </div>

                    {/* Certificate Generated Alert */}
                    {quizResult.certificate_generated && (
                      <div className="p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                          <Award className="w-5 h-5 text-emerald-400" />
                          <span>Certificatul tău NursLab a fost eliberat!</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Cod verificare: <strong>{quizResult.certificate_code}</strong>
                        </p>
                        <Link
                          to="/dashboard"
                          className="inline-block text-xs font-bold text-emerald-400 hover:underline pt-1"
                        >
                          Vizualizează și descarcă certificatul în format PDF din contul tău →
                        </Link>
                      </div>
                    )}

                    {/* Feedback list */}
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      {quizResult.feedback.map((fb, idx) => (
                        <div key={fb.question_id} className="text-xs space-y-1">
                          <div className="flex items-center gap-2 font-semibold">
                            {fb.is_correct ? (
                              <Check className="w-4 h-4 text-brand-green" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className={fb.is_correct ? 'text-brand-green' : 'text-red-400'}>
                              Întrebarea {idx + 1}: {fb.is_correct ? 'Corect' : 'Incorect'}
                            </span>
                          </div>
                          {fb.explanation && (
                            <p className="text-slate-400 pl-6 italic">{fb.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setQuizResult(null)}
                      className="btn-secondary text-xs px-4 py-2 text-slate-900"
                    >
                      Reia testul
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuizSubmit} className="space-y-6">
                    {quiz.questions.map((q, qIndex) => (
                      <div key={q.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                        <p className="text-sm font-semibold text-white">
                          {qIndex + 1}. {q.question_text}
                        </p>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                selectedAnswers[q.id] === opt.id
                                  ? 'bg-brand-green/20 border-brand-green text-white'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={opt.id}
                                checked={selectedAnswers[q.id] === opt.id}
                                onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                className="mt-0.5 text-brand-green focus:ring-brand-green"
                              />
                              <span>{opt.option_text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={isSubmittingQuiz}
                      className="btn-primary text-sm px-6 py-3"
                    >
                      {isSubmittingQuiz ? 'Se verifică...' : 'Trimite răspunsurile și evaluează'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Syllabus Outline Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-serif font-bold text-sm text-white">Programa Cursului</h3>
            <span className="text-[11px] text-slate-400">Modul activ</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-brand-green uppercase tracking-wider">Lecții disponibile</p>
              
              <div className="space-y-1.5">
                <div
                  className="p-3 rounded-xl bg-slate-800/90 border border-brand-green/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <PlayCircle className="w-4 h-4 text-brand-green shrink-0" />
                    <span className="font-semibold text-white">{lesson.title}</span>
                  </div>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />}
                </div>

                {lesson.next_lesson_id && (
                  <Link
                    to={`/lessons/${lesson.next_lesson_id}`}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Următoarea lecție din modul</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
