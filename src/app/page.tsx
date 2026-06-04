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
  Menu,
  X,
  Plus,
  LogOut,
  LogIn
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

// If an image URL points to a backend-uploaded file (/uploads/...), delete that
// file too (best-effort). Preset/external images are left untouched.
function deleteImageIfUploaded(image?: string | null): void {
  if (!image || !image.includes('/uploads/')) return;
  const filename = image.split('/').pop();
  if (filename) api.deleteUpload(filename).catch(() => {});
}

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


  // Mobile sidebar drawer helper
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Mobile AppBar top view (Screen 1 matched headers layout) */}
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
            { id: 'orders', label: 'Take Order', icon: ShoppingCart },
            { id: 'products', label: 'Products', icon: Boxes },
            { id: 'categories', label: 'Menu', icon: Tags },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
          ].filter((item) => !isGuest || item.id === 'orders').map((item) => {
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
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (isGuest) goToAdminLogin();
              else handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs leading-none text-left tracking-wide text-on-surface-variant/80 hover:bg-surface-container"
          >
            {isGuest ? <LogIn className="w-4.5 h-4.5" /> : <LogOut className="w-4.5 h-4.5" />}
            {isGuest ? 'Admin Login' : 'Log out'}
          </button>
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
              { id: 'orders', label: 'Take Order', icon: ShoppingCart },
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
            <button
              onClick={isGuest ? goToAdminLogin : handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 font-bold text-[13px] text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all cursor-pointer"
            >
              {isGuest ? <LogIn className="w-4.5 h-4.5" /> : <LogOut className="w-4.5 h-4.5" />}
              <span>{isGuest ? 'Admin Login' : 'Log out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane wrapper */}
      <main className="flex-1 md:ml-[280px] p-4 sm:p-6 lg:p-8 overflow-x-hidden min-h-screen pb-24 md:pb-8 flex flex-col justify-between">

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
            <TakeOrderView
              products={products}
              categories={categories}
              orders={orders}
              showOrderHistory={!isGuest}
              onPlaceOrder={handlePlaceOrder}
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

    </div>
  );
}
