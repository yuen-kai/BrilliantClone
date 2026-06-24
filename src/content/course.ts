import type { CourseLesson } from '../types/lesson'

export const courseLessons: CourseLesson[] = [
  {
    id: 'lesson-1',
    title: 'Multiplication Principle',
    order: 1,
    prerequisiteLessonId: null,
  },
  {
    id: 'lesson-2',
    title: 'Permutations & Combinations',
    order: 2,
    prerequisiteLessonId: 'lesson-1',
  },
  {
    id: 'lesson-3',
    title: 'Overcounting',
    order: 3,
    prerequisiteLessonId: 'lesson-2',
  },
  {
    id: 'lesson-4',
    title: 'Complementary Counting',
    order: 4,
    prerequisiteLessonId: 'lesson-3',
  },
  {
    id: 'lesson-5',
    title: 'Casework',
    order: 5,
    prerequisiteLessonId: 'lesson-4',
  },
  {
    id: 'lesson-6',
    title: 'Stars and Bars',
    order: 6,
    prerequisiteLessonId: 'lesson-5',
  },
]
