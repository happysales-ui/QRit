import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INVALID_ACCOUNT_NO_MESSAGE,
  hasInvalidAccountNoChars,
  isPlaceholderAccountNo,
  normalizeAccountNo,
  parseTransferUrl,
  validateBankAccount,
} from "@/lib/bank-transfer";
import { validateLinkUrl } from "@/lib/link-presets";

describe("validateBankAccount", () => {
  it("rejects missing bank selection", () => {
    assert.equal(validateBankAccount("", "1234567890"), "은행을 선택해 주세요.");
  });

  it("rejects unsupported bank codes", () => {
    assert.equal(
      validateBankAccount("999", "1234567890"),
      "지원하지 않는 은행입니다.",
    );
  });

  it("rejects empty and too-short account numbers", () => {
    assert.equal(validateBankAccount("004", ""), "계좌번호를 입력해 주세요.");
    assert.equal(validateBankAccount("004", "123"), INVALID_ACCOUNT_NO_MESSAGE);
  });

  it("rejects account numbers that are too long", () => {
    assert.equal(
      validateBankAccount("004", "12345678901234567"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
  });

  it("rejects letters and symbols in account numbers", () => {
    assert.equal(
      validateBankAccount("004", "1234567890abc"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
    assert.equal(
      validateBankAccount("004", "123-456-7890!"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
  });

  it("accepts hyphenated account numbers when digits are valid", () => {
    assert.equal(validateBankAccount("004", "3847-2910-5611"), null);
  });

  it("rejects placeholder account numbers", () => {
    assert.equal(
      validateBankAccount("004", "1234567890"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
    assert.equal(
      validateBankAccount("004", "0000000000"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
    assert.equal(
      validateBankAccount("004", "1111111111"),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
  });

  it("accepts realistic account numbers", () => {
    assert.equal(validateBankAccount("004", "384729105611"), null);
    assert.equal(validateBankAccount("088", "110123456789"), null);
  });
});

describe("validateLinkUrl for bank transfer", () => {
  it("validates dashboard form fields on the server", () => {
    const formData = new FormData();
    formData.set("bank_code", "004");
    formData.set("account_no", "123");

    assert.equal(
      validateLinkUrl("계좌 송금", "qrit://transfer", formData),
      INVALID_ACCOUNT_NO_MESSAGE,
    );
  });

  it("requires bank and account when form fields are empty", () => {
    const formData = new FormData();
    formData.set("bank_code", "");
    formData.set("account_no", "");

    assert.equal(
      validateLinkUrl("계좌 송금", "qrit://transfer", formData),
      "은행을 선택해 주세요.",
    );
  });

  it("rejects transfer deep links with invalid account numbers", () => {
    assert.equal(
      validateLinkUrl(
        "계좌 송금",
        "supertoss://send?bank=국민&accountNo=123",
      ),
      "올바른 송금 링크 형식이 아닙니다.",
    );
  });
});

describe("parseTransferUrl", () => {
  it("returns null for invalid account numbers in deep links", () => {
    assert.equal(
      parseTransferUrl("supertoss://send?bank=국민&accountNo=123"),
      null,
    );
  });

  it("parses valid deep links", () => {
    assert.deepEqual(
      parseTransferUrl("supertoss://send?bank=국민&accountNo=384729105611"),
      { bankCode: "004", accountNo: "384729105611" },
    );
  });
});

describe("account helpers", () => {
  it("normalizes account numbers to digits only", () => {
    assert.equal(normalizeAccountNo("1234-5678-9012"), "123456789012");
  });

  it("detects invalid characters", () => {
    assert.equal(hasInvalidAccountNoChars("1234567890"), false);
    assert.equal(hasInvalidAccountNoChars("123-456-7890"), false);
    assert.equal(hasInvalidAccountNoChars("1234567890a"), true);
  });

  it("detects placeholder account numbers", () => {
    assert.equal(isPlaceholderAccountNo("1234567890"), true);
    assert.equal(isPlaceholderAccountNo("384729105611"), false);
  });
});
