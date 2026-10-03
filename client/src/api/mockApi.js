// In-memory simulation of the Express + Supabase API (server/db/*.js), used only through
// withMockFallback() when the real API is unreachable in a dev build. Mutations are kept in
// module state cloned from mockData.js, so they persist for the tab's session but reset on reload.
import * as seed from '@/mockData';
import { ApiError } from './http';
import { clearMockSignedOut, getMockViewerId, isMockSignedOut, setMockSignedOut } from '@/utils/devFallback';

const clone = (value) => structuredClone(value);
const unauthenticated = () => new ApiError('Please sign in.', { status: 401, code: 'UNAUTHENTICATED' });
const forbidden = () => new ApiError('You do not have access to this.', { status: 403, code: 'FORBIDDEN' });
const notFound = (what) => new ApiError(`${what} not found.`, { status: 404, code: 'NOT_FOUND' });

let state;
function store() {
  state ??= {
    categories: clone(seed.categories),
    spots: clone(seed.spots),
    spotImages: clone(seed.spotImages),
    events: clone(seed.events),
    likes: clone(seed.likes),
    bookmarks: clone(seed.bookmarks),
    submissions: clone(seed.submissions),
    media: clone(seed.media),
    nextId: { spots: 100, categories: 100, events: 100, submissions: 100 },
  };
  return state;
}

// --- shared helpers ---------------------------------------------------------

function paginate(items, { page = 1, pageSize = 10 } = {}) {
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return { items: pageItems, page, pageSize, total: items.length, hasMore: start + pageSize < items.length };
}

