import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INVITE_CODE_CHARSET,
  isValidInviteCodeFormat,
  normalizeInviteCode,
} from "./invite-codes";

describe("invite code format", () => {
  it("accepts U7JVST (reported production code)", () => {
    assert.equal(isValidInviteCodeFormat("U7JVST"), true);
    assert.equal(normalizeInviteCode(" u7jvst "), "U7JVST");
  });

  it("rejects ambiguous characters 0, O, 1, I, L", () => {
    for (const char of ["0", "O", "1", "I", "L"]) {
      assert.equal(isValidInviteCodeFormat(`A3X9K${char}`), false);
    }
  });

  it("generates only from the safe charset", () => {
    for (const char of INVITE_CODE_CHARSET) {
      assert.equal(isValidInviteCodeFormat(`${char}${char}${char}${char}${char}${char}`), true);
    }
  });
});
