import type { CourseLesson } from '../types/lesson'
import { courseLessons } from './course'

/** A course is a titled, ordered path of lessons. The app now hosts more than
 * one (combinatorics + organic chemistry), so course-level copy and lesson
 * lists live here instead of being hardcoded in the path UI. */
export type Course = {
  id: string
  /** Eyebrow shown above the title, e.g. "Combinatorics · Level 1". */
  level: string
  title: string
  tagline: string
  /** When false, the math operator-unlock ladder (! P C) is suppressed — chem
   * lessons never need it, and its "new tools unlocked" notice would confuse. */
  mathProgression: boolean
  lessons: CourseLesson[]
}

export const reactionLessons: CourseLesson[] = [
  { id: 'rxn-1', title: 'Curved Arrows', order: 1, prerequisiteLessonId: null },
  { id: 'rxn-2', title: 'SN2: Backside Attack', order: 2, prerequisiteLessonId: 'rxn-1' },
  { id: 'rxn-3', title: 'SN1: Carbocations', order: 3, prerequisiteLessonId: 'rxn-2' },
  { id: 'rxn-4', title: 'E2: Anti-Periplanar', order: 4, prerequisiteLessonId: 'rxn-3' },
  { id: 'rxn-5', title: 'E1: Carbocation Route', order: 5, prerequisiteLessonId: 'rxn-4' },
  { id: 'rxn-6', title: 'Choosing the Pathway', order: 6, prerequisiteLessonId: 'rxn-5' },
]

/** Independent organic-chemistry course (lessons oc-1…oc-6). Every lesson is
 * built on the `orgo` step type + its own manipulable visuals. */
export const orgoLessons: CourseLesson[] = [
  { id: 'oc-1', title: 'Curved Arrows: Nucleophiles & Electrophiles', order: 1, prerequisiteLessonId: null },
  { id: 'oc-2', title: 'SN2: Backside Attack & Inversion', order: 2, prerequisiteLessonId: 'oc-1' },
  { id: 'oc-3', title: 'SN1: Carbocations & Racemization', order: 3, prerequisiteLessonId: 'oc-2' },
  { id: 'oc-4', title: 'E2: Anti-Periplanar Elimination', order: 4, prerequisiteLessonId: 'oc-3' },
  { id: 'oc-5', title: 'E1: Carbocation Elimination', order: 5, prerequisiteLessonId: 'oc-4' },
  { id: 'oc-6', title: 'Choosing the Pathway', order: 6, prerequisiteLessonId: 'oc-5' },
]

export const courses: Course[] = [
  {
    id: 'counting',
    level: 'Combinatorics · Level 1',
    title: 'Counting Strategies',
    tagline: "Let's count something.",
    mathProgression: true,
    lessons: courseLessons,
  },
  {
    id: 'reactions',
    level: 'Organic Chemistry · Substitution & Elimination',
    title: 'Reaction Mechanisms',
    tagline: 'Push the electrons. Watch the reaction happen.',
    mathProgression: false,
    lessons: reactionLessons,
  },
  {
    id: 'orgo',
    level: 'Organic Chemistry · Mechanisms',
    title: 'Substitution & Elimination',
    tagline: 'Move the electrons, and watch the molecule change.',
    mathProgression: false,
    lessons: orgoLessons,
  },
]

export const defaultCourseId = 'counting'

export function getCourse(id: string | undefined): Course | undefined {
  return courses.find((c) => c.id === id)
}

export function getCourseForLesson(lessonId: string): Course | undefined {
  return courses.find((c) => c.lessons.some((l) => l.id === lessonId))
}
