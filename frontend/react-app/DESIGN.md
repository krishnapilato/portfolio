# ATTITUDE — design notes and decision log

The portfolio is a short film, not a page. One machined gyroscopic attitude
indicator sits in a bench test fixture in a dark workshop; across ten scroll
beats the case pitches and rolls like an aircraft, the camera flies around
it, and the horizon inside never moves. Scrolling up plays the film
backwards.

Why this object: an attitude indicator's only job is to hold a true
reference while everything around it moves, which is straight-and-level
flight, and it is also what the owner does as an engineer: take something
complicated and make it feel light. Trim, the idea he wrote about, is the
epilogue: the controls go light, the instrument lights its own dial.

Every decision below answers "why am I making this decision?".

## Decisions

| Decision | Why |
|---|---|
| One theme, dark, no toggle | The hero is brushed metal, enamel and glass sculpted by a key and a rim; highlights, bloom, depth of field and a paint-white horizon exist only against darkness. |
| English only | A single language keeps every text block one DOM node, which the opacity timeline and the hash logic depend on. |
| No navbar, no footer, no menu | Orientation is a diegetic readout (name, tick tape with a sliding pointer, live PITCH/BANK); a person who reads instruments is given one to read. |
| Everything procedural: no models, textures, HDRIs or images | The object exists nowhere else, nothing is fetched, and the bundle carries geometry recipes instead of assets. |
| Real gimbal chain | Fixed stand, pitching cradle, rolling case; the roll gimbal counter-rotates roll, the pitch gimbal counter-rotates pitch, so the sphere is level in both axes and the rings visibly do their job in profile. |
| No yaw | A real attitude indicator cannot show heading; yawing the object shows nothing the instrument can show. |
| Pitch clamped ±35°, roll ±45° | No Euler ambiguity is reachable and the horizon is always in frame as an anchor. |
| Scroll is the timeline; every visual is a pure function of progress | Reversible by construction: scrolling up is the same film backwards, with no one-way triggers. |
| Camera: Catmull-Rom path through poses and via points, eased holds | Every move is an arc with mass; holds park the camera so the words can be read; the aviation orbit is simply a longer arc. |
| Pilot's-view beats ride with the case | The bezel stays fixed in frame while the horizon moves: the visitor learns how a pilot reads the instrument. |
| Composition by view offset, not by moving the look target | The designed framing survives every aspect ratio: object in the right 58% on landscape, in the top 55% on portrait, text never over the object's centre. |
| Lens defines horizontal framing; portrait widens the field to 62° then dollies back | The same width of the scene is visible on every screen; the object never crops and never shrinks to a dot. |
| Cold open lit by a raking light | The rim sits behind the object and cannot reach its front; a small hard light skimming the band from the front-left gives the paint edge a clean line from frame one. |
| Key = spot (shadow) + area light (specular) | A rect area light cannot cast shadows; the pair gives one shadow direction and the long graded highlight that makes brushed metal read as machined. |
| Key warms to 2800 K in the aviation beat only | The one aviation image (low sun over a horizon) that needs no sky; being the only colour change, it registers. |
| Post lights come up in the epilogue | A diegetic source inside the object: the instrument lights its own dial the way panel instruments do at night; scrolling up puts them out, which reads as dawn. |
| AgX tone mapping, bloom threshold above every diffuse value | Hot speculars stay silver and the amber practicals stay amber; only speculars and the post lights bloom, never paint or text. |
| Text in a fixed layer with spacer tracks | A sticky stage is pushed away during the last viewport of every section, which is exactly when the text must rest; a fixed layer never moves and only changes opacity. |
| One readable block at a time; in over the last 40% of the arrival, out over the first 30% of the departure | Eye-scanning calm: no two blocks are ever visible at once, and words never move with the camera. |
| Scrims on the pilot's-view beats | Those beats fill the frame with the dial by design; the words get a layer of air instead of the object being pushed away. |
| Readout name gives way to a beat counter on phones | An ellipsised name is noise; "04/10" is an instrument reading. |
| Self-hosted Instrument Sans and IBM Plex Mono | System stacks render differently on every OS; a designed hierarchy is part of the calm. Preloaded, 60 KB in total. |
| Visitor trim drag, mouse only, ±8°, springs back | The one interaction that lets a visitor test the object's claim with a hand; on touch the scroll already demonstrates it and a drag would fight the browser. |
| Render on demand | An idle page draws nothing; "trimmed" should also be true of the GPU. |
| Three device tiers with adaptive pixel ratio | A mid phone must hold its frame rate in the orbit; the high tier gets depth of field, transmission glass, a reflective bench and shadows, the low tier gets none of the post stack and CSS grain instead. |
| Reduced motion: cuts, not moves | Ten composed stills are still a film, and cuts carry no vestibular load. Lenis is not created; the camera lands on each pose. |
| J/K, arrows, page keys, Home/End step beats; Space and horizontal arrows stay native | Every key does what a video scrubber does; the browser's own contracts are not overridden. |
| Deep links to each beat's hold point, `replaceState` only | A recruiter can link straight to projects; the back button never becomes a ten-step trap. |
| Five contact channels, one list, Copy on email and telephone | Copying is what people do with an address; a mailto/tel link stays underneath so the action never silently fails. |
| Adoption stated once, as a fact, in the identity beat | One quiet clause carries the distance travelled with dignity; anything more turns a portfolio into a biography. |
| The 3D chunk behind a lazy boundary | The words paint with about 80 KB of JavaScript; the renderer arrives while the visitor reads the opening line, behind an honest OFF flag. |
| React Compiler on, `useEffectEvent` for listeners, `inert` on hidden beats | Automatic memoisation keeps scroll-driven state from cascading; effects register once; hidden text stays in the accessibility tree but out of the tab order. |

## Structure

- `src/content/beats.ts` — the words. Ten beats, five contacts, one adoption clause.
- `src/scene/keyframes.ts` — the shot list: pose, look target, lens, hold, via points, frame, drift.
- `src/scene/attitude.ts` — the attitude and lighting tracks as pure functions of beat time; the gimbal kinematics; the visitor trim spring.
- `src/scene/CameraRig.tsx` — scroll to camera: camera time with eased holds, arc-length pose mapping, case-frame blending, view-offset composition, portrait re-framing, render-on-demand.
- `src/scene/Instrument.tsx` — the assembly: stand, cradle, case, gimbals, sphere, jewels, practicals, trim drag.
- `src/scene/instrument/*` — the parts, each procedural.
- `src/scene/Stage.tsx`, `Post.tsx`, `Experience.tsx` — lights, environment, floor, dust; the post stack per tier; the canvas shell.
- `src/textures/*` — brushed metal, engraving, enamel, digit atlas, crackle: canvas and shader recipes, all seeded.
- `src/ui/*` — the fixed text layer with spacer tracks, the readout, the loading curtain, the links.
- `src/lib/*` — store, device tiers, beat phase math, scroll driver, interaction (keys, deep links, hold points).

## Testing

- `?tier=high|mid|low` forces a tier for testing on other hardware.
- `window.__timeline` exposes the store for diagnostics.
- `npx tsc -b`, `npx eslint src`, `npm run build`.
