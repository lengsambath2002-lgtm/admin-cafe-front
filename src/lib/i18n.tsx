/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'km';

export const LANGUAGES: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'km', label: 'ភាសាខ្មែរ', short: 'ខ្មែរ' },
];

// Translation strings. Add a key to both `en` and `km`. Missing km keys fall
// back to English, so the UI never shows a blank.
type Dict = Record<string, string>;

const en: Dict = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.takeOrder': 'Take Order',
  'nav.ordersList': 'Orders List',
  'nav.products': 'Product',
  'nav.menu': 'Menu',
  'nav.reports': 'Report',
  'nav.take': 'Order',
  'nav.orders': 'List',

  // Chrome / common
  'common.help': 'Help',
  'common.adminLogin': 'Login',
  'common.logout': 'Log out',
  'common.newOrder': 'New Order',
  'common.subtotal': 'Subtotal',
  'common.tax': 'Tax',
  'common.total': 'Total',
  'common.paid': 'Paid',
  'common.unpaid': 'Unpaid',
  'common.done': 'Done',
  'common.cancel': 'Cancel',

  // Order status
  'status.New': 'New',
  'status.Preparing': 'Preparing',
  'status.Ready': 'Ready',
  'status.Completed': 'Completed',
  'status.Picked Up': 'Picked Up',
  'advance.New': 'Start Preparing',
  'advance.Preparing': 'Mark as Ready',
  'advance.Ready': 'Complete & Pickup',

  // Dashboard
  'dash.title': 'Daily Overview',
  'dash.subtitle': "Monitor your cafe's peak performance and order velocity in real-time.",
  'dash.registerProduct': 'Register Product',
  'dash.exportReport': 'Export Report',
  'dash.dailyRevenue': 'Daily Revenue',
  'dash.totalOrders': 'Total Orders',
  'dash.topSellingDrink': 'Top Selling Drink',
  'dash.vsYesterday': 'vs yesterday',
  'dash.unitsSoldToday': 'units sold today',
  'dash.noSalesToday': 'No sales yet today',
  'dash.activeOrders': 'Active Orders',
  'dash.viewAll': 'View all',
  'dash.noActiveOrders': 'No active orders right now',
  'dash.newOrdersWillShow': 'New orders will show up here.',
  'dash.selectOrder': 'Select an order',
  'dash.selectOrderHint': 'Click an active order to see its details.',
  'dash.showKhqr': 'Show KHQR',
  'dash.generating': 'Generating…',
  'dash.ordersListBtn': 'List',
  'dash.items': 'items',

  // Orders List
  'ol.title': 'List',
  'ol.subtitle': 'Process and track incoming orders in real-time.',
  'ol.active': 'Active',
  'ol.completed': 'Completed',
  'ol.all': 'All',
  'ol.viewDetails': 'view details',
  'ol.items': 'item(s)',
  'ol.cancelOrder': 'Cancel order',
  'ol.canceling': 'Canceling…',
  'ol.updating': 'Updating…',
  'ol.noOrders': 'No orders.',
  'ol.noTable': 'No table',
  'ol.dineIn': 'Dine-in',
  'ol.toGo': 'To-Go',

  // Take Order
  'to.title': 'Order',
  'to.subtitle': 'Tap a product to add it, customize each line, then place the order.',
  'to.newOrder': 'New Order',
  'to.orderList': 'Order List',
  'to.placeOrder': 'Place Order',
  'to.placing': 'Placing…',
  'to.table': 'Table',
  'to.customer': 'Customer',
  'to.tablePlaceholder': 'e.g. Table 7',
  'to.optional': 'Optional',
  'to.dineIn': 'Dine-in',
  'to.toGo': 'To-Go',
  'to.yourOrder': 'Your order',
  'to.all': 'All',
  'to.hidden': 'Hidden',

  // KHQR modal
  'khqr.waiting': 'Waiting for payment…',
  'khqr.scan': 'Scan with any Bakong-supported app',
  'khqr.expiresIn': 'expires in',
  'khqr.expired': 'QR expired — close and place again.',
  'khqr.received': 'Payment received',

  // Login
  'login.continueGuest': 'Continue as Guest',
  'login.signIn': 'Sign In',
  'login.email': 'Email',
  'login.password': 'Password',

  'common.all': 'All',

  // Products
  'prod.title': 'Product',
  'prod.subtitle': 'Manage your menu offerings, edit prices and monitor inventory levels.',
  'prod.search': 'Search products...',
  'prod.addProduct': 'Add Product',
  'prod.addNewItem': 'Add New Item',
  'prod.createListing': 'Create a new catalog listing.',
  'prod.onMenu': 'On the menu',
  'prod.hiddenFromMenu': 'Hidden from menu',
  'prod.colProduct': 'Product',
  'prod.colCategory': 'Category',
  'prod.colPrice': 'Price',
  'prod.colStatus': 'Status',
  'prod.colActions': 'Actions',

  // Categories
  'cat.title': 'Menu',
  'cat.subtitle': 'Organize your boutique offerings by coffee beans, extraction methods, and artisanal snacks.',
  'cat.addCategory': 'Add Category',
  'cat.createDirectory': 'Create a new menu directory.',
  'cat.createSection': 'Create Menu Section',
  'cat.categoryName': 'Category Name',
  'cat.namePlaceholder': 'e.g. Specialty Beverages',

  // Register product
  'reg.productName': 'Product Name',
  'reg.namePlaceholder': 'e.g. Ethiopia Yirgacheffe',
  'reg.category': 'Category',
  'reg.selectCategory': 'Select category',
  'reg.price': 'Price (USD)',
  'reg.image': 'Product Image',
  'reg.previewOnMenu': 'Preview on Menu',
  'reg.registerProduct': 'Register Product',
  'reg.editDetails': 'Edit Details',
  'reg.editProductDetails': 'Edit Product Details',
  'reg.updateProduct': 'Update Product',
  'reg.saveProduct': 'Save Product',

  // Reports
  'rep.title': 'Reports',
  'rep.topProducts': 'Top Selling Products',
  'rep.recentTransactions': 'Recent Transactions',
  'rep.searchOrders': 'Search orders, customers...',
  'rep.colProduct': 'Product',
  'rep.colUnits': 'Units',
  'rep.colRevenue': 'Revenue',
  'rep.colCustomer': 'Customer',
  'rep.colTimestamp': 'Timestamp',
  'rep.colStatus': 'Status',
  'rep.colAmount': 'Amount',
  'rep.avgOrderValue': 'Avg Order Value',
  'rep.newCustomers': 'New Customers',
  'rep.topCategory': 'Top Category',
  'rep.staffEfficiency': 'Staff Efficiency',
};

