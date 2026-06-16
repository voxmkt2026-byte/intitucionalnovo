"use client";

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
  HTMLAttributes
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
  )
);
Card.displayName = 'Card';

interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  children: ReactNode;
}

interface Slot {
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  opacity: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  scale: 1 - i * 0.04,
  zIndex: total - i,
  opacity: 1 - i * 0.15,
});

const placeNow = (el: HTMLDivElement | null, slot: Slot) => {
  if (!el) return;
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    xPercent: -50,
    yPercent: -50,
    scale: slot.scale,
    zIndex: slot.zIndex,
    opacity: slot.opacity,
    force3D: true,
  });
};

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<any>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isHovered = useRef(false);
  const isAnimating = useRef(false);
  const goToCardRef = useRef<(idx: number) => void>(() => {});

  useEffect(() => {
    const total = refs.length;

    // Place all cards in initial positions
    order.current.forEach((idx, i) => {
      placeNow(refs[idx].current, makeSlot(i, cardDistance, verticalDistance, total));
    });

    const animateToOrder = (newOrder: number[], duration = 0.7) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // Kill any existing timeline
      if (tlRef.current) {
        tlRef.current.kill();
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        }
      });
      tlRef.current = tl;

      // Get the front card that's being sent to back
      const oldFront = order.current[0];
      const oldFrontEl = refs[oldFront].current;

      // First: fade out + scale down the old front card
      if (oldFrontEl && !newOrder.includes(oldFront) === false) {
        const newPos = newOrder.indexOf(oldFront);
        const backSlot = makeSlot(newPos, cardDistance, verticalDistance, total);

        // Step 1: Shrink & fade old front
        tl.to(oldFrontEl, {
          scale: 0.9,
          opacity: 0,
          duration: duration * 0.4,
          ease: 'power2.in',
        }, 0);

        // Step 2: Teleport to back position (hidden)
        tl.call(() => {
          gsap.set(oldFrontEl, {
            x: backSlot.x,
            y: backSlot.y,
            zIndex: backSlot.zIndex,
          });
        }, undefined, duration * 0.4);

        // Step 3: Fade back in at back position
        tl.to(oldFrontEl, {
          scale: backSlot.scale,
          opacity: backSlot.opacity,
          duration: duration * 0.5,
          ease: 'power2.out',
        }, duration * 0.45);
      }

      // Animate all other cards to their new slot positions
      newOrder.forEach((idx, i) => {
        if (idx === oldFront) return; // handled above
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, total);

        tl.to(el, {
          x: slot.x,
          y: slot.y,
          scale: slot.scale,
          opacity: slot.opacity,
          zIndex: slot.zIndex,
          duration: duration * 0.7,
          ease: 'power2.out',
        }, duration * 0.15);
      });

      // Update order
      tl.call(() => {
        order.current = newOrder;
        setActiveIndex(newOrder[0]);
      });
    };

    const swap = () => {
      if (order.current.length < 2 || isAnimating.current) return;

      const [front, ...rest] = order.current;
      const newOrder = [...rest, front];
      animateToOrder(newOrder);
    };

    const goToCard = (targetIdx: number) => {
      const targetPos = order.current.indexOf(targetIdx);
      if (targetPos === 0 || isAnimating.current) return;

      clearInterval(intervalRef.current);

      const newOrder = [
        ...order.current.slice(targetPos),
        ...order.current.slice(0, targetPos),
      ];
      animateToOrder(newOrder, 0.6);

      // Restart autoplay after navigation
      setTimeout(() => {
        if (!isHovered.current) {
          intervalRef.current = window.setInterval(swap, delay);
        }
      }, 700);
    };

    goToCardRef.current = goToCard;

    // Start autoplay
    intervalRef.current = window.setInterval(swap, delay);

    // ── Touch swipe support ──
    const node = container.current;
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      // Pause autoplay while touching
      isHovered.current = true;
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // Only trigger if horizontal swipe is dominant and > 50px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          // Swipe left → next card
          swap();
        } else {
          // Swipe right → previous card
          if (order.current.length < 2 || isAnimating.current) return;
          const last = order.current[order.current.length - 1];
          const rest = order.current.slice(0, -1);
          animateToOrder([last, ...rest], 0.6);
        }
      }

      // Resume autoplay
      isHovered.current = false;
      tlRef.current?.play();
      intervalRef.current = window.setInterval(swap, delay);
    };

    if (node) {
      node.addEventListener('touchstart', onTouchStart, { passive: true });
      node.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    if (pauseOnHover && node) {
      const pause = () => {
        isHovered.current = true;
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        isHovered.current = false;
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        node.removeEventListener('touchstart', onTouchStart);
        node.removeEventListener('touchend', onTouchEnd);
        clearInterval(intervalRef.current);
      };
    }
    return () => {
      if (node) {
        node.removeEventListener('touchstart', onTouchStart);
        node.removeEventListener('touchend', onTouchEnd);
      }
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover]);

  const rendered = childArr.map((child, i) => {
    if (isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      return cloneElement(element, {
        key: i,
        ref: refs[i],
        style: { width, height, ...(element.props.style ?? {}) },
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          element.props.onClick?.(e);
          onCardClick?.(i);
        }
      });
    }
    return child;
  });

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}

      {/* Pagination dots indicator */}
      <div className="pagination-dots">
        {childArr.map((_, i) => (
          <button
            key={i}
            onClick={() => goToCardRef.current(i)}
            className={`pagination-dot ${activeIndex === i ? 'active' : ''}`}
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CardSwap;
