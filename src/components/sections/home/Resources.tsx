import Image from 'next/image';
import Card from '@/components/common/Card';

export default function Resources() {
  const resources = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and API references for developers and users.',
      link: { href: '/docs', text: 'View Documentation' },
      icon: '/icons/docs.svg'
    },
    {
      title: 'SDKs & Tools',
      description: 'Ready-to-use software development kits and integration tools.',
      link: { href: '/tools', text: 'Explore Tools' },
      icon: '/icons/tools.svg'
    },
    {
      title: 'Community',
      description: 'Join our community of developers, providers, and users.',
      link: { href: '/community', text: 'Join Community' },
      icon: '/icons/community.svg'
    }
  ];

  return (
    <section id="resources" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Resources and Software Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="flex flex-col items-center text-center h-full">
              <div className="w-16 h-16 mb-6 relative">
                <Image
                  src={resource.icon}
                  alt={resource.title}
                  fill
                  className="object-contain"
                />
              </div>
              <Card
                title={resource.title}
                description={resource.description}
                link={resource.link}
                className="w-full h-full flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 