const km: Dict = {
  // Navigation
  'nav.dashboard': 'ផ្ទាំងព័ត៌មាន',
  'nav.takeOrder': 'កម្មង់',
  'nav.ordersList': 'បញ្ជីកម្មង់',
  'nav.products': 'ផលិតផល',
  'nav.menu': 'ម៉ឺនុយ',
  'nav.reports': 'របាយការណ៍',
  'nav.take': 'កម្មង់',
  'nav.orders': 'បញ្ញី',

  // Chrome / common
  'common.help': 'ជំនួយ',
  'common.adminLogin': 'ចូលគ្រប់គរង',
  'common.logout': 'ចេញ',
  'common.newOrder': 'កម្មង់ថ្មី',
  'common.subtotal': 'សរុបរង',
  'common.tax': 'ពន្ធ',
  'common.total': 'សរុប',
  'common.paid': 'បានបង់',
  'common.unpaid': 'មិនទាន់បង់',
  'common.done': 'រួចរាល់',
  'common.cancel': 'បោះបង់',

  // Order status
  'status.New': 'ថ្មី',
  'status.Preparing': 'កំពុងរៀបចំ',
  'status.Ready': 'រួចរាល់',
  'status.Completed': 'បានបញ្ចប់',
  'status.Picked Up': 'បានយក',
  'advance.New': 'ចាប់ផ្តើមរៀបចំ',
  'advance.Preparing': 'សម្គាល់ថារួចរាល់',
  'advance.Ready': 'បញ្ចប់ និងប្រគល់',

  // Dashboard
  'dash.title': 'ទិដ្ឋភាពប្រចាំថ្ងៃ',
  'dash.subtitle': 'តាមដានដំណើរការ និងល្បឿនកម្មង់របស់ហាងកាហ្វេអ្នកភ្លាមៗ។',
  'dash.registerProduct': 'ចុះផលិតផល',
  'dash.exportReport': 'នាំចេញរបាយការណ៍',
  'dash.dailyRevenue': 'ចំណូលប្រចាំថ្ងៃ',
  'dash.totalOrders': 'កម្មង់សរុប',
  'dash.topSellingDrink': 'ភេសជ្ជៈលក់ដាច់',
  'dash.vsYesterday': 'ធៀបនឹងម្សិលមិញ',
  'dash.unitsSoldToday': 'បានលក់ថ្ងៃនេះ',
  'dash.noSalesToday': 'មិនទាន់មានការលក់ថ្ងៃនេះ',
  'dash.activeOrders': 'កម្មង់កំពុងដំណើរការ',
  'dash.viewAll': 'មើលទាំងអស់',
  'dash.noActiveOrders': 'គ្មានកម្មង់សកម្មទេឥឡូវនេះ',
  'dash.newOrdersWillShow': 'កម្មង់ថ្មីនឹងបង្ហាញនៅទីនេះ។',
  'dash.selectOrder': 'ជ្រើសរើសកម្មង់',
  'dash.selectOrderHint': 'ចុចលើកម្មង់សកម្មដើម្បីមើលលម្អិត។',
  'dash.showKhqr': 'បង្ហាញ KHQR',
  'dash.generating': 'កំពុងបង្កើត…',
  'dash.ordersListBtn': 'បញ្ជីកម្មង់',
  'dash.items': 'មុខ',

  // Orders List
  'ol.title': 'បញ្ជីកម្មង់',
  'ol.subtitle': 'ដំណើរការ និងតាមដានកម្មង់ដែលចូលមកភ្លាមៗ។',
  'ol.active': 'សកម្ម',
  'ol.completed': 'បានបញ្ចប់',
  'ol.all': 'ទាំងអស់',
  'ol.viewDetails': 'មើលលម្អិត',
  'ol.items': 'មុខ',
  'ol.cancelOrder': 'បោះបង់កម្មង់',
  'ol.canceling': 'កំពុងបោះបង់…',
  'ol.updating': 'កំពុងធ្វើបច្ចុប្បន្នភាព…',
  'ol.noOrders': 'គ្មានកម្មង់ទេ។',
  'ol.noTable': 'គ្មានតុ',
  'ol.dineIn': 'ញ៉ាំនៅហាង',
  'ol.toGo': 'យកទៅ',

  // Take Order
  'to.title': 'កម្មង់',
  'to.subtitle': 'ចុចផលិតផលដើម្បីបន្ថែម កែសម្រួលនីមួយៗ រួចបញ្ជាទិញ។',
  'to.newOrder': 'កម្មង់ថ្មី',
  'to.orderList': 'បញ្ជីកម្មង់',
  'to.placeOrder': 'បញ្ជាទិញ',
  'to.placing': 'កំពុងបញ្ជាទិញ…',
  'to.table': 'តុ',
  'to.customer': 'អតិថិជន',
  'to.tablePlaceholder': 'ឧ. តុ ៧',
  'to.optional': 'ស្រេចចិត្ត',
  'to.dineIn': 'ញ៉ាំនៅហាង',
  'to.toGo': 'យកទៅ',
  'to.yourOrder': 'កម្មង់របស់អ្នក',
  'to.all': 'ទាំងអស់',
  'to.hidden': 'លាក់',

  // KHQR modal
  'khqr.waiting': 'កំពុងរង់ចាំការទូទាត់…',
  'khqr.scan': 'ស្កេនដោយកម្មវិធីដែលគាំទ្រ Bakong',
  'khqr.expiresIn': 'ផុតកំណត់ក្នុង',
  'khqr.expired': 'QR ផុតកំណត់ — បិទ ហើយបង្កើតម្តងទៀត។',
  'khqr.received': 'បានទទួលការទូទាត់',

  // Login
  'login.continueGuest': 'បន្តជាភ្ញៀវ',
  'login.signIn': 'ចូល',
  'login.email': 'អ៊ីមែល',
  'login.password': 'ពាក្យសម្ងាត់',

  'common.all': 'ទាំងអស់',

  // Products
  'prod.title': 'បញ្ជីផលិតផល',
  'prod.subtitle': 'គ្រប់គរងម៉ឺនុយ កែតម្លៃ និងតាមដានស្តុក។',
  'prod.search': 'ស្វែងរកផលិតផល...',
  'prod.addProduct': 'បន្ថែមផលិតផល',
  'prod.addNewItem': 'បន្ថែមធាតុថ្មី',
  'prod.createListing': 'បង្កើតបញ្ជីផលិតផលថ្មី។',
  'prod.onMenu': 'នៅលើម៉ឺនុយ',
  'prod.hiddenFromMenu': 'លាក់ពីម៉ឺនុយ',
  'prod.colProduct': 'ផលិតផល',
  'prod.colCategory': 'ប្រភេទ',
  'prod.colPrice': 'តម្លៃ',
  'prod.colStatus': 'ស្ថានភាព',
  'prod.colActions': 'សកម្មភាព',

  // Categories
  'cat.title': 'ម៉ឺនុយ',
  'cat.subtitle': 'រៀបចំផលិតផលរបស់អ្នកតាមប្រភេទ។',
  'cat.addCategory': 'បន្ថែមប្រភេទ',
  'cat.createDirectory': 'បង្កើតថតម៉ឺនុយថ្មី។',
  'cat.createSection': 'បង្កើតផ្នែកម៉ឺនុយ',
  'cat.categoryName': 'ឈ្មោះប្រភេទ',
  'cat.namePlaceholder': 'ឧ. ភេសជ្ជៈពិសេស',

  // Register product
  'reg.productName': 'ឈ្មោះផលិតផល',
  'reg.namePlaceholder': 'ឧ. កាហ្វេ Ethiopia',
  'reg.category': 'ប្រភេទ',
  'reg.selectCategory': 'ជ្រើសរើសប្រភេទ',
  'reg.price': 'តម្លៃ (USD)',
  'reg.image': 'រូបផលិតផល',
  'reg.previewOnMenu': 'មើលជាមុននៅលើម៉ឺនុយ',
  'reg.registerProduct': 'ចុះឈ្មោះផលិតផល',
  'reg.editDetails': 'កែព័ត៌មាន',
  'reg.editProductDetails': 'កែព័ត៌មានផលិតផល',
  'reg.updateProduct': 'ធ្វើបច្ចុប្បន្នភាពផលិតផល',
  'reg.saveProduct': 'រក្សាទុកផលិតផល',

  // Reports
  'rep.title': 'របាយការណ៍អាជីវកម្ម',
  'rep.topProducts': 'ផលិតផលលក់ដាច់',
  'rep.recentTransactions': 'ប្រតិបត្តិការថ្មីៗ',
  'rep.searchOrders': 'ស្វែងរកការកម្មង់ អតិថិជន...',
  'rep.colProduct': 'ផលិតផល',
  'rep.colUnits': 'ចំនួន',
  'rep.colRevenue': 'ចំណូល',
  'rep.colCustomer': 'អតិថិជន',
  'rep.colTimestamp': 'ពេលវេលា',
  'rep.colStatus': 'ស្ថានភាព',
  'rep.colAmount': 'ចំនួនទឹកប្រាក់',
  'rep.avgOrderValue': 'តម្លៃកម្មង់ជាមធ្យម',
  'rep.newCustomers': 'អតិថិជនថ្មី',
  'rep.topCategory': 'ប្រភេទលក់ដាច់',
  'rep.staffEfficiency': 'ប្រសិទ្ធភាពបុគ្គលិក',
};

const DICTS: Record<Lang, Dict> = { en, km };

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<I18n>({ lang: 'en', setLang: () => {}, t: (k) => k });

const STORAGE_KEY = 'brewmaster_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Load the saved language after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'km') setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string) => DICTS[lang][key] ?? en[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): I18n {
  return useContext(LanguageContext);
}
