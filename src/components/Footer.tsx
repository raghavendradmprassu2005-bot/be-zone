import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* =========================================================
   Contact Icons
   ========================================================= */

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[19px] w-[19px]"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[19px] w-[19px]"
    aria-hidden="true"
  >
    <path d="M6.7 3.5h2.1c.6 0 1.1.4 1.2 1l.7 3.1c.1.5-.1 1-.5 1.3L8.7 10c1 2 2.5 3.5 4.5 4.5l1.1-1.5c.3-.4.8-.6 1.3-.5l3.1.7c.6.1 1 .6 1 1.2v2.1c0 .7-.6 1.3-1.3 1.3C10.6 17.8 6.2 13.4 6.2 7c0-.7.6-1.3 1.3-1.3" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[19px] w-[19px]"
    aria-hidden="true"
  >
    <path d="M20.2 11.5a8.2 8.2 0 0 1-12.1 7.2L4 20l1.3-4a8.2 8.2 0 1 1 14.9-4.5Z" />
    <path d="M8.4 8.4c.2-.3.4-.3.7-.3h.5c.2 0 .4.1.5.4l.7 1.5c.1.2.1.4 0 .6l-.5.7c.6 1.2 1.5 2.1 2.7 2.7l.7-.5c.2-.1.4-.1.6 0l1.5.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.3.7-.3.3-.8.5-1.2.5-2.7-.2-6.1-3.6-6.3-6.3 0-.4.2-.9.5-1.2Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[19px] w-[19px]"
    aria-hidden="true"
  >
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle
      cx="17.4"
      cy="6.7"
      r="0.8"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

/* =========================================================
   Zone Decode Characters
   ========================================================= */

const DECODE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const randomCharacter = () =>
  DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];

