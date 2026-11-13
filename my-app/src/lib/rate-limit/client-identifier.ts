import "server-only";

import type { NextRequest } from "next/server";

export function getClientIdentifier(
  _request: NextRequest,
): string {
  if (process.env.NODE_ENV !== "production") {
    return "development:local";
  }

  throw new Error(
    "Production client identification is not configured",
  );
}
