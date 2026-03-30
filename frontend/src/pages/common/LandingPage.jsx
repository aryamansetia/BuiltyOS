import FeatureCards from "../../components/home/FeatureCards";
import HomeHero from "../../components/home/HomeHero";
import HowItWorks from "../../components/home/HowItWorks";
import SystemPreview from "../../components/home/SystemPreview";
import TrustMetrics from "../../components/home/TrustMetrics";

function LandingPage() {
  return (
    <section className="landing-stack">
      <HomeHero />
      <SystemPreview />
      <FeatureCards />
      <HowItWorks />
      <TrustMetrics />
    </section>
  );
}

export default LandingPage;
