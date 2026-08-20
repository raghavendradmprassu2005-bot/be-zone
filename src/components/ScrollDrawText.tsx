import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollDrawTextProps {
  text: string;
  className?: string;
}

const ScrollDrawText = ({
  text,
  className = "",
}: ScrollDrawTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const ctx = gsap.context(() => {
      const textElement = textRef.current;

      if (!textElement) return;

      const length = textElement.getComputedTextLength();

      /*
       * Start completely hidden.
       */
      gsap.set(textElement, {
        strokeDasharray: length,
        strokeDashoffset: length,
        fill: "#000000",
        fillOpacity: 0,
        stroke: "#000000",
        strokeWidth: 2.2,
      });

      /*
       * One continuous scroll-controlled timeline.
       */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,

          start: "top 79%",
          end: "bottom 25%",

          /*
           * Smoothly follows the scroll instead of
           * snapping directly to every tiny movement.
           */
          scrub: 1.3,

          invalidateOnRefresh: true,

          anticipatePin: 1,
        },
      });

      /*
       * 1 — DRAW
       *
       * The entire heading draws together.
       */
      timeline.to(textElement, {
        strokeDashoffset: 0,
        duration: 2.2,
        ease: "power1.out",
      });

      /*
       * 2 — SOLIDIFY
       *
       * Once the drawing is complete,
       * the inside becomes completely black.
       */
      timeline.to(textElement, {
        fillOpacity: 1,
        duration: 3,
        ease: "power3.out",
      });

      /*
       * 3 — HOLD
       *
       * Keep the beautiful fully-black heading
       * visible for a moment while scrolling.
       */
      timeline.to({}, {
        duration: 0.35,
      });

      /*
       * 4 — UNDRAW
       *
       * Continue scrolling and the same heading
       * draws backward.
       */
      timeline.to(textElement, {
        strokeDashoffset: length,
        fillOpacity: 0,
        duration: 2.2,
        ease: "power3.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full ${className}`}
    >
      <svg
        viewBox="0 0 1000 120"
        className="block h-auto w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <text
          ref={textRef}
          x="500"
          y="78"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="58"
          fontWeight="700"
          fill="#000000"
          stroke="#000000"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {text}
        </text>
      </svg>

      <span className="sr-only">{text}</span>
    </div>
  );
};

export default ScrollDrawText;