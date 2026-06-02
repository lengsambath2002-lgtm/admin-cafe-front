/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Coffee,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Tags,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
  Plus
} from 'lucide-react';

import { Category, Product, Order, Transaction } from '../types';
import { api } from '../lib/api';

import DashboardView from '../components/DashboardView';
import OrdersView from '../components/OrdersView';
import ProductsView from '../components/ProductsView';
import CategoriesView from '../components/CategoriesView';
import ReportsView from '../components/ReportsView';
import RegisterProductView from '../components/RegisterProductView';
import TakeOrderModal, { PlaceOrderPayload } from '../components/TakeOrderModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Backend-backed reactive states (hydrated from the API on mount)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Initial data load lifecycle
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hydrate all collections from the backend once on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const [cats, prods, ords, txs] = await Promise.all([
          api.listCategories(),
          api.listProducts(),
          api.listOrders(),
          api.listTransactions()
        ]);
        if (!active) return;
        setCategories(cats);
        setProducts(prods);
        setOrders(ords);
        setTransactions(txs);
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Failed to load data from the server.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Search in global bar if focused
  const [globalSearch, setGlobalSearch] = useState('');

  // Mobile sidebar drawer helper
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Take-order ticket modal (admin builds the customer's order)
  const [takeOrderOpen, setTakeOrderOpen] = useState(false);

  // order lifecycles transitional triggers — PATCH /api/orders/{id}/status
  const handleOrderUpdate = async (orderId: string, status: Order['status']) => {
    try {
      const { order, transaction } = await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? order : o)));
      // Backend emits a transaction when an order completes — surface it immediately.
      if (transaction) {
        setTransactions(prev => [transaction, ...prev]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status.');
    }
  };

  // adding categories — POST /api/categories
  const handleAddCategory = async (newCat: { name: string; image: string }) => {
    try {
      const created = await api.createCategory({ name: newCat.name, image: newCat.image });
      setCategories(prev => [...prev, created]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add category.');
    }
  };

  // deleting categories — DELETE /api/categories/{id}
  const handleDeleteCategory = async (catId: string) => {
    try {
      await api.deleteCategory(catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category.');
    }
  };

  // CRUD submits for menu products — POST / PUT /api/products
  const handleProductSubmit = async (productData: Partial<Product>) => {
    const body = {
      name: productData.name || 'New Product',
      category: productData.category || 'espresso',
      price: productData.price ?? 0,
      stock: productData.stock ?? 0,
      description: productData.description || '',
      image: productData.image || ''
    };

    try {
      if (productData.id) {
        // Edit Mode
        const updated = await api.updateProduct(productData.id, body);
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      } else {
        // Create Mode — backend assigns the id
        const created = await api.createProduct(body);
        setProducts(prev => [created, ...prev]);
        // Category itemsCount is computed server-side; refresh to stay in sync.
        try {
          setCategories(await api.listCategories());
        } catch {
          // non-fatal — the product was still created
        }
      }
      setEditingProduct(null);
      setActiveTab('products');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  // Delete product — DELETE /api/products/{id}
  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      // Refresh categories so itemsCount reflects the removal.
      try {
        setCategories(await api.listCategories());
      } catch {
        // non-fatal
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product.');
    }
  };

  // Edit product navigation binder
  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('register_product');
  };

  // Cancel edit/creations
  const handleCancelProductForm = () => {
    setEditingProduct(null);
    setActiveTab('products');
  };

  // Admin places a real order on the customer's behalf — POST /api/orders.
  // The backend assigns the id and computes subtotal/tax/total.
  const handlePlaceOrder = async (payload: PlaceOrderPayload) => {
    try {
      const created = await api.placeOrder({
        tableNumber: payload.tableNumber || undefined,
        customerName: payload.customerName || undefined,
        isTakeout: payload.isTakeout,
        items: payload.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          size: item.size,
          notes: item.notes,
          priceOrder: item.priceOrder
        })),
        kitchenNote: payload.items.flatMap(i => i.notes).join('; ') || undefined
      });
      setOrders(prev => [created, ...prev]);
      setActiveTab('orders');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place order.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">

      {/* Mobile AppBar top view (Screen 1 matched headers layout) */}
      <header className="md:hidden w-full top-0 sticky bg-surface border-b border-outline-variant/35 z-40 flex justify-between items-center px-4 h-16 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <Coffee className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold text-primary leading-none">Café Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTakeOrderOpen(true)}
            className="p-1 px-3 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Order
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu sidebar fallback */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-surface border-b border-outline-variant/45 z-30 flex flex-col p-4 space-y-2 text-left animate-slide-down">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Boxes },
            { id: 'categories', label: 'Menu', icon: Tags },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs leading-none text-left tracking-wide ${
                  isSelected ? 'bg-primary text-white font-bold' : 'text-on-surface-variant/80 hover:bg-surface-container'
                }`}
              >
                <IconComp className="w-4.5 h-4.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop/Tablet persistent left SideNavBar (spec styled) */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full flex-col py-8 bg-surface border-r border-outline-variant w-[280px] shrink-0 z-25 text-left justify-between">
        <div>
          {/* Brand Header */}
          <div className="px-6 mb-8 select-none">
            <h1 className="text-xl font-bold text-primary tracking-tight font-display">Brewmaster</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50 mt-0.5">Admin Portal</p>
          </div>

          {/* Main Navigation indices list */}
          <nav className="space-y-1 px-2.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Boxes },
              { id: 'categories', label: 'Menu', icon: Tags },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id || (item.id === 'products' && activeTab === 'register_product');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditingProduct(null);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-[13px] tracking-wide cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-tertiary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <IconComp className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Admin Profile section footer */}
        <div className="border-t border-outline-variant/20 pt-6 px-4 space-y-4">
          <div className="space-y-0.5">
            <a href="#" className="flex items-center gap-3.5 px-4 py-2.5 font-bold text-[13px] text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
              <Settings className="w-4.5 h-4.5" />
              <span>Settings</span>
            </a>
            <a href="#" className="flex items-center gap-3.5 px-4 py-2.5 font-bold text-[13px] text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
              <HelpCircle className="w-4.5 h-4.5" />
              <span>Support</span>
            </a>
          </div>

          <div className="flex items-center gap-3.5 px-4 select-none">
            <img
              alt="Alex Rivera Admin"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUytDonYMCv1p1gTGFYyRF2q05mBlYP8nbj-HbWAiHC5r8cRFwR0IzDi9Hc9yM6C21odVWOILZYc_30j5L48AvVt14f9Z8yRBGJnLUMROeMEw5bH6zG2K2RL6Sato7URZdpW31ntaCiNbMTozygtdLIgBNNhKqygRtLVMqIFN7h8UJzGjOy_tu8DIMiD4_OJ7psOZqzS2fjM89cQAfGnMPewOhzmYSbadtx0yGCqgUV3mxx7bUdEXxGHH9hT2oP_lzFnY1zbtHNtM"
              className="w-10 h-10 rounded-full object-cover border-2 border-secondary-container"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-[13px] text-primary leading-tight">Alex Rivera</p>
              <p className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider mt-0.5">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane wrapper */}
      <main className="flex-1 md:ml-[280px] p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen pb-24 md:pb-8 flex flex-col justify-between">

        {/* Top Desktop Search and status panel */}
        <div className="hidden md:flex justify-between items-center mb-8 h-12">
          {/* Universal searching indicator */}
          <div className="relative w-full max-w-md text-left">
            <Search className="w-4 h-4 text-on-surface-variant/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search active listings, register logs..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                if (activeTab === 'products' || activeTab === 'dashboard') {
                  // forward search relevance automatically
                }
              }}
              className="w-full bg-surface-container-low text-xs pl-10 pr-4 py-2.5 rounded-xl border-none focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all placeholder:text-on-surface-variant/45"
            />
          </div>

          <div className="flex items-center gap-4" />
        </div>

        {/* Initial load / error feedback */}
        {loading && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant text-xs font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            Loading data from server…
          </div>
        )}
        {loadError && !loading && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-error text-on-error text-xs font-semibold">
            Could not load data: {loadError}
          </div>
        )}

        {/* Active tab content segment */}
        <div className="flex-1 pb-12 sm:pb-4">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              transactions={transactions}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setEditingProduct(null);
              }}
              onSelectOrder={() => {
                setActiveTab('orders');
              }}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              onOrderUpdate={handleOrderUpdate}
              onTakeOrder={() => setTakeOrderOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setEditingProduct(null);
              }}
              onEditProduct={handleEditProductClick}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
            />
          )}

          {activeTab === 'register_product' && (
            <RegisterProductView
              categories={categories}
              onSubmitProduct={handleProductSubmit}
              onCancel={handleCancelProductForm}
              editingProduct={editingProduct}
            />
          )}
        </div>

      </main>

      {/* Mobile only compact Bottom navigation bar (Screen 1 style) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 py-3 pb-safe bg-surface border-t border-outline-variant/35 shadow-bento rounded-t-2xl">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'products', label: 'Products', icon: Boxes },
          { id: 'categories', label: 'Menu', icon: Tags },
          { id: 'dashboard', label: 'Reports', icon: BarChart3 }, // "Reports" icon and bottom nav naming matches Screen 1
        ].map((item) => {
          const IconComp = item.icon;
          const isSelected = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'reports');
          const isCategorySelected = (item.id === 'categories' && activeTab === 'categories');
          const isProductSelected = (item.id === 'products' && (activeTab === 'products' || activeTab === 'register_product'));

          let highlight = isSelected || isCategorySelected || isProductSelected;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'dashboard') {
                  // reports tab toggle
                  setActiveTab('dashboard');
                } else {
                  setActiveTab(item.id);
                }
                setEditingProduct(null);
              }}
              className={`flex flex-col items-center justify-center px-3.5 py-1 transition-all rounded-full active:scale-90 ${
                highlight
                  ? 'bg-secondary-container text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant/80 hover:text-primary'
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Take Order ticket modal — admin builds the customer's order */}
      <TakeOrderModal
        isOpen={takeOrderOpen}
        onClose={() => setTakeOrderOpen(false)}
        products={products}
        onPlaceOrder={handlePlaceOrder}
      />

    </div>
  );
}
