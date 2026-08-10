import { useEffect } from "react";

/** Within this distance of a beat the page counts as seated. */
const SEATED_PX = 8;
/** Idle time after the last scroll event before re-seating (fallback path). */
const SETTLE_MS = 120;
/**
 * After a glide starts, the settle pass never issues a corrective scroll
 * within this window – a mid-glide settle (janky frames on mobile) would
 * otherwise "yank" the page right after landing.
 */
const GLIDE_GRACE_MS = 1200;
/** Accumulated wheel delta (px) that commits a beat advance. */
const WHEEL_TRIGGER_PX = 40;
/** Wheel events further apart than this start a new gesture. */
const WHEEL_GESTURE_GAP_MS = 250;
/** Touch drag distance (px) that commits a beat advance. */
const TOUCH_TRIGGER_PX = 24;
/**
 * Leaving the free end-zone (conclusion) upward needs a deliberate gesture,
 * so small reading adjustments near the conclusion heading don't eject the
 * reader back into the chart scene.
 */
const FREE_ZONE_EXIT_WHEEL_PX = 150;
const FREE_ZONE_EXIT_TOUCH_PX = 90;

/**
 * Collect the scroll positions of every story beat, derived from the
 * `data-story-*` attributes the sections expose:
 *
 * - static sections: one beat, centered in the viewport (or top-aligned
 *   when the section is taller than the viewport, e.g. the hero); sections
 *   that overflow the viewport substantially (landscape phones) get evenly
 *   spaced extra beats so no content is skipped over – except the last
 *   section, whose overflow is the free-scroll end zone
 * - pinned sections: one beat per pin-step at its canonical position –
 *   mid-span for "floor" sections, exact milestones for "round" ones –
 *   offset past any enter zone and short of any exit zone
 */
function collectBeats(viewport: number): number[] {
  const scrollY = window.scrollY;
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-story-section]"),
  );
  const beats: number[] = [];

  for (const [index, section] of sections.entries()) {
    const rect = section.getBoundingClientRect();
    const top = scrollY + rect.top;
    const stepCount = Number(section.dataset.storySteps ?? "1");
    const pinDistance = rect.height - viewport;

    if (stepCount <= 1 || pinDistance <= 0) {
      const overflow = rect.height - viewport;
      const isLast = index === sections.length - 1;
      if (!isLast && overflow > viewport * 0.25) {
        // Too tall for one viewport: overlapping beats through the section.
        const pages = Math.ceil(rect.height / viewport);
        for (let i = 0; i < pages; i++) {
          beats.push(top + (overflow * i) / (pages - 1));
        }
        continue;
      }
      beats.push(
        rect.height >= viewport ? top : top - (viewport - rect.height) / 2,
      );
      continue;
    }

    const enterPx =
      (Number(section.dataset.storyEnterVh ?? "0") / 100) * viewport;
    const exitPx =
      (Number(section.dataset.storyExitVh ?? "0") / 100) * viewport;
    const stepsPx = Math.max(pinDistance - enterPx - exitPx, 0);
    const round = (section.dataset.storySnap ?? "floor") === "round";

    for (let i = 0; i < stepCount; i++) {
      const frac = round
        ? i / Math.max(stepCount - 1, 1)
        : (i + 0.5) / stepCount;
      beats.push(top + enterPx + frac * stepsPx);
    }
  }

  const maxScroll = Math.max(
    document.documentElement.scrollHeight - viewport,
    0,
  );
  return beats
    .map((beat) => Math.min(Math.max(Math.round(beat), 0), maxScroll))
    .sort((a, b) => a - b);
}

function nearestBeatIndex(beats: number[], y: number): number {
  let nearest = 0;
  for (let i = 1; i < beats.length; i++) {
    if (Math.abs(beats[i] - y) < Math.abs(beats[nearest] - y)) nearest = i;
  }
  return nearest;
}

/**
 * Shared snap state: the hook and the scroll-hint chevron both advance
 * through the same beat sequence, so they can never disagree about where
 * the reader is or where "next" lands.
 */
