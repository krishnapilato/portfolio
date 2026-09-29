import type { Copy } from "../copy";

type Props = {
  copy: Copy;
};

export default function TopBar({ copy }: Props) {
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

      </div>
    </header>
  );
}
