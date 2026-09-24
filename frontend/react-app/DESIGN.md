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
| A dim base level inside the environment map | Between three panels of light the environment is black, and metalness-1 flats can only reflect black; a faint workshop level makes the aluminium read as machined silver in every shot. |
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
| Every generated map is built in a Web Worker before the scene mounts | Brushing the metal is seconds of per-pixel work; on the main thread it froze the page exactly when the visitor first scrolled. The scene suspends on the maps, and where a worker cannot draw the same code runs on the main thread. |
| Programs compile asynchronously with the loop held | A frame that stalls on a shader link is a dropped frame at the worst moment; the curtain lifts only after every program exists and one frame has drawn. |
| A frame-time governor steps the pixel ratio down, then the effects level | A device that cannot hold its frame rate gets a lighter film rather than a stuttering one, and never a heavier one again: a look that settles beats one that flickers. Textures and geometry stay at the tier, so a demotion never rebuilds them. |
| The first beat's words are in the HTML, the stylesheet is inlined | The page paints its opening line before any script runs, and React takes over the same markup in place. |
| The entry bundle carries no three.js: React, the store and the scroll driver only | The words and the readout need about 90 KB; the renderer's 450 KB arrive with the lazy scene chunk, never on the first paint's critical path. The attitude tracks are pure math for that reason. |
| The readiness probe runs at frame priority 0 | A positive priority tells react-three-fiber that the subscriber renders the scene itself; on the tier without a post stack that would draw nothing. |
| Render on demand | An idle page draws nothing; "trimmed" should also be true of the GPU. |
| Three device tiers with adaptive pixel ratio | A mid phone must hold its frame rate in the orbit; the high tier gets depth of field, transmission glass, a reflective bench and shadows, the low tier gets none of the post stack and CSS grain instead. |
| Reduced motion: cuts, not moves | Ten composed stills are still a film, and cuts carry no vestibular load. Lenis is not created; the camera sits on the current beat's pose and changes only at the beat boundary, while the words are away. |
| Lenis runs its frame only while something eases | An idle page must not wake the main thread every vsync for the whole visit; the loop wakes on input and on a programmatic move and stops a few frames after the scroll settles. |
| The beat index comes from the scroll, not the renderer | The readout, the keys and the URL work before the scene has loaded and without WebGL at all. |
| No chromatic aberration | A macro lens on a precision instrument has none, and it is the stock WebGL-demo tell. Grain and vignette stay. |
| Dust is sparse and never additive | Six hundred motes with normal blending read as air with a light in it; thousands with additive blending read as particles. |
| J/K, arrows, page keys, Home/End step beats; Space and horizontal arrows stay native | Every key does what a video scrubber does; the browser's own contracts are not overridden. |
| Deep links to each beat's hold point, `replaceState` only; the hash mirrors the beat | A recruiter can link straight to projects, a reload lands where the visitor was, and the back button never becomes a ten-step trap. |
| The readout tape is one slider, not ten buttons | Ten 14 px ticks are no target for a thumb and a focus ring around each would ring three; one 44 px control scrubs by hand, reads the tick under a hovering mouse, and steps with the arrow keys. |
| Hidden beats stay in the accessibility tree; only the readable one takes focus and clicks | A screen reader gets the whole article in film order; a keyboard never lands on words that cannot be seen. |
| Five contact channels, one list, Copy on email and telephone | Copying is what people do with an address; a mailto/tel link stays underneath so the action never silently fails. |
| Origin stated once, in his own headline's words, in the identity beat | "Born in Bangalore, raised in Italy" is how he already introduces himself; anything more turns a portfolio into a biography. |
| The 3D chunk behind a lazy boundary | The words paint with about 80 KB of JavaScript; the renderer arrives while the visitor reads the opening line, behind an honest OFF flag. |
| React Compiler on, `useEffectEvent` for listeners | Automatic memoisation keeps scroll-driven state from cascading; effects register once. |

## Structure

- `src/content/beats.ts` — the words. Ten beats, five contacts, one origin clause.
- `src/scene/keyframes.ts` — the shot list: pose, look target, lens, hold, via points, frame, drift.
- `src/scene/attitude.ts` — the attitude and lighting tracks as pure functions of beat time; the gimbal kinematics; the visitor trim spring.
- `src/scene/CameraRig.tsx` — scroll to camera: camera time with eased holds, arc-length pose mapping, case-frame blending, view-offset composition, portrait re-framing, render-on-demand.
- `src/scene/Instrument.tsx` — the assembly: stand, cradle, case, gimbals, sphere, jewels, practicals, trim drag.
- `src/scene/instrument/*` — the parts, each procedural.
- `src/scene/Stage.tsx`, `Post.tsx`, `Experience.tsx` — lights, environment, floor, dust; the post stack per tier; the canvas shell.
- `src/textures/*` — brushed metal, engraving, digit atlas, crackle, bench: canvas recipes, all seeded, built as one bundle in `maps.worker.ts` and uploaded by `library.ts`; `instrument.ts` and `horizon.ts` turn the maps into materials.
- `src/ui/*` — the fixed text layer with spacer tracks, the readout, the loading curtain, the links.
- `src/lib/*` — store, device tiers, beat phase math, scroll driver, interaction (keys, deep links, hold points).

## Testing

- `?tier=high|mid|low` forces a tier for testing on other hardware.
- `window.__timeline` exposes the store, `window.__camera` the camera pose and film time, for diagnostics.
- `npx tsc -b`, `npx eslint src`, `npm run build`.
