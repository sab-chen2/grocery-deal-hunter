export type { Deal, CircularData } from "./schema";

import type { Deal } from "./schema";

export type ProcessedDeal = Deal & {
  eligibleForDefaultComparison: boolean;
  reason: string | null;
};
