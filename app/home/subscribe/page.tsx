"use client";

import PricingPlan from "@/app/components/pricing-plan";
import { useRouter, useSearchParams } from "next/navigation";

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") || "free";
  const status = searchParams?.get("status") || undefined;

  return (
    <PricingPlan
      parent={true}
      handleCancel={() => router.push("/home/generate")}
      currentPlan={plan}
      status={status}
    />
  );
}
