import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatFreeUntilMessage,
  isSubscriptionExpired,
} from "@/lib/subscription";

describe("isSubscriptionExpired", () => {
  const now = new Date("2026-06-20T12:00:00.000Z");

  it("returns false for paid users regardless of free_until", () => {
    assert.equal(
      isSubscriptionExpired(
        {
          subscription_status: "paid",
          free_until: "2020-01-01T00:00:00.000Z",
        },
        now,
      ),
      false,
    );
  });

  it("returns false when free period is still active", () => {
    assert.equal(
      isSubscriptionExpired(
        {
          subscription_status: "free",
          free_until: "2027-06-20T00:00:00.000Z",
        },
        now,
      ),
      false,
    );
  });

  it("returns true when free period has ended", () => {
    assert.equal(
      isSubscriptionExpired(
        {
          subscription_status: "free",
          free_until: "2025-01-01T00:00:00.000Z",
        },
        now,
      ),
      true,
    );

    assert.equal(
      isSubscriptionExpired(
        {
          subscription_status: "expired",
          free_until: "2025-01-01T00:00:00.000Z",
        },
        now,
      ),
      true,
    );
  });
});

describe("formatFreeUntilMessage", () => {
  it("formats Korean free-until message", () => {
    const message = formatFreeUntilMessage("2027-06-20T00:00:00.000Z");
    assert.match(message, /2027년/);
    assert.match(message, /6월/);
    assert.match(message, /20일/);
    assert.match(message, /까지 무료 이용 가능/);
  });
});
