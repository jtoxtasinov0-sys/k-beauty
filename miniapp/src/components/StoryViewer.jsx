import { useEffect, useState } from 'react';
import { imageUrl } from '../api.js';
import { haptic } from '../telegram.js';

/** Bitta story necha millisekund ko'rinadi. */
const DURATION = 5000;

/** Kartochkaning maqsadli nisbati (eni/bo'yi) — telefon ekraniga yaqin. */
const TARGET_RATIO = 0.8; // 4:5

/** Shundan ko'proq qirqiladigan bo'lsa, kartochka rasmning o'z shakliga o'tadi. */
const MAX_CROP = 0.25;

/** Ekran chetlarida qoldiriladigan joy (px): yon tomon va matn uchun past. */
const SIDE_GAP = 20;
const TEXT_GAP = 150;

/**
 * Kartochkaning aniq o'lchamini hisoblaydi.
 * CSS'ga tashlab qo'yilsa, balandlik cheklanganda en o'zgarmay qolardi —
 * uzun rasm cho'zilib ketardi. Shuning uchun piksel bilan hisoblanadi.
 */
export function frameSize(ratio, viewWidth, viewHeight) {
  const maxWidth = Math.max(120, viewWidth - SIDE_GAP);
  const maxHeight = Math.max(160, viewHeight - TEXT_GAP);

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Kartochka nisbatini tanlaydi.
 *
 * Kvadratga yaqin mahsulot rasmi 4:5 ga ozgina qirqiladi — mahsulot o'rtada
 * bo'lgani uchun bilinmaydi, lekin ekran ancha to'ladi. Keng banner yoki juda
 * uzun rasm esa yarmidan qirqilib ketmasligi uchun o'z shaklida qoladi.
 */
export function frameRatio(width, height) {
  if (!width || !height) return TARGET_RATIO;

  const ratio = width / height;
  const crop = ratio > TARGET_RATIO ? 1 - TARGET_RATIO / ratio : 1 - ratio / TARGET_RATIO;

  return crop <= MAX_CROP ? TARGET_RATIO : ratio;
}

/**
 * To'liq ekranli story ko'ruvchi — Telegram/Instagram'dagidek.
 * O'ng tomonga bosilsa keyingisi, chapga bosilsa oldingisi.
 * Mahsulotga bog'langan bo'lsa pastda "ochish" tugmasi chiqadi.
 */
export default function StoryViewer({ stories, startIndex = 0, lang, onClose, onOpenProduct, t }) {
  const [index, setIndex] = useState(startIndex);
  const [ratio, setRatio] = useState(TARGET_RATIO);
  const [view, setView] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const story = stories[index];

  // Yangi storyda nisbat qayta hisoblanadi (rasm yuklangach aniqlanadi)
  useEffect(() => {
    setRatio(TARGET_RATIO);
  }, [index]);

  // Ekran burilsa yoki Telegram oynasi o'zgarsa — qayta hisoblanadi
  useEffect(() => {
    const onResize = () => setView({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const img = imageUrl(story.imageUrl);

  return (
    <div className="story-view">
      {/*
        Xiralashgan fon: aynan shu rasmning kattalashtirilgan va xiralashgan
        nusxasi. Shu sababli rasm kesilmaydi, lekin tepa-past qora bo'lib
        qolmaydi — ekran to'liq va chiroyli ko'rinadi.
      */}
      <div className="sv-bg" style={{ backgroundImage: `url(${img})` }} />
      <div className="sv-scrim" />

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

      <div className="sv-frame" style={frameSize(ratio, view.width, view.height)}>
        <img
          key={story.id}
          className="sv-image"
          src={img}
          alt={title}
          onLoad={(e) => setRatio(frameRatio(e.target.naturalWidth, e.target.naturalHeight))}
        />
      </div>

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
