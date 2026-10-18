import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5454';

const demoProducts = [
  { id: 'demo-1', title: 'Everyday Sneakers', category: 'Fashion', sellingPrice: 1499, mrpPrice: 1999, discountPercentage: 25, rating: 4.8, quantity: 10, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'], badge: 'BESTSELLER' },
  { id: 'demo-2', title: 'Minimal Wrist Watch', category: 'Accessories', sellingPrice: 2199, mrpPrice: 2799, discountPercentage: 21, rating: 4.7, quantity: 8, images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85'], badge: 'TRENDING' },
  { id: 'demo-3', title: 'Wireless Headphones', category: 'Electronics', sellingPrice: 2999, mrpPrice: 3999, discountPercentage: 25, rating: 4.9, quantity: 15, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85'], badge: 'TOP RATED' },
  { id: 'demo-4', title: 'Daily Carry Backpack', category: 'Accessories', sellingPrice: 1799, mrpPrice: 2299, discountPercentage: 22, rating: 4.6, quantity: 6, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85'], badge: 'NEW' },
  { id: 'demo-5', title: 'Classic Running Shoes', category: 'Fashion', sellingPrice: 2499, mrpPrice: 3299, discountPercentage: 24, rating: 4.7, quantity: 12, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85'], badge: 'POPULAR' },
  { id: 'demo-6', title: 'Studio Headphones', category: 'Electronics', sellingPrice: 3499, mrpPrice: 4499, discountPercentage: 22, rating: 4.8, quantity: 9, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85'], badge: 'GREAT VALUE' },
  { id: 'demo-7', title: 'Everyday Tote Bag', category: 'Accessories', sellingPrice: 1299, mrpPrice: 1699, discountPercentage: 24, rating: 4.5, quantity: 11, images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85'], badge: 'NEW' },
  { id: 'demo-8', title: 'Modern Desk Lamp', category: 'Home & Living', sellingPrice: 1899, mrpPrice: 2399, discountPercentage: 21, rating: 4.6, quantity: 7, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85'], badge: 'EDITOR PICK' },
];

const categories = [
  { name: 'Electronics', icon: '⌁', tone: 'blue', description: 'Mobiles and everyday tech' },
  { name: 'Fashion', icon: '✳', tone: 'peach', description: 'Clothing and accessories' },
  { name: 'Home & Kitchen', icon: '⌂', tone: 'mint', description: 'Useful home essentials' },
  { name: 'Beauty', icon: '✦', tone: 'lavender', description: 'Skincare and personal care' },
  { name: 'Sports', icon: '◇', tone: 'blue', description: 'Fitness and exercise essentials' },
];

const productFilterCategories = [
  'All', 'Phones', 'Tablets', 'Laptops', 'Computers & Accessories',
  'Televisions', 'Audio', 'Cameras', 'Home Appliances', 'Refrigerators',
  'Washing Machines', 'Kitchen Appliances', 'Electronics', 'Fashion',
  "Men's Clothing", "Women's Clothing", 'Footwear', 'Accessories',
  'Bags', 'Watches', 'Home & Kitchen', 'Furniture', 'Lighting', 'Beauty',
  'Sports', 'Toys', 'Books', 'Grocery', 'Automotive',
];

const fallbackImages = demoProducts.map((p) => p.images[0]);

const productImageByTitle = [
  // COMPUTERS: specific products before general category matches
  { match: /dell.*desktop|desktop.*dell|desktop computer|desktop pc|computer tower/i, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=85' },
  { match: /monitor|computer screen|display screen/i, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85' },
  { match: /printer|scanner/i, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=85' },
  { match: /asus.*laptop|laptop.*asus/i, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85' },
  { match: /lenovo.*laptop|laptop.*lenovo/i, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=85' },
  { match: /dell.*laptop|laptop.*dell/i, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85' },
  { match: /laptop|notebook computer|macbook|chromebook/i, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85' },
  { match: /tablet|ipad/i, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85' },
  { match: /television|smart tv|\btv\b/i, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=85' },
  { match: /samsung galaxy smartphone|smartphone|mobile phone|cell\s*phone|iphone|\bphone\b/i, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85' },
  { match: /mechanical\s*keyboard|gaming\s*keyboard|keyboard/i, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85' },
  { match: /gaming\s*mouse|wireless\s*mouse|computer\s*mouse|\bmouse\b/i, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85' },
  { match: /router|wi.?fi|modem/i, image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?auto=format&fit=crop&w=900&q=85' },
  { match: /hard.?drive|ssd|memory card|pen drive|usb drive/i, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=85' },
  { match: /charger|charging\s*adapter|usb.?c|power\s*adapter|power bank/i, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=85' },
  { match: /headphone|headset|earphone|earbud/i, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85' },
  { match: /speaker|soundbar|bluetooth audio/i, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85' },
  // CAMERAS: distinct category-appropriate photos for named models
  { match: /fujifilm/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85' },
  { match: /nikon/i, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85' },
  { match: /canon/i, image: 'https://images.unsplash.com/photo-1510127034890-1ee7c7b5f3a5?auto=format&fit=crop&w=900&q=85' },
  { match: /camera|dslr|mirrorless|camcorder|camera lens/i, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85' },
  // HOME APPLIANCES
  { match: /refrigerator|fridge/i, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85' },
  { match: /washing\s*machine|washer/i, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85' },
  { match: /air\s*conditioner|\bac\b|air cooler/i, image: 'https://images.unsplash.com/photo-1631545806609-7c7f8a6c1c0f?auto=format&fit=crop&w=900&q=85' },
  { match: /vacuum cleaner|vacuum/i, image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=85' },
  { match: /microwave|mixer|grinder|blender|air\s*fryer|toaster|kettle|cookware|kitchen appliance/i, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85' },
  // FURNITURE AND LIGHTING
  { match: /sofa|couch/i, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85' },
  { match: /chair/i, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=85' },
  { match: /table|desk|bed|wardrobe|shelf|furniture/i, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { match: /desk\s*lamp|led\s*lamp|smart\s*lamp|lamp|lighting|light\s*bulb/i, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85' },
  // FASHION AND ACCESSORIES
  { match: /backpack|rucksack|laptop\s*bag|handbag|tote\s*bag|\bbag\b/i, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
  { match: /watch|smartwatch|wristwatch/i, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85' },
  { match: /running\s*shoe|sneaker|footwear|shoes|sandals|boots|slippers/i, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85' },
  { match: /t-shirt|tshirt|shirt|clothing|jeans|trousers|jacket|dress|kurti|saree|hoodie/i, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' },
  { match: /sunglasses|eyewear/i, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85' },
  { match: /wallet|belt/i, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85' },
  // EVERYDAY PRODUCTS
  { match: /water\s*bottle|steel\s*bottle|flask|\bbottle\b/i, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85' },
  { match: /skin|cream|beauty|moistur|cosmetic|serum|skincare|makeup/i, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85' },
  { match: /yoga|fitness|sports|exercise|workout|gym|mat|dumbbell/i, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85' },
  { match: /toy|puzzle|board\s*game/i, image: 'https://images.unsplash.com/photo-1599629954294-14df9ec8c1b8?auto=format&fit=crop&w=900&q=85' },
  { match: /book|novel|textbook/i, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85' },
];

function getProductImage(item, index) {
  const title = String(item.title || item.name || '');
  const match = productImageByTitle.find((entry) => entry.match.test(title));
  // Product-title matches win over generic URLs that may have been assigned incorrectly.
  if (match) return match.image;

  const images = Array.isArray(item.images) ? item.images : [];
  const backendImage = images.find((url) => typeof url === 'string' && url.trim());
  if (backendImage) return backendImage;

  const directImage = item.imageUrl || item.image || item.imageUrlList?.[0];
  if (typeof directImage === 'string' && directImage.trim()) return directImage;

  // Never reuse an unrelated fashion photo for an unknown product.
  return makeProductFallbackImage({ title: item.title || item.name || 'Product', category: item.category?.name || item.category || item.categoryName || 'Store item' });
}


// Give every product card a different image URL within the loaded product list.
// Alternate photos stay within the product's category to avoid showing sofas for computers, etc.
const uniqueImagePools = [
  { test: /camera|dslr|mirrorless|fujifilm|nikon|canon/i, images: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1510127034890-1ee7c7b5f3a5?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /laptop|notebook|macbook|chromebook|desktop|computer|monitor|printer/i, images: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /phone|smartphone|iphone|mobile|tablet|ipad/i, images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /refrigerator|fridge|washing machine|washer|air conditioner|vacuum|microwave/i, images: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /headphone|headset|earphone|earbud|speaker|soundbar/i, images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /sofa|couch|chair|table|desk|bed|wardrobe|furniture/i, images: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /shoe|sneaker|footwear|sandals|boots|slippers/i, images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /shirt|t-shirt|tshirt|jeans|trouser|jacket|dress|kurti|saree|hoodie|clothing/i, images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=85'
  ]},
  { test: /bag|backpack|rucksack|handbag|tote/i, images: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85'
  ]}
];

function assignUniqueProductImages(items) {
  const used = new Set();
  return items.map((item, index) => {
    const product = normalizeProduct(item, index);
    const title = `${product.title} ${product.category}`;
    const pool = uniqueImagePools.find((entry) => entry.test.test(title));
    const current = product.image;
    if (current && !used.has(current)) { used.add(current); return product; }
    const alternative = pool?.images.find((url) => !used.has(url));
    if (alternative) { used.add(alternative); return { ...product, image: alternative }; }
    // If a category has more products than known photos, use a neutral placeholder rather than repeat an image.
    const placeholder = makeProductFallbackImage(product);
    used.add(placeholder);
    return { ...product, image: placeholder };
  });
}

function makeProductFallbackImage(product) {
  const title = String(product?.title || 'Product').slice(0, 42);
  const category = String(typeof product?.category === 'object' ? product.category?.name : product?.category || 'Store item').slice(0, 32);
  const lower = `${title} ${category}`.toLowerCase();
  const escapeXml = (value) => value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  // Offline, category-specific vector artwork: this works even if external image hosts fail.
  let drawing = '';
  if (/phone|smartphone|iphone|mobile/.test(lower)) {
    drawing = '<rect x="380" y="145" width="140" height="245" rx="22" fill="#334155"/><rect x="391" y="164" width="118" height="202" rx="12" fill="#93c5fd"/><circle cx="450" cy="376" r="5" fill="#e2e8f0"/>';
  } else if (/tablet|ipad/.test(lower)) {
    drawing = '<rect x="310" y="160" width="280" height="190" rx="18" fill="#334155"/><rect x="323" y="173" width="254" height="164" rx="8" fill="#bfdbfe"/>';
  } else if (/laptop|notebook|macbook|chromebook/.test(lower)) {
    drawing = '<rect x="320" y="145" width="260" height="175" rx="12" fill="#334155"/><rect x="332" y="157" width="236" height="150" rx="5" fill="#bfdbfe"/><path d="M285 330 H615 L585 354 H315 Z" fill="#64748b"/>';
  } else if (/desktop|computer|monitor|pc/.test(lower)) {
    drawing = '<rect x="300" y="130" width="300" height="190" rx="12" fill="#334155"/><rect x="314" y="144" width="272" height="162" rx="5" fill="#bfdbfe"/><path d="M430 320 H470 L485 352 H415 Z" fill="#64748b"/><rect x="375" y="350" width="150" height="12" rx="6" fill="#64748b"/>';
  } else if (/camera|dslr|nikon|canon|fujifilm/.test(lower)) {
    drawing = '<rect x="300" y="200" width="300" height="145" rx="22" fill="#334155"/><path d="M350 200 L380 165 H465 L490 200 Z" fill="#475569"/><circle cx="450" cy="273" r="65" fill="#94a3b8"/><circle cx="450" cy="273" r="48" fill="#1e293b"/><circle cx="450" cy="273" r="25" fill="#64748b"/><circle cx="450" cy="273" r="10" fill="#bfdbfe"/>';
  } else if (/refrigerator|fridge/.test(lower)) {
    drawing = '<rect x="350" y="115" width="200" height="270" rx="14" fill="#cbd5e1" stroke="#64748b" stroke-width="5"/><path d="M350 245 H550" stroke="#64748b" stroke-width="5"/><path d="M520 165 V220 M520 270 V345" stroke="#64748b" stroke-width="7" stroke-linecap="round"/>';
  } else if (/washing machine|washer/.test(lower)) {
    drawing = '<rect x="340" y="125" width="220" height="255" rx="18" fill="#cbd5e1" stroke="#64748b" stroke-width="5"/><circle cx="450" cy="270" r="72" fill="#64748b"/><circle cx="450" cy="270" r="55" fill="#bfdbfe"/><circle cx="390" cy="155" r="8" fill="#64748b"/><rect x="415" y="145" width="100" height="18" rx="8" fill="#94a3b8"/>';
  } else if (/headphone|headset|earphone|earbud|speaker/.test(lower)) {
    drawing = '<path d="M350 270 V240 A100 100 0 0 1 550 240 V270" fill="none" stroke="#334155" stroke-width="28" stroke-linecap="round"/><rect x="330" y="245" width="48" height="100" rx="18" fill="#64748b"/><rect x="522" y="245" width="48" height="100" rx="18" fill="#64748b"/>';
  } else if (/mouse|keyboard|router|charger|usb|drive|printer/.test(lower)) {
    drawing = /keyboard/.test(lower) ? '<rect x="275" y="220" width="350" height="115" rx="16" fill="#334155"/><path d="M300 245 H600 M300 270 H600 M300 295 H600" stroke="#bfdbfe" stroke-width="10" stroke-dasharray="18 9"/>' : '<rect x="335" y="190" width="230" height="150" rx="24" fill="#64748b"/><rect x="355" y="210" width="190" height="110" rx="18" fill="#bfdbfe"/>';
  } else if (/sofa|couch|chair|table|desk|bed|furniture/.test(lower)) {
    drawing = '<rect x="285" y="235" width="330" height="95" rx="20" fill="#0f766e"/><rect x="305" y="185" width="130" height="75" rx="18" fill="#14b8a6"/><rect x="465" y="185" width="130" height="75" rx="18" fill="#14b8a6"/><path d="M315 330 V370 M585 330 V370" stroke="#92400e" stroke-width="15" stroke-linecap="round"/>';
  } else if (/shoe|sneaker|footwear|sandal|boot/.test(lower)) {
    drawing = '<path d="M285 285 Q345 280 375 210 L430 225 Q440 280 505 290 L605 310 Q625 320 610 345 H300 Q270 330 285 285 Z" fill="#2563eb" stroke="#1e3a8a" stroke-width="5"/><path d="M390 250 L445 265 M375 270 L430 285" stroke="#dbeafe" stroke-width="8"/>';
  } else if (/watch/.test(lower)) {
    drawing = '<rect x="405" y="120" width="90" height="270" rx="25" fill="#64748b"/><circle cx="450" cy="255" r="72" fill="#334155"/><circle cx="450" cy="255" r="58" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/><path d="M450 255 L450 215 M450 255 L480 270" stroke="#334155" stroke-width="7" stroke-linecap="round"/>';
  } else if (/shirt|t-shirt|tshirt|dress|jeans|clothing|fashion|jacket/.test(lower)) {
    drawing = '<path d="M365 165 L410 145 L450 175 L490 145 L535 165 L585 230 L525 260 L505 225 V370 H395 V225 L375 260 L315 230 Z" fill="#0f766e" stroke="#115e59" stroke-width="5"/>';
  } else if (/bag|backpack|rucksack/.test(lower)) {
    drawing = '<rect x="350" y="160" width="200" height="230" rx="45" fill="#b45309"/><rect x="380" y="255" width="140" height="95" rx="18" fill="#f59e0b"/><path d="M385 170 Q450 95 515 170" fill="none" stroke="#78350f" stroke-width="18"/>';
  } else if (/lamp|lighting|bulb/.test(lower)) {
    drawing = '<path d="M380 190 Q450 110 520 190 L485 245 H415 Z" fill="#fbbf24"/><path d="M450 245 V350 M390 355 H510" stroke="#64748b" stroke-width="16" stroke-linecap="round"/>';
  } else if (/beauty|skin|cream|cosmetic|serum|makeup/.test(lower)) {
    drawing = '<rect x="355" y="200" width="90" height="165" rx="18" fill="#f9a8d4"/><rect x="375" y="170" width="50" height="35" rx="6" fill="#64748b"/><rect x="465" y="235" width="85" height="130" rx="16" fill="#c4b5fd"/><rect x="485" y="205" width="45" height="32" rx="6" fill="#64748b"/>';
  } else if (/sports|fitness|yoga|gym|dumbbell|exercise/.test(lower)) {
    drawing = '<rect x="270" y="235" width="360" height="90" rx="15" fill="#0f766e"/><rect x="300" y="210" width="30" height="140" rx="8" fill="#334155"/><rect x="570" y="210" width="30" height="140" rx="8" fill="#334155"/>';
  } else if (/toy|game|puzzle/.test(lower)) {
    drawing = '<rect x="320" y="175" width="260" height="200" rx="22" fill="#fbbf24"/><circle cx="390" cy="240" r="30" fill="#ef4444"/><circle cx="505" cy="240" r="30" fill="#3b82f6"/><rect x="390" y="295" width="115" height="28" rx="14" fill="#16a34a"/>';
  } else if (/book|novel|textbook/.test(lower)) {
    drawing = '<path d="M300 170 Q380 145 450 185 V370 Q380 330 300 355 Z" fill="#2563eb"/><path d="M600 170 Q520 145 450 185 V370 Q520 330 600 355 Z" fill="#60a5fa"/><path d="M450 185 V370" stroke="#dbeafe" stroke-width="7"/>';
  } else {
    drawing = '<rect x="340" y="175" width="220" height="200" rx="24" fill="#cbd5e1"/><circle cx="450" cy="245" r="42" fill="#94a3b8"/><path d="M400 320 H500" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700"><rect width="900" height="700" fill="#f1f5f9"/><rect x="70" y="45" width="760" height="610" rx="28" fill="#ffffff" stroke="#dbe4ef" stroke-width="4"/><g>${drawing}</g><text x="450" y="465" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#243b53">${escapeXml(title)}</text><text x="450" y="510" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#627d98">${escapeXml(category)}</text><text x="450" y="590" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#829ab1">Offline product illustration</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function inferProductBrand(item) {
  const supplied = typeof item.brand === 'string' ? item.brand.trim() : item.brand?.name || item.brandName || '';
  if (supplied) return supplied;
  const title = String(item.title || item.name || '');
  const brands = ['Samsung','Apple','Xiaomi','Redmi','OnePlus','Vivo','Oppo','Realme','Google','ASUS','Lenovo','Dell','HP','Acer','MSI','LG','Sony','Canon','Nikon','Fujifilm','Bose','JBL','boAt','Boat','Philips','Whirlpool','Haier','Godrej','Panasonic','IFB','Nike','Adidas','Puma','Reebok','Woodland','Titan','Fastrack','Prestige','Havells','Dyson','Voltas','Daikin','Blue Star','Bosch','Electrolux','Kenwood','Usha','Pigeon','Milton','Wildcraft','American Tourister','Fossil','Casio','Orient'];
  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return brands.find((brand) => new RegExp('\\b' + escapeRegExp(brand) + '\\b', 'i').test(title)) || '';
}

function normalizeProduct(item, index) {
  const rawCategory = item.category;
  const category = typeof rawCategory === 'string'
    ? rawCategory
    : rawCategory?.name || item.categoryName || 'General';
  const price = Number(item.sellingPrice ?? item.price ?? item.totalSellingPrice ?? 0);
  const mrp = Number(item.mrpPrice ?? item.oldPrice ?? price);
  const image = getProductImage(item, index);
  const discount = Number(item.discountPercentage ??
    (mrp > price && mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0));
  return {
    id: item.id ?? `product-${index}`,
    title: item.title || item.name || 'Product',
    category,
    brand: inferProductBrand(item),
    description: item.description || '',
    sellingPrice: price,
    mrpPrice: mrp,
    discountPercentage: discount,
    rating: Number(item.rating ?? 4.5),
    quantity: Number(item.quantity ?? 0),
    image,
    badge: item.badge || (discount > 0 ? `${discount}% OFF` : 'FEATURED'),
    isDemo: false,
  };
}

function matchesCategoryFilter(product, selectedCategory) {
  if (selectedCategory === 'All') return true;
  const category = String(product.category || '').trim().toLowerCase();
  const text = `${product.title || ''} ${product.description || ''}`.toLowerCase();
  const key = selectedCategory.trim().toLowerCase();
  const patterns = {
    phones: /\b(phone|phones|smartphone|smartphones|mobile|mobiles|iphone|galaxy s\d|pixel \d|redmi note|oneplus \d)\b/i,
    tablets: /\b(tablet|tablets|ipad|galaxy tab)\b/i,
    laptops: /\b(laptop|laptops|notebook|macbook|chromebook|thinkpad|vivobook|inspiron)\b/i,
    'computers & accessories': /\b(computer|desktop|pc tower|monitor|mouse|keyboard|printer|webcam|hard drive|ssd|ram|router|usb drive)\b/i,
    televisions: /\b(tv|television|smart tv|oled tv|qled)\b/i,
    audio: /\b(headphone|headphones|headset|earphone|earphones|earbud|earbuds|speaker|soundbar)\b/i,
    cameras: /\b(camera|cameras|dslr|mirrorless|camcorder|camera lens)\b/i,
    'home appliances': /\b(refrigerator|fridge|washing machine|washer|air conditioner|air cooler|vacuum cleaner|microwave|dishwasher)\b/i,
    refrigerators: /\b(refrigerator|fridge)\b/i,
    'washing machines': /\b(washing machine|washer)\b/i,
    'kitchen appliances': /\b(microwave|mixer|grinder|blender|air fryer|toaster|kettle|rice cooker|induction stove|cookware)\b/i,
    fashion: /\b(shirt|t-shirt|tshirt|jeans|trouser|jacket|dress|kurti|saree|hoodie|clothing|sneaker|shoe|footwear|sandal)\b/i,
    "men's clothing": /\b(men|mens|shirt|trouser|jeans|jacket)\b/i,
    "women's clothing": /\b(women|womens|dress|kurti|saree|leggings)\b/i,
    footwear: /\b(shoe|shoes|sneaker|sandal|slipper|boot|footwear)\b/i,
    accessories: /\b(accessory|accessories|belt|wallet|sunglasses|watch|bag)\b/i,
    bags: /\b(bag|backpack|rucksack|handbag|luggage|tote)\b/i,
    watches: /\b(watch|watches|smartwatch|wristwatch)\b/i,
    'home & kitchen': /\b(kitchen|cookware|container|storage|refrigerator|fridge|sofa|chair|table|lamp|furniture)\b/i,
    furniture: /\b(sofa|couch|chair|table|desk|bed|wardrobe|shelf|furniture)\b/i,
    lighting: /\b(lamp|light|bulb|lighting)\b/i,
    beauty: /\b(beauty|skin|cream|cosmetic|serum|skincare|makeup|moisturizer|shampoo|perfume)\b/i,
    sports: /\b(sports|fitness|yoga|gym|dumbbell|exercise|workout|mat|bicycle)\b/i,
    toys: /\b(toy|toys|game|puzzle|board game)\b/i,
    books: /\b(book|books|novel|textbook)\b/i,
    grocery: /\b(grocery|rice|oil|snack|beverage|food|coffee|tea)\b/i,
    automotive: /\b(car|bike|automotive|vehicle|tyre|tire|helmet|dash cam)\b/i,
  };
  if (patterns[key]) return patterns[key].test(text) || category === key;
  if (category === key || category.includes(key) || (key.includes(category) && category.length > 2)) return true;
  if (key === 'electronics') return /\b(phone|smartphone|mobile|iphone|ipad|tablet|laptop|macbook|tv|television|computer|desktop|camera|headphones?|speaker|mouse|keyboard|printer|router)\b/i.test(text) || /\belectronics?\b/i.test(category);
  return false;
}

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(assignUniqueProductImages(demoProducts).map((p) => ({ ...p, isDemo: true, badge: p.badge })));
  const [apiStatus, setApiStatus] = useState('loading');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('karthikMartCart') || '[]'); }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const checkoutLock = useRef(false);
  // Keep an order created during this browser session so a retry after a
  // payment-initialization failure does not automatically create another order.
  const pendingOrderRef = useRef(null);
  // Keep the saved address ID across retries so a failed payment setup does not create duplicate addresses.
  const savedAddressIdRef = useRef(null);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('karthikMartShippingAddress') || 'null') || { fullName: '', mobile: '', house: '', street: '', landmark: '', city: '', state: '', postalCode: '', instructions: '' }; }
    catch { return { fullName: '', mobile: '', house: '', street: '', landmark: '', city: '', state: '', postalCode: '', instructions: '' }; }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('karthikMartWishlist') || '[]'); }
    catch { return []; }
  });
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('karthikMartUser') || 'null');
    } catch {
      return null;
    }
  });
  const [accountOpen, setAccountOpen] = useState(false);
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
  const [footerPanel, setFooterPanel] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) throw new Error(`Products API returned ${response.status}`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.content || data.products || [];
        if (!Array.isArray(list)) throw new Error('Invalid products API response');
        if (cancelled) return;
        setProducts(assignUniqueProductImages(list));
        setApiStatus('connected');
      } catch (error) {
        if (cancelled) return;
        console.warn('Products API unavailable; showing preview products.', error);
        setProducts(assignUniqueProductImages(demoProducts).map((p) => ({ ...p, isDemo: true, badge: p.badge })));
        setApiStatus('unavailable');
      }
    }
    loadProducts();
    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Only show filter choices that can actually return products. This keeps the
  // dropdown, brand dropdown, and category pills in sync with the loaded store.
  const availableFilterCategories = useMemo(() => {
    const known = [...productFilterCategories.filter((category) => category !== 'All')];
    const actualCategories = products
      .map((product) => String(product.category || '').trim())
      .filter(Boolean);
    for (const category of actualCategories) {
      if (!known.some((item) => item.toLowerCase() === category.toLowerCase())) known.push(category);
    }
    const withProducts = known.filter((category) =>
      products.some((product) => matchesCategoryFilter(product, category))
    );
    return ['All', ...withProducts.filter((category, index, all) => all.findIndex((candidate) => candidate.toLowerCase() === category.toLowerCase()) === index)];
  }, [products]);

  const availableBrands = useMemo(() => {
    const categoryProducts = products.filter((product) =>
      matchesCategoryFilter(product, activeCategory)
    );
    return [...new Set(categoryProducts.map((product) => product.brand).filter(Boolean))].sort();
  }, [products, activeCategory]);

  useEffect(() => {
    if (activeBrand !== 'All' && !availableBrands.some(
      (brand) => brand.toLowerCase() === activeBrand.toLowerCase()
    )) {
      setActiveBrand('All');
    }
  }, [activeBrand, availableBrands]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !query ||
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);
      const matchesBrand = activeBrand === 'All' ||
        product.brand.toLowerCase() === activeBrand.toLowerCase();
      const matchesCategory = matchesCategoryFilter(product, activeCategory);
      return matchesSearch && matchesCategory && matchesBrand;
    });
    if (sortBy === 'price-low') return [...filtered].sort((a, b) => a.sellingPrice - b.sellingPrice);
    if (sortBy === 'price-high') return [...filtered].sort((a, b) => b.sellingPrice - a.sellingPrice);
    if (sortBy === 'discount') return [...filtered].sort((a, b) => b.discountPercentage - a.discountPercentage);
    return filtered;
  }, [products, search, activeCategory, activeBrand, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('karthikMartCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('karthikMartWishlist', JSON.stringify(favorites));
  }, [favorites]);

  function addToCart(product, requestedQuantity = 1) {
    const availableStock = Number(product.stockAvailable ?? product.quantity ?? 0);
    const quantityToAdd = Math.floor(Number(requestedQuantity));

    if (!Number.isFinite(quantityToAdd) || quantityToAdd < 1) {
      setNotice('Please choose a valid quantity.');
      return;
    }
    if (product.isDemo) {
      setNotice('This preview product cannot be purchased. Check that the backend is connected.');
      return;
    }
    if (availableStock <= 0) {
      setNotice('This product is currently out of stock.');
      return;
    }

    const existing = cart.find((item) => String(item.id) === String(product.id));
    const currentQuantity = existing ? Number(existing.quantity) : 0;
    if (currentQuantity + quantityToAdd > availableStock) {
      setNotice(`Only ${Math.max(0, availableStock - currentQuantity)} more unit(s) can be added.`);
      return;
    }

    if (existing) {
      setCart(cart.map((item) => String(item.id) === String(product.id)
        ? { ...item, stockAvailable: availableStock, quantity: currentQuantity + quantityToAdd }
        : item));
    } else {
      setCart([...cart, { ...product, stockAvailable: availableStock, quantity: quantityToAdd }]);
    }

    // Show the cart immediately after a successful add so the customer can
    // see the selected product and adjust its quantity.
    setCartOpen(true);
    setNotice(`${quantityToAdd} × ${product.title} added to your cart.`);
  }

  function changeCartQuantity(productId, delta) {
    const cartItem = cart.find((item) => String(item.id) === String(productId));
    if (!cartItem) return;

    const availableStock = Math.max(0, Number(cartItem.stockAvailable ?? cartItem.quantityAvailable ?? cartItem.stock ?? 0));
    const currentQuantity = Math.max(1, Number(cartItem.quantity) || 1);
    const nextQuantity = currentQuantity + Number(delta);

    if (!Number.isInteger(Number(delta)) || ![-1, 1].includes(Number(delta))) return;

    if (nextQuantity < 1) {
      setCart((current) => current.filter((item) => String(item.id) !== String(productId)));
      setNotice(`${cartItem.title} removed from your cart.`);
      return;
    }

    if (nextQuantity > availableStock) {
      setNotice(availableStock > 0
        ? `Only ${availableStock} unit(s) of ${cartItem.title} are available.`
        : `${cartItem.title} is currently out of stock.`);
      return;
    }

    setCart((current) => current.map((item) => String(item.id) === String(productId)
      ? { ...item, quantity: nextQuantity }
      : item));
  }

  function removeCartItem(productId) {
    const item = cart.find((entry) => String(entry.id) === String(productId));
    setCart((current) => current.filter((entry) => String(entry.id) !== String(productId)));
    if (item) setNotice(`${item.title} removed from your cart.`);
  }

  function clearCart() {
    setCart([]);
    setNotice('Your cart has been cleared.');
  }

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function chooseCategory(category) {
    setActiveCategory(category);
    setActiveBrand('All');
    setMobileMenuOpen(false);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleNewsletter(event) {
    event.preventDefault();
    setNotice('Thanks! Newsletter signup will be connected to your backend next.');
    event.currentTarget.reset();
  }

  function handleCheckout() {
    if (checkoutLock.current || isCheckingOut) {
      setNotice('Checkout is already in progress. Please wait.');
      return;
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      setNotice('Your cart is empty. Add a product before checkout.');
      return;
    }
    if (apiStatus === 'loading') {
      setNotice('The store is still loading. Please wait a moment and try again.');
      return;
    }
    if (apiStatus !== 'connected') {
      setNotice('The store server is unavailable. Please try again after the products load successfully.');
      return;
    }

    const invalidItem = cart.find((item) => {
      const quantity = Number(item.quantity);
      const stock = Number(item.stockAvailable ?? 0);
      const price = Number(item.sellingPrice);
      const id = Number(item.id);
      const currentProduct = products.find((product) => String(product.id) === String(item.id));
      return !Number.isInteger(id) || id <= 0 || !currentProduct || currentProduct.isDemo || item.isDemo
        || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(stock) || stock < 1 || quantity > stock
        || !Number.isFinite(price) || price <= 0;
    });
    if (invalidItem) {
      setNotice(`Please remove and re-add ${invalidItem.title || 'the invalid item'} after checking that it is available in the store. Its product ID, price, quantity, or stock is invalid.`);
      return;
    }

    const token = localStorage.getItem('karthikMartToken');
    let savedCustomer = null;
    try { savedCustomer = JSON.parse(localStorage.getItem('karthikMartUser') || 'null'); }
    catch { savedCustomer = null; }

    if (!token || !savedCustomer) {
      setCartOpen(false);
      setNotice('Please log in before checkout.');
      navigate('/login');
      return;
    }
    const userId = savedCustomer.id ?? savedCustomer.userId;
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      setNotice('Unable to identify your account. Please log in again.');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + Number(item.sellingPrice) * Number(item.quantity), 0);
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      setNotice('The cart total is invalid. Please remove the items and add them again.');
      return;
    }
    setShippingOpen(true);
  }

  async function confirmShippingAddress(event) {
    event.preventDefault();
    const address = {
      fullName: shippingAddress.fullName.trim(),
      mobile: shippingAddress.mobile.trim(),
      house: shippingAddress.house.trim(),
      street: shippingAddress.street.trim(),
      landmark: shippingAddress.landmark.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      instructions: shippingAddress.instructions.trim(),
    };
    if (!address.fullName || !address.mobile || !address.house || !address.street || !address.city || !address.state || !address.postalCode) {
      setNotice('Please fill in all required delivery address fields.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(address.mobile)) {
      setNotice('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^\d{6}$/.test(address.postalCode)) {
      setNotice('Enter a valid 6-digit PIN code.');
      return;
    }
    if (address.fullName.length > 100 || address.house.length > 150 || address.street.length > 180 || address.city.length > 100 || address.state.length > 100 || address.landmark.length > 150 || address.instructions.length > 500) {
      setNotice('One or more address fields are too long. Please shorten them and try again.');
      return;
    }
    if (checkoutLock.current || isCheckingOut) return;
    setShippingAddress(address);
    localStorage.setItem('karthikMartShippingAddress', JSON.stringify(address));
    setShippingOpen(false);
    await processCheckout();
  }

  async function processCheckout() {
    if (checkoutLock.current || isCheckingOut) return;
    checkoutLock.current = true;
    const token = localStorage.getItem('karthikMartToken');
    let savedCustomer = null;
    try { savedCustomer = JSON.parse(localStorage.getItem('karthikMartUser') || 'null'); }
    catch { savedCustomer = null; }
    if (!token || !savedCustomer) {
      checkoutLock.current = false;
      setNotice('Your session has expired. Please log in again.');
      navigate('/login');
      return;
    }
    const userId = savedCustomer.id ?? savedCustomer.userId;
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      checkoutLock.current = false;
      setNotice('Unable to identify your account. Please log in again.');
      return;
    }
    const request = async (url, options = {}) => {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {}),
          },
        });
      } catch (networkError) {
        throw new Error('Could not reach the store server. Check that Spring Boot is running and try again.');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Your session may have expired or you do not have permission. Please log in again.');
      }
      if (response.status === 204) return null;
      const responseText = await response.text();
      let data = null;
      if (responseText) {
        try { data = JSON.parse(responseText); }
        catch { data = responseText; }
      }
      if (!response.ok) {
        const serverMessage = typeof data === 'string'
          ? data
          : data?.message || data?.error || data?.details;
        throw new Error(serverMessage || `The server rejected the request (${response.status}).`);
      }
      if (typeof data === 'string') {
        throw new Error('The server returned an unexpected response. Please try again.');
      }
      return data;
    };

    setIsCheckingOut(true);
    try {
      let order = pendingOrderRef.current;
      if (!order?.id) {
        /*
         * The storefront cart is stored in localStorage. Synchronize it before
         * order creation. Do not retry individual POSTs automatically because
         * the backend may treat them as quantity increments.
         */
        await request(`${API_BASE}/api/carts/user/${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });

        for (const item of cart) {
          await request(
            `${API_BASE}/api/carts/user/${encodeURIComponent(userId)}/products/${encodeURIComponent(item.id)}?quantity=${encodeURIComponent(item.quantity)}`,
            { method: 'POST' }
          );
        }

        // Save the delivery address in MySQL before creating the order.
        // Reuse the returned ID if checkout must be retried in this session.
        if (!savedAddressIdRef.current) {
          const savedAddress = await request(
            `${API_BASE}/api/addresses/user/${encodeURIComponent(userId)}`,
            {
              method: 'POST',
              body: JSON.stringify({
                fullName: shippingAddress.fullName.trim(),
                mobile: shippingAddress.mobile.trim(),
                house: shippingAddress.house.trim(),
                street: shippingAddress.street.trim(),
                landmark: shippingAddress.landmark.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                postalCode: shippingAddress.postalCode.trim(),
                instructions: shippingAddress.instructions.trim(),
              }),
            }
          );
          if (!savedAddress?.id) {
            throw new Error('The backend did not return a saved address ID. The order was not created.');
          }
          savedAddressIdRef.current = savedAddress.id;
        }

        order = await request(
          `${API_BASE}/api/orders/user/${encodeURIComponent(userId)}?addressId=${encodeURIComponent(savedAddressIdRef.current)}`,
          { method: 'POST' }
        );

        if (!order?.id) {
          throw new Error('The backend did not return an order ID. Check your orders before retrying checkout.');
        }
        // Save immediately: if payment setup fails, the next attempt can reuse
        // this order instead of automatically creating another one.
        pendingOrderRef.current = order;
      }

      const payment = await request(
        `${API_BASE}/api/payments/order/${encodeURIComponent(order.id)}`,
        { method: 'POST' }
      );

      if (!payment?.gatewayOrderId) {
        throw new Error('The backend did not return a Razorpay order ID.');
      }

      // This endpoint returns the public Key ID only; never expose the Key Secret in React.
      const keyData = await request(`${API_BASE}/api/payments/key-id`);
      if (!keyData?.keyId) {
        throw new Error('Razorpay Key ID is missing from the backend response.');
      }

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          let script = document.querySelector('script[data-razorpay-checkout]');

          if (!script) {
            script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.dataset.razorpayCheckout = 'true';
            document.body.appendChild(script);
          }

          if (window.Razorpay) {
            resolve();
            return;
          }

          script.addEventListener('load', resolve, { once: true });
          script.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout.')), { once: true });
        });
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout could not be initialized.');
      }

      const amountInRupees = Number(payment.amount ?? order.totalAmount);
      if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
        throw new Error('The backend returned an invalid payment amount.');
      }

      // Record the order associated with this payment attempt for support/debugging.
      // This is informational only; the backend remains the source of payment truth.
      sessionStorage.setItem('karthikMartLastPaymentAttempt', JSON.stringify({
        orderId: order.id,
        gatewayOrderId: payment.gatewayOrderId,
        startedAt: new Date().toISOString(),
      }));

      const checkout = new window.Razorpay({
        key: keyData.keyId,
        amount: Math.round(amountInRupees * 100),
        currency: 'INR',
        name: 'Karthik Mart',
        description: `Order #${order.id}`,
        order_id: payment.gatewayOrderId,
        prefill: {
          name: savedCustomer.fullName || savedCustomer.name || '',
          email: savedCustomer.email || '',
          contact: savedCustomer.mobile || savedCustomer.phone || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            checkoutLock.current = false;
            setIsCheckingOut(false);
            setNotice('Checkout closed. Your order has not been confirmed as paid.');
          },
        },
        handler: async (response) => {
          try {
            // Razorpay's client callback is not proof of payment by itself.
            // Require complete callback fields and the expected gateway order ID.
            if (!response?.razorpay_payment_id || !response?.razorpay_order_id || !response?.razorpay_signature) {
              throw new Error('Razorpay returned incomplete payment details. Your order has not been marked as paid.');
            }
            if (String(response.razorpay_order_id) !== String(payment.gatewayOrderId)) {
              throw new Error('The payment belongs to a different Razorpay order. Your cart has not been cleared.');
            }

            const verifiedPayment = await request(
              `${API_BASE}/api/payments/order/${encodeURIComponent(order.id)}/verify`,
              {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (String(verifiedPayment?.paymentStatus).toUpperCase() !== 'SUCCESS') {
              throw new Error('The backend has not confirmed your payment. Your order is not marked as paid; check My Orders before retrying.');
            }

            pendingOrderRef.current = null;
            savedAddressIdRef.current = null;
            setCart([]);
            localStorage.removeItem('karthikMartCart');
            sessionStorage.removeItem('karthikMartLastPaymentAttempt');
            setCartOpen(false);
            setNotice(`Payment successful! The server verified payment for Order #${order.id}.`);
          } catch (error) {
            console.error('Payment verification error:', error);
            setNotice(error.message || 'We could not confirm your payment. Please contact support.');
          } finally {
            checkoutLock.current = false;
            setIsCheckingOut(false);
          }
        },
      });

      checkout.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', response.error);
        // Keep the cart and pending order so the customer can retry safely.
        checkoutLock.current = false;
        setIsCheckingOut(false);
        setNotice(`${response.error?.description || 'Payment failed.'} Your cart has been kept. You can retry payment or check My Orders before trying again.`);
      });

      checkout.open();
    } catch (error) {
      console.error('Checkout error:', error);
      checkoutLock.current = false;
      setIsCheckingOut(false);
      setNotice(`${error.message || 'Unable to start checkout.'}${pendingOrderRef.current?.id ? ` Your order #${pendingOrderRef.current.id} may already exist; retrying will reuse it in this session.` : ''}`);
    }
  }

  return (
    <div className="karthik-mart-app">
      <div className="announcement-bar">
        <span>✦ Welcome to Karthik Mart</span>
        <span className="announcement-message">Everyday finds. Better prices. A little more delight.</span>
        <span className="announcement-shipping">Free delivery on orders over ₹999</span>
      </div>

      <header className="karthik-mart-header">
        <a className="karthik-mart-brand" href="#home" aria-label="Karthik Mart home">
          <span className="brand-symbol">K</span><span>Karthik Mart<span className="brand-period">.</span></span>
        </a>

        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
          {mobileMenuOpen ? '×' : '☰'}
        </button>

        <nav className={`karthik-mart-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#products" onClick={() => setMobileMenuOpen(false)}>Shop</a>
          <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Categories</a>
          <Link to="/brands" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
          <a href="#why-karthik-mart" onClick={() => setMobileMenuOpen(false)}>Why Karthik Mart</a>

          <div className="orders-dropdown" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button
              type="button"
              className="orders-dropdown-toggle"
              onClick={() => setOrdersMenuOpen((open) => !open)}
              aria-expanded={ordersMenuOpen}
              aria-haspopup="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 12px',
                border: 0,
                background: 'transparent',
                color: 'inherit',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              Orders <span aria-hidden="true">{ordersMenuOpen ? '▴' : '▾'}</span>
            </button>

            {ordersMenuOpen && (
              <div
                className="orders-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 1100,
                  minWidth: '180px',
                  padding: '8px',
                  border: '1px solid #e5e9f2',
                  borderRadius: '12px',
                  background: '#fff',
                  boxShadow: '0 10px 28px rgba(20, 40, 80, 0.12)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOrdersMenuOpen(false);
                    setMobileMenuOpen(false);
                    navigate('/orders');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: 0,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#172b4d',
                    textAlign: 'left',
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  My Orders
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrdersMenuOpen(false);
                    setMobileMenuOpen(false);
                    navigate('/orders');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: 0,
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#172b4d',
                    textAlign: 'left',
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Order History
                </button>
              </div>
            )}
          </div>
        </nav>

        <form className="header-search" onSubmit={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <span className="search-icon">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, brands and more" aria-label="Search products" />
          {search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
          <button className="search-submit" type="submit">Search</button>
        </form>

        <div className="header-utilities">
          <div className="account-container">
            <button
              className="utility-button"
              onClick={() => {
                let savedCustomer = null;
                try {
                  savedCustomer = JSON.parse(localStorage.getItem('karthikMartUser') || 'null');
                } catch {
                  savedCustomer = null;
                }
                if (savedCustomer) {
                  setCustomer(savedCustomer);
                }
                // Always open the account menu so signed-out visitors can see Login/Register.
                setAccountOpen((open) => !open);
              }}
              aria-label="Account"
              aria-expanded={accountOpen}
            >
              <span>♙</span>
              <small>{customer?.fullName ? customer.fullName.split(' ')[0] : 'Account'}</small>
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                {customer ? (
                  <>
                    <strong>{customer.fullName || 'Customer'}</strong>
                    <p>{customer.email || ''}</p>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('karthikMartToken');
                        localStorage.removeItem('karthikMartUser');
                        setCustomer(null);
                        setAccountOpen(false);
                        setNotice('You have been logged out.');
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <strong>Welcome to Karthik Mart</strong>
                    <p>Sign in to manage your account and orders.</p>
                    <div className="account-actions">
                      <button type="button" onClick={() => { setAccountOpen(false); navigate('/login'); }}>Login</button>
                      <button type="button" className="account-register-button" onClick={() => { setAccountOpen(false); navigate('/register'); }}>Create account</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <button className="utility-button cart-utility" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${cartCount} items`}>
            <span className="cart-icon-wrap">🛒{cartCount > 0 && <b>{cartCount}</b>}</span><small>Cart</small>
          </button>
        </div>
      </header>

      <main>
        <section className="market-hero" id="home">
          <div className="hero-content">
            <div className="hero-kicker"><span /> THE EVERYDAY MARKETPLACE</div>
            <h1>Everything you love.<br /><em>All in one place.</em></h1>
            <p>Discover thoughtful finds across fashion, tech, home and more — all at prices that make sense.</p>
            <div className="hero-ctas">
              <a className="btn-primary" href="#products">Shop the collection <span>→</span></a>
              <a className="btn-secondary" href="#categories">Explore categories</a>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars"><span>K</span><span>A</span><span>M</span><span>+</span></div>
              <div><strong>Everyday favorites, all together</strong><small>Explore the Karthik Mart collection</small></div>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-art-image"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90" alt="Fashion collection" /></div>
            <div className="hero-floating-card floating-top"><span className="floating-icon">✦</span><div><strong>Fresh finds</strong><small>Discover something new</small></div></div>
            <div className="hero-floating-card floating-bottom"><span className="floating-icon">✓</span><div><strong>Made for everyday</strong><small>Useful, stylish, delightful</small></div></div>
            <span className="hero-decoration decoration-one">✳</span><span className="hero-decoration decoration-two">✦</span>
          </div>
        </section>

        <section className="service-row" id="why-karthik-mart">
          <div className="service-item"><span className="service-icon">↗</span><div><strong>Free delivery</strong><small>On orders over ₹999</small></div></div>
          <div className="service-item"><span className="service-icon">◇</span><div><strong>Curated quality</strong><small>Finds worth keeping</small></div></div>
          <div className="service-item"><span className="service-icon">↺</span><div><strong>Easy returns</strong><small>Simple shopping experience</small></div></div>
          <div className="service-item"><span className="service-icon">♧</span><div><strong>Secure shopping</strong><small>Your details matter</small></div></div>
        </section>

        <section className="category-section section-container" id="categories">
          <div className="section-title-row">
            <div><span className="section-eyebrow">EXPLORE THE STORE</span><h2>Shop by <em>category</em></h2><p>Find exactly what you're looking for.</p></div>
            <button className="link-button" onClick={() => chooseCategory('All')}>View all products <span>→</span></button>
          </div>
          <div className="category-cards">
            {categories.map((category) => (
              <button className="category-tile" key={category.name} onClick={() => chooseCategory(category.name)}>
                <span className={`category-art ${category.tone}`}>{category.icon}</span>
                <span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small></span>
                <span className="category-chevron">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="products-section section-container" id="products">
          <div className="section-title-row products-title-row">
            <div><span className="section-eyebrow">GOOD FINDS, GREAT PRICES</span><h2>Popular <em>right now</em></h2><p>Everyday essentials and little upgrades you'll love.</p></div>
            <label className="sort-control">Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="discount">Biggest discount</option>
              </select>
            </label>
          </div>

          <div className="product-toolbar">
            <div className="product-filter-selectors">
              <label className="product-filter-select" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#52647b' }}>
                <span>Category</span>
                <select style={{ minWidth: 220, padding: '12px 38px 12px 14px', border: '1px solid #dbe4f0', borderRadius: 12, background: '#fff', color: '#172b4d', font: 'inherit', cursor: 'pointer' }} value={activeCategory} onChange={(event) => { setActiveCategory(event.target.value); setActiveBrand('All'); }} aria-label="Filter products by category">
                  {availableFilterCategories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'All' ? 'All categories' : category === 'Audio' ? 'Audio & Headphones' : category === 'Bags' ? 'Bags & Backpacks' : category === 'Beauty' ? 'Beauty & Personal Care' : category === 'Sports' ? 'Sports & Fitness' : category === 'Grocery' ? 'Grocery & Daily Needs' : category === 'Automotive' ? 'Automotive Accessories' : category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="product-filter-select" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: '#52647b' }}>
                <span>Brand</span>
                <select style={{ minWidth: 180, maxWidth: 260, padding: '12px 38px 12px 14px', border: '1px solid #dbe4f0', borderRadius: 12, background: '#fff', color: '#172b4d', font: 'inherit', cursor: 'pointer' }} value={activeBrand} onChange={(event) => setActiveBrand(event.target.value)} aria-label="Filter products by brand">
                  <option value="All">All brands</option>
                  {availableBrands.map((brand) => (
                    <option value={brand} key={brand}>{brand}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="category-pills">
              {availableFilterCategories.map((category) => (
                <button key={category} className={activeCategory === category ? 'pill-active' : ''} onClick={() => { setActiveCategory(category); setActiveBrand('All'); }}>{category === 'All' ? 'All products' : category}</button>
              ))}
            </div>
            <div className={`api-status ${apiStatus}`}><span />{apiStatus === 'loading' ? 'Loading products…' : apiStatus === 'connected' ? `${products.length} products from your store` : 'Preview mode · backend unavailable'}</div>
          </div>

          {apiStatus === 'loading' ? (
            <div className="product-loading"><span className="loading-spinner" /><strong>Finding your favorites…</strong></div>
          ) : filteredProducts.length ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-media">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget;
                        image.onerror = null;
                        image.src = makeProductFallbackImage(product);
                      }}
                    />
                    <span className="product-badge">{product.badge || (product.discountPercentage ? `${product.discountPercentage}% OFF` : 'FEATURED')}</span>
                    <button className={`favorite-button ${favorites.includes(product.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={`Favorite ${product.title}`}>{favorites.includes(product.id) ? '♥' : '♡'}</button>
                  </div>
                  <div className="product-details">
                    <span className="product-category">{product.category}</span>
                    <h3><button type="button" className="product-title-link" onClick={() => navigate(`/products/${encodeURIComponent(product.id)}`, { state: { product } })}>{product.title}</button></h3>
                    <div className="rating-row"><span className="rating-star">★</span><strong>{Number(product.rating || 4.5).toFixed(1)}</strong><span className="rating-caption">Customer rating</span></div>
                    <div className="price-row"><div><strong className="current-price">{money(product.sellingPrice)}</strong>{product.mrpPrice > product.sellingPrice && <del>{money(product.mrpPrice)}</del>}</div>{product.discountPercentage > 0 && <span className="discount-text">{product.discountPercentage}% off</span>}</div>
                    <div className="stock-row">{product.quantity > 0 ? <span className="in-stock">In stock</span> : <span className="out-stock">Stock status unavailable</span>}</div>
                    <button className="add-cart-button" disabled={product.quantity <= 0} onClick={() => addToCart(product)}>{product.quantity <= 0 ? 'Out of stock' : '＋ Add to cart'}</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-products"><span>⌕</span><h3>No products found</h3><p>Try another search or category.</p><button className="btn-primary" onClick={() => { setSearch(''); setActiveCategory('All'); setActiveBrand('All'); }}>Clear filters</button></div>
          )}
          <div className="products-bottom-note">Showing {filteredProducts.length} of {products.length} items <span>•</span> New discoveries added regularly</div>
        </section>

        <section className="promo-banner section-container">
          <div className="promo-copy"><span className="section-eyebrow">A LITTLE SOMETHING FOR YOU</span><h2>Make everyday<br /><em>a little better.</em></h2><p>Explore pieces that bring more joy to your daily routine.</p><a href="#products" className="btn-primary">Find your next favorite <span>→</span></a></div>
          <div className="promo-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85" alt="Modern retail collection" /></div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-mark">✳</div><div className="newsletter-copy"><span className="section-eyebrow">THE GOOD STUFF, OCCASIONALLY</span><h2>Good finds in your <em>inbox.</em></h2><p>Get updates on new arrivals, offers and everyday favorites.</p></div>
          <form className="newsletter-form" onSubmit={handleNewsletter}><div><input type="email" required placeholder="Enter your email address" aria-label="Email address" /><button type="submit">Subscribe <span>→</span></button></div><small>No spam. Just the good stuff.</small></form>
        </section>
      </main>

      <footer className="karthik-mart-footer" id="footer">
        <div className="footer-main">
          <div className="footer-brand-block"><a className="karthik-mart-brand" href="#home"><span className="brand-symbol">K</span><span>Karthik Mart<span className="brand-period">.</span></span></a><p>Everyday discoveries, a little more delightful.</p></div>
          <div className="footer-column"><strong>Explore</strong><a href="#products">Shop all</a><a href="#categories">Categories</a><a href="#why-karthik-mart">Why Karthik Mart</a></div>
          <div className="footer-column"><strong>Help</strong><button type="button" onClick={() => { setContactSubmitted(false); setFooterPanel('contact'); }}>Contact us</button><button type="button" onClick={() => setFooterPanel('returns')}>Returns &amp; refunds</button><button type="button" onClick={() => setFooterPanel('help')}>Help center</button></div>
          <div className="footer-column"><strong>Follow along</strong><span>Discover something new every day.</span><div className="social-links"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Open Instagram">ig</a><a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest" title="Open Pinterest">p</a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" title="Open Facebook">f</a></div></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Karthik Mart</span><span>Designed for everyday discovery.</span><div><button type="button" onClick={() => setFooterPanel('privacy')}>Privacy</button><button type="button" onClick={() => setFooterPanel('terms')}>Terms</button></div></div>
      </footer>

      {footerPanel && <div className="footer-modal-backdrop" role="presentation" onClick={() => setFooterPanel('')}>
        <section className="footer-modal" role="dialog" aria-modal="true" aria-labelledby="footer-modal-title" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="footer-modal-close" onClick={() => setFooterPanel('')} aria-label="Close dialog">×</button>
          {footerPanel === 'contact' && <><span className="section-eyebrow">WE'RE HERE TO HELP</span><h2 id="footer-modal-title">Contact us</h2><p>Send a message about an order, payment, delivery, or product. This demo form stores the message in this browser only; it does not email the store yet.</p>{contactSubmitted ? <div className="footer-form-success">Your message was saved in this browser. To receive messages, connect this form to a backend or support email.</div> : <form className="footer-contact-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const payload = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), topic: form.elements.topic.value, message: form.elements.message.value.trim(), createdAt: new Date().toISOString() }; const saved = JSON.parse(localStorage.getItem('karthikMartContactMessages') || '[]'); saved.push(payload); localStorage.setItem('karthikMartContactMessages', JSON.stringify(saved)); setContactSubmitted(true); }}><label>Your name<input name="name" required maxLength="100" placeholder="Enter your name" /></label><label>Email address<input name="email" type="email" required maxLength="150" placeholder="you@example.com" /></label><label>What can we help with?<select name="topic"><option>Order or delivery</option><option>Payment</option><option>Return or refund</option><option>Product question</option><option>Other</option></select></label><label>Message<textarea name="message" required rows="4" maxLength="2000" placeholder="Tell us how we can help" /></label><button className="btn-primary" type="submit">Save message</button></form>}</>}
          {footerPanel === 'returns' && <><span className="section-eyebrow">ORDER SUPPORT</span><h2 id="footer-modal-title">Returns &amp; refunds</h2><p>Need to return an item? Keep your order number and product details ready so your request can be reviewed.</p><ol><li>Open <strong>Orders → My Orders</strong> and find the purchase.</li><li>Note the order number and the item you want to return.</li><li>Use Contact us to record your return request.</li></ol><p className="footer-modal-note">A return window, eligibility rules, and automatic refund processing have not been configured in this demo store yet.</p><button className="btn-primary" onClick={() => { setContactSubmitted(false); setFooterPanel('contact'); }}>Contact us about a return</button></>}
          {footerPanel === 'help' && <><span className="section-eyebrow">KARTHIK MART SUPPORT</span><h2 id="footer-modal-title">Help center</h2><div className="help-faq"><details open><summary>How do I track an order?</summary><p>Open the Orders menu and select My Orders to see available order and payment details.</p></details><details><summary>How do I know if payment succeeded?</summary><p>Your order card displays the payment status returned by the store backend.</p></details><details><summary>What if my order is missing?</summary><p>Confirm you are signed in to the account used for the purchase, then contact support with your order number.</p></details><details><summary>How do I ask for a return?</summary><p>Open Returns &amp; refunds and then use Contact us to record your request.</p></details></div><button className="btn-primary" onClick={() => { setContactSubmitted(false); setFooterPanel('contact'); }}>Still need help? Contact us</button></>}
          {footerPanel === 'privacy' && <><span className="section-eyebrow">YOUR INFORMATION</span><h2 id="footer-modal-title">Privacy</h2><p>This demo storefront may store cart, wishlist, account-session, and contact-form data in your browser's local storage. Do not enter sensitive personal or payment information into demo forms.</p><p className="footer-modal-note">A formal privacy policy and server-side data-retention rules must be added before production launch.</p></>}
          {footerPanel === 'terms' && <><span className="section-eyebrow">STORE INFORMATION</span><h2 id="footer-modal-title">Terms</h2><p>This storefront is currently a development/demo application. Product availability, prices, order processing, returns, and support commitments should be confirmed by the store operator.</p><p className="footer-modal-note">Add your business's approved terms and conditions before making the store publicly available.</p></>}
        </section>
      </div>}

      {shippingOpen && <div className="footer-modal-backdrop" role="presentation" onClick={() => { if (!isCheckingOut) setShippingOpen(false); }}>
        <section className="footer-modal" role="dialog" aria-modal="true" aria-labelledby="shipping-modal-title" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
          <button type="button" className="footer-modal-close" onClick={() => { if (!isCheckingOut) setShippingOpen(false); }} aria-label="Close delivery address form" disabled={isCheckingOut}>×</button>
          <span className="section-eyebrow">DELIVERY DETAILS</span>
          <h2 id="shipping-modal-title">Where should we deliver?</h2>
          <p>Enter your delivery address before continuing to payment. Required fields are marked with *.</p>
          <form className="footer-contact-form" onSubmit={confirmShippingAddress}>
            <label>Recipient full name *<input required maxLength="100" autoComplete="name" value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} placeholder="Full name" /></label>
            <label>Mobile number *<input required inputMode="numeric" maxLength="10" autoComplete="tel-national" value={shippingAddress.mobile} onChange={(e) => setShippingAddress({ ...shippingAddress, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" /></label>
            <label>House / Flat / Building *<input required maxLength="150" autoComplete="address-line1" value={shippingAddress.house} onChange={(e) => setShippingAddress({ ...shippingAddress, house: e.target.value })} placeholder="House or flat number" /></label>
            <label>Street / Area *<input required maxLength="180" autoComplete="address-line2" value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} placeholder="Street, area or locality" /></label>
            <label>Landmark (optional)<input maxLength="150" value={shippingAddress.landmark} onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })} placeholder="Nearby landmark" /></label>
            <label>City *<input required maxLength="100" autoComplete="address-level2" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} placeholder="City" /></label>
            <label>State *<input required maxLength="100" autoComplete="address-level1" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} placeholder="State" /></label>
            <label>PIN code *<input required inputMode="numeric" maxLength="6" autoComplete="postal-code" value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6-digit PIN code" /></label>
            <label>Delivery instructions (optional)<textarea rows="2" maxLength="500" value={shippingAddress.instructions} onChange={(e) => setShippingAddress({ ...shippingAddress, instructions: e.target.value })} placeholder="Any instructions for delivery" /></label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}><button className="btn-primary" type="submit" disabled={isCheckingOut}>{isCheckingOut ? 'Preparing checkout…' : 'Save address & continue to payment →'}</button><button className="remove-item" type="button" onClick={() => { if (!isCheckingOut) setShippingOpen(false); }}>Back to cart</button></div>
          </form>
          <p className="footer-modal-note" style={{ marginTop: 16 }}>This step saves the address in this browser. The address is saved in this browser for now. Server-side order/address linking is a separate backend step.</p>
        </section>
      </div>}

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()} aria-label="Shopping cart"><div className="drawer-heading"><div><span className="section-eyebrow">YOUR PICKS</span><h2>Your cart <span>({cartCount})</span></h2></div><button className="drawer-close" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>
        {cart.length === 0 ? <div className="cart-empty"><span>🛒</span><h3>Your cart is waiting</h3><p>Add a few favorites and they'll show up here.</p><button className="btn-primary" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{cart.map((item) => { const stock = Math.max(0, Number(item.stockAvailable ?? 0)); const qty = Math.max(1, Number(item.quantity) || 1); return <div className="cart-line" key={item.id}><img src={item.image} alt={item.title} /><div className="cart-line-info"><strong>{item.title}</strong><span>{money(item.sellingPrice)} each</span><div className="quantity-control"><button disabled={isCheckingOut || qty <= 1} onClick={() => changeCartQuantity(item.id, -1)} aria-label={`Decrease ${item.title} quantity`}>−</button><span aria-live="polite">{qty}</span><button disabled={isCheckingOut || qty >= stock} onClick={() => changeCartQuantity(item.id, 1)} aria-label={`Increase ${item.title} quantity`}>＋</button><button className="remove-item" disabled={isCheckingOut} onClick={() => removeCartItem(item.id)}>Remove</button></div><strong className="cart-line-total">Line total: {money(Number(item.sellingPrice) * qty)}</strong><small className="cart-stock-note">{stock > 0 ? `${stock} available` : 'Stock needs to be rechecked before checkout'}</small></div></div>; })}</div><div className="cart-summary"><div><span>Subtotal ({cartCount} item{cartCount === 1 ? '' : 's'})</span><strong>{money(cartTotal)}</strong></div><small>Final price and stock will be checked by the server at checkout.</small><button className="remove-item cart-clear-button" disabled={isCheckingOut} onClick={clearCart}>Clear cart</button><button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Processing checkout…' : <>Continue to checkout <span>→</span></>}
            </button></div></>}
      </aside></div>}

      {notice && <div className="toast-message" role="status"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
    </div>
  );
}

export default Home;
