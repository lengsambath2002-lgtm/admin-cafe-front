/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import {
  Search,
  Grid3X3,
  List,
  Edit3,
  Plus,
  PlusCircle,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import { Product, Category } from '../types';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  onNavigate: (tab: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleLock: (product: Product) => void;
}

export default function ProductsView({ products, categories, onNavigate, onEditProduct, onDeleteProduct, onToggleLock }: ProductsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Category name or Id mapper
  const getCategoryLabel = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || catId;
  };

  // Live filter catalog lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || 
      p.category === selectedCategory || 
      p.category.toLowerCase() === selectedCategory.toLowerCase().replace(' ', '_');

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page heading */}
      <div>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Product Catalog</h2>
        <p className="text-secondary text-base mt-1">Manage your menu offerings, edit prices and monitor inventory levels.</p>
      </div>

      {/* Filter and search controls row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Chips filters */}
        <div className="flex gap-2.5 flex-wrap">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all border cursor-pointer ${selectedCategory === 'All' ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm' : 'bg-surface-container-highest/20 hover:bg-outline-variant/15 text-on-surface-variant border-outline-variant/30'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all border cursor-pointer ${selectedCategory === cat.name ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm' : 'bg-surface-container-highest/20 hover:bg-outline-variant/15 text-on-surface-variant border-outline-variant/30'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* View toggle (card/table) + search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 shrink-0">
            <button
              onClick={() => setViewStyle('grid')}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewStyle === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              title="Grid Layout"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewStyle === 'list' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
              title="List Density Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-xs px-4 py-2.5 pl-9 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>
      </div>

      {/* Render Product views based on layouts selection */}
      {viewStyle === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

          {filteredProducts.map((product) => {
            const locked = !!product.locked;
            return (
              <div
                key={product.id}
                className={`group bg-surface-container-lowest rounded-2xl border overflow-hidden shadow-bento hover:shadow-bento-raised transition-all duration-300 flex flex-col ${locked ? 'border-outline-variant/50' : 'border-outline-variant/30'}`}
              >
                {/* Media frame */}
                <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
                  <img
                    src={product.imageUrl || product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${locked ? 'grayscale opacity-60' : ''}`}
                    referrerPolicy="no-referrer"
                  />
                  {/* Category tag */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-primary font-bold text-[9px] uppercase tracking-wider shadow-sm border border-outline-variant/15">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>

                  {locked && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm">
                        <Lock className="w-2.5 h-2.5" /> Hidden
                      </span>
                    </div>
                  )}
                </div>

                {/* Info and action panel */}
                <div className="p-3.5 flex flex-col gap-2 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-primary leading-tight line-clamp-1 group-hover:text-primary-container transition-colors">
                      {product.name}
                    </h3>
                    <span className="font-extrabold text-secondary shrink-0 text-sm">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/10 pt-2.5 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${locked ? 'bg-neutral-400' : 'bg-green-500'}`} />
                      <span className="text-[11px] font-semibold text-on-surface-variant">
                        {locked ? 'Hidden from menu' : 'On the menu'}
                      </span>
                    </div>

                    <div className="flex gap-0.5">
                      <button
                        onClick={() => onToggleLock(product)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-container/60 transition-colors text-primary cursor-pointer"
                        title={locked ? 'Show on guest menu' : 'Hide from guest menu'}
                      >
                        {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-container/60 transition-colors text-primary cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors text-neutral-500 hover:text-neutral-900 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dotted Add New Item shortcut */}
          <button
            onClick={() => onNavigate('register_product')}
            className="group border-2 border-dashed border-outline-variant/60 rounded-2xl flex flex-col items-center justify-center p-6 min-h-[200px] hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-primary-container">
              <Plus className="w-5 h-5 text-primary group-hover:text-on-primary" />
            </div>
            <p className="font-bold text-sm text-primary tracking-tight">Add New Item</p>
            <p className="text-[11px] text-on-surface-variant mt-1 max-w-[180px] text-center">Create a new catalog listing.</p>
          </button>
        </div>
      ) : (
        /* List Layout Option */
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/25 overflow-hidden shadow-bento">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/35">
                <th className="px-6 py-4 text-xs font-semibold uppercase text-on-surface-variant/80">Product</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-on-surface-variant/80">Category</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-on-surface-variant/80 text-right">Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-on-surface-variant/80 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-on-surface-variant/80 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {filteredProducts.map((product) => {
                const locked = !!product.locked;
                return (
                  <tr key={product.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.imageUrl || product.image}
                          alt={product.name}
                          className={`w-12 h-12 rounded-lg object-cover shrink-0 border border-outline-variant/20 ${locked ? 'grayscale opacity-60' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-sm font-bold text-primary">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-on-surface-variant font-mono">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-primary">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${locked ? 'bg-neutral-400' : 'bg-green-500'}`} />
                        <span className="text-xs font-bold text-on-surface-variant">
                          {locked ? 'Hidden' : 'On menu'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onToggleLock(product)}
                          className="w-8 h-8 rounded-full hover:bg-secondary-container-high flex items-center justify-center text-primary cursor-pointer border border-outline-variant/10"
                          title={locked ? 'Show on guest menu' : 'Hide from guest menu'}
                        >
                          {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onEditProduct(product)}
                          className="w-8 h-8 rounded-full hover:bg-secondary-container-high flex items-center justify-center text-primary cursor-pointer border border-outline-variant/10"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="w-8 h-8 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer border border-outline-variant/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Add Product button — matches the Menu page's Add Category FAB */}
      <button
        onClick={() => onNavigate('register_product')}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-2.5 px-6 py-4 rounded-full shadow-lg hover:scale-103 hover:shadow-xl active:scale-95 transition-all z-20 cursor-pointer"
      >
        <PlusCircle className="w-5 h-5 text-on-primary" />
        <span>Add Product</span>
      </button>
    </div>
  );
}
