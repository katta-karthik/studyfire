import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Image,
  Bold,
  Italic,
  List,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Heading2,
  Link,
  Save,
  Calendar,
  Tag,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function PageEditor({ page, onClose, user }) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [coverImage, setCoverImage] = useState(page.coverImage);
  const [tags, setTags] = useState(Array.isArray(page.tags) ? page.tags : []);
  const [deadline, setDeadline] = useState(
    page.deadline ? new Date(page.deadline).toISOString().split('T')[0] : ''
  );
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(false);

  // Auto-save every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      savePage();
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, coverImage, tags, deadline]);

  const savePage = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      console.log('💾 Saving page:', page._id);
      console.log('📝 Data:', { title, content, coverImage, tags, deadline });
      
      const response = await fetch(`${API_URL}/pages/${page._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          coverImage,
          tags,
          deadline: deadline || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Save failed:', response.status, errorData);
        throw new Error('Save failed');
      }
      
      const savedData = await response.json();
      console.log('✅ Saved successfully:', savedData);
      setLastSaved(new Date());
      setSaveError(false);
    } catch (error) {
      console.error('💥 Error saving page:', error);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById('content-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        newText = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`;
        break;
      case 'checkbox':
        newText = `\n- [ ] ${selectedText || 'Task'}\n`;
        break;
      case 'code':
        newText = `\`\`\`\n${selectedText || 'code here'}\n\`\`\``;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'Quote'}\n`;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((new Date() - lastSaved) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen max-w-5xl mx-auto bg-gray-900 text-white"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-sm text-gray-400">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Saving...
                  </span>
                ) : saveError ? (
                  <span className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Save failed - Check backend
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved {formatLastSaved()}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showPreview
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>

              <button
                onClick={savePage}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Now'}
              </button>

              <button
                onClick={() => {
                  savePage();
                  onClose();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <Save className="w-4 h-4" />
                Save & Close
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {!showPreview && (
            <div className="flex items-center gap-1 p-2 border-t border-gray-800 overflow-x-auto">
              <button
                onClick={() => insertMarkdown('bold')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('italic')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={() => insertMarkdown('h1')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('h2')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={() => insertMarkdown('list')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('checkbox')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={() => insertMarkdown('code')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('quote')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('link')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Link"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cover Image */}
        <div
          className="h-64 bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center relative group"
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!showPreview && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <input
                type="text"
                placeholder="Cover image URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-96 bg-gray-800/90 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-12">
          {/* Title */}
          {showPreview ? (
            <h1 className="text-5xl font-bold mb-8">{title}</h1>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-5xl font-bold bg-transparent border-none focus:outline-none mb-8"
              placeholder="Untitled"
            />
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-8">
            {/* Tags */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {Array.isArray(tags) && tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-800 rounded-lg text-sm flex items-center gap-2 group"
                  >
                    #{tag}
                    {!showPreview && (
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
                {!showPreview && (
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="w-32 px-3 py-1 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {showPreview ? (
                deadline && (
                  <span className="text-sm text-gray-400">
                    Due: {new Date(deadline).toLocaleDateString()}
                  </span>
                )
              ) : (
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="px-3 py-1 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </div>
          </div>

          {/* Content Editor/Preview */}
          {showPreview ? (
            <div className="prose prose-invert prose-orange max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing... Use Markdown for formatting

# Heading 1
## Heading 2
**bold** *italic*
- bullet list
- [ ] checkbox
> quote
[link](url)
```code block```"
              className="w-full min-h-[600px] bg-transparent border-none focus:outline-none resize-none font-mono text-sm"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
