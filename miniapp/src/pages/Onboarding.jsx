import { useState } from 'react';
import { haptic } from '../telegram.js';

const SLIDES = [
  { art: '💎', title: 'ob1Title', text: 'ob1Text' },
  { art: '🛍️', title: 'ob2Title', text: 'ob2Text' },
  { art: '🎁', title: 'ob3Title', text: 'ob3Text' },
];

export default function Onboarding({ onDone, lang, setLang, t }) {
  // 0 — til tanlash, 1..3 — tanishtiruv slaydlari
  const [step, setStep] = useState(0);

  function chooseLang(value) {
    haptic();
    setLang(value);
    setStep(1);
  }

  // ===== Birinchi ekran: til =====
  // Matn ataylab ikki tilda — mijoz qaysi tilni bilishini hali bilmaymiz.
  if (step === 0) {
    return (
      <div className="onboarding">
        <div className="ob-body">
          <div className="ob-art">🌐</div>
          <h1>
            Tilni tanlang
            <br />
            Выберите язык
          </h1>

          <div className="ob-langs">
            <button
              className={`region-btn${lang === 'uz' ? ' on' : ''}`}
              onClick={() => chooseLang('uz')}
            >
              <span className="flag">🇺🇿</span>
              O‘zbekcha
            </button>

            <button
              className={`region-btn${lang === 'ru' ? ' on' : ''}`}
              onClick={() => chooseLang('ru')}
            >
              <span className="flag">🇷🇺</span>
              Русский
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== Tanishtiruv slaydlari =====
  const index = step - 1;
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="onboarding">
      <button className="ob-skip" onClick={onDone}>
        {t('skip')}
      </button>

      <div className="ob-body">
        <div className="ob-art">{slide.art}</div>
        <h1>{t(slide.title)}</h1>
        <p>{t(slide.text)}</p>
      </div>

      <div className="ob-dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={i === index ? 'on' : ''} />
        ))}
      </div>

      <div className="ob-foot">
        <button
          className="btn btn-primary"
          onClick={() => {
            haptic();
            if (isLast) onDone();
            else setStep((s) => s + 1);
          }}
        >
          {isLast ? t('start') : t('next')}
        </button>
      </div>
    </div>
  );
}
