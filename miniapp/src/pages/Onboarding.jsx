import { useState } from 'react';
import { haptic } from '../telegram.js';

const SLIDES = [
  { art: '💎', title: 'ob1Title', text: 'ob1Text' },
  { art: '🛍️', title: 'ob2Title', text: 'ob2Text' },
  { art: '🎁', title: 'ob3Title', text: 'ob3Text' },
];

export default function Onboarding({ onDone, t }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

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
          <span key={i} className={i === step ? 'on' : ''} />
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
