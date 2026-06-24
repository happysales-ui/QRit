import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AuthError } from "@supabase/supabase-js";
import {
  getInviteSignupServiceRoleErrorMessage,
  isMissingConsumeInviteCodeFunction,
  isMissingExpiredAtColumnError,
  isMissingPhoneColumnError,
  isMissingVerifyInviteCodeFunction,
  mapConsumeInviteCodeError,
  mapConsumeInviteCodeRpcError,
  mapConsumeInviteCodeRpcResponse,
  mapProfileQueryError,
  mapSignUpError,
  mapVerifyInviteCodeRpcError,
  mapVerifyInviteCodeStatus,
  resolveInviteVerifyResult,
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

describe("mapConsumeInviteCodeRpcResponse", () => {
  it("succeeds when atomic RPC returns true", () => {
    assert.deepEqual(mapConsumeInviteCodeRpcResponse(true, false), { ok: true });
  });

  it("fails when RPC returns false (already used or missing)", () => {
    assert.deepEqual(mapConsumeInviteCodeRpcResponse(false, false), {
      ok: false,
      reason: "code_not_consumed",
    });
  });

  it("fails when RPC returns null", () => {
    assert.deepEqual(mapConsumeInviteCodeRpcResponse(null, false), {
      ok: false,
      reason: "code_not_consumed",
    });
  });

  it("fails on RPC error", () => {
    assert.deepEqual(mapConsumeInviteCodeRpcResponse(null, true), {
      ok: false,
      reason: "update_failed",
    });
  });
});

describe("mapConsumeInviteCodeError", () => {
  it("returns service role config message", () => {
    const message = mapConsumeInviteCodeError("service_role_not_configured");
    assert.match(message, /SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("returns Korean message for update failure", () => {
    const message = mapConsumeInviteCodeError("update_failed");
    assert.match(message, /초대 코드 처리/);
  });

  it("returns migration hint when consume RPC is missing", () => {
    const message = mapConsumeInviteCodeError("rpc_missing");
    assert.match(message, /022_consume_invite_code_atomic/);
  });

  it("returns permission hint when RPC grant is missing", () => {
    const message = mapConsumeInviteCodeError("rpc_permission_denied");
    assert.match(message, /권한/);
    assert.match(message, /022_consume_invite_code_atomic/);
  });

  it("returns Korean message when code was not consumed", () => {
    const message = mapConsumeInviteCodeError("code_not_consumed");
    assert.match(message, /이미 사용/);
  });
});

describe("resolveInviteVerifyResult", () => {
  it("accepts legacy boolean true", () => {
    assert.deepEqual(resolveInviteVerifyResult(true), { ok: true });
  });

  it("accepts status text valid", () => {
    assert.deepEqual(resolveInviteVerifyResult("valid"), { ok: true });
  });

  it("accepts JSON-coerced true string", () => {
    assert.deepEqual(resolveInviteVerifyResult("true"), { ok: true });
  });

  it("maps legacy boolean false to generic invalid message", () => {
    const result = resolveInviteVerifyResult(false);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /유효하지 않은 인증코드/);
    }
  });

  it("maps JSON-coerced false string to generic invalid message", () => {
    const result = resolveInviteVerifyResult("false");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /유효하지 않은 인증코드/);
    }
  });

  it("maps not_found status", () => {
    const result = resolveInviteVerifyResult("not_found");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /찾을 수 없습니다/);
    }
  });

  it("maps already_used status", () => {
    const result = resolveInviteVerifyResult("already_used");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.message, /이미 사용/);
    }
  });
});

describe("isMissingConsumeInviteCodeFunction", () => {
  it("detects undefined function", () => {
    assert.equal(
      isMissingConsumeInviteCodeFunction(
        pgError("PGRST202", "Could not find the function public.consume_invite_code"),
      ),
      true,
    );
  });
});

describe("mapConsumeInviteCodeRpcError", () => {
  it("maps missing RPC to rpc_missing", () => {
    assert.equal(
      mapConsumeInviteCodeRpcError(
        pgError("PGRST202", "Could not find the function public.consume_invite_code"),
      ),
      "rpc_missing",
    );
  });

  it("maps permission denied to rpc_permission_denied", () => {
    assert.equal(
      mapConsumeInviteCodeRpcError(pgError("42501", "permission denied for function consume_invite_code")),
      "rpc_permission_denied",
    );
  });

  it("maps unknown errors to update_failed", () => {
    assert.equal(
      mapConsumeInviteCodeRpcError(pgError("XX000", "unexpected database error")),
      "update_failed",
    );
  });
});

describe("mapVerifyInviteCodeRpcError", () => {
  it("returns migration hint when RPC is missing", () => {
    const message = mapVerifyInviteCodeRpcError(
      pgError("PGRST202", "Could not find the function public.verify_invite_code"),
    );
    assert.match(message, /015_invite_codes/);
  });
});

describe("isMissingVerifyInviteCodeFunction", () => {
  it("detects undefined function", () => {
    assert.equal(
      isMissingVerifyInviteCodeFunction(
        pgError("42883", 'function verify_invite_code(text) does not exist'),
      ),
      true,
    );
  });
});

describe("mapVerifyInviteCodeStatus", () => {
  it("maps already_used", () => {
    assert.match(mapVerifyInviteCodeStatus("already_used"), /이미 사용/);
  });

  it("maps not_found", () => {
    assert.match(mapVerifyInviteCodeStatus("not_found"), /찾을 수 없습니다/);
  });
});

describe("getInviteSignupServiceRoleErrorMessage", () => {
  it("includes service role key hint", () => {
    const message = getInviteSignupServiceRoleErrorMessage();
    assert.match(message, /SUPABASE_SERVICE_ROLE_KEY/);
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
