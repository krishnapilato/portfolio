export function Mark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m16 2 13 7.5v13L16 30 3 22.5v-13Z" /><path d="M11 9v14m10-14-10 8m4-3 7 9" /></svg>;
}

export function Orbit() {
  return <div className="identity-art" aria-hidden="true">
    <svg viewBox="0 0 520 520" fill="none">
      <path className="diagram-grid" d="M260 0v520M0 260h520" />
      <g data-orbit>
        <circle className="diagram-line" cx="260" cy="260" r="223" />
        <circle className="diagram-line" cx="260" cy="260" r="186" />
        <path className="diagram-boundary" d="m260 67 167 96.5v193L260 453 93 356.5v-193Z" />
        <path className="diagram-boundary faint" d="m260 112 128 74v148l-128 74-128-74V186Z" />
        <circle className="diagram-node" cx="260" cy="37" r="5" /><circle className="diagram-node" cx="67" cy="372" r="5" /><circle className="diagram-node" cx="453" cy="372" r="5" />
      </g>
      <path className="diagram-core" d="m260 158 88 51v102l-88 51-88-51V209Z" />
      <path className="diagram-monogram" d="M232 221v78m56-78-56 43m23-18 37 53" />
    </svg>
    <span className="coordinate coordinate-top">PAVIA, ITALY</span>
    <span className="coordinate coordinate-side">BUILT ON TRUST</span>
    <span className="coordinate coordinate-bottom">PRECISION / PURPOSE / CARE</span>
  </div>;
}

export function ProjectArt({ type }: { type: "map" | "scanner" }) {
  return type === "map" ? <div className="project-visual map-visual" aria-hidden="true">
    <div className="visual-topline"><span>BIMAP / TERRITORY EXPLORER</span><span>01:02</span></div>
    <svg viewBox="0 0 600 400" fill="none">
      <path className="map-river" d="M-20 329C105 340 138 202 242 220S390 310 437 187 533 93 625 109" />
      <g className="map-parcels"><path d="m18 48 103-20 33 90-100 32Zm150-25 110 28-31 88-79-14Zm148 42 101-19 12 93-122 18ZM31 194l92-38 39 79-77 47Zm155-35 91 12-9 83-89-13Zm142 36 74-27 12 72-70 25Zm119-47 99 11-17 89-76-14ZM84 326l94-46 36 78-96 35Zm155-33 83 13-6 73-75-9Zm112 8 93-36 27 93-101 27Zm135-24 77-15 19 99-91 11Z" /></g>
      <path className="map-route" d="M130 364 197 276 221 193 353 196 470 123" />
      <circle className="map-point" cx="353" cy="196" r="10" /><circle className="map-point-center" cx="353" cy="196" r="3" />
      <path className="map-cross" d="M353 165v-16m0 78v16m-31-47h-16m78 0h16" />
    </svg>
    <div className="visual-bottomline"><span>LAND. HERITAGE. CONTEXT.</span><span>↗ N</span></div>
  </div> : <div className="project-visual scanner-visual" aria-hidden="true">
    <div className="visual-topline"><span>PIXELPAPER / ON-DEVICE</span><span>OFFLINE FIRST</span></div>
    <div className="scan-document"><span className="scan-doc-label">THE EVERYDAY, DIGITIZED.</span><span className="scan-title">A clearer<br />kind of copy.</span><i /><i /><i /><span className="scan-seal">P</span></div>
    <div className="scan-frame"><span className="scan-line" data-scan /></div>
    <div className="visual-bottomline"><span>EDGE DETECTION + OCR</span><span>NO CLOUD REQUIRED</span></div>
  </div>;
}

export function FlightArt() {
  return <div className="flight-art" aria-hidden="true"><span className="flight-coordinate">BLR ───────── IT</span><svg viewBox="0 0 400 440" fill="none"><circle cx="200" cy="205" r="160" /><circle cx="200" cy="205" r="120" /><path className="flight-path" d="M78 326C78 81 322 326 322 84" /><path d="M200 25v44m0 272v44M20 205h44m272 0h44" /><path className="plane" d="m200 145 13 50 46 32v12l-46-17-3 37 16 15v8l-26-9-26 9v-8l16-15-3-37-46 17v-12l46-32Z" /></svg><span className="flight-caption">CHECK. CONSIDER. COMMIT.</span></div>;
}
