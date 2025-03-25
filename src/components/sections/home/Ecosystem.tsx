export default function Ecosystem() {
  return (
    <section id="ecosystem" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Join the ecosystem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add ecosystem cards */}
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <h3 className="text-xl font-bold mb-4">Data Providers</h3>
            <p className="text-gray-600">
              Monetize your data assets securely while maintaining full control over usage and access rights.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <h3 className="text-xl font-bold mb-4">Service Providers</h3>
            <p className="text-gray-600">
              Offer your AI and data services to a growing network of industrial clients.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
            <h3 className="text-xl font-bold mb-4">Technology Partners</h3>
            <p className="text-gray-600">
              Integrate your solutions and expand your reach in the industrial ecosystem.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 