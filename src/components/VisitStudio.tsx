import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
const EarthScene = lazy(() => import("./EarthScene"));

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 767px)").matches;
}

/* ============================================================
   ANIMATION
   ============================================================ */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: (i: number) => ({
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.72,
      delay: i * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* ============================================================
   GALAXY STAR FIELD
   ============================================================ */

function GalaxyStars({ isMobile }: { isMobile: boolean }) {
  /*
   * Deterministic star positions.
   *
   * We intentionally avoid Math.random()
   * so React never produces different layouts.
   */

  const stars = useMemo(
    () =>
      Array.from({ length: 95 }, (_, i) => ({
        id: i,

        left: (i * 37.71) % 100,

        top: (i * 61.37) % 100,

        size:
          i % 13 === 0
            ? 2.2
            : i % 7 === 0
              ? 1.5
              : 0.8 + ((i * 17) % 8) / 10,

        opacity:
          i % 9 === 0
            ? 0.75
            : 0.25 + ((i * 13) % 45) / 100,

        duration:
          3.5 + ((i * 29) % 50) / 10,

        delay:
          -((i * 19) % 40) / 10,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex: 0,
      }}
    >
      {stars.map((star) => {
        const starStyle = {
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,

          background:
            star.id % 11 === 0
              ? "rgba(255,239,190,0.95)"
              : "rgba(210,220,255,0.75)",

          opacity: star.opacity,

          boxShadow:
            star.id % 11 === 0
              ? "0 0 7px rgba(255,220,150,0.8)"
              : "0 0 3px rgba(150,180,255,0.35)",
        } as const;

        if (isMobile) {
          return <span key={star.id} className="absolute rounded-full" style={starStyle} />;
        }

        return (
          <motion.span
            key={star.id}
            className="absolute rounded-full"
            style={starStyle}
            animate={{
              opacity: [
                star.opacity * 0.45,
                Math.min(star.opacity * 1.35, 0.9),
                star.opacity * 0.45,
              ],

              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ============================================================
   GALAXY BACKGROUND
   ============================================================ */

function GalaxyBackground({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex: 0,
        background:
          "radial-gradient(circle at 50% 45%, #11151d 0%, #090b10 42%, #040507 78%, #020204 100%)",
      }}
    >
      {/* ======================================================
          DEEP SPACE
         ====================================================== */}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 48%, rgba(41,55,90,0.16) 0%, rgba(15,20,32,0.08) 34%, transparent 68%)",
        }}
      />

      {/* ======================================================
          MAIN GALAXY NEBULA
         ====================================================== */}

      {isMobile ? (
        <div
          className="absolute"
          style={{
            width: "125%",
            height: "95%",

            left: "-12.5%",
            top: "2.5%",

            borderRadius: "50%",

            background: `
              radial-gradient(
                ellipse at center,
                rgba(105,128,190,0.14) 0%,
                rgba(72,89,145,0.10) 16%,
                rgba(45,55,95,0.08) 28%,
                rgba(212,169,78,0.045) 39%,
                transparent 62%
              )
            `,

            filter: "blur(18px)",

            transform: "rotate(-18deg)",
            opacity: 0.78,
          }}
        />
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "125%",
            height: "95%",

            left: "-12.5%",
            top: "2.5%",

            borderRadius: "50%",

            background: `
              radial-gradient(
                ellipse at center,
                rgba(105,128,190,0.14) 0%,
                rgba(72,89,145,0.10) 16%,
                rgba(45,55,95,0.08) 28%,
                rgba(212,169,78,0.045) 39%,
                transparent 62%
              )
            `,

            filter: "blur(18px)",

            transform: "rotate(-18deg)",
          }}
          animate={{
            rotate: [-18, -13, -18],
            scale: [1, 1.035, 1],
            opacity: [0.72, 0.9, 0.72],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ======================================================
          GALAXY DUST LANE
         ====================================================== */}

      {isMobile ? (
        <div
          className="absolute"
          style={{
            width: "135%",
            height: "48%",

            left: "-17.5%",
            top: "26%",

            borderRadius: "50%",

            background: `
              radial-gradient(
                ellipse at center,
                rgba(255,236,183,0.055) 0%,
                rgba(211,169,78,0.045) 17%,
                rgba(85,103,157,0.035) 34%,
                transparent 67%
              )
            `,

            filter: "blur(28px)",

            transform: "rotate(-13deg)",
            opacity: 0.58,
          }}
        />
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "135%",
            height: "48%",

            left: "-17.5%",
            top: "26%",

            borderRadius: "50%",

            background: `
              radial-gradient(
                ellipse at center,
                rgba(255,236,183,0.055) 0%,
                rgba(211,169,78,0.045) 17%,
                rgba(85,103,157,0.035) 34%,
                transparent 67%
              )
            `,

            filter: "blur(28px)",

            transform: "rotate(-13deg)",
          }}
          animate={{
            rotate: [-13, -10, -13],
            x: [-10, 10, -10],
            opacity: [0.5, 0.72, 0.5],
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ======================================================
          BLUE GALAXY ARM
         ====================================================== */}

      {isMobile ? (
        <div
          className="absolute"
          style={{
            width: "110%",
            height: "42%",

            left: "-5%",
            top: "8%",

            borderRadius: "50%",

            background:
              "conic-gradient(from 205deg at 50% 50%, transparent 0deg, rgba(67,93,160,0.07) 35deg, transparent 78deg, rgba(76,103,176,0.055) 120deg, transparent 165deg, rgba(60,82,145,0.06) 215deg, transparent 280deg)",

            filter: "blur(25px)",
            opacity: 0.6,
          }}
        />
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "110%",
            height: "42%",

            left: "-5%",
            top: "8%",

            borderRadius: "50%",

            background:
              "conic-gradient(from 205deg at 50% 50%, transparent 0deg, rgba(67,93,160,0.07) 35deg, transparent 78deg, rgba(76,103,176,0.055) 120deg, transparent 165deg, rgba(60,82,145,0.06) 215deg, transparent 280deg)",

            filter: "blur(25px)",
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.5, 0.75, 0.5],
          }}
          transition={{
            rotate: {
              duration: 100,
              repeat: Infinity,
              ease: "linear",
            },

            opacity: {
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      )}

      {/* ======================================================
          GOLD AMBIENT CLOUD
         ====================================================== */}

      {isMobile ? (
        <div
          className="absolute"
          style={{
            width: "70%",
            height: "65%",

            left: "-12%",
            bottom: "-28%",

            borderRadius: "50%",

            background:
              "radial-gradient(ellipse, rgba(212,169,78,0.13) 0%, rgba(212,169,78,0.055) 25%, transparent 68%)",

            filter: "blur(35px)",
            opacity: 0.5,
          }}
        />
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "70%",
            height: "65%",

            left: "-12%",
            bottom: "-28%",

            borderRadius: "50%",

            background:
              "radial-gradient(ellipse, rgba(212,169,78,0.13) 0%, rgba(212,169,78,0.055) 25%, transparent 68%)",

            filter: "blur(35px)",
          }}
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.45, 0.7, 0.45],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ======================================================
          DISTANT BLUE CLOUD
         ====================================================== */}

      {isMobile ? (
        <div
          className="absolute"
          style={{
            width: "75%",
            height: "60%",

            right: "-20%",
            top: "-20%",

            borderRadius: "50%",

            background:
              "radial-gradient(ellipse, rgba(65,91,155,0.11) 0%, rgba(55,75,125,0.045) 32%, transparent 70%)",

            filter: "blur(40px)",
            opacity: 0.55,
          }}
        />
      ) : (
        <motion.div
          className="absolute"
          style={{
            width: "75%",
            height: "60%",

            right: "-20%",
            top: "-20%",

            borderRadius: "50%",

            background:
              "radial-gradient(ellipse, rgba(65,91,155,0.11) 0%, rgba(55,75,125,0.045) 32%, transparent 70%)",

            filter: "blur(40px)",
          }}
          animate={{
            x: [-20, 20, -20],
            y: [-10, 15, -10],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ======================================================
          STAR FIELD
         ====================================================== */}

      <GalaxyStars isMobile={isMobile} />

      {/* ======================================================
          CINEMATIC VIGNETTE
         ====================================================== */}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.62) 100%)",
        }}
      />

      {/* ======================================================
          CONTENT READABILITY GRADIENT
         ====================================================== */}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(3,4,6,0.22) 0%, rgba(3,4,6,0.05) 38%, rgba(3,4,6,0.28) 100%)",
        }}
      />
    </div>
  );
}

/* ============================================================
   VISIT STUDIO
   ============================================================ */

export default function VisitStudio() {
  const [isMobile, setIsMobile] = useState(() => getIsMobileViewport());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  return (
    <div
      className="
    relative
    w-full
    min-h-[540px]
    mb-0
    pb-0
    overflow-hidden
    bg-[#020204]
    lg:min-h-[100svh]
    lg:h-screen
  "
    >
      <motion.section
        className="
  relative
  z-10
  w-full
  h-auto
  min-h-[540px]
  mb-0
  pb-0
  overflow-hidden
  lg:h-full
  lg:min-h-[680px]
"
        style={
          isMobile
            ? {
                transform: "none",
                borderRadius: 0,
                opacity: 1,
                willChange: "auto",
              }
            : undefined
        }
      >
        {/* =====================================================
            GALAXY
           ===================================================== */}

        <GalaxyBackground isMobile={isMobile} />

        {/* =====================================================
            VERY SUBTLE TOP TRANSITION
           ===================================================== */}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 sm:h-56"
          style={{
            zIndex: 1,

            background:
              "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",

            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",

            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 100%)",

            opacity: 0.045,
          }}
        />

        {/* =====================================================
            EARTH
           ===================================================== */}

        <Suspense fallback={null}>
          <EarthScene />
        </Suspense>

        {/* =====================================================
            CONTENT
           ===================================================== */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            w-full
            items-center
            justify-center
            px-5
            sm:px-6
          "
        >
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-xl
              flex-col
              items-center
              text-center
              pt-8
              pb-8
              sm:pt-0
              sm:pb-0
            "
          >
            {/* =================================================
                VISIT OUR
               ================================================= */}

            <motion.p
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
                font-luxury-sans
                text-[10px]
                uppercase
                tracking-[0.36em]
                text-white/70
                sm:text-[11px]
              "
            >
              VISIT OUR
            </motion.p>

            {/* =================================================
                TITLE
               ================================================= */}

            <motion.h2
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
                mt-3
                font-luxury-display
                text-[42px]
                font-light
                leading-[0.95]
                text-luxury-ivory
                sm:text-5xl
                lg:text-6xl
              "
              style={{
                letterSpacing: "-0.01em",

                textShadow:
                  "0 2px 24px rgba(0,0,0,0.55)",
              }}
            >
              Beauty Studio
            </motion.h2>

            {/* =================================================
                BUSINESS NAME
               ================================================= */}

            <motion.p
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
  mt-3
  font-luxury-display
  text-[22px]
  italic
  tracking-[0.02em]
  text-luxury-gold
  sm:text-[22px]
  lg:text-[24px]
"
              style={{
                textShadow:
                  "0 0 18px rgba(212,169,78,0.18)",
              }}
            >
              Bhoomika Beauty Parlour
            </motion.p>

            {/* =================================================
                LOCATION
               ================================================= */}

            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
                mt-7
                w-full
                max-w-sm
                rounded-2xl
                border
                border-white/10
                px-5
                py-5
                sm:mt-8
                sm:px-6
              "
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035))",

                backdropFilter:
                  "blur(18px)",

                WebkitBackdropFilter:
                  "blur(18px)",

                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 40px rgba(0,0,0,0.32)",
              }}
            >
              <p className="font-luxury-sans text-[11px] uppercase tracking-[0.3em] text-white/70">
                Near Govt Hospital
              </p>

              <p className="mt-2 font-body text-sm leading-6 text-white/60">
                Basavapatna, Davanagere, Karnataka
              </p>
            </motion.div>

            {/* =================================================
                DESCRIPTION
               ================================================= */}

            <motion.p
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
                mt-7
                max-w-md
                font-luxury-display
                text-[15px]
                leading-[1.8]
                tracking-[0.01em]
                text-white/68
                sm:mt-8
                sm:text-[16px]
              "
              style={{
                color: "#FFFFFF",
                textShadow: "0 2px 12px rgba(0,0,0,0.9)",
              }}
            >
              Experience premium beauty services where luxury meets elegance.
              Every visit is crafted to make you feel confident, refreshed
              and beautifully cared for by our expert stylists.
            </motion.p>

            {/* =================================================
                BUTTONS
               ================================================= */}

            <motion.div
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-10%",
              }}
              variants={fadeUp}
              className="
                mt-8
                flex
                w-full
                max-w-sm
                flex-col
                gap-3
                sm:mt-10
                sm:w-auto
                sm:max-w-none
                sm:flex-row
                sm:gap-4
              "
            >
              {/* =================================================
                  CONTACT BUTTON
                 ================================================= */}
 
              <motion.button
                whileHover={{
                  y: -1,
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 26,
                }}
                className="
                  group
                  relative
                  w-full
                  overflow-hidden
                  rounded-full
                  px-8
                  py-3.5
                  font-luxury-sans
                  text-[11px]
                  uppercase
                  tracking-[0.3em]
                  font-semibold
                  text-black
                  sm:w-auto
                  sm:py-3
                "
                style={{
                  background:
                    "linear-gradient(135deg, #f3d98b 0%, #d4a94e 50%, #b8863a 100%)",
  
                  boxShadow:
                    "0 4px 25px rgba(212,169,78,0.32)",
                }}
              >
                {isMobile ? (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_40%,rgba(255,255,255,0.06))]" />
                ) : (
                  <motion.span
                    className="
                      pointer-events-none
                      absolute
                      inset-y-0
                      -left-1/2
                      w-1/3
                      skew-x-[-20deg]
                      bg-white/30
                      blur-md
                    "
                    animate={{
                      left: [
                        "-50%",
                        "150%",
                      ],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                )}
  
                <a
  href="https://wa.me/917619305964?text=Hi,%20I%20want%20to%20know%20more%20about%20your%20beauty%20services/products"
  target="_blank"
  rel="noopener noreferrer"
  className="group"
>
  <span className="relative z-10 flex items-center justify-center gap-2">
    Contact Us

    <span
      className="
        inline-block
        transition-transform
        duration-300
        group-hover:translate-x-1
      "
    >
      →
    </span>
  </span>
</a>
              </motion.button>
 
              {/* =================================================
                  DIRECTIONS
                 ================================================= */}
 
              <a
  href="https://maps.app.goo.gl/XTh2zrsuTndPabPt9?g_st=ac"
  target="_blank"
  rel="noopener noreferrer"
>
  <motion.button
    whileHover={{
      y: -1,
      scale: 1.01,
    }}
    whileTap={{
      scale: 0.98,
    }}
    transition={{
      type: "spring",
      stiffness: 360,
      damping: 26,
    }}
    className="
      w-full
      rounded-full
      border
      border-white/20
      px-8
      py-3.5
      font-luxury-sans
      text-[11px]
      uppercase
      tracking-[0.3em]
      font-semibold
      text-white
      transition-all
      duration-300
      hover:border-white/40
      sm:w-auto
      sm:py-3
    "
    style={{
      background: "rgba(255,255,255,0.055)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    }}
  >
    Get Directions
  </motion.button>
</a>
            </motion.div>
          </div>
        </div>

        {/* =====================================================
            LOWER CINEMATIC GRADIENT
           ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            z-[5]
            h-40
            sm:h-32
          "
          style={{
            background:
              "linear-gradient(to top, rgba(2,3,5,0.72), rgba(2,3,5,0.18) 48%, transparent 100%)",
          }}
        />

        {/* =====================================================
            SUBTLE GOLD HORIZON GLOW
           ===================================================== */}

        {isMobile ? (
          <div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              z-[4]
              h-32
              w-[70%]
              -translate-x-1/2
              rounded-full
            "
            style={{
              background:
                "radial-gradient(ellipse, rgba(212,169,78,0.08) 0%, transparent 70%)",

              filter: "blur(20px)",
              opacity: 0.35,
            }}
          />
        ) : (
          <motion.div
            className="
              pointer-events-none
              absolute
              bottom-0
              left-1/2
              z-[4]
              h-32
              w-[70%]
              -translate-x-1/2
              rounded-full
            "
            style={{
              background:
                "radial-gradient(ellipse, rgba(212,169,78,0.08) 0%, transparent 70%)",

              filter: "blur(20px)",
            }}
            animate={{
              opacity: [0.35, 0.65, 0.35],
              scaleX: [0.9, 1.05, 0.9],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.section>
    </div>
  );
}