import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const footerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const footerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Footer = () => (
  <motion.footer
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.15 }}
    variants={footerContainer}
    className="border-t border-border/50 bg-foreground text-primary-foreground"
  >
    <div className="container mx-auto px-4 py-12 pb-[calc(110px+env(safe-area-inset-bottom))] lg:py-16 lg:pb-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={footerItem}>
          <div className="mb-4">
            <span className="font-luxury-display text-[1.6rem] font-medium tracking-[0.08em] text-[#f7ebd0]">Be-Zone</span>
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-primary-foreground/55">Glow on Demand</p>
          </div>
          <p className="font-body text-sm leading-relaxed text-primary-foreground/70">Your premium destination for beauty, skincare, makeup & fashion. Curated luxury for everyone.</p>
        </motion.div>
        <motion.div variants={footerItem}>
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
        </motion.div>
        <motion.div variants={footerItem}>
          <h4 className="mb-3 font-luxury-display text-[0.95rem] uppercase tracking-[0.3em] text-[#f7ebd0]">Policies</h4>
          <div className="flex flex-col gap-2">
            <span className="font-body text-sm text-primary-foreground/70">Shipping & Delivery</span>
            <span className="font-body text-sm text-primary-foreground/70">Returns & Exchanges</span>
            <span className="font-body text-sm text-primary-foreground/70">Privacy Policy</span>
            <span className="font-body text-sm text-primary-foreground/70">Terms of Service</span>
          </div>
        </motion.div>
        <motion.div variants={footerItem}>
          <h4 className="mb-3 font-luxury-display text-[0.95rem] uppercase tracking-[0.3em] text-[#f7ebd0]">Contact</h4>
          <div className="flex flex-col gap-2">
            <span className="font-body text-sm text-primary-foreground/70">hello@be-zone.shop</span>
            <span className="font-body text-sm text-primary-foreground/70">+91 7619305964</span>
            <a href="https://wa.me/917619305964" target="_blank" rel="noopener noreferrer" className="font-body text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-[#e7c678]">WhatsApp</a>
            <span className="font-body text-sm text-primary-foreground/70">Instagram: @bezone.shop</span>
          </div>
        </motion.div>
      </div>
      <motion.div variants={footerItem} className="mt-10 flex flex-col items-center gap-2 border-t border-primary-foreground/10 pt-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/40">© 2026 Be-Zone. All rights reserved.</p>
        <h2 className="marcellus text-[11px] leading-none tracking-[0.24em] text-[#f7ebd0] not-italic md:text-[12px]">Made by Raghu</h2>
      </motion.div>
    </div>
  </motion.footer>
);

export default Footer;