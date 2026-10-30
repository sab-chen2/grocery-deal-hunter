import type {
  CircularData,
  Deal,
  ProcessedDeal,
} from "./types";

function isValidDeal(deal: Deal): boolean {
  return (
    typeof deal.productName === "string" &&
    deal.productName.trim().length > 0 &&
    typeof deal.advertisedPrice === "number" &&
    Number.isFinite(deal.advertisedPrice) &&
    deal.advertisedPrice > 0 &&
    typeof deal.priceUnit === "string" &&
    deal.priceUnit.trim().length > 0 &&
    typeof deal.requiresLoyaltyCard === "boolean" &&
    typeof deal.requiresDigitalCoupon === "boolean" &&
    Number.isInteger(deal.minimumQuantity) &&
    deal.minimumQuantity >= 1
  );
}

function processDeal(deal: Deal): ProcessedDeal {
  const reasons: string[] = [];

  if (deal.requiresLoyaltyCard) {
    reasons.push("Loyalty card required");
  }

  if (deal.requiresDigitalCoupon) {
    reasons.push("Digital coupon required");
  }

  if (deal.minimumQuantity > 1) {
    reasons.push("Minimum purchase quantity required");
  }

  return {
    ...deal,
    eligibleForDefaultComparison: reasons.length === 0,
    reason: reasons.length > 0 ? reasons.join("; ") : null,
  };
}

export function processCircular(data: CircularData) {
  const validDeals: ProcessedDeal[] = [];
  const rejectedDeals: unknown[] = [];

  for (const deal of data.deals) {
    if (!isValidDeal(deal)) {
      rejectedDeals.push(deal);
      continue;
    }

    validDeals.push(processDeal(deal));
  }

  return {
    source: data.source,
    validDeals,
    rejectedDeals,
    summary: {
      total: data.deals.length,
      valid: validDeals.length,
      rejected: rejectedDeals.length,
      eligibleForDefaultComparison: validDeals.filter(
        (deal) => deal.eligibleForDefaultComparison
      ).length,
    },
  };
}
