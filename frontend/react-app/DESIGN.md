# FAIR COPY — design notes and decision log

## The idea

A fair copy is the clean version an editor makes from a crowded draft. This
portfolio is set as a small printed book in which every complicated thing
(a stack, a system, a method) is lifted out of the sentence and into a
numbered footnote, so the body reads plainly and the detail stays exact
underneath it. It is Khova's own sentence turned into an object: "taking
something complicated and making it feel simple."

What each part means:

1. **Simplifying moves the complexity; it does not delete it.** A recruiter
   reads the plain sentences, an engineer reads the notes, and both are
   right.
2. **Two countries, two languages, one habit.** The second page is a
   two-column parallel text that closes into one sentence, which is the
   habit it describes.
3. **The career is a fold-out of pages** under one long footnote rule,
   printed in pencil only as far as today. After today the rule continues
   in non-repro blue, the printer's colour for marks that never print: open,
   not written yet.
4. **Every movement is something settling into the place where it is
   easiest to read.** Lines settle onto baselines, jargon steps down into
   notes, notes come into register under their sentence. Nothing flies,
   bounces or scrambles.

## How it looks

- **Paper and ink.** Warm paper `#F4F1EA`, ink `#17171C`, one light theme.
  A fair copy is ink on paper, and paper needs no glow, blur or shadow to
  look finished.
- **One accent, the copy-editor's blue pencil `#2A4A9A`** (7.3:1 on the
  paper): footnote numbers, rules, the one underlined phrase per page,
  focus rings, links on hover. Its printer's twin, non-repro blue
  `#9DB8E2`, is used only for lines that mean "not printed yet" and never
  carries text.
- **Two voices.** Newsreader (a reading serif with optical sizes) for the
  plain voice; IBM Plex Mono for the notes, labels and folios, the voice of
  the complicated original. Both are subset and self-hosted, with fallbacks
  sized to their metrics so the font swap moves nothing.
- **Book parts that work.** Folios on every page; Contents on the title
  page and an Index near the end whose page numbers are real links;
  numbered notes under their sentences; crop marks around each project
  plate (ready for press, which means shipped); a colophon at the end. No
  navbar, no footer: orientation is book design.

## How it moves

GSAP does all of it (ScrollTrigger, SplitText, DrawSVG, CustomEase). Native
scroll only: no smooth-scroll library, no snapping, no scroll capture.

- **Set, don't throw.** Text is set line by line: each line rises out of
  its own mask onto its baseline with one decelerating ease ("settle").
  Lines are split for the reveal only; screen readers read the original
  sentences. Reveals play when text reaches the reading line and un-set
  when you scroll back above it.
- **The edit.** A crowded draft becomes its fair copy under the reader's
  hand, scrubbed by the scroll. It happens in two beats so it can be read
  while it happens. First the editor marks the jargon (it turns pencil blue
  and faint) and lifts it out word by word into its numbered note, leaving
  gaps in the sentence. Then the plain words close the gaps and the page
  closes up around the shorter sentence. Scrolling back up puts the
  complexity back. Words are paired by index; `validate.ts` fails the build
  if the counts drift.
- **The pencil.** One phrase per page is underlined, drawn left to right.
  Straight rules are HTML elements scaled, not SVG strokes.
- **Registration.** Every parallax layer (ghost years, plate numerals,
  notes under a sentence) is offset in proportion to its distance from the
  middle of the screen and lines up exactly with its own text where you
  read it, which is "in register" in print terms.
- **Sideways is time.** On a wide screen the career pages travel sideways
  while you scroll down. The footnote rule under them is printed only up
  to the middle of the screen and never past today; faint years ride on a
  slower layer.
- **Cuts.** Contents and Index links jump instantly, finish any scrubbing,
  move focus to the target heading and mark the arrival with the pencil.
  Nothing races through scrubbed scenes.

## Page by page

| Folio | Page | What moves, and why |
|---|---|---|
| 1 | Title page | The name is printed by the HTML and never animated (it is the first paint). The three headline lines are set, the present tense ("Building in Java.") gets the pencil, the Contents follow. On the way out the past leaves first and the present stays longest. |
| 2 | One habit | A sticky stage. Two columns travelling at two speeds come into register; the divider retracts; the two halves become one sentence; the line that divided them returns as the pencil under "feel simple". Scrubbed. |
| 3 | In plain words | The first and largest edit, taught slowly, with a margin label that changes from Draft to Fair copy. Every tool he uses goes into one note. |
| 4–12 | Experience | Wide screens: the sideways fold-out, plain sentences above the long rule and the detail below it; five small edits; the Dublin course is a half-width tipped-in leaf; the last page is after today, on non-repro blue. Phones: the same pages in a column with a pencil spine printed to today. |
| 13–15 | Work | Three plates, each drawing completed by the scroll as its words settle: BiMap's tree of regions, provinces and municipalities; PixelPaper straightening, enhancing and collating pages (3·1·2 becomes 1·2·3), each a feature of the app; this site as a book spread. |
| 16 | Away from the desk | Aviation, as plain content in one place, built from the same parts as "In plain words", with one small edit. |
| 17 | Index | Still. Four columns of terms with the pages they appear on, all links. |
| 18 | Correspondence | Five ruled rows with Copy buttons for email and telephone; the colophon; the last rule is drawn to 40% in non-repro blue. |

## Modes

The same media conditions decide every section, so the page is always in
one mode (`src/motion/media.ts`):