const Footer = () => {
  /*
   * ========================================================
   * PREMIUM "ZONE" DECODE
   *
   * "Be-" remains completely static.
   * Only "Zone" participates in the animation.
   *
   * GSAP handles:
   * - character scrambling
   * - sequential resolution
   * - subtle blur
   * - opacity
   * - tiny vertical settling
   * ========================================================
   */

  const zoneRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const characters = zoneRefs.current.filter(
      (element): element is HTMLSpanElement => Boolean(element)
    );

    if (!characters.length) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        delay: 0.3,
      });

      characters.forEach((character, index) => {
        const finalCharacter = character.dataset.char || '';

        gsap.set(character, {
          opacity: 0,
          y: 2,
          filter: 'blur(4px)',
        });

        const scrambleObject = {
          progress: 0,
        };

        timeline.to(
          scrambleObject,
          {
            progress: 1,
            duration: 0.42,
            ease: 'power2.out',
            onUpdate: () => {
              const progress = scrambleObject.progress;

              if (progress < 0.72) {
                character.textContent = randomCharacter();
              } else {
                character.textContent = finalCharacter;
              }
            },
            onComplete: () => {
              character.textContent = finalCharacter;
            },
          },
          index * 0.12
        );

        timeline.to(
          character,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.38,
            ease: 'power3.out',
          },
          index * 0.12 + 0.16
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <footer
      className="
        relative
        z-0
        overflow-hidden
        bg-foreground
        text-primary-foreground
      "
    >
      {/* =====================================================
          SUBTLE BLACK TOP FADE

          This replaces the old hard border.

          It gives Visit Studio → Footer a smoother transition
          without creating another animated white fade.
          ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          h-12
          bg-gradient-to-b
          from-black/45
          via-black/18
          to-transparent
          sm:h-14
        "
      />

      <div className="container mx-auto px-4 py-12 pb-[calc(110px+env(safe-area-inset-bottom))] lg:py-16 lg:pb-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* =================================================
              BRAND
              ================================================= */}

          <div>
            <div className="mb-4">
              <span className="font-luxury-display text-[1.6rem] font-medium tracking-[0.08em] text-[#f7ebd0]">
                Be-
                <span
                  className="
                    inline-block
                    min-w-[4.1ch]
                    whitespace-pre
                  "
                  aria-label="Zone"
                >
                  {['Z', 'o', 'n', 'e'].map((character, index) => (
                    <span
                      key={index}
                      ref={(element) => {
                        zoneRefs.current[index] = element;
                      }}
                      data-char={character}
                      className="inline-block"
                    >
                      {character}
                    </span>
                  ))}
                </span>
              </span>

              <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-primary-foreground/55">
                Glow on Demand
              </p>
            </div>

            <p className="font-body text-sm leading-relaxed text-primary-foreground/70">
              Your premium destination for beauty, skincare, makeup & fashion.
              Curated luxury for everyone.
            </p>
          </div>

          {/* =================================================
              SHOP
              ================================================= */}

          <div>
            <h4 className="mb-3 font-luxury-display text-[0.95rem] uppercase tracking-[0.3em] text-[#f7ebd0]">
              Shop
            </h4>

            <div className="flex flex-col gap-2">
              <Link
                to="/products?category=beauty-care"
                className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]"
              >
                Beauty Care
              </Link>

              <Link
                to="/products?category=hair-care"
                className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]"
              >
                Hair Care
              </Link>

              <Link
                to="/products?category=makeup"
                className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]"
              >
                Makeup
              </Link>

              <Link
                to="/products?category=jewellery"
                className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]"
              >
                Jewellery
              </Link>

              <Link
                to="/products?category=grooming"
                className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]"
              >
                Grooming
              </Link>
            </div>
          </div>

          {/* =================================================
              POLICIES
              ================================================= */}

          <div>
            <h4 className="mb-3 font-luxury-display text-[0.95rem] uppercase tracking-[0.3em] text-[#f7ebd0]">
              Policies
            </h4>

            <div className="flex flex-col gap-2">
              <span className="font-body text-sm text-primary-foreground/70">
                Shipping & Delivery
              </span>

              <span className="font-body text-sm text-primary-foreground/70">
                Returns & Exchanges
              </span>

              <span className="font-body text-sm text-primary-foreground/70">
                Privacy Policy
              </span>

              <span className="font-body text-sm text-primary-foreground/70">
                Terms of Service
              </span>
            </div>
          </div>

          {/* =================================================
              CONTACT
              ================================================= */}

          <div>
            <h4 className="mb-3 font-luxury-display text-[0.95rem] uppercase tracking-[0.3em] text-[#f7ebd0]">
              Contact
            </h4>

            <div className="flex items-center gap-3">
              {/* Email */}
              <a
                href="mailto:hello@be-zone.shop"
                aria-label="Email Be-Zone at hello@be-zone.shop"
                title="Email"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-primary-foreground/10
                  text-primary-foreground/65
                  transition-all
                  duration-300
                  hover:border-[#e7c678]/40
                  hover:bg-[#e7c678]/5
                  hover:text-[#e7c678]
                "
              >
                <MailIcon />
              </a>

              {/* Phone — SAME NUMBER */}
              <a
                href="tel:+917619305964"
                aria-label="Call Be-Zone at +91 7619305964"
                title="Call +91 7619305964"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-primary-foreground/10
                  text-primary-foreground/65
                  transition-all
                  duration-300
                  hover:border-[#e7c678]/40
                  hover:bg-[#e7c678]/5
                  hover:text-[#e7c678]
                "
              >
                <PhoneIcon />
              </a>

              {/* WhatsApp — LINK UNCHANGED */}
              <a
                href="https://wa.me/917619305964"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Be-Zone on WhatsApp"
                title="WhatsApp"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-primary-foreground/10
                  text-primary-foreground/65
                  transition-all
                  duration-300
                  hover:border-[#e7c678]/40
                  hover:bg-[#e7c678]/5
                  hover:text-[#e7c678]
                "
              >
                <WhatsAppIcon />
              </a>

              {/* Instagram */}
              <span
                aria-label="Instagram: @bezone.shop"
                title="@bezone.shop"
                className="
                  group
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-primary-foreground/10
                  text-primary-foreground/65
                  transition-all
                  duration-300
                  hover:border-[#e7c678]/40
                  hover:bg-[#e7c678]/5
                  hover:text-[#e7c678]
                "
              >
                <InstagramIcon />
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            COPYRIGHT
            =================================================== */}

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-primary-foreground/10 pt-6">
          <p className="w-full text-center text-[11px] uppercase tracking-[0.3em] text-primary-foreground/40">
            © 2026 Be-Zone. All rights reserved.
          </p>

          <h2 className="marcellus text-[11px] leading-none tracking-[0.24em] text-[#f7ebd0] not-italic md:text-[12px]">
            Made by Raghu
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;