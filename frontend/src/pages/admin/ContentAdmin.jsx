import React, { useEffect, useState } from 'react';
import {
  createCourse,
  createLesson,
  createModule,
  listCourses,
  listLessons,
  listModules,
} from '../../api.js';

export default function ContentAdmin() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [error, setError] = useState('');

  const [courseForm, setCourseForm] = useState({ title: '', slug: '', description: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', orderIndex: 0 });
  const [lessonForm, setLessonForm] = useState({ title: '', slug: '', contentText: '', orderIndex: 0 });

  async function loadCourses() {
    const data = await listCourses();
    setCourses(data || []);
  }

  async function loadModules(courseId) {
    if (!courseId) return;
    const data = await listModules(courseId);
    setModules(data || []);
  }

  async function loadLessons(moduleId) {
    if (!moduleId) return;
    const data = await listLessons(moduleId);
    setLessons(data || []);
  }

  useEffect(() => {
    loadCourses().catch((e) => setError(e.message));
  }, []);

  async function onCreateCourse(e) {
    e.preventDefault();
    setError('');
    try {
      await createCourse({
        title: courseForm.title,
        slug: courseForm.slug,
        description: courseForm.description,
        orderIndex: 0,
        published: false,
      });
      setCourseForm({ title: '', slug: '', description: '' });
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCreateModule(e) {
    e.preventDefault();
    setError('');
    if (!selectedCourseId) {
      setError('Select a course first');
      return;
    }
    try {
      await createModule({
        courseId: Number(selectedCourseId),
        title: moduleForm.title,
        orderIndex: Number(moduleForm.orderIndex || 0),
      });
      setModuleForm({ title: '', orderIndex: 0 });
      await loadModules(selectedCourseId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCreateLesson(e) {
    e.preventDefault();
    setError('');
    if (!selectedModuleId) {
      setError('Select a module first');
      return;
    }
    try {
      await createLesson({
        moduleId: Number(selectedModuleId),
        title: lessonForm.title,
        slug: lessonForm.slug,
        contentText: lessonForm.contentText,
        contentVideoUrl: null,
        freeOnly: true,
        orderIndex: Number(lessonForm.orderIndex || 0),
      });
      setLessonForm({ title: '', slug: '', contentText: '', orderIndex: 0 });
      await loadLessons(selectedModuleId);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="container mx-auto px-4 py-8" style={{ maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem' }}>Content Admin</h1>
      {error && <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem' }}>
        <form onSubmit={onCreateCourse} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Create Course</h3>
          <input placeholder="Title" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} />
          <input placeholder="Slug" value={courseForm.slug} onChange={(e) => setCourseForm((p) => ({ ...p, slug: e.target.value }))} />
          <textarea placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
          <button type="submit">Create course</button>
        </form>

        <form onSubmit={onCreateModule} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Create Module</h3>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedModuleId('');
              setLessons([]);
              loadModules(e.target.value).catch((err) => setError(err.message));
            }}
          >
            <option value="">Select course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input placeholder="Title" value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} />
          <input placeholder="Order" type="number" value={moduleForm.orderIndex} onChange={(e) => setModuleForm((p) => ({ ...p, orderIndex: e.target.value }))} />
          <button type="submit">Create module</button>
        </form>

        <form onSubmit={onCreateLesson} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Create Lesson</h3>
          <select
            value={selectedModuleId}
            onChange={(e) => {
              setSelectedModuleId(e.target.value);
              loadLessons(e.target.value).catch((err) => setError(err.message));
            }}
          >
            <option value="">Select module</option>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
          <input placeholder="Title" value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} />
          <input placeholder="Slug" value={lessonForm.slug} onChange={(e) => setLessonForm((p) => ({ ...p, slug: e.target.value }))} />
          <textarea placeholder="Content" value={lessonForm.contentText} onChange={(e) => setLessonForm((p) => ({ ...p, contentText: e.target.value }))} />
          <button type="submit">Create lesson</button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
        <h3 style={{ fontWeight: 600 }}>Current Structure</h3>
        <div>Courses: {courses.length}</div>
        <div>Modules: {modules.length}</div>
        <div>Lessons: {lessons.length}</div>
      </div>
    </section>
  );
}
