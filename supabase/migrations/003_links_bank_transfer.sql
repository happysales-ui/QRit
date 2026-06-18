-- Bank transfer fields for 계좌 송금 links (nullable; only populated for transfer links)

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS bank_code TEXT,
  ADD COLUMN IF NOT EXISTS account_no TEXT;

COMMENT ON COLUMN public.links.bank_code IS '금융결제원 은행 코드 (계좌 송금 링크 전용)';
COMMENT ON COLUMN public.links.account_no IS '계좌번호 숫자만 (계좌 송금 링크 전용)';