const searchText = (spot) =>
  [spot.name, spot.area, spot.street, spot.description, ...(spot.tags ?? []), spot.category_slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export function currentUser() {
  if (isMockSignedOut()) return null;
  const user = seed.users.find((u) => u.id === getMockViewerId());
  return user ? clone(user) : null;
}

function requireUser() {
  const user = currentUser();
  if (!user) throw unauthenticated();
  return user;
}

function requireRole(...roles) {
  const user = requireUser();
  if (!roles.includes(user.role)) throw forbidden();
  return user;
}

function withGallery(spot) {
  const images = store()
    .spotImages.filter((image) => image.spot_id === spot.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  return { ...spot, spot_images: images };
}

function withVenue(event) {
  const spot = store().spots.find((item) => item.id === event.spot_id);
  return {
    ...event,
    hero_img: event.hero_img ?? spot?.hero_img ?? null,
    spot: spot ? { id: spot.id, name: spot.name, area: spot.area, street: spot.street, category_slug: spot.category_slug, hero_img: spot.hero_img, lat: spot.lat, lng: spot.lng } : null,
  };
}

const PUBLISHABLE = (spot) => spot.status !== 'active' || (spot.hero_img && spot.description);
function assertPublishable(spot) {
  if (!PUBLISHABLE(spot)) {
    throw new ApiError('A published spot needs a hero image and a description.', { status: 400, code: 'NOT_PUBLISHABLE' });
  }
}

// --- public: categories / spots / events ------------------------------------

export function listCategories() {
  return clone(store().categories).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export function listSpots(params) {
  const { q, category, area, pincode, time, sort = 'newest' } = params;
  let items = store().spots.filter((spot) => spot.status === 'active');

  if (category) items = items.filter((spot) => spot.category_slug === category);
  if (area) items = items.filter((spot) => spot.area?.toLowerCase() === area.toLowerCase());
  if (pincode) items = items.filter((spot) => spot.pincode === pincode);
  if (time) items = items.filter((spot) => spot.best_time_to_visit === time || spot.best_time_to_visit === 'anytime');
  for (const word of (q ?? '').split(/\s+/).filter(Boolean)) {
    const needle = word.toLowerCase();
    items = items.filter((spot) => searchText(spot).includes(needle));
  }

  items = [...items].sort((a, b) =>
    sort === 'popular'
      ? b.like_count - a.like_count || +new Date(b.created_at) - +new Date(a.created_at)
      : +new Date(b.created_at) - +new Date(a.created_at) || b.id - a.id,
  );

  const page = paginate(items, params);
  return { ...page, items: page.items.map(clone) };
}

export function getHotSpots() {
  return store()
    .spots.filter((spot) => spot.status === 'active')
    .toSorted((a, b) => b.like_count - a.like_count || b.views - a.views || a.id - b.id)
    .slice(0, 10)
    .map(clone);
}

export function getSpotFacets() {
  const active = store().spots.filter((spot) => spot.status === 'active');
  return {
    areas: [...new Set(active.map((spot) => spot.area).filter(Boolean))].sort(),
    pincodes: [...new Set(active.map((spot) => spot.pincode).filter(Boolean))].sort(),
  };
}

export function getSpotDetail(id) {
  const spot = store().spots.find((item) => item.id === id && item.status === 'active');
  if (!spot) throw notFound('Spot');

  spot.views += 1;
  const viewer = currentUser();
  return {
    ...withGallery(clone(spot)),
    viewer: viewer
      ? {
          liked: store().likes.some((like) => like.user_id === viewer.id && like.spot_id === id),
          bookmarked: store().bookmarks.some((mark) => mark.user_id === viewer.id && mark.spot_id === id),
        }
      : { liked: false, bookmarked: false },
  };
}

export function listEvents(params) {
  const { status } = params;
  const active = new Set(store().spots.filter((spot) => spot.status === 'active').map((spot) => spot.id));
  let items = store().events.filter((event) => status.includes(event.status) && active.has(event.spot_id));

  const pastOnly = status.every((item) => item === 'completed' || item === 'cancelled');
  items = [...items].sort((a, b) => {
    const diff = a.event_date.localeCompare(b.event_date) || a.start_time.localeCompare(b.start_time) || a.id - b.id;
    return pastOnly ? -diff : diff;
  });

  const page = paginate(items, params);
  return { ...page, items: page.items.map((event) => withVenue(clone(event))) };
}

export function getEvent(id) {
  const event = store().events.find((item) => item.id === id);
  const spot = event && store().spots.find((item) => item.id === event.spot_id && item.status === 'active');
  if (!event || !spot) throw notFound('Event');
  return withVenue(clone(event));
}

// --- authenticated: likes / bookmarks / submissions -------------------------

export function likeSpot(spotId) {
  const user = requireUser();
  const spot = store().spots.find((item) => item.id === spotId && item.status === 'active');
  if (!spot) throw notFound('Spot');

  if (!store().likes.some((like) => like.user_id === user.id && like.spot_id === spotId)) {
    store().likes.push({ user_id: user.id, spot_id: spotId });
    spot.like_count += 1;
  }
  return { liked: true, like_count: spot.like_count };
}

export function unlikeSpot(spotId) {
  const user = requireUser();
  const spot = store().spots.find((item) => item.id === spotId);
  if (!spot) throw notFound('Spot');

  const before = store().likes.length;
  state.likes = store().likes.filter((like) => !(like.user_id === user.id && like.spot_id === spotId));
  if (store().likes.length < before) spot.like_count = Math.max(spot.like_count - 1, 0);
  return { liked: false, like_count: spot.like_count };
}

export function listBookmarks(params) {
  const user = requireUser();
  const marks = store()
    .bookmarks.filter((mark) => mark.user_id === user.id)
    .toSorted((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const page = paginate(marks, params);
  return {
    ...page,
    items: page.items.map((mark) => {
      const spot = store().spots.find((item) => item.id === mark.spot_id);
      return { ...clone(spot), bookmarked_at: mark.created_at };
    }),
  };
}

export function addBookmark(spotId) {
  const user = requireUser();
  const spot = store().spots.find((item) => item.id === spotId && item.status === 'active');
  if (!spot) throw notFound('Spot');

  if (!store().bookmarks.some((mark) => mark.user_id === user.id && mark.spot_id === spotId)) {
    store().bookmarks.push({ user_id: user.id, spot_id: spotId, created_at: new Date().toISOString() });
  }
  return { bookmarked: true };
}

export function removeBookmark(spotId) {
  const user = requireUser();
  state.bookmarks = store().bookmarks.filter((mark) => !(mark.user_id === user.id && mark.spot_id === spotId));
  return { bookmarked: false };
}

const MAX_PENDING = 10;

export function createSubmission(input, imageFile) {
  const user = requireUser();
  const pending = store().submissions.filter((item) => item.user_id === user.id && item.status === 'pending');
  if (pending.length >= MAX_PENDING) {
    throw new ApiError(`You already have ${MAX_PENDING} suggestions waiting for review.`, { status: 429, code: 'TOO_MANY_PENDING' });
  }

  const submission = {
    id: store().nextId.submissions++,
    user_id: user.id,
    ...input,
    image_url: imageFile ? URL.createObjectURL(imageFile) : null,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store().submissions.push(submission);
  return clone(submission);
}

export function listUserSubmissions(params) {
  const user = requireUser();
  const mine = store()
    .submissions.filter((item) => item.user_id === user.id)
    .toSorted((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const page = paginate(mine, params);
  return { ...page, items: page.items.map(clone) };
}

// --- admin -------------------------------------------------------------------

function loadAccessibleSpot(id, user) {
  const spot = store().spots.find((item) => item.id === id);
  if (!spot || (user.role !== 'super_admin' && spot.created_by !== user.id)) throw notFound('Spot');
  return spot;
}

export function adminListSpots(params) {
  const user = requireRole('spoter', 'super_admin');
  let items = store().spots;
  if (user.role !== 'super_admin') items = items.filter((spot) => spot.created_by === user.id);
  if (params.status) items = items.filter((spot) => spot.status === params.status);
  if (params.category) items = items.filter((spot) => spot.category_slug === params.category);
  for (const word of (params.q ?? '').split(/\s+/).filter(Boolean)) {
    items = items.filter((spot) => searchText(spot).includes(word.toLowerCase()));
  }
  items = [...items].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  const page = paginate(items, params);
  return { ...page, items: page.items.map(clone) };
}

export function adminGetSpot(id) {
  const user = requireRole('spoter', 'super_admin');
  return withGallery(clone(loadAccessibleSpot(id, user)));
}

export function adminCreateSpot(input) {
  const user = requireRole('spoter', 'super_admin');
  if (!store().categories.some((category) => category.slug === input.category_slug)) {
    throw new ApiError('That category does not exist.', { status: 400, code: 'INVALID_REFERENCE' });
  }
  const spot = {
    id: store().nextId.spots++,
    status: 'draft',
    best_time_to_visit: 'anytime',
    state: 'Bihar',
    tags: [],
    like_count: 0,
    views: 0,
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...input,
    name: input.name.trim(),
  };
  assertPublishable(spot);
  store().spots.push(spot);
  return clone(spot);
}

export function adminUpdateSpot(id, patch) {
  const user = requireRole('spoter', 'super_admin');
  const spot = loadAccessibleSpot(id, user);
  const updated = { ...spot, ...patch, updated_at: new Date().toISOString() };
  assertPublishable(updated);
  Object.assign(spot, updated);
  return clone(spot);
}

export function adminDeleteSpot(id) {
  const user = requireRole('spoter', 'super_admin');
  const spot = loadAccessibleSpot(id, user);
  if (store().events.some((event) => event.spot_id === id)) {
    throw new ApiError('Events are scheduled at this spot. Remove them first, or archive the spot instead.', { status: 409, code: 'IN_USE' });
  }
  state.spots = store().spots.filter((item) => item.id !== id);
  state.spotImages = store().spotImages.filter((image) => image.spot_id !== id);
}

export function replaceSpotImages(id, images) {
  const user = requireRole('spoter', 'super_admin');
  loadAccessibleSpot(id, user);
  state.spotImages = store().spotImages.filter((image) => image.spot_id !== id);
  images.forEach((image, index) => {
    store().spotImages.push({ id: store().nextId.spots++, spot_id: id, caption: null, ...image, sort_order: index });
  });
  return store()
    .spotImages.filter((image) => image.spot_id === id)
    .map(clone);
}

export function adminListCategories() {
  requireRole('super_admin');
  return listCategories();
}

export function adminCreateCategory(input) {
  requireRole('super_admin');
  if (store().categories.some((category) => category.slug === input.slug)) {
    throw new ApiError('That already exists.', { status: 409, code: 'CONFLICT' });
  }
  const category = {
    id: store().nextId.categories++,
    sort_order: 0,
    created_at: new Date().toISOString(),
    ...input,
    name: input.name.trim(),
    color: input.color.toUpperCase(),
  };
  store().categories.push(category);
  return clone(category);
}

export function adminUpdateCategory(id, patch) {
  requireRole('super_admin');
  const category = store().categories.find((item) => item.id === id);
  if (!category) throw notFound('Category');
  if (patch.slug !== undefined && patch.slug !== category.slug) {
    throw new ApiError('A category slug cannot be changed once it is created.', { status: 400, code: 'SLUG_IMMUTABLE' });
  }
  Object.assign(category, patch);
  return clone(category);
}

export function adminDeleteCategory(id) {
  requireRole('super_admin');
  const category = store().categories.find((item) => item.id === id);
  if (!category) throw notFound('Category');
  if (store().spots.some((spot) => spot.category_slug === category.slug)) {
    throw new ApiError('Spots still use this category. Move or archive them first.', { status: 409, code: 'IN_USE' });
  }
  state.categories = store().categories.filter((item) => item.id !== id);
}

export function adminListEvents(params) {
  requireRole('super_admin');
  let items = store().events;
  if (params.status) items = items.filter((event) => event.status === params.status);
  if (params.q) items = items.filter((event) => event.title.toLowerCase().includes(params.q.toLowerCase()));
  items = [...items].sort((a, b) => b.event_date.localeCompare(a.event_date) || b.id - a.id);
  const page = paginate(items, params);
  return {
    ...page,
    items: page.items.map((event) => {
      const spot = store().spots.find((item) => item.id === event.spot_id);
      return { ...clone(event), spot: spot ? { id: spot.id, name: spot.name, area: spot.area } : null };
    }),
  };
}

export function adminGetEvent(id) {
  requireRole('super_admin');
  const event = store().events.find((item) => item.id === id);
  if (!event) throw notFound('Event');
  return withVenue(clone(event));
}

export function adminCreateEvent(input) {
  requireRole('super_admin');
  if (!store().spots.some((spot) => spot.id === input.spot_id)) {
    throw new ApiError('A referenced item does not exist.', { status: 400, code: 'INVALID_REFERENCE' });
  }
  const event = {
    id: store().nextId.events++,
    status: 'upcoming',
    categories: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...input,
  };
  store().events.push(event);
  return clone(event);
}

export function adminUpdateEvent(id, patch) {
  requireRole('super_admin');
  const event = store().events.find((item) => item.id === id);
  if (!event) throw notFound('Event');
  Object.assign(event, patch, { updated_at: new Date().toISOString() });
  return clone(event);
}

export function adminDeleteEvent(id) {
  requireRole('super_admin');
  if (!store().events.some((item) => item.id === id)) throw notFound('Event');
  state.events = store().events.filter((item) => item.id !== id);
}

export function adminListSubmissions(params) {
  requireRole('super_admin');
  const status = params.status ?? 'pending';
  let items = status === 'all' ? store().submissions : store().submissions.filter((item) => item.status === status);
  items = [...items].sort((a, b) =>
    status === 'pending'
      ? +new Date(a.created_at) - +new Date(b.created_at)
      : +new Date(b.created_at) - +new Date(a.created_at),
  );
  const page = paginate(items, params);
  return {
    ...page,
    items: page.items.map((item) => {
      const submitter = seed.users.find((user) => user.id === item.user_id);
      return { ...clone(item), submitter: submitter ? clone(submitter) : null };
    }),
  };
}

export function adminGetSubmission(id) {
  requireRole('super_admin');
  const submission = store().submissions.find((item) => item.id === id);
  if (!submission) throw notFound('Suggestion');
  return clone(submission);
}

export function reviewSubmission(id, review) {
  requireRole('super_admin');
  const submission = store().submissions.find((item) => item.id === id);
  if (!submission || submission.status !== 'pending') {
    throw new ApiError('This suggestion has already been reviewed.', { status: 409, code: 'ALREADY_REVIEWED' });
  }

  if (review.status === 'rejected') {
    submission.status = 'rejected';
    submission.updated_at = new Date().toISOString();
    return { submission: clone(submission), spot: null };
  }

  submission.status = 'approved';
  submission.updated_at = new Date().toISOString();
  const spot = adminCreateSpotFromSubmission(submission, review.spot);
  return { submission: clone(submission), spot };
}

function adminCreateSpotFromSubmission(submission, overrides = {}) {
  const spot = {
    id: store().nextId.spots++,
    name: submission.name,
    category_slug: submission.category_slug,
    status: 'draft',
    lat: submission.lat,
    lng: submission.lng,
    description: submission.description,
    best_time_to_visit: submission.best_time_to_visit,
    hero_img: submission.image_url,
    tags: [],
    state: 'Bihar',
    like_count: 0,
    views: 0,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
  store().spots.push(spot);
  return clone(spot);
}

export function adminListMedia({ folder = 'admin', page, pageSize }) {
  requireRole('super_admin');
  const items = store().media.filter((item) => item.path.startsWith(`${folder}/`));
  return paginate(items, { page, pageSize });
}

export function adminDeleteMedia(path) {
  requireRole('super_admin');
  const usedByHero = store().spots.some((spot) => spot.hero_img && path.includes(spot.hero_img));
  if (usedByHero) {
    throw new ApiError('This image is still used by a spot, event or suggestion.', { status: 409, code: 'IN_USE' });
  }
  state.media = store().media.filter((item) => item.path !== path);
}

export function adminUploadImage(file) {
  requireRole('spoter', 'super_admin');
  const url = URL.createObjectURL(file);
  return { path: `admin/${file.name}`, url, width: null, height: null, size: file.size, mime: file.type };
}

export function adminDashboardStats() {
  requireRole('super_admin');
  return {
    total_spots: store().spots.length,
    active_spots: store().spots.filter((spot) => spot.status === 'active').length,
    draft_spots: store().spots.filter((spot) => spot.status === 'draft').length,
    pending_submissions: store().submissions.filter((item) => item.status === 'pending').length,
    active_events: store().events.filter((event) => ['upcoming', 'ongoing'].includes(event.status)).length,
    total_users: seed.users.length,
  };
}
