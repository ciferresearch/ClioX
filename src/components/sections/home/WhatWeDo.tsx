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
    <section className="py-24 bg-white">
      <Container>
        <div className="flex items-center gap-3 mb-12">
          <h2 className="text-2xl font-bold">What We Do</h2>
        </div>

        {/* Top placeholder text lines */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="h-6 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>

        {/* Partner logos grid - more spacious */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="border border-gray-300 rounded-md p-8 flex items-center justify-center"
            >
              {/* Using a div with background color as placeholder instead of Image */}
              <div className="w-full h-32 bg-gray-200 rounded-md flex flex-col items-center justify-center p-4">
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
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
                  {partner.name} Logo Placeholder
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom placeholder text lines */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="h-6 bg-gray-200 rounded mb-4 w-2/3 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-2/3 mx-auto"></div>
        </div>

        {/* Additional placeholder text lines at bottom */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-full mx-auto"></div>
        </div>
      </Container>
    </section>
  );
} 