import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border/50 bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12 pb-[calc(110px+env(safe-area-inset-bottom))] lg:py-16 lg:pb-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4">
            <span className="font-display text-2xl font-semibold tracking-wide">Be-Zone</span>
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/50">Glow on Demand</p>
          </div>
          <p className="text-sm leading-relaxed text-primary-foreground/60">Your premium destination for beauty, skincare, makeup & fashion. Curated luxury for everyone.</p>
        </div>
        <div>
  <h4 className="mb-3 text-sm font-semibold font-body uppercase tracking-wider text-primary-foreground/80">
    Shop
  </h4>

  <div className="flex flex-col gap-2">
    <Link
      to="/products?category=beauty-care"
      className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary"
    >
      Beauty Care
    </Link>

    <Link
      to="/products?category=hair-care"
      className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary"
    >
      Hair Care
    </Link>

    <Link
      to="/products?category=makeup"
      className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary"
    >
      Makeup
    </Link>

    <Link
      to="/products?category=jewellery"
      className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary"
    >
      Jewellery
    </Link>

    <Link
      to="/products?category=grooming"
      className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary"
    >
      Grooming
    </Link>
  </div>
</div>
        <div>
          <h4 className="mb-3 text-sm font-semibold font-body uppercase tracking-wider text-primary-foreground/80">Policies</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-foreground/60">Shipping & Delivery</span>
            <span className="text-sm text-primary-foreground/60">Returns & Exchanges</span>
            <span className="text-sm text-primary-foreground/60">Privacy Policy</span>
            <span className="text-sm text-primary-foreground/60">Terms of Service</span>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold font-body uppercase tracking-wider text-primary-foreground/80">Contact</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-primary-foreground/60">hello@be-zone.shop</span>
            <span className="text-sm text-primary-foreground/60">+91 7619305964</span>
            <a href="https://wa.me/917619305964" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-foreground/60 transition-colors hover:text-secondary">WhatsApp</a>
            <span className="text-sm text-primary-foreground/60">Instagram: @bezone.shop</span>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-primary-foreground/10 pt-6 flex flex-col items-center gap-2">
        <p className="text-xs text-primary-foreground/40">© 2026 Be-Zone. All rights reserved.</p>
        <p className="text-[12px] font-display italic text-primary-foreground/40">Made with ❤️ by Raghu</p>
      </div>
    </div>
  </footer>
);

export default Footer;
