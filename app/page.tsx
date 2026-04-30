// app/page.tsx
//
// Homepage. Chat-first.
// Just the TopNav and the Hero (which hosts the guest chat).
// All marketing content (pain points, transformation steps, features,
// "Powered by Claude AI") lives on /info — accessible via the "Info"
// link in the nav.

import Hero from "@/components/landing/Hero";
import TopNav from "@/components/landing/TopNav";

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <Hero />
    </>
  );
}