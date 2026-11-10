# Design system

Every page a service shows (landing, error, subscription, demo) uses one stylesheet, `core/src/main/resources/static/assets/core.css`. A service adds layout of its own, never colours, fonts or sizes: those are tokens, and each has a reason.

The API reference is the exception: Swagger UI keeps its own default look. Developers already know it, its method colours are a shared convention across tools, and leaving it untouched means every Swagger UI update applies as it is.

## Principles

1. **Quiet.** These pages sit next to someone else's product. They inform and step aside.
2. **One meaning per colour.** If a colour appears, it says something; if it says nothing, it is grey.
3. **Nothing from outside.** No web fonts, no icon fonts, no images from a CDN: a page that loads nothing from third parties tells them nothing about who is reading it.
4. **Readable by everyone.** Every text pair meets WCAG 2.2 AA contrast in both themes, every control is at least 44 px tall, and motion stops when the system asks for less of it.

## Colour

| Token | Light | Dark | Why |
|---|---|---|---|
| `--color-paper` | `#f7f6f3` | `#141518` | Warm off-white: pure white glares on long reading, and the warmth keeps it from feeling clinical. |
| `--color-surface` | `#ffffff` | `#1c1d21` | One step above the paper, for things that sit on it. |
| `--color-ink` | `#1c1d21` | `#ecebe6` | Near-black, not black: full black on off-white vibrates. |
| `--color-muted` | `#5b5e66` | `#a5a8b0` | Secondary text. Still above 4.5 : 1 on the paper. |
| `--color-line` | `#dedcd6` | `#30323a` | Borders: visible structure without boxes shouting. |
| `--color-action` | `#2448c9` | `#8fa8ff` | **The only accent.** Blue is the colour people already read as "this is a link or a button", so it needs no explanation. It marks the one thing to do next, never decoration. |
| `--color-done` | same as action | same as action | A finished state (sent, confirmed) is the positive end of an action, so it reuses the action colour instead of adding a green. |
| `--color-waiting` | `#8a5a00` | `#e5b55c` | Amber for "not yet": pending, queued. Warm and noticeable, without alarm. |
| `--color-stopped` | `#a3261f` | `#ff8f86` | Red for "this will not happen": failed, unsubscribed. |

There is no green. A second positive colour would compete with the accent and mean nothing extra.

State colours appear only on a `.badge`, and a badge always contains the word for the state. Someone who cannot tell the colours apart reads the same thing.

## Type

- **Text:** the system interface font (`system-ui`, then Segoe UI, Roboto). It is already on every device, so pages render at once and nothing is downloaded, and it is the font people read all day on that device.
- **Code and ids:** the system monospace font, for identifiers that must be read character by character.
- **Scale:** a major third (×1.25), from 0.8 rem to about 3 rem. Each step is clearly different from the next, and six steps cover every need. The display size shrinks with the screen (`clamp`) so a heading never wraps word by word on a phone.
- **Line length:** text stops at 38 rem, about 70 characters, where reading is easiest.

## Space

A 4 px grid: every margin, padding and gap is a token from `--space-1` (4 px) to `--space-12` (48 px). Edges line up across pages without anyone measuring, and the steps are coarse enough that the choice between two of them is obvious.

## Shape

- Controls have a 6 px radius, containers 12 px: the inner shape is tighter than the outer one, as it is in the physical objects they imitate.
- Every interactive element is at least 44 px tall: the minimum target size for a finger.
- Focus is a 2 px ring in the action colour, offset from the control so it never hides its border.

## Changing it

Change a token in `core.css`, rebuild, and every service picks it up. Add a token only with a reason in the table above.
