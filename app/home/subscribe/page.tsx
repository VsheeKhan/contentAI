"use client";

import PricingPlan from "@/app/components/pricing-plan";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();
  return (
    <PricingPlan
      parent={true}
      handleCancel={() => router.push("/home/generate")}
    />
  );
}
