const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001'

export interface ArticleListItem {
  id: string
  title: string
  thumbnailImageUrl?: string
  description?: string
  created: string
  published?: string
  commentCount: number
}

export interface Article {
  id: string
  title: string
  description?: string
  introduction?: string
  content: string
  bannerImageUrl?: string
  created: string
  updated?: string
  published?: string
  authorName: string
  views: number
}

export interface PagedResult<T> {
  totalCount: number
  items: T[]
  pageSize: number
  currentPage: number
}

// article banner/thumbnail fields store just a filename served by Images.API -
// build the full URL through the gateway rather than using the value as-is
export function getImageUrl(filename?: string): string | undefined {
  if (!filename) {
    return undefined
  }
  if (/^https?:\/\//i.test(filename)) {
    return filename
  }
  return `${API_BASE_URL}/api/images/${encodeURIComponent(filename)}`
}

export class ArticlesError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function getLatestArticles(count: number): Promise<ArticleListItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/articles/0/${count}`)

  if (!response.ok) {
    throw new ArticlesError('Failed to load articles.', response.status)
  }

  const result = (await response.json()) as PagedResult<ArticleListItem>
  return result.items
}

export async function getArticle(id: string): Promise<Article | null> {
  const response = await fetch(`${API_BASE_URL}/api/articles/${id}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new ArticlesError('Failed to load article.', response.status)
  }

  return response.json() as Promise<Article>
}

export interface ArticleInput {
  title: string
  description?: string
  introduction?: string
  content: string
  bannerImageUrl?: string
  authorUserId: string
}

export async function createArticle(input: ArticleInput, token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      introduction: input.introduction,
      content: input.content,
      bannerImageUrl: input.bannerImageUrl,
      created: new Date().toISOString(),
      authorUserId: input.authorUserId,
    }),
  })

  if (!response.ok) {
    throw new ArticlesError('Failed to create article.', response.status)
  }

  return response.json() as Promise<string>
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/articles`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      title: input.title,
      description: input.description,
      introduction: input.introduction,
      content: input.content,
      bannerImageUrl: input.bannerImageUrl,
      updated: new Date().toISOString(),
      authorUserId: input.authorUserId,
    }),
  })

  if (!response.ok) {
    throw new ArticlesError('Failed to save article.', response.status)
  }
}
