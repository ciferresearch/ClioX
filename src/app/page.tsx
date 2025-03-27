import Hero from '@/components/sections/home/Hero';
import WhatWeDo from '@/components/sections/home/WhatWeDo';
import Pillars from '@/components/sections/home/Pillars';
import ContactAndOnboarding from '@/components/sections/home/Contact';

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <Pillars />
      <ContactAndOnboarding />
    </main>
  );
}
