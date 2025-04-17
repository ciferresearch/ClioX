import Button from '@/components/common/Button';
import Container from '@/components/layout/Container';
import Link from 'next/link';
import { DisplayLarge, BodyText } from '@/components/common/Typography';

export default function Hero() {
  return (
    <section className="py-36 relative overflow-hidden">
      {/* Hero background image */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url('/images/hero-background.png')`,
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />

      <Container>
        <div className="flex flex-col relative z-10">
          <DisplayLarge
            className="mb-6"
          >
            Explore archival data securely. Build knowledge collectively.
          </DisplayLarge>

          <BodyText
            align="left"
            className="max-w-4xl mb-15 opacity-90"
          >
            ClioX is a new kind of privacy-first platform—built by and for
            researchers, archivists, and cultural institutions. It's designed to
            help you explore, share, and collaborate on sensitive archival
            material with AI without compromising on privacy or ownership.
          </BodyText>

          <div className="flex gap-10">
            <Link href="#choose-role">
              <Button variant="primary" size="lg" className="cursor-pointer">
                Get Started
              </Button>
            </Link>
            <Link href="#what-we-do">
              <Button variant="secondary" size="lg" className="cursor-pointer">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
} 