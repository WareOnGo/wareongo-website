# Warehouse image swiping

`WarehouseImageCarousel` (property detail) and `WarehouseCard` share
`useGallerySwipe`. This covers listings, location collections, editorial
overviews and related properties. Homepage featured cards have one authored
photo each; their existing horizontal scroller moves between cards.

Photos follow horizontal finger movement and show the neighbour being revealed.
Releasing a deliberate drag or short flick advances one photo, including wrapping
at either end. Small drags return to the selected photo. Transitions finish from
the release position in 240ms; reduced motion skips the transition and its lock.
Vertical gestures and pinch zoom stay with the browser. Cancellation or adding a
second finger does not select a photo.

The card binds pointer handlers to its root because the title's stretched anchor
covers the image. Gestures must begin inside the image bounds, outside buttons.
Only a horizontal drag suppresses its generated click; fresh taps, keyboard
activation, modified clicks and independent gallery/enquiry controls retain their
normal behavior.

Only the neighbour being dragged into view mounts as a preview. Idle cards retain
their existing preload and lazy-loading policy. Previews use `WarehousePhoto`'s
existing fallback and timeout handling; a failed neighbour is removed without
changing the active photo or retrying it on each drag. Drag transforms update
once per animation frame without rerendering the card for each pointer movement.

## Verification

In `../wareongo-evals`, run `npx playwright test
tests/specs/warehouse-gallery-swipe.spec.ts tests/specs/warehouse-card-links.spec.ts
--project=behaviour --workers=1` for touchscreen behavior and card-link regression
checks. Touch tests use Chromium's trusted input rather than synthetic DOM events.

Run `npm run test:images` against a fresh SSG build to check hydration, fallbacks,
timeouts, lazy loading, keyboard/dot/swipe navigation and stable gallery heights.
`npm run test:build-cache` creates an isolated fixture build for this purpose and
prints the `WEBSITE_DIR` to use. It does not publish anything.

## Adversarial review

Two issues in the initial implementation were corrected:

- Updating React state on every pointer movement rerendered the whole card.
  The hook now owns a CSS variable on the image viewport and updates it through
  `requestAnimationFrame`; React updates when preview direction or settling
  state changes. Pending frames and timers are cancelled on reset/unmount.
- The preview duplicated fallback handling by assigning an image element's
  `src` and hiding it after failure. It now uses `WarehousePhoto`, including its
  timeout and remembered successful source. A failed preview is excluded from
  the gallery without advancing the selected photo. Adversarial tests cover
  repeated drags over a broken neighbour and cancellation after a WebP fallback.

A local non-passive `touchmove` listener is intentional: Chromium could otherwise
swallow a tap immediately after a swipe. It cancels only an established horizontal
single-finger drag, and is removed when disabled or unmounted. The vertical-scroll,
second-finger, cancellation and immediate-tap checks exercise this boundary.

The 240ms settling animation still serializes photo changes. Reduced motion skips
that lock. Browser validation uses Chromium touchscreen emulation; physical
iOS/Safari performance has not been measured.
