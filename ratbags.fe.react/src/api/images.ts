const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001'

export class ImageUploadError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// Images.API saves the upload under the original filename and serves it back
// by that same name, so the filename doubles as the reference to store on the article.
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/images`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new ImageUploadError('Failed to upload image.', response.status)
  }

  return file.name
}
