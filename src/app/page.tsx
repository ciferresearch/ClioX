import Hero from '@/components/sections/home/Hero';
import ChooseRole from '@/components/sections/home/ChooseRole';
import WhatWeDo from '@/components/sections/home/WhatWeDo';
import Pillars from '@/components/sections/home/Pillars';
import ContactAndOnboarding from '@/components/sections/home/Contact';

export default function Home() {
  return (
    <main>
      <Hero />
      <ChooseRole />
      <WhatWeDo />
      <Pillars />
      <ContactAndOnboarding />
    </main>
  );
}
