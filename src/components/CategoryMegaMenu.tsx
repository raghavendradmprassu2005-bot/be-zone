import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Watch, Sparkles, Baby, Package, Scissors, Droplets, Palette, Crown } from 'lucide-react';

interface SubCategory {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface MegaCategory {
  name: string;
  subs: SubCategory[];
}

const megaCategories: MegaCategory[] = [
  {
    name: 'Women',
    subs: [
      {
        name: 'Beauty Care',
        icon: <Sparkles className="h-4 w-4" />,
        href: '/products?category=beauty-care',
      },
      {
        name: 'Hair Care',
        icon: <Scissors className="h-4 w-4" />,
        href: '/products?category=hair-care',
      },
      {
        name: 'Makeup',
        icon: <Palette className="h-4 w-4" />,
        href: '/products?category=makeup',
      },
      {
        name: 'Jewellery',
        icon: <Watch className="h-4 w-4" />,
        href: '/products?category=jewellery',
      },
    ],
  },

  {
    name: 'Men',
    subs: [
      {
        name: 'Grooming',
        icon: <Shirt className="h-4 w-4" />,
        href: '/products?category=grooming',
      },
    ],
  },

  {
    name: 'Kids',
    subs: [
      {
        name: 'Kids Zone',
        icon: <Baby className="h-4 w-4" />,
        href: '/products?category=kids-zone',
      },
    ],
  },

  {
    name: 'Home',
    subs: [
      {
        name: 'Education',
        icon: <Package className="h-4 w-4" />,
        href: '/products?category=education',
      },
      {
        name: 'Makeup Rental',
        icon: <Crown className="h-4 w-4" />,
        href: '/products?category=makeup-rental',
      },
      {
        name: 'Beauty Services',
        icon: <Droplets className="h-4 w-4" />,
        href: '/products?category=beauty-services',
      },
    ],
  },
];

interface CategoryMegaMenuProps {
  open: boolean;
  onClose: () => void;
}

const CategoryMegaMenu = ({ open, onClose }: CategoryMegaMenuProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 top-full z-50 border-b border-border/50 bg-card shadow-premium-lg"
          onMouseLeave={onClose}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {megaCategories.map((cat) => (
                <div key={cat.name}>
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{cat.name}</h3>
                  <div className="space-y-1">
                    {cat.subs.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        onClick={onClose}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary/5 hover:text-foreground"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-secondary/10 group-hover:text-secondary">
                          {sub.icon}
                        </span>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryMegaMenu;
