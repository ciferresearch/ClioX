import Image from 'next/image';

interface CaseStudy {
  title: string;
  company: string;
  description: string;
  image: string;
  link: string;
}

export default function CaseStudies() {
  const caseStudies: CaseStudy[] = [
    {
      title: "Industrial IoT Data Exchange",
      company: "Manufacturing Corp",
      description: "How a leading manufacturer implemented secure IoT data sharing across their supply chain.",
      image: "/images/case-study-1.jpg",
      link: "/cases/manufacturing-corp"
    },
    {
      title: "AI Model Marketplace",
      company: "Tech Solutions Ltd",
      description: "Creating a marketplace for specialized industrial AI models with usage-based pricing.",
      image: "/images/case-study-2.jpg",
      link: "/cases/tech-solutions"
    },
    {
      title: "Compliance Automation",
      company: "Global Industries",
      description: "Automating regulatory compliance across international data exchanges.",
      image: "/images/case-study-3.jpg",
      link: "/cases/global-industries"
    }
  ];

  return (
    <section id="cases" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Clio-X Case Studies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <a 
              key={index}
              href={study.link}
              className="group hover:no-underline"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="relative h-48 w-full">
                  <Image
                    src={study.image}
                    alt={study.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-blue-600 mb-2">{study.company}</p>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {study.title}
                  </h3>
                  <p className="text-gray-600">{study.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
} 