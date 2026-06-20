"use client";

import { useState, type InputHTMLAttributes } from "react";
import { normalizePhone } from "@/lib/auth/validation";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "onChange" | "value"> {
  helperClassName?: string;
}

export function PhoneInput({
  helperClassName = "mt-1 text-xs text-zinc-400",
  className,
  ...props
}: PhoneInputProps) {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        {...props}
        type="tel"
        inputMode="numeric"
        autoComplete={props.autoComplete ?? "tel"}
        value={value}
        maxLength={11}
        onChange={(event) => setValue(normalizePhone(event.target.value))}
        className={className}
        placeholder={props.placeholder ?? "01012345678"}
      />
      <p className={helperClassName}>숫자만 입력 (하이픈 없이 10~11자리)</p>
    </>
  );
}
