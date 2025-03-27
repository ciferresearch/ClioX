import Container from '@/components/layout/Container';

export default function Pillars() {
  const pillars = [
    { id: 1, title: 'Pillar 1', content: 'Description of the first pillar or ethos of Clio X.' },
    { id: 2, title: 'Pillar 2', content: 'Description of the second pillar or ethos of Clio X.' },
    { id: 3, title: 'Pillar 3', content: 'Description of the third pillar or ethos of Clio X.' },
  ];

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="flex items-center gap-3 mb-12">
          <h2 className="text-2xl font-bold">Pillars/Ethos of Clio X</h2>
        </div>
        
        <div className="max-w-4xl mx-auto mb-16">
          <div className="h-6 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex flex-col">
              {/* Image placeholder */}
              <div className="border border-gray-300 rounded-md p-4 mb-6 aspect-[4/3] flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded-md flex flex-col items-center justify-center p-4">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-2"
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
                  <span className="text-gray-500 text-sm text-center">
                    {pillar.title} Image
                  </span>
                </div>
              </div>
              
              {/* Text description */}
              <div className="space-y-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
} 