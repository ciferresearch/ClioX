import Container from '@/components/layout/Container';

export default function Pillars() {
  const pillars = [
    {
      id: 1,
      title: 'Ethical Humanities Computing Framework',
      content: 'We are developing a digital Web3 ecosystem designed to ensure that all participants can contribute equitably and benefit fairly.'
    },
    {
      id: 2,
      title: 'Cultural Heritage First Approach',
      content: 'Our goal is to have a platform that is collectively owned, operated, and developed for the direct benefit of archives and other cultural heritage institutions - prioritizing their sustainability and growth.'
    },
    {
      id: 3,
      title: 'Rethinking Traditional Business Models',
      content: 'Conventional business models have monetized archival and cultural heritage data, generating billion-dollar corporations, often without reinvesting in the archival and cultural heritage community. We seek to shift this dynamic by centering the needs and growth of archives and cultural heritage institutions.'
    },
  ];

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Core Pillars</h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-700">
            Building a sustainable and ethical future for digital archives and cultural heritage
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex flex-col">
              {/* Image placeholder */}
              <div className="border border-gray-200 rounded-lg p-4 mb-8 aspect-[4/3] flex items-center justify-center hover:border-gray-300 transition-colors">
                <div className="w-full h-full bg-gray-100 rounded-md flex flex-col items-center justify-center p-4">
                  <svg
                    className="w-20 h-20 text-gray-400 mb-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
              
              {/* Text content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {pillar.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {pillar.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
} 