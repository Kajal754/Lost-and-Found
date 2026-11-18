import Hero from "../components/website/Hero";
import Statistics from "../components/website/Statistics";
import HowItWorks from "../components/website/HowItWorks";
import Features from "../components/website/Features";
import InstallApp from "../components/website/InstallApp";
import CallToAction from "../components/website/CallToAction";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Statistics />
      <HowItWorks />
      <Features />
      <InstallApp />
      <CallToAction />
    </main>
  );
}