const state = {
  /** Index of the beat the reader is seated on (or gliding toward). */
  anchor: null as number | null,
  gliding: false,
  glideTarget: 0,
  lastGlideAt: 0,
  /**
   * Scroll position of the last beat (the conclusion). From here on the
   * page is a free-scroll zone: the conclusion can be taller than the
   * viewport and the footer follows it, so input stays native and no
   * snapping happens.
   */
  freeZoneStart: null as number | null,
};

function startGlide(top: number) {
  state.gliding = true;
  state.glideTarget = top;
  state.lastGlideAt = Date.now();
  // Beat glides own the scroll position – cancel any scene exit ride that
  // would otherwise fight the browser smooth scroll through the same zone.
  window.dispatchEvent(new CustomEvent("story-glide-start"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}

/** Whether a beat glide is in flight (used by pinned scenes to avoid competing scroll rides). */
export function isStoryGliding() {
  return state.gliding;
}

/**
 * Glide exactly one beat forward or backward from the current anchor.
 * Also used by the scroll-hint chevron so a click always matches what a
 * scroll gesture would do.
 */
export function advanceStoryBeat(direction: 1 | -1) {
  const viewport = window.innerHeight;
  const y = window.scrollY;
  const beats = collectBeats(viewport);
  if (beats.length === 0) return;

  const last = beats.length - 1;
  state.freeZoneStart = beats[last];

  let top: number;
  if (y > beats[last] + SEATED_PX) {
    // Inside the free end-zone (conclusion overflow / footer): any beat
    // navigation from here first returns to the conclusion's start.
    state.anchor = last;
    top = beats[last];
  } else {
    // Trust the anchor only while it still describes reality: it goes stale
    // after native scrolling with no settle pass (reduced motion, or the
    // window before a settle fires) and its index shifts when a resize or
    // rotation changes the beat count. Mid-glide the anchor is the glide
    // target, so distance from the viewport is expected.
    const anchor = state.anchor;
    const from =
      anchor !== null &&
      anchor < beats.length &&
      (state.gliding || Math.abs(y - beats[anchor]) < viewport * 0.75)
        ? anchor
        : nearestBeatIndex(beats, y);
    if (
      direction === -1 &&
      from === last &&
      Math.abs(y - beats[last]) > SEATED_PX
    ) {
      // Coming back up out of the end zone (or having overshot its top on
      // momentum): stop at the conclusion heading before leaving it.
      top = beats[last];
    } else {
      const target = Math.min(Math.max(from + direction, 0), last);
      state.anchor = target;
      top = beats[target];
    }
  }

  if (Math.abs(top - y) <= SEATED_PX) return;
  startGlide(top);
}

/** How a single gesture is handled – decided once, then sticky. */
type GestureMode = "hijack" | "native";

/**
 * Story navigation: wheel and touch input is intercepted, and each gesture
 * triggers exactly one glide to the next/previous story beat – no native
 * pre-scroll, no momentum skipping steps. The glide itself animates the
 * scroll position, so all scroll-driven scenes still play their
 * transitions.
 *
 * The conclusion + footer form a free end-zone with native scrolling.
 * Whether a gesture is native or hijacked is decided ONCE per gesture from
 * where it started (mid-gesture `preventDefault` is unreliable on mobile):
 *
 * - started above the zone: hijacked beat navigation
 * - started seated on the conclusion top: downward drags are native (into
 *   the zone), upward drags are hijacked with a deliberate-exit threshold
 * - started deep in the zone: fully native; if momentum flings the reader
 *   out above the zone, the settle pass returns them to the conclusion top
 *
 * Scrollbar drags and keyboard scrolling stay native; a settle pass seats
 * the page on the nearest beat once that movement stops. Disabled under
 * `prefers-reduced-motion` (the chevron still works, jumping instantly).
 */
export function useStoryAutoSnap() {
  useEffect(() => {
    state.anchor = null;
    state.gliding = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let settleTimer: number | null = null;
    let touchActive = false;
    /** Last touch input – lets a lost touchend (iOS system gestures, JS
     * alerts) expire instead of blocking the settle pass forever. */
    let lastTouchAt = 0;
    const TOUCH_STALE_MS = 600;

    // Wheel gesture tracking
    let wheelAccum = 0;
    let lastWheelAt = 0;
    let wheelStartScrollY = 0;
    /** Swallow trailing momentum events after a glide has been triggered. */
    let wheelCooling = false;

    // Touch gesture tracking
    let touchStartClientY: number | null = null;
    let touchStartScrollY = 0;
    let touchMode: GestureMode | null = null;
    let touchTriggered = false;

    /**
     * Overlays (search dialog, header dropdowns) portal outside the story
     * sections and manage their own scrolling – leave their input alone.
     */
    const isInsideOverlay = (target: EventTarget | null) =>
      target instanceof Element &&
      target.closest(
        '[role="dialog"], [role="menu"], [data-radix-popper-content-wrapper]',
      ) !== null;

    const startedSeatedAtLast = (startY: number) =>
      state.freeZoneStart !== null &&
      Math.abs(startY - state.freeZoneStart) <= SEATED_PX;

    const startedDeepInZone = (startY: number) =>
      state.freeZoneStart !== null && startY > state.freeZoneStart + SEATED_PX;

    /** Re-seat on the nearest beat after native scrolling (scrollbar, keys). */
    const settle = () => {
      const y = window.scrollY;
      const beats = collectBeats(window.innerHeight);
      if (beats.length === 0) return;
      const last = beats.length - 1;
      state.freeZoneStart = beats[last];

      // Mid-glide: don't clear gliding or rewrite the anchor until the
      // smooth scroll has landed – touchend schedules settle ~120ms in,
      // often while the browser is still animating.
      if (state.gliding && Math.abs(y - state.glideTarget) > SEATED_PX) {
        const sinceGlide = Date.now() - state.lastGlideAt;
        if (settleTimer !== null) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(
          settle,
          Math.max(GLIDE_GRACE_MS - sinceGlide, SETTLE_MS),
        );
        return;
      }
      state.gliding = false;
      // From the conclusion onward scrolling is free – never snap there.
      if (y > beats[last] + SEATED_PX) {
        state.anchor = last;
        return;
      }
      // A native fling up out of the end zone (touch momentum) must stop
      // at the conclusion heading, not wherever the momentum ran out. Only
      // near-zone escapes qualify – a deliberate long-distance jump
      // (scrollbar drag, Home key) re-anchors normally instead of being
      // dragged all the way back down.
      if (
        state.anchor === last &&
        y < beats[last] - SEATED_PX &&
        y > beats[last] - window.innerHeight
      ) {
        startGlide(beats[last]);
        return;
      }
      // Small displacements re-seat on the anchored beat (residual momentum
      // shouldn't hand the reader to a neighbouring beat); big movements
      // (scrollbar drags, Home/End) re-anchor on whatever is nearest.
      const nearest = nearestBeatIndex(beats, y);
      const anchored =
        state.anchor !== null &&
        state.anchor <= last &&
        Math.abs(y - beats[state.anchor]) < window.innerHeight * 0.75;
      const target = anchored ? (state.anchor as number) : nearest;
      state.anchor = target;
      if (Math.abs(beats[target] - y) <= SEATED_PX) return;
      // Corrective scrolls are for genuinely native movement (scrollbar,
      // keyboard). Right after a glide they'd read as a "yank" on landing,
      // so retry once the grace window has passed – if residual momentum
      // (or a browser quirk) left the page off-beat, that late pass quietly
      // re-seats it.
      const sinceGlide = Date.now() - state.lastGlideAt;
      if (sinceGlide < GLIDE_GRACE_MS) {
        if (settleTimer !== null) window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(
          settle,
          Math.max(GLIDE_GRACE_MS - sinceGlide, SETTLE_MS),
        );
        return;
      }
      startGlide(beats[target]);
    };

    const scheduleSettle = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_MS);
    };

    const onScroll = () => {
      if (state.gliding && Math.abs(window.scrollY - state.glideTarget) <= 2) {
        state.gliding = false;
      }
      // While a finger is down the page may pause without the gesture being
      // over – never let a settle fire (and snap) mid-touch. If no touch
      // input has arrived for a while, assume the touchend was lost.
      if (touchActive) {
        if (performance.now() - lastTouchAt < TOUCH_STALE_MS) return;
        touchActive = false;
      }
      scheduleSettle();
    };

    const onWheel = (event: WheelEvent) => {
      // Ctrl+wheel is pinch/zoom – leave it alone.
      if (event.ctrlKey) return;
      if (isInsideOverlay(event.target)) return;

      const now = performance.now();
      const freshGesture = now - lastWheelAt > WHEEL_GESTURE_GAP_MS;
      lastWheelAt = now;
      if (freshGesture) {
        wheelAccum = 0;
        wheelStartScrollY = window.scrollY;
      }

      // Gestures that started deep in the end zone stay native. If momentum
      // carries the page out above the zone, block further movement and let
      // the settle pass return to the conclusion top.
      if (startedDeepInZone(wheelStartScrollY)) {
        if (
          state.freeZoneStart !== null &&
          window.scrollY < state.freeZoneStart - SEATED_PX
        ) {
          event.preventDefault();
        }
        return;
      }

      // Seated on the conclusion top: scrolling down into the zone is
      // native; only upward gestures engage beat navigation.
      if (startedSeatedAtLast(wheelStartScrollY) && event.deltaY > 0) {
        return;
      }

      event.preventDefault();

      if (state.gliding) {
        wheelCooling = true;
        return;
      }
      if (wheelCooling) {
        if (!freshGesture) return;
        wheelCooling = false;
      }

      const delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
      wheelAccum += delta;

      // Backing out of the end zone takes a deliberate gesture.
      const trigger = startedSeatedAtLast(wheelStartScrollY)
        ? FREE_ZONE_EXIT_WHEEL_PX
        : WHEEL_TRIGGER_PX;

      if (Math.abs(wheelAccum) >= trigger) {
        const direction = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;
        wheelCooling = true;
        advanceStoryBeat(direction);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchActive = true;
      lastTouchAt = performance.now();
      if (event.touches.length === 1) {
        touchStartClientY = event.touches[0].clientY;
        touchStartScrollY = window.scrollY;
        touchMode = null;
        touchTriggered = false;
      } else {
        // Multi-touch (pinch zoom) stays native for the whole gesture.
        touchMode = "native";
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      lastTouchAt = performance.now();
      if (touchStartClientY === null) return;
      if (isInsideOverlay(event.target)) return;
      const delta = touchStartClientY - event.touches[0].clientY;

      // Decide the gesture's fate once, on its very first movement, based
      // on where it STARTED. iOS ignores preventDefault after an unprevented
      // first touchmove, so hijacked gestures must be prevented immediately.
      if (touchMode === null) {
        if (startedDeepInZone(touchStartScrollY)) {
          touchMode = "native";
        } else if (startedSeatedAtLast(touchStartScrollY)) {
          // Direction decides: down reads into the zone natively, up is a
          // deliberate exit. Only zero-delta moves need preventDefault to
          // stop iOS claiming the gesture before direction is known.
          if (delta === 0) {
            event.preventDefault();
            return;
          }
          touchMode = delta > 0 ? "native" : "hijack";
          if (touchMode === "native") return;
        } else {
          touchMode = "hijack";
        }
      }

      if (touchMode === "native") return;

      event.preventDefault();
      if (state.gliding || touchTriggered) return;

      // Backing out of the end zone takes a deliberate drag.
      const trigger = startedSeatedAtLast(touchStartScrollY)
        ? FREE_ZONE_EXIT_TOUCH_PX
        : TOUCH_TRIGGER_PX;

      if (Math.abs(delta) >= trigger) {
        touchTriggered = true;
        advanceStoryBeat(delta > 0 ? 1 : -1);
      }
    };

    const onTouchEnd = () => {
      touchActive = false;
      touchStartClientY = null;
      touchMode = null;
      scheduleSettle();
    };

    // Rotation/resize changes the beat list (overflowing sections gain or
    // lose beats), so the anchor index no longer matches. Re-anchor from
    // scratch and re-seat on the nearest beat in the new geometry.
    const onResize = () => {
      state.anchor = null;
      scheduleSettle();
    };

    // Anchor to the current beat right away so the first gesture advances
    // from where the reader actually is.
    scheduleSettle();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
    };
  }, []);
}
