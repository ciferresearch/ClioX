import Hero from '@/components/sections/home/Hero';
import Ecosystem from '@/components/sections/home/Ecosystem';
import Portals from '@/components/sections/home/Portals';
import Features from '@/components/sections/home/Features';
import Resources from '@/components/sections/home/Resources';
import CaseStudies from '@/components/sections/home/CaseStudies';

export default function Home() {
  return (
    <>
      <Hero />
      <Ecosystem />
      <Portals />
      <Features />
      <Resources />
      <CaseStudies />
    </>
  );
}
