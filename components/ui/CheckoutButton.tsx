import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "./button";
import { authFetch } from "@/app/utils/authFetch";
import { toast } from "@/hooks/use-toast";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublishableKey || "");

export default function CheckoutButton({
  priceId,
  plan,
  handleCancel,
}: {
  priceId: string;
  plan?: string;
  handleCancel?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId } = await res.json();

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: `${error}`,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/cancel-subscription", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to cancel subscription");
      }
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been successfully canceled.",
      });
      handleCancel && handleCancel();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: `${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={
        plan && plan === "pro" ? handleCancelSubscription : handleSubscribe
      }
      disabled={loading}
      className="w-full text-lg py-6"
      variant={plan && plan === "pro" ? "destructive" : "default"}
    >
      {loading
        ? "Loading..."
        : plan && plan === "pro"
        ? "Cancel Subscription"
        : "Subscribe"}
    </Button>
  );
}
