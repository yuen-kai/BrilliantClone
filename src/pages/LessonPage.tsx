import { Link, useParams } from 'react-router-dom'
import { lessons } from '../content/lessons'
import { getCourseForLesson, defaultCourseId } from '../content/courses'
import { LessonRunner } from '../components/lesson/LessonRunner'
import { useLessonProgress } from '../hooks/useLessonProgress'
import { isLayerActive } from '../config/buildLayer'

export function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const lessonId = id ?? 'lesson-1'
  const lesson = lessons[lessonId]
  const course = getCourseForLesson(lessonId)
  const { progress, loading, persistProgress, recordLessonStart } = useLessonProgress(lessonId)

  if (!lesson) {
    return (
      <div className="lesson-page">
        <p>Lesson not found.</p>
        {isLayerActive(4) && <Link to="/course">Back to course</Link>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="lesson-page">
        <p>Loading lesson…</p>
      </div>
    )
  }

  return (
    <div className="lesson-page">
      <LessonRunner
        lesson={lesson}
        progress={progress}
        onProgressChange={persistProgress}
        onLessonStart={recordLessonStart}
        courseId={course?.id ?? defaultCourseId}
        mathProgression={course?.mathProgression ?? true}
      />
    </div>
  )
}
