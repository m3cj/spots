// Development fallback data (PRD §9.2). It mirrors schema.sql exactly, snake_case included, and is only reachable
// from api/devFallback.js when the API cannot be reached under `vite dev`. Production builds never include it.
// Coordinates come from OpenStreetMap; descriptions and counts are illustrative.

const DAY_MS = 86_400_000;
const at = (daysAgo) => new Date(Date.now() - daysAgo * DAY_MS).toISOString();
const pad = (value) => String(value).padStart(2, '0');
const dateFromNow = (days) => {
  const date = new Date(Date.now() + days * DAY_MS);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const categories = [
  { id: 1, slug: 'cafes', name: 'Cafés', icon: 'FiCoffee', color: '#F97316', sort_order: 1, created_at: at(90) },
  { id: 2, slug: 'heritage', name: 'Heritage', icon: 'MdTempleHindu', color: '#8B5CF6', sort_order: 2, created_at: at(90) },
  { id: 3, slug: 'parks', name: 'Parks', icon: 'LuTreePine', color: '#10B981', sort_order: 3, created_at: at(90) },
  { id: 4, slug: 'ghat', name: 'Ghats', icon: 'MdWater', color: '#EC4899', sort_order: 4, created_at: at(90) },
  { id: 5, slug: 'shopping', name: 'Bazaars', icon: 'FiShoppingBag', color: '#F59E0B', sort_order: 5, created_at: at(90) },
  { id: 6, slug: 'secrets', name: 'Secrets', icon: 'FiEye', color: '#06B6D4', sort_order: 6, created_at: at(90) },
];

const categoryColor = (slug) => categories.find((category) => category.slug === slug)?.color ?? '#CA2019';
const escapeXml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// Self-contained 3:2 placeholder so the mock works offline.
export const placeholderImage = (label, categorySlug) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${categoryColor(categorySlug)}"/>` +
      `<stop offset="1" stop-color="#2B1D15" stop-opacity=".88"/></linearGradient></defs>` +
      `<rect width="600" height="400" fill="url(#g)"/><circle cx="486" cy="92" r="44" fill="#FCA102" opacity=".9"/>` +
      `<path d="M0 322 Q150 262 300 312 T600 292 V400 H0Z" fill="#FFF6E5" opacity=".18"/>` +
      `<text x="32" y="362" font-family="Georgia, serif" font-size="34" fill="#FFF6E5">${escapeXml(label)}</text></svg>`,
  )}`;

export const users = [
  { id: 1, display_name: 'Asha Verma', email: 'asha@example.com', avatar_url: null, role: 'explorer', created_at: at(40) },
  { id: 2, display_name: 'Rohan Singh', email: 'rohan@example.com', avatar_url: null, role: 'spoter', created_at: at(70) },
  { id: 3, display_name: 'Meera Kumari', email: 'meera@example.com', avatar_url: null, role: 'super_admin', created_at: at(90) },
];

const mapsLink = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const makeSpot = (id, fields) => ({
  id,
  status: 'active',
  gmap_link: mapsLink(fields.lat, fields.lng),
  direction: null,
  street: null,
  landmark: null,
  area: null,
  city: 'Patna',
  pincode: null,
  state: 'Bihar',
  contacts: null,
  views: 0,
  like_count: 0,
  created_by: null,
  created_at: at(80 - id * 6),
  updated_at: at(8),
  ...fields,
  hero_img: placeholderImage(fields.name, fields.category_slug),
});

export const spots = [
  makeSpot(1, {
    name: 'Golghar', category_slug: 'heritage', lat: 25.6203, lng: 85.1395, best_time_to_visit: 'morning',
    street: 'Ashok Raj Path', area: 'Gandhi Maidan', pincode: '800001', like_count: 128, views: 2410,
    description: 'A beehive-shaped granary built in 1786 after the great famine of 1770. Climb the 145 steps for a wide view over the Ganga and the rooftops around Gandhi Maidan.',
    direction: 'A few minutes on foot from Gandhi Maidan; the gate faces Ashok Raj Path.',
    tags: ['Landmark', 'View', 'History'],
  }),
  makeSpot(2, {
    name: 'Gandhi Maidan', category_slug: 'parks', lat: 25.6173, lng: 85.1451, best_time_to_visit: 'anytime',
    area: 'Gandhi Maidan', pincode: '800001', like_count: 112, views: 3120,
    description: 'The great open ground at the heart of Patna. Morning walkers, evening families, Dussehra crowds and the odd rally all find room here.',
    direction: 'Enter from any of the gates; auto and e-rickshaw stands ring the ground.',
    tags: ['Walks', 'Open-air', 'Family'],
  }),
  makeSpot(3, {
    name: 'Patna Museum', category_slug: 'heritage', lat: 25.6126, lng: 85.1335, best_time_to_visit: 'day',
    street: 'Buddha Marg', area: 'Buddha Marg', pincode: '800001', like_count: 54, views: 980,
    description: 'Locally called Jadu Ghar, the House of Magic. Terracotta, bronzes, coins and a fossil tree said to be 200 million years old.',
    direction: 'On Buddha Marg, a short ride from Patna Junction.',
    tags: ['Museum', 'Art', 'History'],
  }),
  makeSpot(4, {
    name: 'Takht Sri Harmandir Ji Patna Sahib', category_slug: 'heritage', lat: 25.5958, lng: 85.2298, best_time_to_visit: 'morning',
    street: 'Ashok Raj Path', area: 'Patna City', pincode: '800007', like_count: 90, views: 1760,
    description: 'Birthplace of Guru Gobind Singh and one of the five Takhts of Sikhism. Come early for the quiet of the morning prayers and the langar.',
    direction: 'In Patna City, east along Ashok Raj Path.',
    tags: ['Gurudwara', 'Langar', 'Peaceful'],
  }),
  makeSpot(5, {
    name: 'Eco Park', category_slug: 'parks', lat: 25.6019, lng: 85.1151, best_time_to_visit: 'day',
    area: 'Bailey Road', like_count: 61, views: 1105,
    description: 'A landscaped park with lakes, walking trails and play areas. A green pocket for a slow evening away from the traffic.',
    direction: 'West of the city centre, off Bailey Road.',
    tags: ['Lake', 'Walks', 'Family'],
  }),
  makeSpot(6, {
    name: 'Patna Marine Drive', category_slug: 'ghat', lat: 25.6514, lng: 85.0906, best_time_to_visit: 'night',
    area: 'Digha', pincode: '800011', like_count: 97, views: 2030,
    description: 'A riverside promenade along the Ganga. Best at sunset, when chai and roasted corn carts gather along the railing.',
    direction: 'Follow the Ganga Path from Digha; parking is along the road.',
    tags: ['Riverfront', 'Sunset', 'Chai'],
  }),
  makeSpot(7, {
    name: 'Maurya Lok Complex', category_slug: 'shopping', lat: 25.6095, lng: 85.1344, best_time_to_visit: 'day',
    street: 'Dak Bungalow Road', area: 'Dak Bungalow', pincode: '800001', like_count: 33, views: 640,
    description: 'A busy city-centre shopping complex close to Dak Bungalow Chowk, with clothes, footwear and accessories at every price.',
    direction: 'Two minutes from Dak Bungalow Chowk.',
    tags: ['Shopping', 'Market', 'Budget'],
  }),
  makeSpot(8, {
    name: 'Indian Coffee House', category_slug: 'cafes', lat: 25.6101, lng: 85.1376, best_time_to_visit: 'day',
    street: 'Dak Bungalow Road', area: 'Dak Bungalow', pincode: '800001', like_count: 76, views: 1420,
    description: 'A long-running coffee house where conversations outlast the coffee. Order the filter coffee and a cutlet, then stay a while.',
    direction: 'Near Dak Bungalow Chowk.',
    tags: ['Coffee', 'Heritage', 'Adda'],
  }),
  makeSpot(9, {
    name: 'Padri Ki Haveli', category_slug: 'secrets', lat: 25.6012, lng: 85.2194, best_time_to_visit: 'morning',
    street: 'Ashok Raj Path', area: 'Patna City', pincode: '800008', like_count: 19, views: 310, created_by: 2,
    description: 'An 18th-century church complex built by Capuchin missionaries, tucked into the lanes of Patna City. Quiet, old and rarely crowded.',
    direction: 'Off Ashok Raj Path in Hakimganj; ask for the old church.',
    tags: ['Church', 'Hidden', 'History'],
  }),
  makeSpot(10, {
    name: 'Khuda Bakhsh Oriental Library', category_slug: 'secrets', status: 'draft', lat: 25.6193, lng: 85.1626, best_time_to_visit: 'day',
    street: 'Ashok Raj Path', area: 'Ashok Raj Path', pincode: '800004', like_count: 0, views: 0, created_by: 2,
    description: 'One of India\'s oldest public libraries, with rare Persian and Arabic manuscripts. Ask at the desk before photographing.',
    tags: ['Library', 'Manuscripts'],
  }),
];

const gallery = (spotId, captions) => {
  const spot = spots.find((item) => item.id === spotId);
  return captions.map((caption, index) => ({
    id: spotId * 10 + index,
    spot_id: spotId,
    image_url: placeholderImage(caption, spot.category_slug),
    caption,
    sort_order: index,
    created_at: spot.created_at,
  }));
};

export const spotImages = [
  ...gallery(1, ['Golghar at dawn', 'The spiral staircase', 'View from the top']),
  ...gallery(2, ['Morning walkers', 'Dussehra evening']),
  ...gallery(3, ['The main gallery', 'Terracotta room']),
  ...gallery(6, ['Sunset on the Ganga', 'Evening promenade']),
];

export const events = [
  {
    id: 1, title: 'Sunday Heritage Walk', spot_id: 1, event_date: dateFromNow(3), start_time: '07:00:00',
    categories: 'heritage', status: 'upcoming', age_limit: null, price: null, booking_link: null, hero_img: null,
    created_at: at(6), updated_at: at(6),
  },
  {
    id: 2, title: 'Open Mic Evening', spot_id: 8, event_date: dateFromNow(0), start_time: '18:30:00',
    categories: 'cafes', status: 'ongoing', age_limit: 16, price: 199, booking_link: 'https://example.com/tickets/open-mic',
    hero_img: placeholderImage('Open Mic Evening', 'cafes'), created_at: at(9), updated_at: at(2),
  },
  {
    id: 3, title: 'Winter Book Fair', spot_id: 2, event_date: dateFromNow(-12), start_time: '11:00:00',
    categories: 'parks,shopping', status: 'completed', age_limit: null, price: null, booking_link: null, hero_img: null,
    created_at: at(30), updated_at: at(12),
  },
];

// Seeds for the three mock users so Profile and Saved spots are populated whichever role is active.
export const likes = [
  { user_id: 1, spot_id: 1 }, { user_id: 1, spot_id: 2 }, { user_id: 3, spot_id: 3 },
];

export const bookmarks = [
  { user_id: 1, spot_id: 1, created_at: at(5) }, { user_id: 1, spot_id: 6, created_at: at(2) },
  { user_id: 2, spot_id: 4, created_at: at(3) }, { user_id: 3, spot_id: 8, created_at: at(1) },
];

export const submissions = [
  {
    id: 1, user_id: 1, name: 'Kulhad Chai Corner', category_slug: 'cafes', lat: 25.6118, lng: 85.1262,
    description: 'Tiny stall on Boring Road that serves chai in clay kulhads and the best samosas in the lane.',
    best_time_to_visit: 'morning', image_url: null, status: 'pending', created_at: at(2), updated_at: at(2),
  },
  {
    id: 2, user_id: 1, name: 'Sunrise Point, Marine Drive', category_slug: 'ghat', lat: 25.6502, lng: 85.0958,
    description: 'The quiet end of the promenade where you can watch the sun come up over the Ganga without the crowds.',
    best_time_to_visit: 'morning', image_url: placeholderImage('Sunrise Point', 'ghat'), status: 'pending', created_at: at(1), updated_at: at(1),
  },
  {
    id: 3, user_id: 1, name: 'Sher Shah Suri Mosque', category_slug: 'heritage', lat: 25.6126, lng: 85.1862,
    description: 'A 16th-century mosque built under Sher Shah Suri, with fine Afghan-style arches and a calm courtyard.',
    best_time_to_visit: 'day', image_url: null, status: 'approved', created_at: at(14), updated_at: at(10),
  },
  {
    id: 4, user_id: 1, name: 'Mall Food Court', category_slug: 'shopping', lat: 25.6, lng: 85.1,
    description: 'Large food court inside a mall with all the usual chains.',
    best_time_to_visit: 'anytime', image_url: null, status: 'rejected', created_at: at(20), updated_at: at(18),
  },
];

export const media = spots
  .filter((spot) => spot.status === 'active')
  .slice(0, 6)
  .map((spot, index) => ({
    name: `mock-${spot.id}.webp`,
    path: `admin/mock-${spot.id}.webp`,
    url: spot.hero_img,
    size: 84_000 + index * 11_000,
    mime: 'image/webp',
    created_at: at(index + 1),
  }));
