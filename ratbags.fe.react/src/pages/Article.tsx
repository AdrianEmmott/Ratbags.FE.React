import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faImage, faPen } from '@fortawesome/free-solid-svg-icons'
import { getArticle, getImageUrl, type Article as ArticleModel } from '../api/articles'
import { useAuth } from '../hooks/useAuth'
import './Article.css'
import DOMPurify from 'dompurify';

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

function Article() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const [article, setArticle] = useState<ArticleModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    getArticle(id)
      .then((result) => {
        if (!cancelled) {
          setArticle(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <div className="article-page-status">Loading article&hellip;</div>
  }

  if (error || !article) {
    return (
      <div className="article-page-status">
        <p>Couldn't find that article.</p>
        <Link className="btn btn-secondary" to="/">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to home
        </Link>
      </div>
    )
  }

  const imageUrl = getImageUrl(article.bannerImageUrl)
  const hasImage = Boolean(imageUrl) && !imageFailed
  const date = formatDate(article.published ?? article.created)

  return (
    <article className="article-page">
      <div className="article-page-banner">
        {hasImage ? (
          <img
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="article-page-banner-placeholder">
            <FontAwesomeIcon icon={faImage} />
          </div>
        )}
      </div>

      <div className="article-page-content">
        <Link className="article-page-back" to="/">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to home
        </Link>

        <div className="article-page-title-row">
          <h1>{article.title}</h1>
          {isAuthenticated && (
            <Link className="article-page-edit" to={`/articles/${article.id}/edit`}>
              <FontAwesomeIcon icon={faPen} />
              Edit
            </Link>
          )}
        </div>

        <div className="article-page-meta">
          <span>{article.authorName}</span>
          {date && <span>{date}</span>}
        </div>

        {article.introduction && <p className="lead">{article.introduction}</p>}

        <div className="article-page-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
      </div>
    </article>
  )
}

export default Article
