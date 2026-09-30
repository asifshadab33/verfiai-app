import { getPaddleEnvironment } from "@/lib/paddle";
export function PaymentTestModeBanner() {
  return getPaddleEnvironment() === "sandbox" ? <p className="border-b border-warning bg-warning-soft px-4 py-2 text-center text-sm text-foreground">Payments in this preview are for testing only. No real charges are made.</p> : null;
}