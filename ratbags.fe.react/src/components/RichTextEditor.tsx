import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBold,
  faItalic,
  faStrikethrough,
  faListUl,
  faListOl,
  faQuoteRight,
  faLink,
  faImage,
  faRotateLeft,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons'
import './RichTextEditor.css'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // keep editor content in sync when switching articles (e.g. after async load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl ?? 'https://')

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <button
          type="button"
          className={editor.isActive('bold') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          type="button"
          className={editor.isActive('strike') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive('heading', { level: 2 }) ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 3 }) ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Heading 3"
        >
          H3
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive('bulletList') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>
        <button
          type="button"
          className={editor.isActive('blockquote') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
        >
          <FontAwesomeIcon icon={faQuoteRight} />
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          className={editor.isActive('link') ? 'active' : undefined}
          onClick={setLink}
          aria-label="Link"
        >
          <FontAwesomeIcon icon={faLink} />
        </button>
        <button type="button" onClick={addImage} aria-label="Insert image">
          <FontAwesomeIcon icon={faImage} />
        </button>

        <span className="rich-text-toolbar-divider" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Undo"
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Redo"
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>

      <EditorContent editor={editor} className="rich-text-content" />
    </div>
  )
}

export default RichTextEditor
