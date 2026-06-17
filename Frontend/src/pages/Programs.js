import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Programs.css';

const createProgramCover = (title, subtitle, start, end) => {
  const safeTitle = title.replace(/&/g, '&amp;');
  const safeSubtitle = subtitle.replace(/&/g, '&amp;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540">
      <defs>
        <linearGradient id="programBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="900" height="540" rx="36" fill="url(#programBg)" />
      <circle cx="760" cy="120" r="110" fill="rgba(255,255,255,0.12)" />
      <circle cx="130" cy="430" r="150" fill="rgba(255,255,255,0.08)" />
      <text x="60" y="94" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="700">${safeSubtitle}</text>
      <text x="60" y="235" fill="#ffffff" font-family="Arial, sans-serif" font-size="56" font-weight="700">${safeTitle}</text>
      <text x="60" y="300" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="24">Structured training inside your app</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const PROGRAM_COVERS = {
  strength: createProgramCover('Gym Strength Starter', 'Build muscle with confidence', '#0f2027', '#2c5364'),
  hiit: createProgramCover('HIIT Conditioning', 'Fast paced fat-burn blocks', '#f12711', '#f5af19'),
  yoga: createProgramCover('Yoga Mobility Flow', 'Stretch, breathe, recover', '#614385', '#516395'),
  transformation: createProgramCover('Body Reboot Plan', 'Lose fat and improve stamina', '#1d4350', '#a43931'),
  recovery: createProgramCover('Recovery and Core', 'Restore movement quality', '#134e5e', '#71b280'),
  fallback: createProgramCover('Fitness Program', 'Train smarter every week', '#232526', '#414345')
};

const DEFAULT_PROGRAMS = [
  {
    _id: 'default-strength',
    title: 'Gym Strength Starter',
    description: 'A beginner-friendly full body strength program with gym-based workouts, weekly progression, and clear form-focused sessions.',
    difficulty: 'beginner',
    duration: 6,
    category: 'strength',
    coach: 'Coach Arjun',
    focus: 'Muscle building',
    calorieRange: '280-420 kcal',
    thumbnail: PROGRAM_COVERS.strength,
    weeklySchedule: ['Upper Body', 'Lower Body', 'Full Body', 'Recovery'],
    exercises: [
      { name: 'Dumbbell Squat', sets: 3, reps: 12 },
      { name: 'Bench Press', sets: 3, reps: 10 },
      { name: 'Lat Pulldown', sets: 3, reps: 12 }
    ],
    benefits: ['Build muscle', 'Gain confidence', 'Improve posture']
  },
  {
    _id: 'default-hiit',
    title: 'Gym HIIT Conditioning',
    description: 'High-intensity gym circuits designed to improve conditioning, endurance, and fat-loss without losing strength.',
    difficulty: 'intermediate',
    duration: 4,
    category: 'fat-loss',
    coach: 'Trainer Sarah',
    focus: 'Fat burn',
    calorieRange: '350-520 kcal',
    thumbnail: PROGRAM_COVERS.hiit,
    weeklySchedule: ['Circuit Day', 'Bike Sprint Day', 'Sled and Core', 'Mobility Reset'],
    exercises: [
      { name: 'Battle Ropes', sets: 4, reps: 30 },
      { name: 'Kettlebell Swing', sets: 4, reps: 15 },
      { name: 'Box Jump', sets: 4, reps: 12 }
    ],
    benefits: ['Boost metabolism', 'Increase stamina', 'Fat loss']
  },
  {
    _id: 'default-yoga',
    title: 'Yoga Mobility Flow',
    description: 'A gentle program combining yoga sequences, breathing work, and flexibility progressions for daily mobility.',
    difficulty: 'beginner',
    duration: 5,
    category: 'yoga',
    coach: 'Instructor Meera',
    focus: 'Mobility',
    calorieRange: '180-260 kcal',
    thumbnail: PROGRAM_COVERS.yoga,
    weeklySchedule: ['Morning Flow', 'Hip Opener', 'Balance Session', 'Deep Stretch'],
    exercises: [
      { name: 'Sun Salutations', sets: 3, reps: 8 },
      { name: 'Warrior Flow', sets: 3, reps: 10 },
      { name: 'Bridge Hold', sets: 3, reps: 30 }
    ],
    benefits: ['Improve flexibility', 'Reduce stress', 'Better movement quality']
  },
  {
    _id: 'default-transformation',
    title: 'Body Reboot Plan',
    description: 'A guided reboot plan with cardio, strength, and recovery blocks for members who want visible progress over eight weeks.',
    difficulty: 'intermediate',
    duration: 8,
    category: 'transformation',
    coach: 'Coach Daniel',
    focus: 'Full transformation',
    calorieRange: '300-500 kcal',
    thumbnail: PROGRAM_COVERS.transformation,
    weeklySchedule: ['Strength Day', 'Conditioning Day', 'Core Day', 'Mobility Day'],
    exercises: [
      { name: 'Goblet Squat', sets: 4, reps: 12 },
      { name: 'Incline Push-up', sets: 4, reps: 12 },
      { name: 'Row Erg', sets: 5, reps: 250 }
    ],
    benefits: ['Visible progress', 'Better stamina', 'Improved consistency']
  },
  {
    _id: 'default-recovery',
    title: 'Recovery and Core Reset',
    description: 'Low-impact recovery sessions focused on posture, trunk stability, and easing stiffness after intense training weeks.',
    difficulty: 'beginner',
    duration: 3,
    category: 'recovery',
    coach: 'Coach Nila',
    focus: 'Recovery',
    calorieRange: '140-220 kcal',
    thumbnail: PROGRAM_COVERS.recovery,
    weeklySchedule: ['Core Stability', 'Mobility Reset', 'Stretch and Breathe'],
    exercises: [
      { name: 'Dead Bug', sets: 3, reps: 12 },
      { name: 'Bird Dog', sets: 3, reps: 12 },
      { name: 'Side Plank', sets: 3, reps: 30 }
    ],
    benefits: ['Less stiffness', 'Better core control', 'Faster recovery']
  }
];

const FILTERS = ['all', 'strength', 'fat-loss', 'yoga', 'transformation', 'recovery'];

const normalizeProgram = (program = {}) => ({
  ...program,
  title: program.title || program.name || 'Fitness Program',
  description: program.description || 'Structured coaching to help you train with more clarity every week.',
  difficulty: String(program.difficulty || 'beginner').toLowerCase(),
  duration: Number(program.duration) || 4,
  category: String(program.category || program.type || 'strength').toLowerCase(),
  coach: program.coach || program.instructor || 'Expert Coach',
  focus: program.focus || 'General fitness',
  calorieRange: program.calorieRange || '200-400 kcal',
  benefits: Array.isArray(program.benefits) ? program.benefits : [],
  exercises: Array.isArray(program.exercises) ? program.exercises : [],
  weeklySchedule: Array.isArray(program.weeklySchedule) ? program.weeklySchedule : [],
  thumbnail: program.thumbnail || program.images?.[0] || PROGRAM_COVERS[program.category] || PROGRAM_COVERS.fallback
});

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.PROGRAMS);
      const fetched = Array.isArray(res.data) ? res.data.map(normalizeProgram) : [];
      if (fetched.length === 0) {
        setPrograms(DEFAULT_PROGRAMS.map(normalizeProgram));
      } else {
        setPrograms(fetched);
      }
    } catch (err) {
      console.error('Programs fetch error:', err.response?.data || err.message);
      toast.error('Failed to fetch programs. Showing built-in training plans.');
      setPrograms(DEFAULT_PROGRAMS.map(normalizeProgram));
    } finally {
      setLoading(false);
    }
  };

  const enrollProgram = async (program) => {
    try {
      toast.success(`Successfully enrolled in ${program.title}!`);
    } catch (err) {
      toast.error('Failed to enroll in program');
    }
  };

  const filteredPrograms = programs.filter((program) =>
    activeFilter === 'all' ? true : program.category === activeFilter
  );

  const difficultyCount = {
    beginner: programs.filter((program) => program.difficulty === 'beginner').length,
    intermediate: programs.filter((program) => program.difficulty === 'intermediate').length,
    advanced: programs.filter((program) => program.difficulty === 'advanced').length
  };

  if (loading) {
    return <div className="loading">Loading programs...</div>;
  }

  return (
    <div className="programs-page">
      <header className="programs-hero">
        <div className="programs-hero-copy">
          <span className="eyebrow">Training Library</span>
          <h1>Programs built for gym, yoga, fat loss, and recovery</h1>
          <p>
            Explore guided plans with clear weekly structure, coach-led focus areas, and built-in exercises
            that help members stay consistent inside your application.
          </p>
        </div>

        <div className="programs-summary">
          <div className="summary-card">
            <strong>{programs.length}</strong>
            <span>Total Programs</span>
          </div>
          <div className="summary-card">
            <strong>{difficultyCount.beginner}</strong>
            <span>Beginner Friendly</span>
          </div>
          <div className="summary-card">
            <strong>{difficultyCount.intermediate + difficultyCount.advanced}</strong>
            <span>Progressive Plans</span>
          </div>
        </div>
      </header>

      <section className="program-toolbar">
        <div className="toolbar-copy">
          <h2>Browse by goal</h2>
          <p>Filter the catalog to quickly find the right plan for each member.</p>
        </div>

        <div className="program-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.replace('-', ' ')}
            </button>
          ))}
        </div>
      </section>

      <div className="programs-grid">
        {filteredPrograms.map((program) => (
          <article key={program._id} className="program-card">
            <div className="program-image">
              <img src={program.thumbnail} alt={program.title} />
              <div className="program-image-overlay">
                <span className={`difficulty ${program.difficulty}`}>{program.difficulty}</span>
                <span className="category-pill">{program.category.replace('-', ' ')}</span>
              </div>
            </div>

            <div className="program-content">
              <div className="program-topline">
                <span>{program.duration} weeks</span>
                <span>{program.calorieRange}</span>
              </div>

              <h3>{program.title}</h3>
              <p className="program-description">{program.description}</p>

              <div className="program-stats">
                <div className="stat-block">
                  <strong>Coach</strong>
                  <span>{program.coach}</span>
                </div>
                <div className="stat-block">
                  <strong>Focus</strong>
                  <span>{program.focus}</span>
                </div>
              </div>

              {program.weeklySchedule.length > 0 && (
                <div className="program-section">
                  <h4>Weekly Flow</h4>
                  <div className="schedule-pills">
                    {program.weeklySchedule.slice(0, 4).map((item, index) => (
                      <span key={`${program._id}-schedule-${index}`} className="schedule-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {program.exercises.length > 0 && (
                <div className="program-section">
                  <h4>Key Exercises</h4>
                  <ul className="program-list">
                    {program.exercises.slice(0, 3).map((exercise, index) => (
                      <li key={`${program._id}-exercise-${index}`}>
                        {exercise.name} - {exercise.sets} sets x {exercise.reps} reps
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {program.benefits.length > 0 && (
                <div className="program-section">
                  <h4>Benefits</h4>
                  <ul className="program-list benefits-list">
                    {program.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={`${program._id}-benefit-${index}`}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="enroll-btn" onClick={() => enrollProgram(program)}>
                Enroll Now
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="program-empty-state">
          <h3>No programs in this category yet</h3>
          <p>Try another filter to explore the rest of the training library.</p>
        </div>
      )}
    </div>
  );
};

export default Programs;
