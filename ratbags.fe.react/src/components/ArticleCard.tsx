import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faImage } from '@fortawesome/free-solid-svg-icons'
import { getImageUrl, type ArticleListItem } from '../api/articles'
import './ArticleCard.css'

function formatDate(value?: string): string | null {
  if (!value) {
    return null
  }
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function ArticleCard({ article }: { article: ArticleListItem }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getImageUrl(article.thumbnailImageUrl)
  const hasImage = Boolean(imageUrl) && !imageFailed
  const date = formatDate(article.published ?? article.created)

  return (
    <article className="article-card">
      <Link to={`/articles/${article.id}`} className="article-card-thumb">
        {hasImage ? (
          <img
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="article-card-thumb-placeholder">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </Link>

      <div className="article-card-body">
        {date && <span className="article-card-date">{date}</span>}
        <h2>
          <Link to={`/articles/${article.id}`}>{article.title}</Link>
        </h2>
        {article.description && <p>{article.description}</p>}
        <Link to={`/articles/${article.id}`} className="article-card-readmore">
          Read more
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>
    </article>
  )
}

export default ArticleCard
