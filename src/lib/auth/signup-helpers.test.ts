import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AuthError } from "@supabase/supabase-js";
import {
  isMissingExpiredAtColumnError,
  isMissingPhoneColumnError,
  mapProfileQueryError,
  mapSignUpError,
  resolveSignUpResult,
} from "./signup-helpers";

function pgError(code: string, message: string) {
  return { code, message, details: "", hint: "", name: "PostgrestError" } as const;
}

describe("isMissingPhoneColumnError", () => {
  it("detects Postgres undefined column code", () => {
    assert.equal(isMissingPhoneColumnError(pgError("42703", 'column "phone" does not exist')), true);
  });

  it("detects PostgREST schema cache miss", () => {
    assert.equal(
      isMissingPhoneColumnError(
        pgError("PGRST204", "Could not find the 'phone' column of 'profiles'"),
      ),
      true,
    );
  });
});

describe("mapProfileQueryError", () => {
  it("returns migration hint for missing phone column", () => {
    const message = mapProfileQueryError(
      pgError("PGRST204", "Could not find the 'phone' column of 'profiles'"),
    );
    assert.match(message, /009_signup_trigger_fix/);
  });

  it("returns migration hint for missing expired_at column", () => {
    const message = mapProfileQueryError(
      pgError("42703", 'column profiles.expired_at does not exist'),
    );
    assert.match(message, /expired_at/);
    assert.match(message, /009_signup_trigger_fix/);
  });
});

describe("isMissingExpiredAtColumnError", () => {
  it("detects missing expired_at", () => {
    assert.equal(
      isMissingExpiredAtColumnError(pgError("42703", "column profiles.expired_at does not exist")),
      true,
    );
  });
});

describe("mapSignUpError", () => {
  it("maps duplicate user to Korean phone message", () => {
    const message = mapSignUpError({
      name: "AuthApiError",
      message: "User already registered",
      status: 400,
    } as AuthError);
    assert.equal(message, "이미 가입된 휴대폰 번호입니다.");
  });

  it("maps database trigger failure to migration hint", () => {
    const message = mapSignUpError({
      name: "AuthApiError",
      message: "Database error saving new user",
      status: 500,
    } as AuthError);
    assert.match(message, /009_signup_trigger_fix/);
  });
});

describe("resolveSignUpResult", () => {
  it("redirects when session exists", () => {
    assert.deepEqual(
      resolveSignUpResult({
        user: { id: "u1" } as never,
        session: { access_token: "t" } as never,
      }),
      { redirectTo: "/dashboard" },
    );
  });

  it("shows success when user exists without session", () => {
    const result = resolveSignUpResult({
      user: { id: "u1" } as never,
      session: null,
    });
    assert.ok(result.success);
    assert.match(result.success!, /이메일 확인/);
  });

  it("errors when neither user nor session", () => {
    const result = resolveSignUpResult({ user: null, session: null });
    assert.ok(result.error);
  });
});