- **wide** (at least 760 × 540, motion allowed): sticky stages, the
  sideways passage, registration parallax.
- **narrow** (phones upright): the same scenes in a column, scrubbed edits,
  a spine instead of the long rule.
- **short** (under 540 px tall, phones on their side): no sticky stages;
  One habit plays as a toggle when it reaches the middle.
- **still** (reduced motion): every final state, nothing travels, nothing
  scrubs. What is further down the page fades in once as it arrives
  (opacity only); anything already on screen is never hidden.
- **No JavaScript**: the prerendered page is the complete fair copy.

An inline head script marks `<html class="motion">` before the first paint,
so text awaiting its reveal is hidden from the start and nothing flashes. A
3-second safety timer shows the finished copy if the script never arrives;
a script that was only slow still gets the motion as long as the reader has
not started scrolling.

## Performance

- Prerendered HTML with the stylesheet inlined; two font preloads; no
  images, no third-party requests.
- Transforms and opacity only while scrolling. Layout is read when
  ScrollTrigger refreshes, never while scrubbing; `will-change` is set on
  the passage track only while it is active.
- CSS `position: sticky` stages instead of pinning, so there is no pin
  spacer and no layout shift; heights are in CSS from the first paint.
- React and GSAP ship in their own chunks so the app code stays small.

## Accessibility

- One `h1` (the name), one `h2` per page, `h3` per career page and plate;
  every page is a labelled section inside one `main`.
- The drafts are `aria-hidden`; the fair copy is the text. Footnote
  references are hidden from screen readers because each note sits directly
  under its sentence.
- Skip links (to Correspondence, and past the Experience passage), visible
  focus everywhere, and anything that takes focus inside the passage is
  brought to the middle first.
- Copy buttons announce through a polite live region and select the text
  if the clipboard is refused.
- Text contrast on the paper: ink 15.8:1, notes 8.7:1, labels and folios 5.7:1, pencil 7.3:1.
- Reduced motion, forced colours and print (the fair copy as a clean
  document) are all handled.

## Decision log

| # | Decision | Why |
|---|---|---|
| 1 | FAIR COPY over a flight-themed concept | The flight concept was aviation-literal at every level; aviation belongs in the content, never the design language. |
| 2 | One light theme, no toggle | Ink on paper is the concept and the most comfortable long read. |
| 3 | Accent is the copy-editor's blue pencil, never red | Blue pencil reads as care, not error; non-repro blue is its twin for "not printed yet". |
| 4 | Newsreader for prose, IBM Plex Mono for notes | The plain voice is a reading serif; the complicated original is code. |
| 5 | Instanced font subsets with metric-matched fallbacks | Keeps the optical sizes at a fraction of the size, and the swap moves nothing. |
| 6 | The name is never animated | It is the first paint, and a printed title page already carries the name. |
| 7 | SplitText lines only, `aria: "none"` | Words are never broken, and screen readers read whole sentences. |
| 8 | Edits are scrubbed and reverse on the way back up | The owner asked for the edit to follow the scroll both ways: scrolling back up is "undo". (The first spec played edits once.) |
| 9 | The edit has two beats: lift out, then close up | When both happened at once the middle of the edit was a crowd of words; in two beats the gaps show what was removed. |
| 10 | Jargon is marked pencil blue and faint before it moves | The editor marks before cutting, and while it travels the plain sentence is what you read. |
| 11 | The fair copy keeps its own height inside the edit cell | The page can then measure the space the edit frees and close up around it, instead of leaving a hole. |
| 12 | Experience is sideways on wide screens, a column on phones | A fold-out reads sideways on a desk; a thumb reads down, and a landscape phone cannot hold a page in a sticky frame. |
| 13 | The long rule is the footnote rule, printed only to today | One line separating plain words from detail across the whole career is the concept in a single stroke. |
| 14 | Years run in a low band, small enough that neighbours never touch | They are a running date, not a headline, and must never sit under the text being read. |
| 15 | Sticky stages, not ScrollTrigger pins | No pin spacers, no refresh-order bugs, no layout shift, robust under mobile URL bars. |
| 16 | No snap, no smooth-scroll library | Snap moves the page without the reader's hand; scrub smoothing gives the softness. |
| 17 | One registration law for every parallax layer | Depth is offset while you travel and aligned exactly where you read. |
| 18 | In-page jumps are instant cuts with focus | No racing through scrubbed scenes; keyboard users land where they asked. |
| 19 | Straight rules are scaled HTML; DrawSVG only for plate drawings | Composited transforms are cheap on integrated GPUs. |
| 20 | No navbar or footer; Contents, Index and colophon instead | Orientation is book design, not a menu bar. |
| 21 | Aviation is one plain chapter, "Away from the desk" | Content, not design language; the build fails if it leaks into other pages or headings. |
| 22 | Origin appears only as "Born in Bangalore, raised in Italy." and in the title headline | His own words, nothing more. |
| 23 | Reduced motion gets calm fades, not a frozen page | Movement stops completely; arrival is still marked, by opacity alone. |
| 24 | A slow script does not cost the visit its motion | The safety timer guards against a script that never arrives, not one that is merely late. |
| 25 | The build reads its own output (`check-dist.mjs`) | Wrong contacts, stray aviation or a private subject fail the build instead of shipping. The private list stays out of the repository. |
| 26 | External links open in the same tab | A book does not spawn tabs, and the back button restores the scroll position. |
| 27 | A print stylesheet prints the fair copy as a clean document | The concept is a printed book; printing it should work. |
