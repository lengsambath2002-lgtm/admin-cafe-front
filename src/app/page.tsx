/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Tags,
  BarChart3,
  X,
  Plus,
  LogOut,
  LogIn,
  HelpCircle,
  Sparkles,
  Check,
  ChevronLeft,
  ClipboardList
} from 'lucide-react';

import { Category, Product, Order, Transaction } from '../types';
import { api } from '../lib/api';
import { getAuthUser, signOut, AuthUser, GUEST_USER } from '../lib/auth';

import DashboardView from '../components/DashboardView';
import ProductsView from '../components/ProductsView';
import CategoriesView from '../components/CategoriesView';
import ReportsView from '../components/ReportsView';
import RegisterProductView from '../components/RegisterProductView';
import TakeOrderView, { PlaceOrderPayload } from '../components/TakeOrderView';
import OrderListView from '../components/OrderListView';

// Merge orders from several sources (regular + guest), de-duped by id, newest first.
function mergeOrders(...results: PromiseSettledResult<Order[]>[]): Order[] {
  const byId = new Map<string, Order>();
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      for (const o of r.value) byId.set(o.id, o);
    }
  }
  return Array.from(byId.values()).sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));
}

// If an image URL points to an uploaded file (Supabase Storage, served by the
// backend), delete it too (best-effort). Preset/external images are left alone.
function deleteImageIfUploaded(image?: string | null): void {
  if (!image || !image.includes('/storage/v1/object/public/')) return;
  const filename = image.split('/').pop();
  if (filename) api.deleteUpload(decodeURIComponent(filename)).catch(() => {});
}

// Auto step-by-step walkthrough shown to guests on first visit.
const GUEST_TOUR = [
  { icon: Sparkles, title: 'Welcome 👋', desc: "Let's quickly show you how to take an order — it only takes 3 steps." },
  { icon: ShoppingCart, title: '1. Browse the menu', desc: 'Tap any product card to add it to the order. Use the category chips to filter the menu.' },
  { icon: Plus, title: '2. Customize the order', desc: 'In the order panel, tap a line to set size, sugar, quantity and notes — and add a table or customer name.' },
  { icon: Check, title: '3. Place the order', desc: 'Check the total, then tap Place Order. That’s it — you’re ready to serve!' },
];

// Auto walkthrough shown to admins on first visit.
const ADMIN_TOUR = [
  { icon: Sparkles, title: 'Welcome 👋', desc: 'A quick tour of your café admin — orders, menu, products and reports.' },
  { icon: LayoutDashboard, title: 'Dashboard', desc: 'Track daily revenue, total orders and your sales trend at a glance.' },
  { icon: ShoppingCart, title: 'Take Order', desc: 'Place orders and advance their status: New → Preparing → Ready → Complete.' },
  { icon: Boxes, title: 'Products', desc: 'Add, edit or remove products and upload their images.' },
  { icon: Tags, title: 'Menu', desc: 'Group products into categories, each with its own image.' },
  { icon: BarChart3, title: 'Reports', desc: 'Review performance by range and export the figures as CSV.' },
];

