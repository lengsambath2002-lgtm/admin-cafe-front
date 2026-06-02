/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
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
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS
} from '../data';

import DashboardView from '../components/DashboardView';
import OrdersView from '../components/OrdersView';
import ProductsView from '../components/ProductsView';
import CategoriesView from '../components/CategoriesView';
import ReportsView from '../components/ReportsView';
import RegisterProductView from '../components/RegisterProductView';
import TakeOrderModal, { PlaceOrderPayload } from '../components/TakeOrderModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // High availability memory reactive states
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search in global bar if focused
  const [globalSearch, setGlobalSearch] = useState('');

  // Mobile sidebar drawer helper
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Take-order ticket modal (admin builds the customer's order)
  const [takeOrderOpen, setTakeOrderOpen] = useState(false);

  // order lifecycles transitional triggers
  const handleOrderUpdate = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        let elapsed = order.timeElapsed;
        if (status === 'Preparing') elapsed = 'Started prep';
        if (status === 'Ready') elapsed = 'Ready for pickup';
        if (status === 'Completed') elapsed = 'Completed just now';

        // Add transaction entry state if completed to demonstrate complete structural cohesion
        if (status === 'Completed' && order.status !== 'Completed') {
          const newTx: Transaction = {
            id: `BW-9${Math.floor(100 + Math.random() * 900)}`,
            customerName: order.tableNumber || 'Anonymous Table',
            description: order.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
            timestamp: 'Just now',
            itemsCount: order.items.reduce((acc, current) => acc + current.quantity, 0),
            amount: order.total,
            status: 'COMPLETED'
          };
          setTransactions(tPrev => [newTx, ...tPrev]);
        }

        return {
          ...order,
          status,
          timeElapsed: elapsed
        };
      }
      return order;
    }));
  };

  // adding categories
  const handleAddCategory = (newCat: { name: string; image: string }) => {
    const freshCat: Category = {
      id: newCat.name.toLowerCase().replace(/\s+/g, '_'),
      name: newCat.name,
      itemsCount: 0,
      image: newCat.image,
      icon: 'Coffee'
    };
    setCategories(prev => [...prev, freshCat]);
  };

  // deleting categories
  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // CRUD submits for menu products
  const handleProductSubmit = (productData: Partial<Product>) => {
    if (productData.id) {
      // Edit Mode
      setProducts(prev => prev.map(p => {
        if (p.id === productData.id) {
          return { ...p, ...productData } as Product;
        }
        return p;
      }));
    } else {
      // Create Mode
      const nextId = `p${products.length + 1}`;
      const newProduct: Product = {
        id: nextId,
        name: productData.name || 'New Product',
        category: productData.category || 'espresso',
        price: productData.price || 0,
        stock: productData.stock || 0,
        description: productData.description || '',
        image: productData.image || ''
      };
      setProducts(prev => [newProduct, ...prev]);

      // dynamically add categories items count calculation to reflect dynamic stats
      setCategories(prev => prev.map(c => {
        if (c.id === productData.category || c.name.toLowerCase() === productData.category?.toLowerCase()) {
          return { ...c, itemsCount: c.itemsCount + 1 };
        }
        return c;
      }));
    }

    setEditingProduct(null);
    setActiveTab('products');
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
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

  // Admin places a real order on the customer's behalf (from the Take Order modal)
  const handlePlaceOrder = (payload: PlaceOrderPayload) => {
    const subtotal = payload.items.reduce((sum, item) => sum + item.priceOrder, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const newOrder: Order = {
      id: `${Math.floor(884 + Math.random() * 100)}`,
      tableNumber: payload.tableNumber || (payload.isTakeout ? 'Takeout' : 'Walk-In'),
      customerName: payload.customerName || undefined,
      isTakeout: payload.isTakeout,
      timeElapsed: 'Just Placed',
      timestamp: 'Just now',
      status: 'New',
      server: 'Alex Rivera',
      items: payload.items.map((item, idx) => ({
        id: `oi_${Date.now()}_${idx}`,
        productName: item.productName,
        quantity: item.quantity,
        size: item.size,
        notes: item.notes,
        priceOrder: item.priceOrder
      })),
      subtotal,
      tax,
      total,
      kitchenNote: payload.items.flatMap(i => i.notes).join('; ') || 'Standard preparation.'
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveTab('orders');
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
