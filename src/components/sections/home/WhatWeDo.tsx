import Container from '@/components/layout/Container';

export default function WhatWeDo() {
  // Using placeholder images instead of SVG files
  const partners = [
    { id: 1, name: 'Partner 1' },
    { id: 2, name: 'Partner 2' },
    { id: 3, name: 'Partner 3' },
    { id: 4, name: 'Partner 4' },
  ];

  return (
    <section id="what-we-do" className="py-24 bg-white">
      <Container>
        {/* Top Section */}
        <div className="flex flex-col items-center text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Welcoming Values-Aligned Partners
          </h2>
          
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed">
            This platform was designed to be built together. From memory
            institutions to research labs, our partners are shaping a shared
            ecosystem grounded in community, care, and transparency.
          </p>
        </div>

        {/* Partner logos grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="border border-gray-200 rounded-lg p-6 md:p-8 flex items-center justify-center hover:border-gray-300 transition-colors"
            >
              <div className="w-full h-24 md:h-32 bg-gray-100 rounded-md flex flex-col items-center justify-center p-4">
                <svg
                  className="w-10 h-10 text-gray-400 mb-2"
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
                  {partner.name} Logo
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Content Section */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>
              As public institutions increasingly digitize and share records online, and as more digital-born records become accessible, the risk of exposing sensitive personal data has grown significantly.
            </p>
            
            <p>
              ClioX addresses these challenges by allowing archives to manage consent and usage rights for their data while ensuring that computations are performed where the data is stored. This means that the raw data is never moved or exposed; only the results or insights from the computations are shared.
            </p>
            
            <p>
              The platform also provides AI + visual analytic tools to help researchers analyze large volumes of archival data and discover connections among them.
            </p>
          </div>
        </div>

      </Container>
    </section>
  );
} 