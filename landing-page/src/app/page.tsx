import Hero from '@/components/sections/home/Hero';
import ChooseRole from '@/components/sections/home/ChooseRole';
import WhatWeDo from '@/components/sections/home/WhatWeDo';
import Pillars from '@/components/sections/home/Pillars';
import ContactAndOnboarding from '@/components/sections/home/Contact';
import FAQ from '@/components/sections/home/FAQ';

export default function Home() {
  return (
    <main>
      <Hero />
      <ChooseRole />
      <WhatWeDo />
      <Pillars />
      <FAQ />
      <ContactAndOnboarding />
    </main>
  );
}
