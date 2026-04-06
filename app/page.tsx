import Hero from "@/components/landing/Hero";
import HeroTransition from "@/components/HeroTransition";
import NeuralBackground from "@/components/NeuralBackground";
import PainSection from "@/components/landing/PainSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AISection from "@/components/landing/AISection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HeroTransition />

      <NeuralBackground variant="dim" gradientFrom="rgba(248,113,113,0.06)">
        <PainSection />
      </NeuralBackground>

      <NeuralBackground variant="normal" gradientFrom="rgba(124,111,255,0.09)">
        <ProblemSection />
      </NeuralBackground>

      <NeuralBackground variant="normal" gradientFrom="rgba(124,111,255,0.09)">
        <FeaturesSection />
      </NeuralBackground>

      <NeuralBackground variant="bright" gradientFrom="rgba(139,92,246,0.11)">
        <AISection />
      </NeuralBackground>
    </>
  );
}