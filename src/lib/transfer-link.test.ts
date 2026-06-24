import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getTransferLinkFullUrl,
  inferTransferLinkFormState,
  isTransferLink,
} from "@/lib/transfer-link";
import { TRANSFER_URL_MARKER } from "@/lib/transfer-gateway";

describe("isTransferLink", () => {
  it("detects transfer links by bank columns regardless of title", () => {
    assert.equal(
      isTransferLink({
        title: "사업용",
        url: TRANSFER_URL_MARKER,
        bank_code: "004",
        account_no: "384729105611",
      }),
      true,
    );
  });

  it("detects legacy transfer links by default title", () => {
    assert.equal(
      isTransferLink({
        title: "계좌 송금",
        url: TRANSFER_URL_MARKER,
        bank_code: null,
        account_no: null,
      }),
      true,
    );
  });

  it("does not treat unrelated custom titles as transfer links", () => {
    assert.equal(
      isTransferLink({
        title: "인스타그램",
        url: "https://instagram.com/example",
        bank_code: null,
        account_no: null,
      }),
      false,
    );
  });
});

describe("inferTransferLinkFormState", () => {
  it("preserves custom transfer alias when editing", () => {
    assert.deepEqual(
      inferTransferLinkFormState({
        title: "개인",
        url: TRANSFER_URL_MARKER,
        bank_code: "004",
        account_no: "384729105611",
      }),
      { preset: "계좌 송금", transferAlias: "개인" },
    );
  });
});

describe("getTransferLinkFullUrl", () => {
  it("builds absolute transfer gateway URLs", () => {
    assert.equal(
      getTransferLinkFullUrl("https://qrit.example", "kim", "abc-123"),
      "https://qrit.example/kim/transfer/abc-123",
    );
  });
});
