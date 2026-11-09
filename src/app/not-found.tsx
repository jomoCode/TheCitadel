import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <p className="text-eyebrow text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">This page has moved on.</h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">The page you are looking for doesn&apos;t exist — but your next home might.</p>
      <Link href="/" className={buttonVariants({ variant: "solid", size: "lg", className: "mt-8" })}>Return home</Link>
    </main>
  );
}
