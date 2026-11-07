
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { readFile, mkdir, writeFile } from "node:fs/promises";

import { circularSchema } from "../src/lib/deals/schema";
import { processCircular } from "../src/lib/deals/process-deals";

const IMAGE_PATH =
  "data/circulars/foodtown-2026-10-30-page-1.jpg";

const OUTPUT_PATH =
  "data/extracted/foodtown-2026-10-30.json";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Read the circular image from disk.
  const image = await readFile(IMAGE_PATH);
  const base64Image = image.toString("base64");

  // Ask Gemini to extract the grocery offers.
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [
      {
        text: `
Extract grocery deals from this Foodtown circular.

Return one JSON object with this structure:

{
  "source": {
    "store": "Foodtown",
    "circularPage": 1,
    "validFrom": "2026-10-30",
    "validTo": "2026-11-05"
  },
  "deals": [
    {
      "productName": "Example Product",
      "advertisedPrice": 1.99,
      "priceUnit": "each",
      "requiresLoyaltyCard": false,
      "requiresDigitalCoupon": false,
      "minimumQuantity": 1
    }
  ]
}

Rules:
- Extract only clearly readable offers.
- Never invent products, prices, or conditions.
- Do not assume a loyalty card or coupon is unnecessary.
- Exclude offers with uncertain required fields.
- Preserve minimum purchase quantities.
- For a 2-for-$5 offer, use advertisedPrice 5,
  priceUnit "2 items", and minimumQuantity 2.
- For per-pound prices, use priceUnit "lb".
- Use the supplied validity dates and page index.
- Include coupon and loyalty requirements when shown.
- Return JSON only.
        `.trim(),
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned no text.");
  }

  // Parse the model's JSON response.
  const rawData: unknown = JSON.parse(response.text);

  // Validate the structure with our existing Zod schema.
  const validation = circularSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Zod validation failed:");
    console.error(validation.error.issues);
    process.exitCode = 1;
    return;
  }

  // Reuse our existing deal-processing logic.
  const result = processCircular(validation.data);

  // Save results for manual verification.
  await mkdir("data/extracted", { recursive: true });

  await writeFile(
    OUTPUT_PATH,
    JSON.stringify(
      {
        verificationStatus: "pending",
        ...result,
      },
      null,
      2
    )
  );

  console.log("Extraction complete.");
  console.log(result.summary);
  console.log(`Saved results to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("Extraction failed:", error);
  process.exitCode = 1;
});

