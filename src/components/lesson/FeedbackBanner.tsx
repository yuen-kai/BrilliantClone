import './FeedbackBanner.css'

type FeedbackBannerProps = {
  message: string
  variant: 'correct' | 'wrong' | 'hint'
}

export function FeedbackBanner({ message, variant }: FeedbackBannerProps) {
  return (
    <div className={`feedback-banner feedback-banner--${variant}`} role="status">
      {message}
    </div>
  )
}
