import { getPageBySlug, markdownToHtmlWithToc } from '@/utils/markdown';
import Container from '@/components/layout/Container';
import Link from 'next/link';
import styles from '@/styles/privacy.module.css';

// This defines valid paths for static generation
export async function generateStaticParams() {
  return [{ locale: 'en' }]; // Add more locales as needed
}

export default async function PrivacyPolicyPage({
  params
}: {
  params: { locale: string }
}) {
  // Properly await the params object before using its properties
  const locale = params.locale;
  
  const { metadata, content } = await getPageBySlug('privacy', locale);
  const htmlContent = await markdownToHtmlWithToc(content);
  
  return (
    <div className="py-12 bg-white">
      <Container>
        {/* Title and description section - centered */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-bold mb-6 font-sans">{metadata.title}</h1>
          <p className="text-lg font-serif text-black/80 max-w-3xl mx-auto leading-relaxed">
            {metadata.description}
          </p>
          
          {/* Language selector */}
          <div className={styles.languageSelector}>
            <div>Language</div>
            <div className="font-medium">
              <Link href="/privacy/en" className={locale === 'en' ? 'text-primary font-bold' : 'text-gray-500'}>
                English
              </Link>
            </div>
          </div>
          
          {/* Last updated date */}
          {metadata.lastUpdated && (
            <div className={styles.lastUpdated}>
              Last updated on {metadata.lastUpdated}
            </div>
          )}
        </div>
        
        {/* Content section with enhanced typography */}
        <div className="max-w-4xl mx-auto">
          <div 
            className={`prose prose-lg prose-slate max-w-none font-serif 
                      prose-headings:font-sans prose-headings:font-bold 
                      prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-8
                      prose-h3:text-xl prose-p:text-black/80 prose-p:leading-relaxed
                      prose-li:marker:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      ${styles.content}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        </div>
      </Container>
    </div>
  );
} 