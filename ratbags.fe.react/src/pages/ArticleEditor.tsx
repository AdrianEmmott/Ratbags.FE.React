import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faFloppyDisk,
  faUpload,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../hooks/useAuth'
import { ArticlesError, createArticle, getArticle, getImageUrl, updateArticle } from '../api/articles'
import { ImageUploadError, uploadImage } from '../api/images'
import RichTextEditor from '../components/RichTextEditor'
import './ArticleEditor.css'

function ArticleEditor() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { token, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [content, setContent] = useState('')

  const [loading, setLoading] = useState(isEditing)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname }, replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false

    getArticle(id)
      .then((article) => {
        if (cancelled) {
          return
        }
        if (!article) {
          setLoadError(true)
          return
        }
        setTitle(article.title)
        setDescription(article.description ?? '')
        setIntroduction(article.introduction ?? '')
        setBannerImageUrl(article.bannerImageUrl ?? '')
        setContent(article.content)
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
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

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return <div className="article-editor-status">Loading article&hellip;</div>
  }

  if (loadError || !user) {
    return (
      <div className="article-editor-status">
        <p>Couldn't load that article.</p>
        <Link className="btn btn-secondary" to="/">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to home
        </Link>
      </div>
    )
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setUploadingImage(true)
    setImageError(null)

    try {
      const filename = await uploadImage(file)
      setBannerImageUrl(filename)
    } catch (err) {
      setImageError(
        err instanceof ImageUploadError
          ? err.message
          : 'Unable to reach the server. Please try again.',
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      return
    }

    setSaving(true)
    setSaveError(null)

    const input = {
      title,
      description: description || undefined,
      introduction: introduction || undefined,
      content,
      bannerImageUrl: bannerImageUrl || undefined,
      authorUserId: user.id,
    }

    try {
      if (isEditing && id) {
        await updateArticle(id, input, token)
        navigate(`/articles/${id}`)
      } else {
        const newId = await createArticle(input, token)
        navigate(`/articles/${newId}`)
      }
    } catch (err) {
      setSaveError(
        err instanceof ArticlesError
          ? err.message
          : 'Unable to reach the server. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="article-editor">
      <Link className="article-page-back" to={isEditing && id ? `/articles/${id}` : '/'}>
        <FontAwesomeIcon icon={faArrowLeft} />
        {isEditing ? 'Back to article' : 'Back to home'}
      </Link>

      <h1>{isEditing ? 'Edit article' : 'New article'}</h1>

      <form onSubmit={handleSubmit} className="article-editor-form">
        <label htmlFor="title">
          Title
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Article title"
            required
          />
        </label>

        <label htmlFor="description">
          Description
          <input
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short tag line shown in article listings"
          />
        </label>

        <div className="article-editor-banner-field">
          <span className="article-editor-banner-label">Banner image</span>

          {bannerImageUrl && (
            <div className="article-editor-banner-preview">
              <img src={getImageUrl(bannerImageUrl)} alt="" />
              <button
                type="button"
                className="article-editor-banner-remove"
                onClick={() => setBannerImageUrl('')}
                aria-label="Remove banner image"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? 'Uploading…' : bannerImageUrl ? 'Replace image' : 'Upload image'}
            <FontAwesomeIcon icon={faUpload} />
          </button>

          {imageError && <p className="article-editor-error">{imageError}</p>}
        </div>

        <label htmlFor="introduction">
          Introduction
          <textarea
            id="introduction"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value)}
            placeholder="Short intro shown at the top of the article"
            rows={3}
          />
        </label>

        <div className="article-editor-content-label">Content</div>
        <RichTextEditor content={content} onChange={setContent} placeholder="Write your article…" />

        {saveError && <p className="article-editor-error">{saveError}</p>}

        <div className="article-editor-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save article'}
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        </div>
      </form>
    </section>
  )
}

export default ArticleEditor
