import { imageUrl } from '../api.js';
import { haptic } from '../telegram.js';

/** Mahsulotlardan brendlar ro'yxatini yig'adi (har brendga bitta rasm). */
function buildStories(products) {
  const map = new Map();

  for (const product of products) {
    const brand = product.brand || '✨';
    if (!map.has(brand)) {
      map.set(brand, { brand, image: product.imageUrl });
    } else if (!map.get(brand).image && product.imageUrl) {
      map.get(brand).image = product.imageUrl;
    }
  }

  return [...map.values()].slice(0, 10);
}

export default function Stories({ products, onSelect }) {
  const stories = buildStories(products);
  if (stories.length === 0) return null;

  return (
    <div className="stories">
      {stories.map((story) => (
        <div
          key={story.brand}
          className="story"
          onClick={() => {
            haptic();
            onSelect(story.brand);
          }}
        >
          <div className="story-ring">
            <div>
              {story.image ? (
                <img src={imageUrl(story.image)} alt={story.brand} loading="lazy" />
              ) : (
                <div className="fallback">💄</div>
              )}
            </div>
          </div>
          <span>{story.brand}</span>
        </div>
      ))}
    </div>
  );
}
