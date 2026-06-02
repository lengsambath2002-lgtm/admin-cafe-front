import { Category, Product, Order, Transaction } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    itemsCount: 12,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA5XVPLLbq5XprLeh2MQo0n4CCR9W4ZdpOWVioxJnHDg9lA0t5AUCL4yCWzL1rPW9K6qNGFkO_fDBqiCuQ-rATXD08mMeUTYFcT5-IUjqYeJw1lVMClquDprdwbirWDbm1pU2mdg20ncrCYC2yOHV12ut94v9zjoKvTBdnGJwsj8g2jMfugcGQPOUv6OuBqWH7OnPMBwvfu9FG78IyhN5A9BNY9saFxUqXNxKL_jaWbl72cPAuahgNfmJcrpDv1CPJQQbtYf7pnQw',
    icon: 'Coffee'
  },
  {
    id: 'cold_brew',
    name: 'Cold Brew',
    itemsCount: 8,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh1X0xw6H7iwjHkHrKy4rnVQ0OggvAKp1bl0cFrqKibTub-yhLGMC9EnLtPYt8p_BYyuWcbqJLNngIZNjbfFwinD8BpX5oGQTgNhIeEfz8o4B8hSXPWAYrKLCV-W8nUBul1oV2tFEFticBXiLBNiTPdY1Gsgy3ZJtsWyj-ofzwuVjiTMGQuCuNvLZSvXXnwUes3Np2ZReB1GxWM-TcoGTl79axpQeJINWHGRIWO9DuDcCsk9aEEqp-zMdu9c7XtI8bGE4J3f2AlDs',
    icon: 'Snowflake'
  },
  {
    id: 'pastries',
    name: 'Pastries',
    itemsCount: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3V93x7xtGTQ_OdmhCfDpi53YoTtJqJ5hMHjLrQWaElN5uyi-_Apr0c8A9OInlPIbYjvofaT_U8uVNP2KtdsvCJyju2ldLCuM7chp49KEeuvSLHAqGHAkYakxAcxv1fjAbnf5zgjQBwccovcCVZs7HhPCNAxA-qUiLcR57zdQrFmX7UrnA9wDsehaVGN5WttNAmr4pGSlt-drqAq3EYBvP_yXK85OlKVmlxHp_YsOe5NID1F-uuZfQcA4N8Dc1CwLdJnkS2AjP52s',
    icon: 'Croissant'
  },
  {
    id: 'whole_bean',
    name: 'Whole Bean',
    itemsCount: 6,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIOxGY2O4HLPo7PeptWvQs-0ugi_39g4v_ZfGeQ9NLsWdpCy1TftI5KPJQ62f6JW5hPIOmXMtQuqHNi9zFQfbgvuyFw94FueKqshfkND7ON_hSoB-0WACr8wc3zTkm4i-oemy0GYUvozDLr8e7oPZKnurHUfNFQgLzV5wc5-afWwA8NC2nCJeoy4FUu1GxuEAi9z5Puvph96H0WeOL6Kq8dA-dkR0iSxL0CYAnChfFxXyxtJsBEkbElaF9kzokoxTq3Wum6XlGgJA',
    icon: 'Leaf'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Signature Latte',
    category: 'espresso',
    price: 5.50,
    stock: 84,
    description: 'A masterfully prepared caffe latte with velvety smooth milk foam and signature double espresso shot.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWag7MpuwITw_u60NGEQkyfs4RXpmJ73RZxon86KMyTXhVl2P9YH3JDO3JI063wiKFUrx455PLcRMZoWlTNH9TZDwVjtf0N330tKq8X2FUy8DEQ9f_POeBsRuY-OtocIvm0btzHwWC_EPt5yWcF6kY6vmXAJj6oylKnTypFOqugfgfDHzKgo8jdCNbK-URPsOQey-oa7iheTv0NuxSFcxIW8AblEPMRyAJ7Pu2E1m22h9_YW4C9NY16Uoy3W0YVAcdkj9f85jsv5A'
  },
  {
    id: 'p2',
    name: 'Kyoto Cold Brew',
    category: 'cold_brew',
    price: 6.25,
    stock: 32,
    description: 'Slow-drip Kyoto-style cold brew with clear slow-frozen ice spheres, bringing clear clarity and sweetness.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_9Em2NxSCFBDbf2G-M1dabz4YhoQlyGf6BN6z-jg1S8tloRGiNUHe-SP3qeRdFAqkeomUdAGH16vK4jKa6fmr0nS80OTVQ-nvkc07XtQNk67yNFH9dGoMUvn3PN4cRSfFfLaeP0WCuwI2geUnf7n06sNbDSZtZ-AMurafThxBp4fjl7ZrzAEBtPnJnx_bm2pbClWaelpF0X9mXlwSrwBdtZuzWxE2oY_ixvJNvCK6TRidEjN4kTW-u4ngIsOpcQ38Ev7rMvGd7yE'
  },
  {
    id: 'p3',
    name: 'Sourdough Croissant',
    category: 'pastries',
    price: 4.75,
    stock: 12,
    description: 'Golden flaky sourdough croissant baked fresh daily with raw butter, crunchy visual layers and deep rich crumb.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy92GGIdvriConmGQUitY6xGOwDR53i34Ln0wOEQZrECdVo9HDkQbRR6c-yZpA-Q0H4zjShPuqdIuR8QB059zkbf-Nmv_R0tIAmmvgswvyWKGavGiU74UpNBrl9pI91XgaGlooQ1OP9zZiH379_7-Fr7I0KIdUnr_uTxXoz4G_HfYWi-nSOlRYQbo1kUs-9x9bTo0h7mrg55yUXKWEwTcZPNeqRZGCtF1r1NmtojRRHnNRM3JAEvvtFAUzjGbeoeSnEW6JlmSY6D4'
  },
  {
    id: 'p4',
    name: 'Ethiopia Yirgacheffe',
    category: 'whole_bean',
    price: 18.00,
    stock: 45,
    description: 'Lightly roasted single-origin whole bean coffee with distinct floral notes, bergamot citrus acidity and lavender aroma.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdd57KweF-rEZDlm5ZD2kZWSBreQNO7FMLiV8T5OIx2n6V-3neL179SVTDFUtQ2JfYOZvvpu5Q4tIkyV_dRDqVZe1DLJtDEn7HBVq_svstI1IKfNWMjXTHzOhAYM_0AeNCT0os5TCqIE4E7muSSpH-UFXmhvylOGCsg-z7lHqxF3Cr1lEUwDbE95qwrsvWcZ4PCAr_q4nZ-pyV-pY6fH5so8fZMVnEdhSqMH95d9XYsxRh7a9zrIVgxgSVENHvI3ycmPf7KChyPWk'
  },
  {
    id: 'p5',
    name: 'Sea Salt Cookie',
    category: 'pastries',
    price: 3.50,
    stock: 0,
    description: 'Decadent dark chocolate cookie finished with premium flaky sea salt and gooey warm chocolate core chunks.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_3__5YMC6fJb436jvu_-KWQcJnT2_kC-jcIlrMYGF052ZhI6nxH2QL1FkeVaW5-UpYdrYgyYIsrFtVMdZTGfRzrdBREIw1tjsM6RRq9W_VFEmnjy-IhacxdlKj85gllNjzruGXLYAGLByd_12IKjVGEKoMM47uyLlcZcmkmBCNmEvG_i_mRlpoUuRUzz0iT0DmnG2QpG-fKM-cHcVaYQm15FX9LBESEnJUZY64taGq_i9_CpffvZi7Dqd7hduAX9b0FGE3nJoOrA'
  },
  {
    id: 'p6',
    name: 'Oat Milk Latte',
    category: 'espresso',
    price: 5.50,
    stock: 95,
    description: 'Creamy barista oat milk paired with our rich Signature Espresso for a smooth and satisfying non-dairy cup.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA5XVPLLbq5XprLeh2MQo0n4CCR9W4ZdpOWVioxJnHDg9lA0t5AUCL4yCWzL1rPW9K6qNGFkO_fDBqiCuQ-rATXD08mMeUTYFcT5-IUjqYeJw1lVMClquDprdwbirWDbm1pU2mdg20ncrCYC2yOHV12ut94v9zjoKvTBdnGJwsj8g2jMfugcGQPOUv6OuBqWH7OnPMBwvfu9FG78IyhN5A9BNY9saFxUqXNxKL_jaWbl72cPAuahgNfmJcrpDv1CPJQQbtYf7pnQw'
  },
  {
    id: 'p7',
    name: 'Flat White',
    category: 'espresso',
    price: 4.50,
    stock: 40,
    description: 'Expertly extracted espresso covered in a thin, dense layer of finely steamed microfoam milk.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA5XVPLLbq5XprLeh2MQo0n4CCR9W4ZdpOWVioxJnHDg9lA0t5AUCL4yCWzL1rPW9K6qNGFkO_fDBqiCuQ-rATXD08mMeUTYFcT5-IUjqYeJw1lVMClquDprdwbirWDbm1pU2mdg20ncrCYC2yOHV12ut94v9zjoKvTBdnGJwsj8g2jMfugcGQPOUv6OuBqWH7OnPMBwvfu9FG78IyhN5A9BNY9saFxUqXNxKL_jaWbl72cPAuahgNfmJcrpDv1CPJQQbtYf7pnQw'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '882',
    tableNumber: 'Table 4',
    isTakeout: false,
    timeElapsed: '4m elapsed',
    timestamp: '10:45 AM',
    status: 'Preparing',
    server: 'Elena R.',
    queuePosition: 1,
    kitchenNote: 'Customer mentioned they are in a hurry for a meeting. Priority prep if possible.',
    items: [
      {
        id: 'oi1',
        productName: 'Oat Milk Latte',
        quantity: 2,
        size: 'L',
        notes: ['Extra Hot', 'One sugar each'],
        priceOrder: 11.00
      },
      {
        id: 'oi2',
        productName: 'Almond Croissant',
        quantity: 1,
        size: 'Reg',
        notes: ['Warmed up'],
        priceOrder: 5.50
      }
    ],
    subtotal: 16.50,
    tax: 1.32,
    total: 17.82
  },
  {
    id: '881',
    tableNumber: 'Alex M.',
    isTakeout: true,
    timeElapsed: '12m total',
    timestamp: '10:37 AM',
    status: 'Ready',
    server: 'Marcus Chen',
    queuePosition: 2,
    items: [
      {
        id: 'oi3',
        productName: 'Espresso Macchiato',
        quantity: 1,
        size: 'S',
        notes: ['Muted crema', 'Dusting of cocoa'],
        priceOrder: 4.25
      }
    ],
    subtotal: 4.25,
    tax: 0.34,
    total: 4.59
  },
  {
    id: '883',
    tableNumber: 'Table 12',
    isTakeout: false,
    timeElapsed: '1m elapsed',
    timestamp: '10:48 AM',
    status: 'New',
    server: 'Elena R.',
    queuePosition: 3,
    items: [
      {
        id: 'oi4',
        productName: 'Flat White',
        quantity: 1,
        size: 'Reg',
        priceOrder: 4.50
      },
      {
        id: 'oi5',
        productName: 'Pain au Chocolat',
        quantity: 1,
        size: 'Reg',
        notes: ['Warm'],
        priceOrder: 4.50
      },
      {
        id: 'oi6',
        productName: 'Avocado Toast',
        quantity: 1,
        size: 'Spec',
        notes: ['Extra squeeze of fresh lemon'],
        priceOrder: 9.75
      }
    ],
    subtotal: 18.75,
    tax: 1.50,
    total: 20.25
  },
  {
    id: '880',
    tableNumber: 'Sarah J.',
    isTakeout: true,
    timeElapsed: 'Completed 5m ago',
    timestamp: '10:30 AM',
    status: 'Completed',
    server: 'John D.',
    items: [
      {
        id: 'oi7',
        productName: 'Kyoto Cold Brew',
        quantity: 1,
        size: 'XL',
        priceOrder: 6.25
      }
    ],
    subtotal: 6.25,
    tax: 0.50,
    total: 6.75
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'BW-9402',
    customerName: 'Sarah Jenkins',
    description: '2x Oat Latte, 1x Sourdough Croissant',
    timestamp: 'Oct 24, 14:22',
    itemsCount: 3,
    amount: 34.50,
    status: 'COMPLETED'
  },
  {
    id: 'BW-9401',
    customerName: 'Marcus Thorne',
    description: '1x Kyoto Cold Brew, 1x Sea Salt Cookie',
    timestamp: 'Oct 24, 14:15',
    itemsCount: 2,
    amount: 12.20,
    status: 'COMPLETED'
  },
  {
    id: 'BW-9400',
    customerName: 'Elena Rodriguez',
    description: 'Whole Bean Ethiopia Coffee bag (refunded)',
    timestamp: 'Oct 24, 13:58',
    itemsCount: 1,
    amount: -45.00,
    status: 'REFUNDED'
  },
  {
    id: 'BW-9399',
    customerName: 'David Kim',
    description: '1x Signatures Flat White',
    timestamp: 'Oct 24, 13:42',
    itemsCount: 1,
    amount: 5.50,
    status: 'COMPLETED'
  },
  {
    id: 'BW-9398',
    customerName: 'Anonymous',
    description: 'Walk-In Order #409',
    timestamp: 'Oct 24, 13:30',
    itemsCount: 4,
    amount: 28.90,
    status: 'COMPLETED'
  }
];

export const WEEKLY_CHART_REVENUE = [
  { label: 'Mon', revenue: 780, heightPercent: 65, isActive: false },
  { label: 'Tue', revenue: 540, heightPercent: 45, isActive: false },
  { label: 'Wed', revenue: 960, heightPercent: 80, isActive: false },
  { label: 'Thu', revenue: 660, heightPercent: 55, isActive: false },
  { label: 'Fri', revenue: 1080, heightPercent: 90, isActive: false },
  { label: 'Sat', revenue: 840, heightPercent: 70, isActive: true },
  { label: 'Sun', revenue: 420, heightPercent: 35, isActive: false }
];

export const MONTHLY_CHART_REVENUE = [
  { label: 'Oct 01', scale: 40, active: false },
  { label: 'Oct 04', scale: 55, active: false },
  { label: 'Oct 08', scale: 45, active: false },
  { label: 'Oct 11', scale: 70, active: false },
  { label: 'Oct 15', scale: 85, active: false },
  { label: 'Oct 18', scale: 60, active: false },
  { label: 'Oct 22', scale: 95, active: true },
  { label: 'Oct 25', scale: 75, active: false },
  { label: 'Oct 28', scale: 50, active: false },
  { label: 'Oct 31', scale: 80, active: false }
];
