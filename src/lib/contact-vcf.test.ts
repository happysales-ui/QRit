import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMecardUrl,
  parseContactFieldsFromUrl,
  parseMecard,
  resolveContactFromUrl,
  sanitizeContactUrl,
  validateMecardContactUrl,
} from "@/lib/contact-vcf";

describe("parseMecard", () => {
  it("parses standard MECARD with Korean name and mobile number", () => {
    assert.deepEqual(
      parseMecard("MECARD:N:천종성 알파크레인대표;TEL:01012345678;"),
      { name: "천종성 알파크레인대표", tel: "01012345678" },
    );
  });

  it("ignores placeholder TEL values", () => {
    assert.deepEqual(
      parseMecard("MECARD:N:천종성 알파크레인대표;TEL:연락처;"),
      { name: "천종성 알파크레인대표", tel: "" },
    );
  });

  it("supports equals delimiters and dashed phone numbers", () => {
    assert.deepEqual(
      parseMecard("MECARD:N=김지우;TEL=010-1234-5678;"),
      { name: "김지우", tel: "01012345678" },
    );
  });
});

describe("sanitizeContactUrl", () => {
  it("strips https prefix accidentally saved on MECARD rows", () => {
    assert.equal(
      sanitizeContactUrl("https://MECARD:N:이름;TEL:01012345678;"),
      "MECARD:N:이름;TEL:01012345678;",
    );
  });
});

describe("resolveContactFromUrl", () => {
  it("falls back to tel: URLs", () => {
    assert.deepEqual(resolveContactFromUrl("tel:010-9876-5432"), {
      name: "",
      tel: "01098765432",
    });
  });

  it("falls back to bare mobile numbers", () => {
    assert.deepEqual(resolveContactFromUrl("01055556666"), {
      name: "",
      tel: "01055556666",
    });
  });
});

describe("buildMecardUrl", () => {
  it("normalizes phone digits in stored payload", () => {
    assert.equal(
      buildMecardUrl("천종성", "010-1234-5678"),
      "MECARD:N:천종성;TEL:01012345678;",
    );
  });
});

describe("parseContactFieldsFromUrl", () => {
  it("returns editable dashboard fields from stored MECARD", () => {
    assert.deepEqual(
      parseContactFieldsFromUrl("MECARD:N:천종성;TEL:01012345678;"),
      { name: "천종성", tel: "01012345678" },
    );
  });
});

describe("validateMecardContactUrl", () => {
  it("rejects template phone placeholders", () => {
    assert.match(
      validateMecardContactUrl("MECARD:N:천종성;TEL:연락처;") ?? "",
      /전화번호|연락처/u,
    );
  });
});
