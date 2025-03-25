interface CardProps {
  title: string;
  description: string;
  link?: {
    href: string;
    text: string;
  };
  className?: string;
}

export default function Card({ title, description, link, className = '' }: CardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm flex flex-col h-full ${className}`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 flex-grow mb-4">{description}</p>
      {link && (
        <div className="mt-auto">
          <a href={link.href} className="text-blue-600 hover:underline">
            {link.text} →
          </a>
        </div>
      )}
    </div>
  );
} 