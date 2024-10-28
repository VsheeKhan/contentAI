import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import CheckoutButton from "@/components/ui/CheckoutButton";
import { AlertCircle, ArrowLeft, CheckCircle2, X } from "lucide-react";

interface PricingPlanProps {
  parent: boolean;
  handleCancel: () => void;
  currentPlan?: string;
  status?: string;
}

export default function PricingPlan({
  parent,
  handleCancel,
  currentPlan,
  status,
}: PricingPlanProps) {
  const monthlyPrice = 249;
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PLAN_ID;
  return (
    <div className={parent ? "w-full" : "w-full max-w-md mx-auto"}>
      <Card className="w-full">
        <CardHeader className="space-y-6">
          {parent ? (
            <button
              onClick={handleCancel}
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
            </button>
          )}

          <CardTitle className="text-3xl sm:text-4xl font-bold text-center">
            Plan Pricing
          </CardTitle>
          <CardDescription className="text-2xl sm:text-3xl font-bold text-center">
            Pro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-center">
            {status === "cancelled" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Subscription Cancelled</AlertTitle>
                <AlertDescription>
                  Your subscription has been canceled but is still active till
                  the end of the current billing cycle. Renew your subscription
                  at the end of the billing period to continue enjoying premium
                  benefits.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <p className="text-3xl sm:text-4xl font-bold mt-2">
                ${monthlyPrice}
                <span className="text-lg sm:text-xl font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-muted-foreground mt-1">Unlimited posts</p>
            </div>
            <ul className="space-y-2 inline-block text-left">
              {[
                "Custom analytics",
                "Unlimited users",
                "Content calendar",
                "AI writing assistant",
                "API access",
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "cancelled" && (
            <CheckoutButton
              priceId={stripePublicKey || ""}
              plan={currentPlan}
              handleCancel={handleCancel}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
