import { readFile } from "node:fs/promises";
import { circularSchema } from "../src/lib/deals/schema";
import { processCircular } from "../src/lib/deals/process-deals";

async function main() {
  const file = await readFile(
    "data/sample-foodtown-deals.json",
    "utf8"
  );

  const rawData: unknown = JSON.parse(file);

  const validation = circularSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Circular validation failed:");

    console.error(
      JSON.stringify(validation.error.issues, null, 2)
    );

    process.exitCode = 1;
    return;
  }

  const result = processCircular(validation.data);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Failed to process circular:", error);
  process.exitCode = 1;
});
