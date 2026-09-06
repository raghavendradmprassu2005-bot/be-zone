import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface AgentProductResultsProps {
  products: Product[];
}

const AgentProductResults = ({ products }: AgentProductResultsProps) => {
  if (!products.length) return null;

  return (
    <div className="mt-5 [--background:20_8%_12%] [--foreground:35_25%_94%] [--card:20_8%_16%] [--card-foreground:35_25%_94%] [--muted:20_7%_22%] [--muted-foreground:30_8%_65%] [--border:25_8%_28%] [--secondary:38_60%_52%] [--secondary-foreground:20_10%_12%]">
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#777169]">
        Verified Be-Zone options
      </p>
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {products.map((product) => (
        <div key={product.id} className="min-w-[220px] max-w-[240px] shrink-0 snap-start">
          <ProductCard product={product} />
        </div>
      ))}
      </div>
    </div>
  );
};

export default AgentProductResults;
