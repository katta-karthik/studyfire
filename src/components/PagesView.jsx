import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid, List, Star, Trash2, Calendar, Tag, X } from 'lucide-react';
import PageEditor from './PageEditor';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyfire-backend.onrender.com/api';

export default function PagesView({ user }) {
  const [pages, setPages] = useState([]);
  const [viewType, setViewType] = useState('gallery');
  const [selectedPage, setSelectedPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch(`${API_URL}/pages?userId=${user._id}`);
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const createNewPage = async () => {
    try {
      const response = await fetch(`${API_URL}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          title: 'Untitled',
          content: '',
        }),
      });
      const newPage = await response.json();
      setPages([newPage, ...pages]);
      setSelectedPage(newPage);
      setShowEditor(true);
    } catch (error) {
      console.error('Error creating page:', error);
    }
  };

  const deletePage = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await fetch(`${API_URL}/pages/${pageId}`, { method: 'DELETE' });
      setPages(pages.filter(p => p._id !== pageId));
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const toggleFavorite = async (pageId) => {
    try {
      const response = await fetch(`${API_URL}/pages/${pageId}/favorite`, {
        method: 'PATCH',
      });
      const updatedPage = await response.json();
      setPages(pages.map(p => (p._id === pageId ? updatedPage : p)));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openPage = (page) => {
    setSelectedPage(page);
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setSelectedPage(null);
    fetchPages(); // Refresh pages after editing
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderGalleryView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, index) => {
          const daysLeft = getDaysLeft(page.deadline);
          return (
            <motion.div
              key={page._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-orange-500/50 transition-all cursor-pointer"
              onClick={() => openPage(page)}
            >
              {/* Cover Image */}
              <div
                className="h-40 bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center"
                style={{
                  backgroundImage: page.coverImage ? `url(${page.coverImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!page.coverImage && (
                  <span className="text-6xl">📄</span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors flex-1">
                    {page.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(page._id);
                    }}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${page.isFavorite ? 'fill-orange-500 text-orange-500' : ''}`}
                    />
                  </button>
                </div>

                {/* Tags */}
                {page.tags && Array.isArray(page.tags) && page.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {page.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Deadline */}
                {page.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span
                      className={`${
                        daysLeft < 0
                          ? 'text-red-400'
                          : daysLeft < 7
                          ? 'text-orange-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {daysLeft < 0
                        ? `${Math.abs(daysLeft)} days overdue`
                        : `${daysLeft} days left`}
                    </span>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(page._id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {pages.map((page, index) => {
          const daysLeft = getDaysLeft(page.deadline);
          return (
            <motion.div
              key={page._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => openPage(page)}
              className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all cursor-pointer group"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(page._id);
                }}
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${page.isFavorite ? 'fill-orange-500 text-orange-500' : ''}`}
                />
              </button>

              <div className="flex-1">
                <h3 className="font-bold text-white group-hover:text-orange-500 transition-colors">
                  {page.title}
                </h3>
                {page.tags && Array.isArray(page.tags) && page.tags.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {page.tags.slice(0, 5).map((tag, i) => (
                      <span key={i} className="text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {page.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span
                    className={`${
                      daysLeft < 0
                        ? 'text-red-400'
                        : daysLeft < 7
                        ? 'text-orange-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page._id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </h2>

          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
              <button
                onClick={() => setViewType('gallery')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'gallery'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewType === 'list'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* New Page Button */}
            <button
              onClick={createNewPage}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Page
            </button>
          </div>
        </motion.div>

        {/* Pages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {pages.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/30">
              <p className="text-gray-400 text-lg mb-4">No pages yet. Create your first one!</p>
              <button
                onClick={createNewPage}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                Create Page
              </button>
            </div>
          ) : viewType === 'gallery' ? (
            renderGalleryView()
          ) : (
            renderListView()
          )}
        </motion.div>
      </div>

      {/* Page Editor Modal */}
      <AnimatePresence>
        {showEditor && selectedPage && (
          <PageEditor page={selectedPage} onClose={closeEditor} user={user} />
        )}
      </AnimatePresence>
    </>
  );
}
