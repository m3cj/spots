import { FiCamera, FiCoffee, FiCompass, FiEye, FiGift, FiHeart, FiMapPin, FiMusic, FiShoppingBag, FiStar, FiSun } from 'react-icons/fi';
import { LuLandmark, LuMountain, LuPalette, LuStore, LuTreePine, LuTrees, LuUtensils } from 'react-icons/lu';
import {
  MdFestival,
  MdLocalLibrary,
  MdMuseum,
  MdPark,
  MdRestaurant,
  MdSailing,
  MdStorefront,
  MdTempleBuddhist,
  MdTempleHindu,
  MdTheaters,
  MdWater,
} from 'react-icons/md';
import { PiMapPinFill } from 'react-icons/pi';

// Categories store a React Icons component name (PRD §6). Importing every pack to resolve arbitrary names
// would bloat the bundle, so the names an admin can pick are a curated registry. Unknown names fall back to a pin.
const REGISTRY = {
  FiCamera,
  FiCoffee,
  FiCompass,
  FiEye,
  FiGift,
  FiHeart,
  FiMapPin,
  FiMusic,
  FiShoppingBag,
  FiStar,
  FiSun,
  LuLandmark,
  LuMountain,
  LuPalette,
  LuStore,
  LuTreePine,
  LuTrees,
  LuUtensils,
  MdFestival,
  MdLocalLibrary,
  MdMuseum,
  MdPark,
  MdRestaurant,
  MdSailing,
  MdStorefront,
  MdTempleBuddhist,
  MdTempleHindu,
  MdTheaters,
  MdWater,
  // The PRD seed lists FiTreePine, which Feather does not ship; Lucide's pine tree is the same glyph.
  FiTreePine: LuTreePine,
};

/** Icon names an admin may assign to a category. */
export const CATEGORY_ICON_NAMES = Object.keys(REGISTRY).filter((name) => name !== 'FiTreePine');

export function CategoryIcon({ name, className = 'h-4 w-4', ...rest }) {
  const Icon = REGISTRY[name] ?? PiMapPinFill;
  return <Icon aria-hidden="true" className={className} {...rest} />;
}
