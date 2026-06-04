/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  ChevronRight,
  Image as ImageIcon,
  Lightbulb,
  Upload,
  Loader2
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../lib/api';

interface RegisterProductViewProps {
  categories: Category[];
  onSubmitProduct: (product: Partial<Product>) => void;
  onCancel: () => void;
  editingProduct?: Product | null;
}

const PRESET_PRODUCT_PHOTOS = [
  { name: 'Signature Espresso Pull', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA5XVPLLbq5XprLeh2MQo0n4CCR9W4ZdpOWVioxJnHDg9lA0t5AUCL4yCWzL1rPW9K6qNGFkO_fDBqiCuQ-rATXD08mMeUTYFcT5-IUjqYeJw1lVMClquDprdwbirWDbm1pU2mdg20ncrCYC2yOHV12ut94v9zjoKvTBdnGJwsj8g2jMfugcGQPOUv6OuBqWH7OnPMBwvfu9FG78IyhN5A9BNY9saFxUqXNxKL_jaWbl72cPAuahgNfmJcrpDv1CPJQQbtYf7pnQw' },
  { name: 'Velvety Latte Heart', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWag7MpuwITw_u60NGEQkyfs4RXpmJ73RZxon86KMyTXhVl2P9YH3JDO3JI063wiKFUrx455PLcRMZoWlTNH9TZDwVjtf0N330tKq8X2FUy8DEQ9f_POeBsRuY-OtocIvm0btzHwWC_EPt5yWcF6kY6vmXAJj6oylKnTypFOqugfgfDHzKgo8jdCNbK-URPsOQey-oa7iheTv0NuxSFcxIW8AblEPMRyAJ7Pu2E1m22h9_YW4C9NY16Uoy3W0YVAcdkj9f85jsv5A' },
  { name: 'Kyoto Cold Brew Glass', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh1X0xw6H7iwjHkHrKy4rnVQ0OggvAKp1bl0cFrqKibTub-yhLGMC9EnLtPYt8p_BYyuWcbqJLNngIZNjbfFwinD8BpX5oGQTgNhIeEfz8o4B8hSXPWAYrKLCV-W8nUBul1oV2tFEFticBXiLBNiTPdY1Gsgy3ZJtsWyj-ofzwuVjiTMGQuCuNvLZSvXXnwUes3Np2ZReB1GxWM-TcoGTl79axpQeJINWHGRIWO9DuDcCsk9aEEqp-zMdu9c7XtI8bGE4J3f2AlDs' },
  { name: 'Sourdough Croissants tray', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3V93x7xtGTQ_OdmhCfDpi53YoTtJqJ5hMHjLrQWaElN5uyi-_Apr0c8A9OInlPIbYjvofaT_U8uVNP2KtdsvCJyju2ldLCuM7chp49KEeuvSLHAqGHAkYakxAcxv1fjAbnf5zgjQBwccovcCVZs7HhPCNAxA-qUiLcR57zdQrFmX7UrnA9wDsehaVGN5WttNAmr4pGSlt-drqAq3EYBvP_yXK85OlKVmlxHp_YsOe5NID1F-uuZfQcA4N8Dc1CwLdJnkS2AjP52s' },
  { name: 'Burlap Sack Beans pouring', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIOxGY2O4HLPo7PeptWvQs-0ugi_39g4v_ZfGeQ9NLsWdpCy1TftI5KPJQ62f6JW5hPIOmXMtQuqHNi9zFQfbgvuyFw94FueKqshfkND7ON_hSoB-0WACr8wc3zTkm4i-oemy0GYUvozDLr8e7oPZKnurHUfNFQgLzV5wc5-afWwA8NC2nCJeoy4FUu1GxuEAi9z5Puvph96H0WeOL6Kq8dA-dkR0iSxL0CYAnChfFxXyxtJsBEkbElaF9kzokoxTq3Wum6XlGgJA' }
];

export default function RegisterProductView({ categories, onSubmitProduct, onCancel, editingProduct }: RegisterProductViewProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [savingStatus, setSavingStatus] = useState<idle | saving | success | error>('idle');

  // Image upload (POST /api/upload)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Filename this session uploaded — so we can delete it if it gets replaced.
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { url, filename } = await api.uploadImage(file);
      if (url) {
        // Remove the file we uploaded earlier in this session (avoid orphans).
        if (uploadedFilename) api.deleteUpload(uploadedFilename).catch(() => {});
        setImage(url);
        setUploadedFilename(filename ?? null);
      } else {
        setUploadError('Upload succeeded but no URL was returned.');
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      // reset so selecting the same file again still triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Load editing product factors if in edit mode
  useEffect(() => {
    // Switching products clears any session-upload association.
    setUploadedFilename(null);
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setStock(editingProduct.stock);
      setDescription(editingProduct.description);
      setImage(editingProduct.imageUrl || editingProduct.image);
    } else {
      setName('');
      setCategory('');
      setPrice('');
      setStock('');
      setDescription('');
      setImage('');
    }
  }, [editingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    setSavingStatus('saving');

    setTimeout(() => {
      onSubmitProduct({
        id: editingProduct?.id, // will pass id if in edit mode to overwrite
        name: name.trim(),
        category,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        description: description.trim(),
        image: image || PRESET_PRODUCT_PHOTOS[0].url
      });
      setSavingStatus('success');
    }, 1000);
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'New Category';
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Breadcrumbs and Page title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-2.5">
          <span className="hover:text-primary cursor-pointer" onClick={onCancel}>Products</span>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40" />
          <span className="text-primary font-bold">
            {editingProduct ? 'Edit Details' : 'Register Product'}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-primary tracking-tight">
          {editingProduct ? 'Edit Product Details' : 'Register Product'}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column Fields: Form container (Screen 3) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-bento border border-outline-variant/20 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ethiopia Yirgacheffe"
                  className="w-full bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* Price Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-surface-container-low text-xs pl-8 pr-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                    required
                  />
                </div>
              </div>

              {/* Stock Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Initial Stock</label>
                <input 
                  type="number" 
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                  required
                />
              </div>

            </div>

            {/* Description note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the flavor profile, bean origins, extraction methods or bakery ingredients..."
                className="w-full bg-surface-container-low text-xs px-4 py-3 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 resize-none leading-relaxed"
                required
              />
            </div>

            {/* Predefined visual options select */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Product Image</label>

                {/* Upload your own image */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-container disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
              </div>

              {uploadError && (
                <p className="text-[11px] font-semibold text-red-600">{uploadError}</p>
              )}

              {/* Current product image preview (uploaded). No preset themes. */}
              {image ? (
                <div className="relative rounded-xl overflow-hidden h-32 border border-outline-variant/30 shadow-sm">
                  <img src={image} alt="Product" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-semibold">{uploading ? 'Uploading…' : 'Upload a product image'}</span>
                </button>
              )}
            </div>

            {/* Submitting Bar */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-outline-variant/20">
              <button 
                type="submit"
                disabled={savingStatus === 'saving' || savingStatus === 'success'}
                className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md hover:bg-primary-container disabled:opacity-50 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                {savingStatus === 'saving' && 'Processing...'}
                {savingStatus === 'success' && 'Product Saved!'}
                {savingStatus === 'idle' && (editingProduct ? 'Update Product' : 'Save Product')}
              </button>
              
              <button 
                type="button"
                onClick={onCancel}
                className="flex-1 bg-secondary-container hover:bg-surface-container-high text-primary font-bold py-4 rounded-xl active:scale-95 transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Previews and tips box (Screen 3) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Menu Card representation Preview block */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/20 text-left">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Preview on Menu</p>
            
            <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/25 flex shadow-sm hover:shadow-md transition-all">
              <div className="w-24 h-24 bg-surface-container-low flex items-center justify-center shrink-0">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-outline-variant" />
                )}
              </div>
              <div className="p-3.5 flex flex-col justify-center gap-1.5 text-left overflow-hidden select-none">
                <div className="h-4 w-32 bg-surface-container rounded-full truncate font-bold text-xs text-primary leading-none">
                  {name || 'Product Title'}
                </div>
                <div className="h-3 w-40 bg-surface-container rounded-full truncate text-[10px] text-on-surface-variant mt-0.5">
                  {description || 'Product flavor breakdown'}
                </div>
                <div className="h-4 w-12 bg-secondary-container text-primary rounded-full mt-1.5 flex items-center justify-center font-bold text-[10px] py-1.5">
                  ${price ? Number(price).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Admin tips box (Screen 3 detail) */}
          <section className="bg-tertiary text-on-tertiary p-6 rounded-2xl shadow-bento space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5 text-on-primary-container" />
              <h3 className="font-bold text-sm tracking-tight">Admin Tip</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              High-quality pictures of brewed coffee perform <strong className="text-white">40% better</strong> on user interfaces. Make sure your lighting matches the cafe shop's beautiful "Boutique Hospitality" look.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}

// Temporary type solution to clear typescript compile checklist
type idle = 'idle';
type saving = 'saving';
type success = 'success';
type error = 'error';
