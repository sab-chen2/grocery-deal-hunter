import "server-only";
import type { NextRequest } from "next/server";

export function validateOrigin(request: NextRequest): boolean {
  const configuredOrigin = process.env.APP_ORIGIN;

  // Fail closed if the trusted origin is not configured.
  if (!configuredOrigin) {
    return false;
  }

  const requestOrigin = request.headers.get("origin");

  // Reject requests without an Origin header.
  if (!requestOrigin) {
    return false;
  }

  try {
    const trustedOrigin = new URL(configuredOrigin);
    const suppliedOrigin = new URL(requestOrigin);

    // Require a complete, canonical origin rather than a URL
    // containing a path, query string, or credentials.
    if (
      configuredOrigin !== trustedOrigin.origin ||
      requestOrigin !== suppliedOrigin.origin
    ) {
      return false;
    }

    // Compare the complete origin: scheme, hostname, and port.
    return suppliedOrigin.origin === trustedOrigin.origin;
  } catch {
    // Reject malformed origin values.
    return false;
  }
}
