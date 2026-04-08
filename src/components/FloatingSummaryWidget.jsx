import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./FloatingSummaryWidget.module.css";

const DRAG_THRESHOLD = 5;
const COLLAPSE_AFTER_SNAP_MS = 300;
const NAV_TOP = 72;
const BOTTOM_RESERVE = 130;

const COLLAPSED_W = 40;
const COLLAPSED_H = 48;
const EXPANDED_W = 64;
const EXPANDED_H = 80;

function ChecklistIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17h8M9 6h8M9 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingSummaryWidget({ frameRef, onOpenPanel }) {
  const [collapsed, setCollapsed] = useState(true);
  const [dockedSide, setDockedSide] = useState("right");
  const [centerY, setCenterY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState(null);

  const dragMovedRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const centerStartRef = useRef({ x: 0, y: 0 });
  const captureTargetRef = useRef(null);
  const collapseAfterSnapRef = useRef(null);

  const getFrameRect = useCallback(() => {
    const el = frameRef?.current;
    if (!el) return { width: 390, height: 844, left: 0, top: 0 };
    return el.getBoundingClientRect();
  }, [frameRef]);

  const getWidgetSize = () => (collapsed ? { w: COLLAPSED_W, h: COLLAPSED_H } : { w: EXPANDED_W, h: EXPANDED_H });

  const clampCenterY = useCallback(
    (cy, w, h) => {
      const { height } = getFrameRect();
      const minY = NAV_TOP + h / 2 + 4;
      const maxY = height - BOTTOM_RESERVE - h / 2 - 4;
      return Math.min(maxY, Math.max(minY, cy));
    },
    [getFrameRect]
  );

  const clearCollapseAfterSnap = useCallback(() => {
    if (collapseAfterSnapRef.current) {
      clearTimeout(collapseAfterSnapRef.current);
      collapseAfterSnapRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    const el = frameRef?.current;
    if (!el) return;
    const { height } = el.getBoundingClientRect();
    setCenterY(height / 2);
  }, [frameRef]);

  const dockedCenterX = useCallback(
    (side, w) => {
      const { width } = getFrameRect();
      return side === "left" ? w / 2 : width - w / 2;
    },
    [getFrameRect]
  );

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    clearCollapseAfterSnap();
    captureTargetRef.current = e.currentTarget;
    e.currentTarget.setPointerCapture(e.pointerId);

    dragMovedRef.current = false;

    const frame = getFrameRect();
    const { w, h } = getWidgetSize();
    const cx = dockedCenterX(dockedSide, w);
    const cy = centerY != null ? centerY : frame.height / 2;

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    centerStartRef.current = { x: cx, y: cy };
  };

  const onPointerMove = (e) => {
    if (!captureTargetRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    const pastThreshold = Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD;
    if (!dragMovedRef.current && !pastThreshold) return;

    if (!dragMovedRef.current && pastThreshold) {
      dragMovedRef.current = true;
      setIsDragging(true);
    }

    const frame = getFrameRect();
    const { w, h } = getWidgetSize();

    let ncx = centerStartRef.current.x + dx;
    let ncy = centerStartRef.current.y + dy;

    ncx = Math.min(frame.width - w / 2, Math.max(w / 2, ncx));
    ncy = clampCenterY(ncy, w, h);

    setDragPos({ cx: ncx, cy: ncy });
    setCenterY(ncy);
  };

  const onPointerUp = (e) => {
    const cap = captureTargetRef.current;
    captureTargetRef.current = null;
    if (cap?.releasePointerCapture) {
      try {
        cap.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    if (dragMovedRef.current && dragPos) {
      const frame = getFrameRect();
      const { w, h } = getWidgetSize();
      const mid = frame.width / 2;
      const nextSide = dragPos.cx < mid ? "left" : "right";
      setDockedSide(nextSide);
      setCenterY(clampCenterY(dragPos.cy, w, h));
      setDragPos(null);
      setIsDragging(false);
      dragMovedRef.current = false;

      clearCollapseAfterSnap();
      collapseAfterSnapRef.current = setTimeout(() => {
        setCollapsed(true);
        collapseAfterSnapRef.current = null;
      }, COLLAPSE_AFTER_SNAP_MS);
      return;
    }

    dragMovedRef.current = false;
    setIsDragging(false);
    setDragPos(null);

    if (collapsed) {
      setCollapsed(false);
    } else {
      onOpenPanel();
    }
  };

  const onPointerCancel = (e) => {
    clearCollapseAfterSnap();
    if (dragMovedRef.current) {
      setCenterY(centerStartRef.current.y);
    }
    setIsDragging(false);
    setDragPos(null);
    dragMovedRef.current = false;
    const cap = captureTargetRef.current;
    captureTargetRef.current = null;
    if (cap?.releasePointerCapture) {
      try {
        cap.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  useEffect(
    () => () => {
      clearCollapseAfterSnap();
    },
    [clearCollapseAfterSnap]
  );

  const { w, h } = getWidgetSize();

  let positionStyle;
  if (isDragging && dragPos) {
    positionStyle = {
      left: dragPos.cx - w / 2,
      top: dragPos.cy - h / 2,
      right: "auto",
      transform: "none"
    };
  } else {
    if (dockedSide === "right") {
      positionStyle = {
        right: 0,
        left: "auto",
        top: centerY != null ? centerY : "50%",
        transform: centerY != null ? "translateY(-50%)" : "translateY(-50%)"
      };
    } else {
      positionStyle = {
        left: 0,
        right: "auto",
        top: centerY != null ? centerY : "50%",
        transform: centerY != null ? "translateY(-50%)" : "translateY(-50%)"
      };
    }
  }

  const transitionCombined = isDragging
    ? "none"
    : "left 0.2s ease, right 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease, border-radius 0.2s ease";

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.widget} ${collapsed ? styles.widgetCollapsed : styles.widgetExpanded} ${
        dockedSide === "left" ? styles.dockLeft : styles.dockRight
      } ${isDragging ? styles.dragging : ""}`}
      style={{
        ...positionStyle,
        width: w,
        height: h,
        transition: transitionCombined
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (collapsed) setCollapsed(false);
          else onOpenPanel();
        }
      }}
      aria-label={collapsed ? "Expand service summary widget" : "Open service summary"}
    >
      {collapsed ? (
        <span className={styles.collapsedPulseDot} aria-hidden="true" />
      ) : (
        <>
          <ChecklistIcon className={styles.expandedCheckIcon} />
          <span className={styles.expandedSummaryText}>Summary</span>
          <div className={styles.expandedActiveRow}>
            <span className={styles.expandedActiveDot} aria-hidden="true" />
            <span className={styles.expandedActiveLabel}>Active</span>
          </div>
        </>
      )}
    </div>
  );
}
