import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBolt,
  faChartLine,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { getLatestArticles, type ArticleListItem } from '../api/articles'
import ArticleCard from '../components/ArticleCard'
import './Home.css'

const LATEST_ARTICLE_COUNT = 3

const FEATURES = [
  {
    icon: faBolt,
    title: 'Fast by default',
    description:
      'Built on Vite for instant startup and hot-module reloads that keep pace with you.',
  },
  {
    icon: faShieldHalved,
    title: 'Solid foundations',
    description:
      'TypeScript, ESLint and sensible defaults baked in, so you can ship with confidence.',
  },
  {
    icon: faChartLine,
    title: 'Grows with you',
    description:
      'A clean starting point that scales from a weekend project to a full product.',
  },
]

function Home() {
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [articlesError, setArticlesError] = useState(false)
  const [loadingArticles, setLoadingArticles] = useState(true)

  useEffect(() => {
    let cancelled = false

    getLatestArticles(LATEST_ARTICLE_COUNT)
      .then((result) => {
        if (!cancelled) {
          setArticles(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticlesError(true)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingArticles(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <section id="home" className="hero">
        <span className="eyebrow">Welcome</span>
        <h1>
          Build something great, <span className="accent-text">starting here</span>
        </h1>
        <p className="lead">
          This is a placeholder home page — swap this copy, the nav links and
          the sections below for the real thing whenever you're ready.
        </p>
        <div className="hero-actions">
          <a className="btn btn-secondary" href="#features">
            Get started
            <FontAwesomeIcon icon={faArrowRight} />
          </a>
          <a className="btn btn-secondary" href="/contact">
            Contact us
          </a>
        </div>
      </section>

      <section id="features" className="features">
        {FEATURES.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <div className="feature-icon">
              <FontAwesomeIcon icon={feature.icon} />
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>

      <section id="latest-articles" className="latest-articles">
        <span className="eyebrow">Fresh off the press</span>
        <h2>Latest articles</h2>

        {loadingArticles && (
          <p className="latest-articles-status">Loading articles&hellip;</p>
        )}

        {!loadingArticles && articlesError && (
          <p className="latest-articles-status">
            Couldn't load the latest articles right now.
          </p>
        )}

        {!loadingArticles && !articlesError && articles.length === 0 && (
          <p className="latest-articles-status">No articles yet — check back soon.</p>
        )}

        {!loadingArticles && !articlesError && articles.length > 0 && (
          <div className="article-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Home
