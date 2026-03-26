(() => {
  const strip = document.getElementById("photo-strip");
  if (!strip) return;

  let isPointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let isInteractingUntil = 0;

  // Auto-scroll using scrollLeft so user can still drag/scroll.
  const speedPxPerSecond = 12; // slow
  let lastT = performance.now();

  const getLoopPoint = () => {
    const content = strip.scrollWidth;
    // We duplicate items in HTML, so loop at half the content.
    return content > 0 ? content / 2 : 0;
  };

  const markInteracting = (ms = 1200) => {
    isInteractingUntil = Math.max(isInteractingUntil, performance.now() + ms);
  };

  const tick = (t) => {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    if (performance.now() > isInteractingUntil && !isPointerDown) {
      const loopPoint = getLoopPoint();
      if (loopPoint > 0) {
        strip.scrollLeft += speedPxPerSecond * dt;
        if (strip.scrollLeft >= loopPoint) strip.scrollLeft -= loopPoint;
      }
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Drag-to-scroll (mouse + touch via pointer events)
  strip.addEventListener("pointerdown", (e) => {
    // Prevent native image drag / text selection
    e.preventDefault();
    isPointerDown = true;
    strip.classList.add("is-dragging");
    strip.setPointerCapture?.(e.pointerId);
    startX = e.clientX;
    startScrollLeft = strip.scrollLeft;
    markInteracting(2000);
  });

  strip.addEventListener("pointermove", (e) => {
    if (!isPointerDown) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    strip.scrollLeft = startScrollLeft - dx;
    markInteracting(2000);
  });

  const endDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    strip.classList.remove("is-dragging");
    markInteracting(1500);
  };

  strip.addEventListener("pointerup", endDrag);
  strip.addEventListener("pointercancel", endDrag);
  strip.addEventListener("pointerleave", endDrag);

  // Trackpad/wheel scroll should pause auto-scroll briefly.
  strip.addEventListener(
    "wheel",
    () => {
      markInteracting(1200);
    },
    { passive: true }
  );
})();