export default function App() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Auth gate — redirect to /login until a session is confirmed.
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // No forced login — visitors land on the Take Order page as a guest.
    // A persisted admin session keeps full access; admins reach the login form
    // via the "Admin Login" button.
    const user = getAuthUser() ?? GUEST_USER;
    setAuthUser(user);
    if (user.role === 'guest') setActiveTab('orders');
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    // Best-effort backend logout; clear the local session regardless.
    api.logout().catch(() => {});
    signOut();
    router.replace('/login');
  };

  // Guests reach the admin login form here.
  const goToAdminLogin = () => router.push('/login');

  // Guests are restricted to the Take Order page; admins manage everything.
  const isGuest = authUser?.role === 'guest';

  // Backend-backed reactive states (hydrated from the API on mount)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Count of new (unstarted) orders — shown as a badge on the Orders List nav.
  const newOrderCount = orders.filter((o) => o.status === 'New').length;

  // Initial data load lifecycle
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hydrate all collections from the backend once the session is confirmed.
  useEffect(() => {
    if (!authChecked) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        // Fetch independently so one failing endpoint doesn't blank the whole app.
        // Guests use the public guest menu endpoints (no token) and don't load the
        // admin-only order/transaction lists. Admins merge regular + guest orders.
        const empty = Promise.resolve([] as never[]);
        const [catsR, prodsR, ordsR, guestR, txsR] = await Promise.allSettled([
          isGuest ? api.listGuestCategories() : api.listCategories(),
          isGuest ? api.listGuestProducts() : api.listProducts(),
          isGuest ? empty : api.listOrders(),
          isGuest ? empty : api.listGuestOrders(),
          isGuest ? empty : api.listTransactions()
        ]);
        if (!active) return;
        if (catsR.status === 'fulfilled') setCategories(catsR.value);
        if (prodsR.status === 'fulfilled') setProducts(prodsR.value);
        setOrders(mergeOrders(ordsR, guestR));
        if (txsR.status === 'fulfilled') setTransactions(txsR.value);
        // Flag an error only if the core catalog couldn't load.
        if (catsR.status === 'rejected' && prodsR.status === 'rejected') {
          const reason = catsR.reason;
          setLoadError(reason instanceof Error ? reason.message : 'Failed to load data from the server.');
        }
      } catch (err) {
        if (active) setLoadError(err instanceof Error ? err.message : 'Failed to load data from the server.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authChecked]);

  // Keep orders/transactions fresh so admins see orders placed by guests (or other
  // devices) in near-real-time, without a manual reload. Guests don't view the list,
  // so we only poll for admins.
  useEffect(() => {
    if (!authChecked || isGuest) return;
    let active = true;
    const refresh = async () => {
      const [ordsR, guestR, txsR] = await Promise.allSettled([
        api.listOrders(),
        api.listGuestOrders(),
        api.listTransactions(),
      ]);
      if (!active) return;
      // Only replace data when at least one source succeeded — avoids wiping good
      // data on a transient failure.
      if (ordsR.status === 'fulfilled' || guestR.status === 'fulfilled') {
        setOrders(mergeOrders(ordsR, guestR));
      }
      if (txsR.status === 'fulfilled') setTransactions(txsR.value);
    };
    const id = setInterval(refresh, 15000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [authChecked, isGuest]);



  // Desktop sidebar collapse (persisted).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('brewmaster_sidebar_collapsed') === '1') {
      setSidebarCollapsed(true);
    }
  }, []);
  const toggleSidebar = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem('brewmaster_sidebar_collapsed', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  // How-to guide modal
  const [showHelp, setShowHelp] = useState(false);

  // Auto step-by-step walkthrough (first visit only) — role-specific steps.
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const activeTour = isGuest ? GUEST_TOUR : ADMIN_TOUR;
  const tourKey = isGuest ? 'brewmaster_guest_tour' : 'brewmaster_admin_tour';

  useEffect(() => {
    if (!authChecked || typeof window === 'undefined') return;
    const key = isGuest ? 'brewmaster_guest_tour' : 'brewmaster_admin_tour';
    if (!localStorage.getItem(key)) {
      setTourStep(0);
      setShowTour(true);
    }
  }, [authChecked, isGuest]);

  const closeTour = () => {
    setShowTour(false);
    try { localStorage.setItem(tourKey, '1'); } catch { /* ignore */ }
  };

  // Jump to the Orders (Take Order) screen — used by header / dashboard shortcuts.
  const goToTakeOrder = () => {
    setActiveTab('orders');
    setEditingProduct(null);
  };

  // order lifecycle transitions — PATCH /api/orders/{id}/status.
  // Returns the updated order so the Take Order panel can reflect the new status.
  const handleOrderUpdate = async (orderId: string, status: Order['status']): Promise<Order> => {
    try {
      const { order, transaction } = await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? order : o)));
      // Backend emits a transaction when an order completes — surface it immediately.
      if (transaction) {
        setTransactions(prev => [transaction, ...prev]);
      }
      return order;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status.');
      throw err;
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
    const image = categories.find(c => c.id === catId)?.image;
    try {
      await api.deleteCategory(catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
      deleteImageIfUploaded(image);
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
    const prod = products.find(p => p.id === productId);
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      deleteImageIfUploaded(prod?.imageUrl || prod?.image);
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

  // Toggle a product's lock — locked products are hidden from the guest menu.
  const handleToggleLock = async (product: Product) => {
    try {
      const updated = product.locked ? await api.unlockProduct(product.id) : await api.lockProduct(product.id);
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product lock.');
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

  // Places an order. Guests have no token, so they go through the public
  // POST /api/guest/orders; admins use POST /api/orders. The backend assigns the
  // id and computes subtotal/tax/total, and returns the created order.
  const handlePlaceOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
    try {
      const body = {
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
      };
      const created = isGuest ? await api.placeGuestOrder(body) : await api.placeOrder(body);
      setOrders(prev => [created, ...prev]);
      return created;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to place order.');
      throw err;
    }
  };

  // Hold rendering until the auth check resolves — avoids flashing the dashboard
  // before a redirect to /login.
  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">

      {/* Chrome (mobile header, drawer, sidebar, bottom nav) is hidden for guests
          — they get a clean, full-width Take Order page. */}
      {!isGuest && (
      <header className="md:hidden w-full top-0 sticky bg-surface border-b border-outline-variant/35 z-40 flex justify-between items-center px-4 h-16 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <Coffee className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold text-primary leading-none">Café Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToTakeOrder}
            className="p-1 px-3 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Order
          </button>
          <button
            onClick={() => setShowHelp(true)}
            title="How to use"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      )}

      {/* Desktop/Tablet persistent left SideNavBar (collapsible) */}
      {!isGuest && (
      <aside className={`hidden md:flex fixed left-0 top-0 h-full flex-col py-8 bg-surface border-r border-outline-variant shrink-0 z-25 text-left justify-between transition-[width] duration-300 ${sidebarCollapsed ? 'w-[76px]' : 'w-[280px]'}`}>
        <div>
          {/* Brand Header + collapse toggle */}
          <div className={`mb-8 select-none flex items-center ${sidebarCollapsed ? 'flex-col gap-3 px-2' : 'justify-between px-6'}`}>
            {sidebarCollapsed ? (
              <div className="p-2 bg-primary rounded-xl">
                <Coffee className="w-5 h-5 text-on-primary" />
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-primary tracking-tight font-display">Brewmaster</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50 mt-0.5">Admin Portal</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Main Navigation indices list */}
          <nav className="space-y-1 px-2.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Take Order', icon: ShoppingCart },
              { id: 'order-list', label: 'Orders List', icon: ClipboardList },
                { id: 'products', label: 'Products', icon: Boxes },
              { id: 'categories', label: 'Menu', icon: Tags },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
            ].filter((item) => !isGuest || item.id === 'orders').map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id || (item.id === 'products' && activeTab === 'register_product');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditingProduct(null);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center py-3.5 rounded-xl font-bold text-[13px] tracking-wide cursor-pointer transition-all duration-150 ${
                    sidebarCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'
                  } ${
                    isSelected
                      ? 'bg-tertiary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="relative shrink-0">
                    <IconComp className="w-4.5 h-4.5" />
                    {item.id === 'order-list' && newOrderCount > 0 && sidebarCollapsed && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                        {newOrderCount}
                      </span>
                    )}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.id === 'order-list' && newOrderCount > 0 && !sidebarCollapsed && (
                    <span className={`ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${isSelected ? 'bg-white text-primary' : 'bg-blue-600 text-white'}`}>
                      {newOrderCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer — log out */}
        <div className="border-t border-outline-variant/20 pt-6 px-2.5">
          <button
            onClick={isGuest ? goToAdminLogin : handleLogout}
            title={sidebarCollapsed ? (isGuest ? 'Admin Login' : 'Log out') : undefined}
            className={`w-full flex items-center py-2.5 font-bold text-[13px] text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all cursor-pointer ${
              sidebarCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4'
            }`}
          >
            {isGuest ? <LogIn className="w-4.5 h-4.5 shrink-0" /> : <LogOut className="w-4.5 h-4.5 shrink-0" />}
            {!sidebarCollapsed && <span>{isGuest ? 'Admin Login' : 'Log out'}</span>}
          </button>
        </div>
      </aside>
      )}

      {/* Top-right controls: Help + Admin Login (guests). Guests have no header so
          they show on all sizes; admins use the mobile header on small screens to
          avoid overlapping it, so this floats on desktop only for them. */}
      <div className={`fixed top-5 right-6 z-40 items-center gap-2 ${isGuest ? 'flex' : 'hidden md:flex'}`}>
        {isGuest && (
          <button
            onClick={goToAdminLogin}
            className="flex items-center gap-1.5 bg-surface-container-lowest text-primary border border-outline-variant/50 hover:border-primary text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Admin Login
          </button>
        )}
        <button
          onClick={() => setShowHelp(true)}
          title="How to use"
          className="flex items-center gap-1.5 bg-surface-container-lowest text-primary border border-outline-variant/50 hover:border-primary text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </div>

      {/* How-to guide modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-primary/25 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => setShowHelp(false)}>
          <div
            className="bg-surface-container-lowest border border-outline-variant/45 shadow-lg rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin p-6 relative animate-scale-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-primary tracking-tight">How to use Brewmaster</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">A quick guide to taking orders and managing the café.</p>

            <div className="space-y-4">
              {[
                {
                  icon: ShoppingCart,
                  title: 'Take an order',
                  steps: [
                    'Tap a product to add it to the order.',
                    'Tap a line in the New Order panel to customize size, sugar, quantity and notes.',
                    'Enter the table / customer and choose Dine-in or To-Go.',
                    'Press Place Order.',
                  ],
                },
                {
                  icon: LayoutDashboard,
                  title: 'Track orders (admin)',
                  steps: [
                    'Placed orders appear in the Orders list on the Take Order panel.',
                    'Tap an order to view its items, then advance its status: New → Preparing → Ready → Complete.',
                  ],
                },
                {
                  icon: Boxes,
                  title: 'Products (admin)',
                  steps: [
                    'Open Products, then tap Add Product (bottom-right).',
                    'Fill in the details and upload a product image, then Save.',
                    'Use the edit / delete icons on each card to manage items.',
                  ],
                },
                {
                  icon: Tags,
                  title: 'Menu / categories (admin)',
                  steps: [
                    'Open Menu, then tap Add Category.',
                    'Enter a name and pick or upload an image, then Create.',
                  ],
                },
                {
                  icon: BarChart3,
                  title: 'Reports (admin)',
                  steps: [
                    'Open Reports and switch the range (Weekly / Monthly / Yearly).',
                    'Tap Export CSV to download the figures.',
                  ],
                },
                {
                  icon: LogIn,
                  title: 'Roles',
                  steps: [
                    'Guests can only take orders (no sidebar).',
                    'Admins manage everything — use Admin Login to sign in, or Log out from the sidebar.',
                  ],
                },
              ].map((section) => {
                const SectionIcon = section.icon;
                return (
                  <div key={section.title} className="rounded-xl border border-outline-variant/25 bg-surface-container-low/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-secondary-container/60 rounded-lg">
                        <SectionIcon className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="text-sm font-bold text-primary">{section.title}</h4>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-on-surface-variant leading-relaxed marker:text-on-surface-variant/50">
                      {section.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full bg-primary text-on-primary hover:bg-primary-container font-bold text-xs py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Auto step-by-step walkthrough (guests and admins) */}
      {showTour && (() => {
        const step = activeTour[tourStep];
        const StepIcon = step.icon;
        const isLast = tourStep === activeTour.length - 1;
        return (
          <div className="fixed inset-0 z-[60] bg-primary/30 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface-container-lowest rounded-2xl shadow-lg w-full max-w-sm p-6 text-center animate-scale-up relative">
              <button
                onClick={closeTour}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-secondary-container/60 flex items-center justify-center mx-auto mb-4">
                <StepIcon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-primary tracking-tight">{step.title}</h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{step.desc}</p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 my-5">
                {activeTour.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === tourStep ? 'w-5 bg-primary' : 'w-1.5 bg-outline-variant'}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={() => setTourStep((s) => s - 1)}
                    className="flex-1 bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => (isLast ? closeTour() : setTourStep((s) => s + 1))}
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container font-bold text-xs py-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {isLast ? 'Got it' : 'Next'}
                </button>
              </div>

              {!isLast && (
                <button onClick={closeTour} className="mt-3 text-[11px] font-semibold text-on-surface-variant/70 hover:text-primary cursor-pointer">
                  Skip tour
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Main Content Pane wrapper */}
      <main className={`flex-1 ${isGuest ? '' : (sidebarCollapsed ? 'md:ml-[76px]' : 'md:ml-[280px]')} p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen pb-24 md:pb-8 flex flex-col justify-between transition-[margin] duration-300`}>

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
        <div className="flex-1 w-full max-w-[1500px] mx-auto pb-12 sm:pb-4">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setEditingProduct(null);
              }}
              onSelectOrder={() => {
                setActiveTab('order-list');
              }}
            />
          )}

          {activeTab === 'orders' && (
            <TakeOrderView
              products={products}
              categories={categories}
              orders={orders}
              showOrderHistory={false}
              onPlaceOrder={handlePlaceOrder}
              onUpdateStatus={handleOrderUpdate}
            />
          )}

          {activeTab === 'order-list' && (
            <OrderListView
              orders={orders}
              onUpdateStatus={handleOrderUpdate}
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
              onToggleLock={handleToggleLock}
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
      {!isGuest && (
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 py-3 pb-safe bg-surface border-t border-outline-variant/35 shadow-bento rounded-t-2xl">
        {[
          { id: 'orders', label: 'Take', icon: ShoppingCart },
          { id: 'order-list', label: 'Orders', icon: ClipboardList },
          { id: 'products', label: 'Products', icon: Boxes },
          { id: 'categories', label: 'Menu', icon: Tags },
          { id: 'dashboard', label: 'Reports', icon: BarChart3 }, // "Reports" icon and bottom nav naming matches Screen 1
        ].filter((item) => !isGuest || item.id === 'orders').map((item) => {
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
              className={`flex flex-col items-center justify-center px-2.5 py-1 transition-all rounded-full active:scale-90 ${
                highlight
                  ? 'bg-secondary-container text-primary font-bold shadow-xs'
                  : 'text-on-surface-variant/80 hover:text-primary'
              }`}
            >
              <span className="relative">
                <IconComp className="w-5 h-5" />
                {item.id === 'order-list' && newOrderCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                    {newOrderCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
      )}

    </div>
  );
}
