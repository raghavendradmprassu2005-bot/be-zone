import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

const MODEL = "Xenova/clip-vit-base-patch32";

const getExtractor = async () => {
  if (!extractorPromise) {
    extractorPromise = pipeline("image-feature-extraction", MODEL, {
      dtype: "q8",
    });
  }

  return extractorPromise;
};

export const createImageEmbedding = async (
  image: Blob | string,
): Promise<number[]> => {
  const extractor = await getExtractor();

  const output = await extractor(image, {
    pooling: "mean",
    normalize: true,
  });

  const values = Array.from(output.data as Float32Array);

  if (values.length !== 512) {
    throw new Error(
      `Unexpected image embedding size: ${values.length}. Expected 512.`,
    );
  }

  return values;
};