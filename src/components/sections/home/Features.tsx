import { LockClosedIcon, CubeTransparentIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Features() {
  const features = [
    {
      title: "Data Sovereignty",
      description: "Complete control over your data with granular access policies and usage tracking.",
      icon: LockClosedIcon
    },
    {
      title: "Smart Contracts",
      description: "Automated compliance and transparent value exchange through blockchain technology.",
      icon: CubeTransparentIcon
    },
    {
      title: "Gaia-X Integration",
      description: "Native support for Gaia-X standards ensuring interoperability and trust.",
      icon: GlobeAltIcon
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Unique features. Derived from best-in-class building blocks.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 