import Container from '@/components/layout/Container';
import Button from '@/components/common/Button';

export default function ContactAndOnboarding() {
  return (
    <section className="py-24">
      <Container>
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Contact Section - Left Side */}
          <div className="flex flex-col md:col-span-2 justify-self-start">
            {/* Contact Header */}
            <div className="bg-gray-100 p-4 rounded-md mb-8">
              <h3 className="text-xl font-semibold">Contact Us Header with CTA here</h3>
            </div>
            
            {/* Placeholder text lines */}
            <div className="space-y-4 mb-12">
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
            
            {/* Contact Details */}
            <div className="bg-gray-100 p-4 rounded-md mb-8">
              <h3 className="text-xl font-semibold">Contact Details with Github hyperlink and email</h3>
            </div>
            
            {/* More placeholder text lines */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          
          {/* Onboarding Section - Right Side */}
          <div className="bg-blue-100 p-8 rounded-md flex flex-col items-center justify-center text-center justify-self-end h-full">
            <h3 className="text-2xl font-bold mb-6">[First time Visiting Section/Onboarding]</h3>
            <div className="space-y-4 mb-8">
              <p className="text-lg">Quick start guide information will go here.</p>
              <p className="text-lg">Hyperlink to onboarding button below.</p>
            </div>
            <Button variant="primary" size="lg" className="px-8">Button</Button>
          </div>
        </div>
      </Container>
    </section>
  );
} 