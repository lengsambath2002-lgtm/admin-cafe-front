/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useRef, useState } from 'react';
import {
  Coffee,
  Snowflake,
  Croissant,
  Leaf,
  Plus,
  Trash2,
  PlusCircle,
  X,
  Sparkles,
  Upload,
  Loader2
} from 'lucide-react';
import { Category } from '../types';
import { api } from '../lib/api';
import { onImageError } from '../lib/img';
import { useT } from '../lib/i18n';

interface CategoriesViewProps {
  categories: Category[];
  onAddCategory: (newCategory: { name: string; image: string }) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export default function CategoriesView({ categories, onAddCategory, onDeleteCategory }: CategoriesViewProps) {
  const { t } = useT();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Image upload (POST /api/upload) — categories can use their own image, not just presets.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { url, filename } = await api.uploadImage(file);
      if (url) {
        if (uploadedFilename) api.deleteUpload(uploadedFilename).catch(() => {});
        setNewCatImage(url);
        setUploadedFilename(filename ?? null);
      } else {
        setUploadError('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Icon mapping helpers
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'snowflake':
        return <Snowflake className="w-5 h-5 text-primary" />;
      case 'croissant':
        return <Croissant className="w-5 h-5 text-primary" />;
      case 'leaf':
        return <Leaf className="w-5 h-5 text-primary" />;
      default:
        return <Coffee className="w-5 h-5 text-primary" />;
    }
  };

  // Pre-configured beautiful coffee images to help admins populate lists beautifully
  const COFFEE_MOCK_IMAGES = [
    { label: 'Espresso Machine shot', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA5XVPLLbq5XprLeh2MQo0n4CCR9W4ZdpOWVioxJnHDg9lA0t5AUCL4yCWzL1rPW9K6qNGFkO_fDBqiCuQ-rATXD08mMeUTYFcT5-IUjqYeJw1lVMClquDprdwbirWDbm1pU2mdg20ncrCYC2yOHV12ut94v9zjoKvTBdnGJwsj8g2jMfugcGQPOUv6OuBqWH7OnPMBwvfu9FG78IyhN5A9BNY9saFxUqXNxKL_jaWbl72cPAuahgNfmJcrpDv1CPJQQbtYf7pnQw' },
    { label: 'Barista Latte Prep', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWag7MpuwITw_u60NGEQkyfs4RXpmJ73RZxon86KMyTXhVl2P9YH3JDO3JI063wiKFUrx455PLcRMZoWlTNH9TZDwVjtf0N330tKq8X2FUy8DEQ9f_POeBsRuY-OtocIvm0btzHwWC_EPt5yWcF6kY6vmXAJj6oylKnTypFOqugfgfDHzKgo8jdCNbK-URPsOQey-oa7iheTv0NuxSFcxIW8AblEPMRyAJ7Pu2E1m22h9_YW4C9NY16Uoy3W0YVAcdkj9f85jsv5A' },
    { label: 'Cold brew glass', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh1X0xw6H7iwjHkHrKy4rnVQ0OggvAKp1bl0cFrqKibTub-yhLGMC9EnLtPYt8p_BYyuWcbqJLNngIZNjbfFwinD8BpX5oGQTgNhIeEfz8o4B8hSXPWAYrKLCV-W8nUBul1oV2tFEFticBXiLBNiTPdY1Gsgy3ZJtsWyj-ofzwuVjiTMGQuCuNvLZSvXXnwUes3Np2ZReB1GxWM-TcoGTl79axpQeJINWHGRIWO9DuDcCsk9aEEqp-zMdu9c7XtI8bGE4J3f2AlDs' },
    { label: 'Golden pastries', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3V93x7xtGTQ_OdmhCfDpi53YoTtJqJ5hMHjLrQWaElN5uyi-_Apr0c8A9OInlPIbYjvofaT_U8uVNP2KtdsvCJyju2ldLCuM7chp49KEeuvSLHAqGHAkYakxAcxv1fjAbnf5zgjQBwccovcCVZs7HhPCNAxA-qUiLcR57zdQrFmX7UrnA9wDsehaVGN5WttNAmr4pGSlt-drqAq3EYBvP_yXK85OlKVmlxHp_YsOe5NID1F-uuZfQcA4N8Dc1CwLdJnkS2AjP52s' },
    { label: 'Burlap Sack Beans', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIOxGY2O4HLPo7PeptWvQs-0ugi_39g4v_ZfGeQ9NLsWdpCy1TftI5KPJQ62f6JW5hPIOmXMtQuqHNi9zFQfbgvuyFw94FueKqshfkND7ON_hSoB-0WACr8wc3zTkm4i-oemy0GYUvozDLr8e7oPZKnurHUfNFQgLzV5wc5-afWwA8NC2nCJeoy4FUu1GxuEAi9z5Puvph96H0WeOL6Kq8dA-dkR0iSxL0CYAnChfFxXyxtJsBEkbElaF9kzokoxTq3Wum6XlGgJA' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      image: newCatImage || COFFEE_MOCK_IMAGES[0].url
    });

    setNewCatName('');
    setNewCatImage('');
    setUploadedFilename(null);
    setUploadError(null);
    setShowAddModal(false);
  };

  // Close the modal and clear any in-progress upload state.
  const closeModal = () => {
    setShowAddModal(false);
    setUploadError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">
      
      {/* Sticky header: title stays pinned while the grid scrolls below */}
      <div className="sticky -top-4 sm:-top-6 lg:-top-8 z-20 bg-background -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
      {/* Category Heading Info */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">{t('cat.title')}</h2>
        </div>
      </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-bento hover:shadow-bento-raised transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Image */}
            <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
                onError={onImageError}
              />
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/15 shadow-sm flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-white transition-colors cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="p-3.5 flex items-center gap-3">
              <div className="p-2 bg-secondary-container rounded-lg shrink-0">
                {renderCategoryIcon(cat.icon)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-primary leading-tight tracking-tight uppercase truncate">{cat.name}</h3>
                <p className="text-[11px] text-secondary font-medium">{cat.itemsCount} items</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add Category Dotted interactive block */}
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant/60 rounded-2xl flex flex-col items-center justify-center p-6 min-h-[200px] bg-surface-container-low/45 hover:border-primary hover:bg-primary/5 transition-all duration-300 group active:scale-[0.98] cursor-pointer"
        >
          <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-container group-hover:scale-110 transition-all duration-300">
            <Plus className="w-5 h-5 text-primary group-hover:text-on-primary transition-colors" />
          </div>
          <span className="font-bold text-sm text-primary tracking-tight">{t('cat.addCategory')}</span>
          <span className="text-[11px] text-secondary text-center mt-1 max-w-[180px]">{t('cat.createDirectory')}</span>
        </button>
      </div>

      {/* Floating Action Button (FAB) on bottom right (Screen 2) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-2.5 px-6 py-4 rounded-full shadow-lg hover:scale-103 hover:shadow-xl active:scale-95 transition-all z-20 cursor-pointer group"
      >
        <PlusCircle className="w-5 h-5 text-on-primary" />
        <span>{t('cat.addCategory')}</span>
      </button>

      {/* Interactive Category Dialog modal box prompt */}
      {showAddModal && (
        <div className="fixed inset-0 bg-primary/25 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/45 shadow-lg rounded-2xl w-full max-w-md p-6 relative animate-scale-up text-left">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-primary tracking-tight">{t('cat.createSection')}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('cat.categoryName')}</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t('cat.namePlaceholder')}
                  className="w-full bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Choose Visual Theme</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-[11px] font-bold text-primary flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {uploadError && <p className="text-[10px] font-semibold text-error">{uploadError}</p>}

                {/* Selected image preview (preset or uploaded) */}
                {newCatImage && (
                  <div className="relative rounded-xl overflow-hidden h-24 border-2 border-primary shadow-sm mt-1.5">
                    <img src={newCatImage} className="w-full h-full object-cover" alt="Selected" referrerPolicy="no-referrer" />
                    <span className="absolute top-1.5 left-1.5 bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded-full">Selected</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-1.5 overflow-y-auto max-h-[160px] p-0.5">
                  {COFFEE_MOCK_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewCatImage(img.url)}
                      className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all group ${newCatImage === img.url ? 'border-primary shadow-sm' : 'border-transparent'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white text-center leading-tight truncate px-1">
                          {img.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/10 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container font-bold text-xs py-3 rounded-xl transition-all shadow shadow-primary/10 active:scale-95 cursor-pointer"
                >
                  Create Category
                </button>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
