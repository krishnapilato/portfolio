import type { Copy, Lang } from "../i18n";
import { LANGS } from "../i18n";

type Props = {
  copy: Copy;
  lang: Lang;
  onSelect: (lang: Lang) => void;
};

export default function TopBar({ copy, lang, onSelect }: Props) {
  return (
    <header className="topbar">
      <div className="topbar__inner glass" data-light>
        <span className="mark" aria-label="Khova Krishna Pilato">
          KKP
        </span>

        <span className="status">
          <i className="status__dot" aria-hidden="true" />
          <span className="status__text">{copy.status}</span>
        </span>

        <div
          className="langswitch"
          role="group"
          aria-label={copy.languageLabel}
        >
          <span
            className="langswitch__thumb"
            data-lang={lang}
            aria-hidden="true"
          />
          {LANGS.map((option) => (
            <button
              className="langswitch__btn"
              type="button"
              key={option}
              lang={option}
              aria-pressed={option === lang}
              onClick={() => onSelect(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
