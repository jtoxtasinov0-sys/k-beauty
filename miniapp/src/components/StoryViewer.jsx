import { useEffect, useState } from 'react';
import { imageUrl } from '../api.js';
import { haptic } from '../telegram.js';

/** Bitta story necha millisekund ko'rinadi. */
const DURATION = 5000;

/**
 * To'liq ekranli story ko'ruvchi — Telegram/Instagram'dagidek.
 * O'ng tomonga bosilsa keyingisi, chapga bosilsa oldingisi.
 * Mahsulotga bog'langan bo'lsa pastda "ochish" tugmasi chiqadi.
 */
export default function StoryViewer({ stories, startIndex = 0, lang, onClose, onOpenProduct, t }) {
  const [index, setIndex] = useState(startIndex);
  const story = stories[index];

  // Vaqt tugaganda keyingisiga o'tadi, oxirgisidan keyin yopiladi
  useEffect(() => {
    const timer = setTimeout(() => {
      if (index >= stories.length - 1) onClose();
      else setIndex(index + 1);
    }, DURATION);

    return () => clearTimeout(timer);
  }, [index, stories.length, onClose]);

  if (!story) return null;

  const title = lang === 'ru' && story.titleRu ? story.titleRu : story.title;

  function next() {
    haptic();
    if (index >= stories.length - 1) onClose();
    else setIndex(index + 1);
  }

  function prev() {
    haptic();
    if (index > 0) setIndex(index - 1);
  }

  return (
    <div className="story-view">
      {/* Yuqoridagi progress chiziqlari */}
      <div className="sv-bars">
        {stories.map((s, i) => (
          <div key={s.id} className="sv-bar">
            <span
              className={i < index ? 'sv-fill done' : i === index ? 'sv-fill run' : 'sv-fill'}
              style={i === index ? { animationDuration: `${DURATION}ms` } : undefined}
            />
          </div>
        ))}
      </div>

      <button className="sv-close" onClick={onClose} aria-label="Yopish">
        ✕
      </button>

      <img className="sv-image" src={imageUrl(story.imageUrl)} alt={title} />

      {/* Bosish sohalari: chap chorak — orqaga, qolgani — oldinga */}
      <button className="sv-tap sv-tap-left" onClick={prev} aria-label="Oldingi" />
      <button className="sv-tap sv-tap-right" onClick={next} aria-label="Keyingi" />

      <div className="sv-foot">
        <div className="sv-title">{title}</div>

        {story.productId && (
          <button
            className="sv-cta"
            onClick={() => {
              haptic('medium');
              onOpenProduct(story.productId);
            }}
          >
            {t('openProduct')}
          </button>
        )}
      </div>
    </div>
  );
}
