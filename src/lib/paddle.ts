import { resolvePaddlePrice } from "./payments.functions";

type PaddleWindow = Window & { Paddle?: {
  Environment: { set: (value: "sandbox" | "production") => void };
  Initialize: (options: { token: string }) => void;
  Checkout: { open: (options: { items: { priceId: string; quantity: number }[]; customer?: { email: string }; customData: { userId: string }; settings: { displayMode: "overlay"; successUrl: string; allowLogout: boolean; variant: "one-page" } }) => void };
} };
const token = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] as string | undefined;
export function getPaddleEnvironment(): "sandbox" | "live" { return token?.startsWith("test_") ? "sandbox" : "live"; }
let ready: Promise<void> | undefined;
export function initializePaddle() {
  if (!token) return Promise.reject(new Error("Payments are unavailable right now."));
  ready ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      try {
        const paddle = (window as PaddleWindow).Paddle;
        if (!paddle) throw new Error("Payment window could not open.");
        paddle.Environment.set(getPaddleEnvironment() === "sandbox" ? "sandbox" : "production");
        paddle.Initialize({ token }); resolve();
      } catch (error) { ready = undefined; reject(error); }
    };
    script.onerror = () => { ready = undefined; reject(new Error("Payment window could not load.")); };
    document.head.appendChild(script);
  });
  return ready;
}
export async function openProCheckout(user: { id: string; email?: string }) {
  await initializePaddle();
  const priceId = await resolvePaddlePrice({ data: { priceId: "pro_monthly", environment: getPaddleEnvironment() } });
  (window as PaddleWindow).Paddle?.Checkout.open({ items: [{ priceId, quantity: 1 }],
    ...(user.email ? { customer: { email: user.email } } : {}), customData: { userId: user.id },
    settings: { displayMode: "overlay", successUrl: `${location.origin}/checkout/success`, allowLogout: false, variant: "one-page" },
  });
}