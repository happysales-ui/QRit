import { redirect } from "next/navigation";
import { QRIT_SHOP_URL } from "@/lib/qrit-config";

export default function HomePage() {
  redirect(QRIT_SHOP_URL);
}
