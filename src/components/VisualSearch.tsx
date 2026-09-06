import { useRef, useState } from "react";
import { Camera, ImagePlus, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createImageEmbedding } from "@/lib/visualSearch";
import type { Product } from "@/lib/types";
import { Link } from "react-router-dom";

type SearchResult = Product & {
  similarity: number;
};

const VisualSearch = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    if (image) {
      URL.revokeObjectURL(image);
    }

    setError(null);
    setResults([]);
    setFile(selectedFile);

    const url = URL.createObjectURL(selectedFile);
    setImage(url);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0]);
  };

  const clearImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setFile(null);
    setResults([]);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const runVisualSearch = async () => {
    if (!file) {
      setError("Choose an image first.");
      return;
    }

    setSearching(true);
    setModelLoading(true);
    setError(null);
    setResults([]);

    try {
      // Generate the CLIP embedding locally in the browser.
      const embedding = await createImageEmbedding(file);

      setModelLoading(false);

      // Search Supabase using pgvector.
      const { data, error: searchError } = await supabase.rpc(
  "match_products_by_image",
  {
    query_embedding: `[${embedding.join(",")}]`,
    match_threshold: 0.35,
    match_count: 12,
  },
);

      if (searchError) {
        throw searchError;
      }

      const mappedResults: SearchResult[] = (data ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price ?? undefined,
        category: product.category as any,
        image: product.image,
        rating: Number(product.rating ?? 0),
        reviewCount: product.review_count ?? 0,
        tags: product.tags ?? [],
        zodiacSign: product.zodiac_sign ?? undefined,
        inStock: product.in_stock,
        similarity: Number(product.similarity ?? 0),
      }));

      setResults(mappedResults);

      if (mappedResults.length === 0) {
        setError(
          "No visually similar products found. Try another product photo.",
        );
      }
    } catch (err) {
      console.error("Visual search failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Visual search failed. Please try again.",
      );
    } finally {
      setSearching(false);
      setModelLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-background px-4 py-16 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Be-Zone
          </p>

          <h1 className="font-display text-4xl font-medium tracking-tight md:text-6xl">
            Find it by photo.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            Upload a product photo and discover visually similar products
            from the Be-Zone collection.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          {!image ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              className="
                group
                cursor-pointer
                rounded-[2rem]
                border
                border-dashed
                border-border
                bg-card
                p-10
                text-center
                transition-all
                duration-300
                hover:border-foreground/30
                hover:bg-muted/30
                md:p-16
              "
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background transition-transform duration-300 group-hover:scale-105">
                <ImagePlus className="h-7 w-7 text-muted-foreground" />
              </div>

              <h2 className="mt-6 text-lg font-medium">
                Upload a product image
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop an image here, or browse your device.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Choose image
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use camera
                </Button>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                JPG, PNG, WEBP · Maximum 10 MB
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="relative aspect-square max-h-[520px] bg-muted">
                <img
                  src={image}
                  alt="Selected visual search"
                  className="h-full w-full object-contain"
                />

                <button
                  type="button"
                  onClick={clearImage}
                  aria-label="Remove image"
                  className="
                    absolute
                    right-4
                    top-4
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/70
                    text-white
                    backdrop-blur-md
                    transition-transform
                    hover:scale-105
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 p-5 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={searching}
                  className="sm:flex-1"
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Change image
                </Button>

                <Button
                  type="button"
                  onClick={runVisualSearch}
                  disabled={searching}
                  className="sm:flex-1"
                >
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {modelLoading
                        ? "Preparing visual search..."
                        : "Finding matches..."}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find similar products
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-center text-sm text-destructive">
              {error}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {results.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Visual matches
              </p>

              <h2 className="mt-2 font-display text-3xl font-medium md:text-4xl">
                Products you may like
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-medium">
                      {product.name}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>

                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {Math.round(product.similarity * 100)}% match
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default VisualSearch;