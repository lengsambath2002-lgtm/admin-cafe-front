/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { 
  Coffee, 
  Snowflake, 
  Croissant, 
  Leaf, 
  Plus,
  Trash2,
  PlusCircle,
  X,
  Sparkles
} from 'lucide-react';
import { Category } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  onAddCategory: (newCategory: { name: string; image: string }) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export default function CategoriesView({ categories, onAddCategory, onDeleteCategory }: CategoriesViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

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
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">
      
      {/* Category Heading Info */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Menu</h2>
          <p className="text-secondary text-base mt-2">Organize your boutique offerings by coffee beans, extraction methods, and artisanal snacks.</p>
        </div>
      </div>

      {/* Grid of Categories (Screen 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            className="bg-surface-container-lowest p-5 rounded-2xl border border-secondary-container shadow-bento hover:shadow-bento-raised transition-all group relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-container rounded-xl">
                  {renderCategoryIcon(cat.icon)}
                </div>
                
                {/* Visual Actions buttons list */}
                <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 rounded-full transition-colors material-symbols-outlined cursor-pointer border border-outline-variant/10 bg-white shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary mb-1 tracking-tight">{cat.name}</h3>
              <p className="text-xs text-secondary font-medium mb-4">{cat.itemsCount} items listed</p>
            </div>

            {/* Visual Frame */}
            <div className="w-full h-36 rounded-xl bg-surface-container-low overflow-hidden mt-2 relative border border-outline-variant/15">
              <img 
                src={cat.image} 
                alt={cat.name}
                className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-103 transition-all duration-500 ease-out"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}

        {/* Add Category Dotted interactive block */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant/65 rounded-2xl flex flex-col items-center justify-center p-6 min-h-[290px] bg-surface-container-low/45 hover:bg-surface-container-low/55 transition-colors group active:scale-[0.98] cursor-pointer"
        >
          <div className="p-4 bg-surface-container-high rounded-full mb-4 group-hover:bg-primary transition-all duration-300">
            <Plus className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
          </div>
          <span className="font-bold text-lg text-primary tracking-tight">Add Category</span>
          <span className="text-xs text-secondary text-center mt-2 max-w-[200px]">Create a new premium directory for menu items.</span>
        </button>
      </div>

      {/* Floating Action Button (FAB) on bottom right (Screen 2) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-2.5 px-6 py-4 rounded-full shadow-lg hover:scale-103 hover:shadow-xl active:scale-95 transition-all z-20 cursor-pointer group"
      >
        <PlusCircle className="w-5 h-5 text-on-primary" />
        <span>Add Category</span>
      </button>

      {/* Interactive Category Dialog modal box prompt */}
      {showAddModal && (
        <div className="fixed inset-0 bg-primary/25 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/45 shadow-lg rounded-2xl w-full max-w-md p-6 relative animate-scale-up text-left">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-primary tracking-tight">Create Menu Section</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Specialty Beverages"
                  className="w-full bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Choose Visual Theme</label>
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
                  onClick={() => setShowAddModal(false)}
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
