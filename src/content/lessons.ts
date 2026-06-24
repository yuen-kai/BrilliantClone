import type { Lesson } from '../types/lesson'
import { lesson1 } from './lesson1'
import { lesson2 } from './lesson2'
import { lesson3 } from './lesson3'
import { lesson4 } from './lesson4'
import { lesson5 } from './lesson5'
import { lesson6 } from './lesson6'

export const lessons: Record<string, Lesson> = {
  'lesson-1': lesson1,
  'lesson-2': lesson2,
  'lesson-3': lesson3,
  'lesson-4': lesson4,
  'lesson-5': lesson5,
  'lesson-6': lesson6,
}

/** Lesson ids that have content loaded and are playable. */
export const availableLessonIds = new Set(Object.keys(lessons))
