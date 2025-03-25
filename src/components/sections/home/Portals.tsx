export default function Portals() {
  return (
    <section id="portals" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Clio-X Portals and Marketplaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Data Marketplace</h3>
            <p className="text-gray-600 mb-4">
              Discover and exchange industrial data assets with guaranteed compliance and sovereignty.
            </p>
            <a href="#" className="text-blue-600 hover:underline">Learn more →</a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Service Catalog</h3>
            <p className="text-gray-600 mb-4">
              Browse AI and data services tailored for industrial applications.
            </p>
            <a href="#" className="text-blue-600 hover:underline">Learn more →</a>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Developer Portal</h3>
            <p className="text-gray-600 mb-4">
              Access tools, documentation, and APIs to build on the Clio-X platform.
            </p>
            <a href="#" className="text-blue-600 hover:underline">Learn more →</a>
          </div>
        </div>
      </div>
    </section>
  );
} 