import { DisplayLarge, BodyText, DisplayMedium } from '@/components/common/Typography';
import Container from '@/components/layout/Container';
import Image from 'next/image';

export default function Pillars() {
  const pillars = [
    {
      id: 1,
      title: 'Ethical Humanities Computing Framework',
      content: 'We are developing a digital Web3 ecosystem designed to ensure that all participants can contribute equitably and benefit fairly.',
      imageSrc: '/images/ethical-framework-icon.svg',
      imageAlt: 'Ethical Humanities Computing Framework'
    },
    {
      id: 2,
      title: 'Cultural Heritage First Approach',
      content: 'Our goal is to have a platform that is collectively owned, operated, and developed for the direct benefit of archives and other cultural heritage institutions - prioritizing their sustainability and growth.',
      imageSrc: '/images/heritage-first-icon.svg',
      imageAlt: 'Cultural Heritage First Approach'
    },
    {
      id: 3,
      title: 'Rethinking Traditional Business Models',
      content: 'Conventional business models have monetized archival and cultural heritage data, generating billion-dollar corporations, often without reinvesting in the archival and cultural heritage community. We seek to shift this dynamic by centering the needs and growth of archives and cultural heritage institutions.',
      imageSrc: '/images/sustainable-model-icon.svg',
      imageAlt: 'Rethinking Traditional Business Models'
    },
  ];

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col items-center text-center mb-24">
          <DisplayLarge align="center" className="mb-6">Our Core Pillars</DisplayLarge>
          <BodyText align="center">
            Building a sustainable and ethical future for digital archives and cultural heritage
          </BodyText>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex flex-col">
              {/* Image */}
              <div className="mb-8 flex items-center justify-center">
                <Image 
                  src={pillar.imageSrc}
                  alt={pillar.imageAlt}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              
              {/* Text content */}
              <div className="space-y-4">
                <DisplayMedium align="center" className="mb-10">
                  {pillar.title}
                </DisplayMedium>
                <BodyText align="center" className="text-lg text-gray-700 leading-relaxed">
                  {pillar.content}
                </BodyText>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
} 