import { useEffect, useRef } from "react";

import FeatureCards from "../../components/home/FeatureCards";
import HomeHero from "../../components/home/HomeHero";
import HowItWorks from "../../components/home/HowItWorks";
import TrustMetrics from "../../components/home/TrustMetrics";

function LandingPage() {
  const revealRootRef = useRef(null);

  useEffect(() => {
    const revealRoot = revealRootRef.current;
    if (!revealRoot) {
      return;
    }

    const revealSections = Array.from(revealRoot.querySelectorAll("[data-reveal-section]"));
    if (revealSections.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealSections.forEach((sectionElement) => {
        sectionElement.classList.add("is-visible");
      });
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12
      }
    );

    revealSections.forEach((sectionElement, index) => {
      sectionElement.style.setProperty("--reveal-delay", `${index * 70}ms`);
      revealObserver.observe(sectionElement);
    });

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  return (
    <section ref={revealRootRef} className="grid gap-6">
      <div data-reveal-section className="landing-reveal-section">
        <HomeHero />
      </div>
      <div data-reveal-section className="landing-reveal-section">
        <FeatureCards />
      </div>
      <div data-reveal-section className="landing-reveal-section">
        <HowItWorks />
      </div>
      <div data-reveal-section className="landing-reveal-section">
        <TrustMetrics />
      </div>
    </section>
  );
}

export default LandingPage;
