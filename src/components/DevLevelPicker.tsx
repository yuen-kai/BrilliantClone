import { useLocation, useNavigate } from 'react-router-dom'
import { courseLessons } from '../content/course'

/** DEV-only floating control to jump to any lesson/level while testing. */
export function DevLevelPicker() {
  const navigate = useNavigate()
  const location = useLocation()

  if (!import.meta.env.DEV) return null

  const match = location.pathname.match(/\/lesson\/([^/]+)/)
  const currentId = match?.[1] ?? ''

  return (
    <div className="dev-level-picker">
      <span className="dev-level-picker__tag">DEV</span>
      <label>
        level
        <select value={currentId} onChange={(e) => navigate(`/lesson/${e.target.value}`)}>
          <option value="" disabled>
            select…
          </option>
          {courseLessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.order}. {l.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
