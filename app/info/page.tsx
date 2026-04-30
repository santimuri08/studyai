// app/info/page.tsx
//
// "How StudyAI works" — the marketing/info page.
// Every section animates upward into view as the user scrolls,
// so content rises into the viewport instead of feeling like the
// user falls past it.

import HeroTransition from "@/components/HeroTransition";
import NeuralBackground from "@/components/NeuralBackground";
import PainSection from "@/components/landing/PainSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AISection from "@/components/landing/AISection";
import TopNav from "@/components/landing/TopNav";
import SectionRise from "@/components/landing/SectionRise";
import InfoIntro from "@/components/landing/InfoIntro";

export const metadata = {
  title: "How it works — StudyAI",
  description:
    "See how StudyAI turns messy assignments into clear plans, schedules tasks for you, and tracks your progress.",
};

export default function InfoPage() {
  return (
    <>
      <TopNav />

      {/* Page intro — short, sets the stage so the page doesn't start cold */}
      <InfoIntro />

      <HeroTransition />

      <NeuralBackground variant="dim" gradientFrom="rgba(248,113,113,0.06)">
        <SectionRise distance={90}>
          <PainSection />
        </SectionRise>
      </NeuralBackground>

      <NeuralBackground variant="normal" gradientFrom="rgba(124,111,255,0.09)">
        <SectionRise distance={100}>
          <ProblemSection />
        </SectionRise>
      </NeuralBackground>

      <NeuralBackground variant="normal" gradientFrom="rgba(124,111,255,0.09)">
        <SectionRise distance={90}>
          <FeaturesSection />
        </SectionRise>
      </NeuralBackground>

      <NeuralBackground variant="bright" gradientFrom="rgba(139,92,246,0.11)">
        <SectionRise distance={110}>
          <AISection />
        </SectionRise>
      </NeuralBackground>
    </>
  );
}