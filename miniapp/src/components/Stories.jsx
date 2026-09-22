import { imageUrl } from '../api.js';
import { haptic } from '../telegram.js';

/**
 * Bosh sahifadagi dumaloq storylar.
 * Ro'yxat admin panelda tuziladi — bu yerda hech narsa o'ylab topilmaydi.
 * Story yo'q bo'lsa qator umuman ko'rinmaydi.
 */
export default function Stories({ stories, lang, onOpen }) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="stories">
      {stories.map((story, i) => {
        const title = lang === 'ru' && story.titleRu ? story.titleRu : story.title;

        return (
          <div
            key={story.id}
            className="story"
            onClick={() => {
              haptic();
              onOpen(i);
            }}
          >
            <div className="story-ring">
              <div>
                {story.imageUrl ? (
                  <img src={imageUrl(story.imageUrl)} alt={title} loading="lazy" />
                ) : (
                  <div className="fallback">💄</div>
                )}
              </div>
            </div>
            <span>{title}</span>
          </div>
        );
      })}
    </div>
  );
}
