import type { Lesson } from '../types/lesson'
import { lesson1 } from './lesson1'
import { lesson2 } from './lesson2'
import { lesson3 } from './lesson3'
import { lesson4 } from './lesson4'
import { lesson5 } from './lesson5'
import { lesson6 } from './lesson6'
import { lessonRxn1 } from './lessonRxn1'
import { lessonRxn2 } from './lessonRxn2'
import { lessonRxn3 } from './lessonRxn3'
import { lessonRxn4 } from './lessonRxn4'
import { lessonRxn5 } from './lessonRxn5'
import { lessonRxn6 } from './lessonRxn6'
import { oc1 } from './oc1'
import { oc2 } from './oc2'
import { oc3 } from './oc3'
import { oc4 } from './oc4'
import { oc5 } from './oc5'
import { oc6 } from './oc6'

export const lessons: Record<string, Lesson> = {
  'lesson-1': lesson1,
  'lesson-2': lesson2,
  'lesson-3': lesson3,
  'lesson-4': lesson4,
  'lesson-5': lesson5,
  'lesson-6': lesson6,
  'rxn-1': lessonRxn1,
  'rxn-2': lessonRxn2,
  'rxn-3': lessonRxn3,
  'rxn-4': lessonRxn4,
  'rxn-5': lessonRxn5,
  'rxn-6': lessonRxn6,
  'oc-1': oc1,
  'oc-2': oc2,
  'oc-3': oc3,
  'oc-4': oc4,
  'oc-5': oc5,
  'oc-6': oc6,
}

/** Lesson ids that have content loaded and are playable. */
export const availableLessonIds = new Set(Object.keys(lessons))
