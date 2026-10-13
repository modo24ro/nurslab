import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Plus, Edit2, Trash2, Copy, Eye, CheckCircle2, XCircle,
  Search, SlidersHorizontal, Award, Clock, Users, ArrowRight,
  FileText, Video, HelpCircle, Archive, AlertCircle, Save, X,
  Layers, Check, Sparkles, ChevronDown, ChevronRight, ShieldCheck,
  Tag, DollarSign, Globe, PlayCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { CourseAdmin, Category, InstructorOption, CourseSectionAdmin, LessonAdmin } from '../../types';
import { VisualImageCropper } from '../../components/admin/VisualImageCropper';
import { formatImageUrl, getImageStyle } from '../../utils/cms';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseAdmin[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Editor Modal State
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseAdmin | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'image' | 'instructor' | 'curriculum' | 'outcomes' | 'pricing' | 'seo'>('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<CourseAdmin | null>(null);

  // Curriculum sub-form states
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');
  const [activeSectionIdForLesson, setActiveSectionIdForLesson] = useState<string | null>(null);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    lesson_type: 'video' as any,
    duration_minutes: 15,
    is_preview: false,
    video_url: '',
    content_markdown: '',
  });

  // Section Edit State
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<{ title: string; description: string }>({
    title: '',
    description: '',
  });

  // Lesson Edit State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonData, setEditingLessonData] = useState<{
    title: string;
    lesson_type: 'video' | 'article' | 'quiz' | 'workshop';
    duration_minutes: number;
    is_preview: boolean;
    video_url: string;
    content_markdown: string;
  }>({
    title: '',
    lesson_type: 'video',
    duration_minutes: 15,
    is_preview: false,
    video_url: '',
    content_markdown: '',
  });

  // Course Form Data State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    full_description: '',
    category_id: '',
    instructor_id: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimated_hours: 5,
    is_free: false,
    price: 99.00,
    currency: 'RON',
    status: 'draft',
    is_published: false,
    featured: false,
    has_certificate: true,
    completion_threshold_percent: 80,
    cover_image: '/images/journey_theory.jpg',
    preview_video_url: '',
    metadata_json: {
      image_position: 'center center',
      image_position_x: 50,
      image_position_y: 50,
      zoom: 1.0,
      object_fit: 'cover',
      language: 'Română',
      outcomes: ['Însușirea protocoalelor clinice esențiale', 'Dezvoltarea gândirii critice în urgențe'],
      skills: ['Monitorizare pacient', 'Administrare medicație'],
      prerequisites: ['Diplomă de asistent medical sau student'],
      target_audience: ['Asistenți medicali generaliști', 'Studenți nursing'],
      seo_title: '',
      meta_description: '',
    } as any,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesList, catList, instList] = await Promise.all([
        api.getAdminCourses(),
        api.getCategories(),
        api.getInstructors().catch(() => []),
      ]);
      setCourses(coursesList);
      setCategories(catList);
      setInstructors(instList);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Eroare la încărcarea cursurilor.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick KPI Stats
  const totalCoursesCount = courses.length;
  const publishedCount = courses.filter((c) => c.status === 'published' || c.is_published).length;
  const draftsCount = courses.filter((c) => c.status === 'draft' || (!c.is_published && c.status !== 'archived')).length;
  const archivedCount = courses.filter((c) => c.status === 'archived').length;

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSlug = c.slug.toLowerCase().includes(q);
      const matchInst = c.instructor_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchInst) return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'published' && c.status !== 'published' && !c.is_published) return false;
      if (statusFilter === 'draft' && c.status !== 'draft' && (c.is_published || c.status === 'archived')) return false;
      if (statusFilter === 'archived' && c.status !== 'archived') return false;
    }
    if (categoryFilter !== 'all' && c.category_id !== categoryFilter) {
      return false;
    }
    if (priceFilter === 'free' && !c.is_free) return false;
    if (priceFilter === 'paid' && c.is_free) return false;
    return true;
  });

  // Open Create Modal
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setActiveTab('general');
    setFormData({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      instructor_id: instructors.length > 0 ? instructors[0].id : '',
      difficulty: 'beginner',
      estimated_hours: 6,
      is_free: false,
      price: 129.00,
      currency: 'RON',
      status: 'draft',
      is_published: false,
      featured: false,
      has_certificate: true,
      completion_threshold_percent: 80,
      cover_image: '/images/journey_theory.jpg',
      preview_video_url: '',
      metadata_json: {
        image_position: 'center center',
        image_position_x: 50,
        image_position_y: 50,
        zoom: 1.0,
        object_fit: 'cover',
        language: 'Română',
        outcomes: ['Însușirea procedurilor clinice corecte', 'Comunicarea eficientă în echipă'],
        skills: ['Evaluare inițială', 'Siguranța pacientului'],
        prerequisites: ['Diplomă de asistent medical sau student'],
        target_audience: ['Asistenți medicali generaliști'],
        seo_title: '',
        meta_description: '',
      },
    });
    setEditorModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditCourse = (c: CourseAdmin) => {
    setEditingCourse(c);
    setActiveTab('general');
    setFormData({
      title: c.title,
      slug: c.slug,
      short_description: c.short_description,
      full_description: c.full_description,
      category_id: c.category_id || '',
      instructor_id: c.instructor_id || '',
      difficulty: c.difficulty,
      estimated_hours: c.estimated_hours,
      is_free: c.is_free,
      price: Number(c.price),
      currency: c.currency,
      status: c.status || (c.is_published ? 'published' : 'draft'),
      is_published: c.is_published,
      featured: c.featured,
      has_certificate: c.has_certificate,
      completion_threshold_percent: c.completion_threshold_percent,
      cover_image: c.cover_image || '/images/journey_theory.jpg',
      preview_video_url: c.preview_video_url || '',
      metadata_json: {
        image_position: 'center center',
        image_position_x: 50,
        image_position_y: 50,
        zoom: 1.0,
        object_fit: 'cover',
        language: 'Română',
        outcomes: ['Însușirea procedurilor clinice corecte'],
        skills: ['Evaluare inițială'],
        prerequisites: ['Diplomă de asistent medical'],
        target_audience: ['Asistenți medicali'],
        seo_title: '',
        meta_description: '',
        ...(c.metadata_json || {}),
      },
    });
    setEditorModalOpen(true);
  };

  // Save Course
  const handleSaveCourse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = {
        title: formData.title,
        slug: formData.slug || undefined,
        short_description: formData.short_description,
        full_description: formData.full_description,
        category_id: formData.category_id || undefined,
        instructor_id: formData.instructor_id || undefined,
        difficulty: formData.difficulty,
        estimated_hours: Number(formData.estimated_hours),
        is_free: formData.is_free,
        price: Number(formData.price),
        currency: formData.currency,
        status: formData.status,
        is_published: formData.status === 'published',
        featured: formData.featured,
        has_certificate: formData.has_certificate,
        completion_threshold_percent: Number(formData.completion_threshold_percent),
        cover_image: formData.cover_image,
        preview_video_url: formData.preview_video_url || undefined,
        metadata_json: formData.metadata_json,
      };

      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.id, payload);
        setEditingCourse(updated);
        setMessage({ type: 'success', text: 'Cursul a fost actualizat cu succes!' });
      } else {
        const created = await api.createCourse(payload);
        setEditingCourse(created);
        setMessage({ type: 'success', text: 'Cursul a fost creat! Acum poți adăuga secțiuni și lecții.' });
      }

      await loadData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Eroare la salvarea cursului.' });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Publish Status Quick Action
  const handleTogglePublish = async (c: CourseAdmin) => {
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    const isPub = newStatus === 'published';
    try {
      await api.updateCourse(c.id, { status: newStatus, is_published: isPub });
      setMessage({
        type: 'success',
        text: `Cursul "${c.title}" este acum ${isPub ? 'Publicat' : 'Ciornă'}.`,
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la actualizarea statusului.' });
    }
  };

  // Duplicate Course
  const handleDuplicateCourse = async (c: CourseAdmin) => {
    if (!window.confirm(`Doriți să duplicați cursul "${c.title}" împreună cu structura sa de lecții?`)) return;
    try {
      const dup = await api.duplicateCourse(c.id);
      setMessage({ type: 'success', text: `Cursul a fost duplicat cu succes sub numele "${dup.title}".` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la duplicare.' });
    }
  };

  // Archive Course
  const handleArchiveCourse = async (c: CourseAdmin) => {
    if (!window.confirm(`Doriți să arhivați cursul "${c.title}"? Nu va mai fi vizibil public.`)) return;
    try {
      await api.updateCourse(c.id, { status: 'archived', is_published: false });
      setMessage({ type: 'success', text: `Cursul "${c.title}" a fost arhivat.` });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la arhivare.' });
    }
  };

  // Delete Course
  const handleDeleteCourse = async (c: CourseAdmin) => {
    if (!window.confirm(`ATENȚIE: Sunteți sigur că doriți să ștergeți definitiv cursul "${c.title}"? Această acțiune nu poate fi anulată.`)) return;
    try {
      await api.deleteCourse(c.id);
      setMessage({ type: 'success', text: 'Cursul a fost șters definitiv.' });
      if (editorModalOpen && editingCourse?.id === c.id) {
        setEditorModalOpen(false);
      }
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la ștergerea cursului.' });
    }
  };

  // Section CRUD
  const handleAddSection = async () => {
    if (!editingCourse) return;
    if (!newSectionTitle.trim()) return;
    try {
      await api.createCourseSection(editingCourse.id, {
        title: newSectionTitle,
        description: newSectionDesc,
        order_index: editingCourse.sections.length,
      });
      setNewSectionTitle('');
      setNewSectionDesc('');
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      const curr = updatedList.find((x) => x.id === editingCourse.id);
      if (curr) setEditingCourse(curr);
      setMessage({ type: 'success', text: 'Secțiunea a fost adăugată!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la adăugarea secțiunii.' });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Sigur doriți să ștergeți această secțiune și toate lecțiile sale?')) return;
    try {
      await api.deleteCourseSection(sectionId);
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      if (editingCourse) {
        const curr = updatedList.find((x) => x.id === editingCourse.id);
        if (curr) setEditingCourse(curr);
      }
      setMessage({ type: 'success', text: 'Secțiunea a fost ștearsă.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la ștergerea secțiunii.' });
    }
  };

  // Lesson CRUD
  const handleAddLesson = async (sectionId: string) => {
    if (!newLessonData.title.trim()) return;
    try {
      await api.createLesson(sectionId, {
        title: newLessonData.title,
        lesson_type: newLessonData.lesson_type,
        duration_minutes: Number(newLessonData.duration_minutes),
        is_preview: newLessonData.is_preview,
        video_url: newLessonData.video_url || undefined,
        content_markdown: newLessonData.content_markdown || undefined,
        is_published: true,
      });
      setNewLessonData({
        title: '',
        lesson_type: 'video',
        duration_minutes: 15,
        is_preview: false,
        video_url: '',
        content_markdown: '',
      });
      setActiveSectionIdForLesson(null);
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      if (editingCourse) {
        const curr = updatedList.find((x) => x.id === editingCourse.id);
        if (curr) setEditingCourse(curr);
      }
      setMessage({ type: 'success', text: 'Lecția a fost adăugată!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la adăugarea lecției.' });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Sigur doriți să ștergeți această lecție?')) return;
    try {
      await api.deleteLesson(lessonId);
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      if (editingCourse) {
        const curr = updatedList.find((x) => x.id === editingCourse.id);
        if (curr) setEditingCourse(curr);
      }
      setMessage({ type: 'success', text: 'Lecția a fost ștearsă.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la ștergerea lecției.' });
    }
  };

  // Section Editing Handlers
  const handleStartEditSection = (sec: CourseSectionAdmin) => {
    setEditingSectionId(sec.id);
    setEditingSectionData({
      title: sec.title,
      description: sec.description || '',
    });
  };

  const handleSaveEditSection = async (sectionId: string) => {
    if (!editingSectionData.title.trim()) return;
    try {
      await api.updateCourseSection(sectionId, {
        title: editingSectionData.title,
        description: editingSectionData.description || undefined,
      });
      setEditingSectionId(null);
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      if (editingCourse) {
        const curr = updatedList.find((x) => x.id === editingCourse.id);
        if (curr) setEditingCourse(curr);
      }
      setMessage({ type: 'success', text: 'Modulul a fost actualizat cu succes!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la actualizarea modulului.' });
    }
  };

  // Lesson Editing Handlers
  const handleStartEditLesson = (les: LessonAdmin) => {
    setEditingLessonId(les.id);
    setEditingLessonData({
      title: les.title,
      lesson_type: les.lesson_type as any,
      duration_minutes: les.duration_minutes || 15,
      is_preview: les.is_preview || false,
      video_url: les.video_url || '',
      content_markdown: les.content_markdown || '',
    });
  };

  const handleSaveEditLesson = async (lessonId: string) => {
    if (!editingLessonData.title.trim()) return;
    try {
      await api.updateLesson(lessonId, {
        title: editingLessonData.title,
        lesson_type: editingLessonData.lesson_type,
        duration_minutes: Number(editingLessonData.duration_minutes),
        is_preview: editingLessonData.is_preview,
        video_url: editingLessonData.video_url || undefined,
        content_markdown: editingLessonData.content_markdown || undefined,
      });
      setEditingLessonId(null);
      const updatedList = await api.getAdminCourses();
      setCourses(updatedList);
      if (editingCourse) {
        const curr = updatedList.find((x) => x.id === editingCourse.id);
        if (curr) setEditingCourse(curr);
      }
      setMessage({ type: 'success', text: 'Lecția a fost actualizată cu succes!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la actualizarea lecției.' });
    }
  };

  // Outcomes array helpers
  const handleAddOutcome = () => {
    const list = [...(formData.metadata_json.outcomes || [])];
    list.push('Obiectiv nou de învățare');
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, outcomes: list },
    }));
  };

  const handleUpdateOutcome = (index: number, val: string) => {
    const list = [...(formData.metadata_json.outcomes || [])];
    list[index] = val;
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, outcomes: list },
    }));
  };

  const handleRemoveOutcome = (index: number) => {
    const list = [...(formData.metadata_json.outcomes || [])];
    list.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, outcomes: list },
    }));
  };

  // Prerequisites array helpers
  const handleAddPrereq = () => {
    const list = [...(formData.metadata_json.prerequisites || [])];
    list.push('Cerință prealabilă');
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, prerequisites: list },
    }));
  };

  const handleUpdatePrereq = (index: number, val: string) => {
    const list = [...(formData.metadata_json.prerequisites || [])];
    list[index] = val;
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, prerequisites: list },
    }));
  };

  const handleRemovePrereq = (index: number) => {
    const list = [...(formData.metadata_json.prerequisites || [])];
    list.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      metadata_json: { ...prev.metadata_json, prerequisites: list },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Notification Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Header and KPI Statistics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">LMS Management & Curriculum</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Gestionare Cursuri Medicale</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Creează, editează, duplică și publică programele de instruire clinică, modulele și lecțiile video.
          </p>
        </div>

        <button
          onClick={handleOpenCreateCourse}
          className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă Curs Nou</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cursuri</p>
          <p className="text-2xl font-serif font-bold text-brand-navy mt-1">{totalCoursesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Publicate Activ</p>
          <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Ciorne (În lucru)</p>
          <p className="text-2xl font-serif font-bold text-amber-600 mt-1">{draftsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arhivate</p>
          <p className="text-2xl font-serif font-bold text-slate-600 mt-1">{archivedCount}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută după titlu curs, slug sau instructor..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-green/30"
          >
            <option value="all">Toate Statusurile</option>
            <option value="published">Publicate</option>
            <option value="draft">Ciorne</option>
            <option value="archived">Arhivate</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-green/30"
          >
            <option value="all">Toate Categoriile</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Price filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-green/30"
          >
            <option value="all">Toate Prețurile</option>
            <option value="free">Doar Gratuite</option>
            <option value="paid">Doar Cu Plată</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Se încarcă catalogul complet de cursuri...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">Nu a fost găsit niciun curs conform filtrelor selectate.</p>
            <p className="text-xs text-slate-400">Încearcă să resetezi căutarea sau adaugă un nou curs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Curs</th>
                  <th className="px-6 py-4">Categorie & Instructor</th>
                  <th className="px-6 py-4">Structură & Ore</th>
                  <th className="px-6 py-4">Preț</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Acțiuni Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={formatImageUrl(c.cover_image || '/images/journey_theory.jpg')}
                          alt=""
                          style={getImageStyle(c.metadata_json)}
                          className="w-14 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-900 line-clamp-1">{c.title}</p>
                          <p className="text-[11px] font-mono text-slate-400 line-clamp-1">/{c.slug}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="capitalize text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {c.difficulty}
                            </span>
                            {c.featured && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Recomandat
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-brand-navy">{c.category_name || 'Practică'}</span>
                        <p className="text-[11px] text-slate-400">{c.instructor_name || 'Echipa NursLab'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-brand-green" />
                          <span>{c.estimated_hours} ore</span>
                        </div>
                        <p className="text-slate-400">
                          {c.total_sections_count || c.sections?.length || 0} module • {c.total_lessons_count || 0} lecții
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {c.is_free ? (
                        <span className="badge-mint text-[10px]">GRATUIT</span>
                      ) : (
                        <span className="font-bold text-slate-900">{c.price} {c.currency}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {c.status === 'published' || c.is_published ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Publicat
                        </span>
                      ) : c.status === 'archived' ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full text-[10px]">
                          <Archive className="w-3 h-3" /> Arhivat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full text-[10px]">
                          <XCircle className="w-3 h-3" /> Ciornă
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewCourse(c);
                            setPreviewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-brand-navy hover:bg-slate-100 rounded-lg transition-colors"
                          title="Previzualizare Curs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditCourse(c)}
                          className="p-1.5 text-slate-600 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editează Curs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateCourse(c)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplică Curs"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(c)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.is_published
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={c.is_published ? 'Retrage la Ciornă' : 'Publică pe site'}
                        >
                          {c.is_published ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleArchiveCourse(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Arhivează Curs"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c)}
                          className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Șterge definitiv"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* COMPREHENSIVE COURSE EDITOR MODAL */}
      {editorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
                  {editingCourse ? `ID: ${editingCourse.id}` : 'Creare Curs Nou'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-brand-navy">
                  {editingCourse ? `Editare: ${editingCourse.title}` : 'Adaugă Curs Clinic Nou'}
                </h2>
              </div>
              <button
                onClick={() => setEditorModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'general' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1. Informații Generale
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'image' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2. Copertă & Încadrare Vizuală
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instructor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'instructor' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                3. Instructor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'curriculum' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                4. Curriculum & Lecții ({editingCourse?.sections?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outcomes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'outcomes' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                5. Obiective & Cerințe
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'pricing' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                6. Preț & Înscriere
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'seo' ? 'bg-brand-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                7. SEO
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCourse} className="space-y-6 text-xs">
              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Titlu Curs *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ex: Monitorizarea Funcțiilor Vitale și Urgențe Majore"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">URL Slug (identificator unic)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="lasă gol pentru auto-generare"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Categorie Curs *</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-green/30"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Scurt Rezumat (afișat pe carduri) *</label>
                    <textarea
                      rows={2}
                      required
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Rezumat concis în 1-2 propoziții..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Descriere Completă a Cursului *</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      placeholder="Detaliază programa, metodologia și importanța practică..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Dificultate</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-green/30"
                      >
                        <option value="beginner">Începător (Beginner)</option>
                        <option value="intermediate">Intermediar</option>
                        <option value="advanced">Avansat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Ore Estimate</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.estimated_hours}
                        onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Status Curs</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-green/30"
                      >
                        <option value="draft">Ciornă (Draft)</option>
                        <option value="published">Publicat</option>
                        <option value="archived">Arhivat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Prag Certificat (%)</label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={formData.completion_threshold_percent}
                        onChange={(e) => setFormData({ ...formData, completion_threshold_percent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                      />
                      <span>Curs Recomandat (Featured)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.has_certificate}
                        onChange={(e) => setFormData({ ...formData, has_certificate: e.target.checked })}
                        className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                      />
                      <span>Acordă Certificat de Absolvire</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: VISUAL IMAGE CROPPER */}
              {activeTab === 'image' && (
                <div className="space-y-4">
                  <VisualImageCropper
                    label="Copertă Curs & Poziționare Imagine (Visual Crop)"
                    imageUrl={formData.cover_image}
                    onImageUrlChange={(newUrl) => setFormData((prev) => ({ ...prev, cover_image: newUrl }))}
                    metadata={formData.metadata_json}
                    onChange={(updatedMeta) =>
                      setFormData((prev) => ({
                        ...prev,
                        metadata_json: { ...prev.metadata_json, ...updatedMeta },
                      }))
                    }
                    cardType="default"
                    cardTitle={formData.title || 'Titlu Curs'}
                    badge={formData.is_free ? 'GRATUIT' : `${formData.price} RON`}
                  />

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">URL Video Trailer / Previzualizare Curs (opțional)</label>
                    <input
                      type="url"
                      value={formData.preview_video_url}
                      onChange={(e) => setFormData({ ...formData, preview_video_url: e.target.value })}
                      placeholder="https://...mp4 sau link video"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: INSTRUCTOR */}
              {activeTab === 'instructor' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Selectează Instructor din Comunitate</label>
                      <select
                        value={formData.instructor_id}
                        onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-green/30"
                      >
                        <option value="">-- Fără Instructor Asignat (Echipa NursLab) --</option>
                        {instructors.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.full_name} ({inst.specialty || inst.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                      <p className="font-bold text-slate-800">Formator Asignat Cursului</p>
                      <p className="text-slate-500 text-[11px]">
                        Informațiile despre experiența și spitalul formatorului sunt legate direct de profilul său de utilizator.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CURRICULUM & LESSONS */}
              {activeTab === 'curriculum' && (
                <div className="space-y-6">
                  {!editingCourse ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl">
                      Salvează mai întâi cursul pentru a putea adăuga module și lecții structurate.
                    </div>
                  ) : (
                    <>
                      {/* Add Section Form */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <span className="font-bold text-brand-navy flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-brand-green" />
                          <span>Adaugă Modul / Secțiune Nouă</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="Titlu modul (ex: Modulul 1: Tehnica Puncției Venoase)"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                          />
                          <input
                            type="text"
                            value={newSectionDesc}
                            onChange={(e) => setNewSectionDesc(e.target.value)}
                            placeholder="Descriere sumară modul..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSection}
                          disabled={!newSectionTitle.trim()}
                          className="btn-secondary text-xs px-4 py-1.5 font-semibold"
                        >
                          Adaugă Modul
                        </button>
                      </div>

                      {/* Sections and Lessons Accordion */}
                      <div className="space-y-4">
                        {editingCourse.sections.length === 0 ? (
                          <p className="text-slate-400 italic text-center py-4">Nu există încă secțiuni în acest curs.</p>
                        ) : (
                          editingCourse.sections.map((sec, secIdx) => (
                            <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                                <div>
                                  <p className="font-bold text-brand-navy">
                                    {secIdx + 1}. {sec.title}
                                  </p>
                                  {sec.description && <p className="text-slate-400 text-[11px]">{sec.description}</p>}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditSection(sec)}
                                    className="p-1.5 text-slate-500 hover:text-brand-navy hover:bg-slate-200/60 rounded-lg transition-colors"
                                    title="Editează Modul"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveSectionIdForLesson(activeSectionIdForLesson === sec.id ? null : sec.id)}
                                    className="btn-primary text-[11px] px-3 py-1 flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Adaugă Lecție
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSection(sec.id)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Șterge Modul"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Form to edit this section */}
                              {editingSectionId === sec.id && (
                                <div className="p-4 bg-blue-50/70 border-b border-blue-100 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-blue-900 text-xs">Editare Modul: {sec.title}</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Titlu Modul *</label>
                                      <input
                                        type="text"
                                        value={editingSectionData.title}
                                        onChange={(e) => setEditingSectionData({ ...editingSectionData, title: e.target.value })}
                                        placeholder="Titlu modul..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Descriere Modul</label>
                                      <input
                                        type="text"
                                        value={editingSectionData.description}
                                        onChange={(e) => setEditingSectionData({ ...editingSectionData, description: e.target.value })}
                                        placeholder="Descriere sumară modul..."
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditSection(sec.id)}
                                      disabled={!editingSectionData.title.trim()}
                                      className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-xs"
                                    >
                                      <Save className="w-3.5 h-3.5" /> Salvează Modulul
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSectionId(null)}
                                      className="btn-secondary text-xs px-3 py-1.5"
                                    >
                                      Anulează
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Form to add lesson inside this section */}
                              {activeSectionIdForLesson === sec.id && (
                                <div className="p-4 bg-emerald-50/50 border-b border-slate-100 space-y-3">
                                  <span className="font-bold text-emerald-800">Lecție nouă pentru: {sec.title}</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                      type="text"
                                      value={newLessonData.title}
                                      onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                                      placeholder="Titlu lecție *"
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                                    />
                                    <select
                                      value={newLessonData.lesson_type}
                                      onChange={(e) => setNewLessonData({ ...newLessonData, lesson_type: e.target.value as any })}
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                                    >
                                      <option value="video">Video</option>
                                      <option value="article">Articol Text</option>
                                      <option value="quiz">Test Grilă</option>
                                      <option value="workshop">Workshop Practic</option>
                                    </select>
                                    <input
                                      type="number"
                                      min={1}
                                      value={newLessonData.duration_minutes}
                                      onChange={(e) => setNewLessonData({ ...newLessonData, duration_minutes: Number(e.target.value) })}
                                      placeholder="Durată (min)"
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      value={newLessonData.video_url}
                                      onChange={(e) => setNewLessonData({ ...newLessonData, video_url: e.target.value })}
                                      placeholder="URL Video (ex: /media/... sau https://...)"
                                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                                    />
                                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={newLessonData.is_preview}
                                        onChange={(e) => setNewLessonData({ ...newLessonData, is_preview: e.target.checked })}
                                        className="rounded text-brand-green w-4 h-4"
                                      />
                                      <span>Lecție demonstrativă gratuită (Preview liber)</span>
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAddLesson(sec.id)}
                                      disabled={!newLessonData.title.trim()}
                                      className="btn-primary text-xs px-4 py-1.5"
                                    >
                                      Salvează Lecția
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveSectionIdForLesson(null)}
                                      className="btn-secondary text-xs px-3 py-1.5"
                                    >
                                      Anulează
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Lessons list inside section */}
                              <div className="divide-y divide-slate-100">
                                {sec.lessons.length === 0 ? (
                                  <p className="p-3 text-slate-400 italic text-[11px]">Nicio lecție adăugată în acest modul.</p>
                                ) : (
                                  sec.lessons.map((les, lesIdx) => (
                                    editingLessonId === les.id ? (
                                      <div key={les.id} className="p-4 bg-amber-50/50 border-b border-amber-200/60 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-amber-900 text-xs">Editare Lecție: {les.title}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                          <div className="sm:col-span-1">
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Titlu lecție *</label>
                                            <input
                                              type="text"
                                              value={editingLessonData.title}
                                              onChange={(e) => setEditingLessonData({ ...editingLessonData, title: e.target.value })}
                                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-green/30"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tip lecție</label>
                                            <select
                                              value={editingLessonData.lesson_type}
                                              onChange={(e) => setEditingLessonData({ ...editingLessonData, lesson_type: e.target.value as any })}
                                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                                            >
                                              <option value="video">Video</option>
                                              <option value="article">Articol Text</option>
                                              <option value="quiz">Test Grilă</option>
                                              <option value="workshop">Workshop Practic</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Durată (minute)</label>
                                            <input
                                              type="number"
                                              min={1}
                                              value={editingLessonData.duration_minutes}
                                              onChange={(e) => setEditingLessonData({ ...editingLessonData, duration_minutes: Number(e.target.value) })}
                                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">URL Video / Resursă</label>
                                            <input
                                              type="text"
                                              value={editingLessonData.video_url}
                                              onChange={(e) => setEditingLessonData({ ...editingLessonData, video_url: e.target.value })}
                                              placeholder="ex: /media/... sau https://..."
                                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                                            />
                                          </div>
                                          <div className="flex items-center pt-5">
                                            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 text-xs">
                                              <input
                                                type="checkbox"
                                                checked={editingLessonData.is_preview}
                                                onChange={(e) => setEditingLessonData({ ...editingLessonData, is_preview: e.target.checked })}
                                                className="rounded text-brand-green w-4 h-4"
                                              />
                                              <span>Lecție demonstrativă gratuită (Preview liber)</span>
                                            </label>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleSaveEditLesson(les.id)}
                                            disabled={!editingLessonData.title.trim()}
                                            className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-xs"
                                          >
                                            <Save className="w-3.5 h-3.5" /> Salvează Modificările
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingLessonId(null)}
                                            className="btn-secondary text-xs px-3 py-1.5"
                                          >
                                            Anulează
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div key={les.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                                        <div className="flex items-center gap-2.5">
                                          {les.lesson_type === 'video' ? (
                                            <Video className="w-4 h-4 text-brand-green" />
                                          ) : les.lesson_type === 'quiz' ? (
                                            <HelpCircle className="w-4 h-4 text-purple-600" />
                                          ) : (
                                            <FileText className="w-4 h-4 text-blue-600" />
                                          )}
                                          <div>
                                            <p className="font-semibold text-slate-800">
                                              {secIdx + 1}.{lesIdx + 1} {les.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                              <span>{les.duration_minutes} min</span>
                                              {les.is_preview && <span className="text-emerald-600 font-bold">• Preview gratuit</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleStartEditLesson(les)}
                                            className="p-1 text-slate-500 hover:text-brand-green hover:bg-slate-100 rounded transition-colors"
                                            title="Editează lecție"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteLesson(les.id)}
                                            className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                            title="Șterge lecție"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    )
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 5: LEARNING OUTCOMES & PREREQUISITES */}
              {activeTab === 'outcomes' && (
                <div className="space-y-6">
                  {/* Objectives */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Obiective de Învățare (Ce vei învăța)</span>
                      <button
                        type="button"
                        onClick={handleAddOutcome}
                        className="btn-secondary text-[11px] px-3 py-1 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Adaugă Obiectiv
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.metadata_json.outcomes || []).map((out: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                          <input
                            type="text"
                            value={out}
                            onChange={(e) => handleUpdateOutcome(idx, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOutcome(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Prerechizite & Cerințe Prealabile</span>
                      <button
                        type="button"
                        onClick={handleAddPrereq}
                        className="btn-secondary text-[11px] px-3 py-1 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Adaugă Cerință
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.metadata_json.prerequisites || []).map((prereq: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                          <input
                            type="text"
                            value={prereq}
                            onChange={(e) => handleUpdatePrereq(idx, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePrereq(idx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PRICING & ENROLLMENT */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.is_free}
                        onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                        className="rounded text-brand-green w-4 h-4"
                      />
                      <span>Curs Complet Gratuit (Fără plată)</span>
                    </label>

                    {!formData.is_free && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Preț Curs (RON) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Monedă</label>
                          <input
                            type="text"
                            disabled
                            value="RON"
                            className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold mb-1">Preț Redus (Promoțional)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.metadata_json.discounted_price || ''}
                            onChange={(e) => setFormData((prev) => ({
                              ...prev,
                              metadata_json: { ...prev.metadata_json, discounted_price: e.target.value ? Number(e.target.value) : undefined },
                            }))}
                            placeholder="ex: 99.00"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Titlu SEO (Meta Title)</label>
                    <input
                      type="text"
                      value={formData.metadata_json.seo_title || ''}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        metadata_json: { ...prev.metadata_json, seo_title: e.target.value },
                      }))}
                      placeholder="ex: Curs Monitorizare ATI & Proceduri Clinice | NursLab"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Descriere Meta (Meta Description)</label>
                    <textarea
                      rows={3}
                      value={formData.metadata_json.meta_description || ''}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        metadata_json: { ...prev.metadata_json, meta_description: e.target.value },
                      }))}
                      placeholder="Descrierea afișată în motoarele de căutare Google..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCourse({
                      ...formData,
                      id: editingCourse ? editingCourse.id : 'preview-temp',
                      category_name: categories.find((c) => c.id === formData.category_id)?.name || 'Practică',
                      instructor_name: instructors.find((i) => i.id === formData.instructor_id)?.full_name || 'Echipa NursLab',
                      total_sections_count: editingCourse ? editingCourse.sections.length : 0,
                      total_lessons_count: editingCourse ? editingCourse.total_lessons_count : 0,
                      sections: editingCourse ? editingCourse.sections : [],
                    } as any);
                    setPreviewModalOpen(true);
                  }}
                  className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Previzualizează
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditorModalOpen(false)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Închide
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs px-6 py-2 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Se salvează...' : editingCourse ? 'Salvează Modificările' : 'Creează Curs'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE COURSE PREVIEW MODAL (Matches Public Frontend) */}
      {previewModalOpen && previewCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-brand-sand rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="badge-mint text-xs">PREVIZUALIZARE ADMIN</span>
                <span className="text-xs text-slate-500 font-mono">/{previewCourse.slug}</span>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Public Header Card layout */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-brand-green uppercase tracking-wider">
                    {previewCourse.category_name || 'Practică Clinică'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 capitalize">{previewCourse.difficulty}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy leading-tight">
                  {previewCourse.title}
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {previewCourse.short_description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-brand-green" />
                    <span>{previewCourse.estimated_hours} ore de instruire</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Award className="w-3.5 h-3.5 text-brand-green" />
                    <span>Certificat NursLab</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs">
                    {previewCourse.instructor_name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Formator clinic</p>
                    <p className="text-xs font-bold text-brand-navy">{previewCourse.instructor_name || 'Echipa NursLab'}</p>
                  </div>
                </div>
              </div>

              {/* Right Media Card */}
              <div className="lg:col-span-5 bg-[#F8FAF9] p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black/5 border border-slate-200">
                  <img
                    src={formatImageUrl(previewCourse.cover_image || '/images/journey_theory.jpg')}
                    alt={previewCourse.title}
                    style={getImageStyle(previewCourse.metadata_json)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    {previewCourse.is_free ? (
                      <span className="badge-mint">GRATUIT</span>
                    ) : (
                      <span className="badge-coral">{previewCourse.price} RON</span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button className="btn-primary w-full py-2.5 text-xs font-bold shadow-sm">
                    {previewCourse.is_free ? 'Înscrie-te Gratuit la Curs' : `Achiziționează Cursul • ${previewCourse.price} RON`}
                  </button>
                </div>
              </div>
            </div>

            {/* Curriculum Preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-brand-navy">Curriculum Curs & Lecții</h3>
              {previewCourse.sections.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nu există module configurate pentru acest curs.</p>
              ) : (
                <div className="space-y-3">
                  {previewCourse.sections.map((sec, idx) => (
                    <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-brand-navy">
                        <span>{idx + 1}. {sec.title}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{sec.lessons?.length || 0} lecții</span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {sec.lessons?.map((les, lIdx) => (
                          <div key={les.id} className="p-3 flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-2">
                              <PlayCircle className="w-3.5 h-3.5 text-brand-green" />
                              <span>{idx + 1}.{lIdx + 1} {les.title}</span>
                            </span>
                            <span className="text-[11px] text-slate-400">{les.duration_minutes} min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
