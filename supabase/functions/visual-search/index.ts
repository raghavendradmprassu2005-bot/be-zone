import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req, ctx) => {
      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      try {
        if (req.method !== "POST") {
          return Response.json(
            { error: "Method not allowed" },
            {
              status: 405,
              headers: corsHeaders,
            },
          );
        }

        const body = await req.json();

        if (!body.image) {
          return Response.json(
            { error: "Image is required" },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        /*
         * Visual-search pipeline:
         *
         * 1. Receive user's image
         * 2. Generate a visual embedding
         * 3. Compare it with product image embeddings
         * 4. Return the closest products
         *
         * The embedding provider will be connected in the next step.
         */

        return Response.json(
          {
            success: true,
            message: "Visual search endpoint is ready",
            received: true,
          },
          {
            headers: corsHeaders,
          },
        );
      } catch (error) {
        console.error("Visual search error:", error);

        return Response.json(
          {
            error: "Visual search failed",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    },
  ),
};