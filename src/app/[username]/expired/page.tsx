import type { Metadata } from "next";
import { ExpiredBracelet } from "@/components/profile/expired-bracelet";

export const metadata: Metadata = {
  title: "서비스 만료 | QRit Jewelry",
  description: "서비스 사용 기간이 만료되었습니다.",
};

export default function ExpiredPage() {
  return <ExpiredBracelet />;
}
