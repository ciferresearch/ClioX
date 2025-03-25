export default function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Open-Source Framework for the Industrial AI & Data Economy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The largest publicly available X-Ecosystem, powered by smart contracts and Gaia-X, transforms Data Act compliance into scalable collaboration and monetization opportunities.
          </p>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 cursor-pointer">
              Enter Clio-X
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 cursor-pointer">
              Explore the Catalogue
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 