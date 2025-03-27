import Button from '@/components/common/Button';
import Container from '@/components/layout/Container';

export default function Hero() {
  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="bg-gray-100 p-6 flex items-center justify-center w-full h-[32rem]">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Placeholder Image</p>
                <p className="text-gray-400 text-sm">Replace with your actual hero image</p>
              </div>
            </div>
          </div>
          
          <Button variant="primary" size="md" className="mb-12">Button</Button>
          
          <div className="mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </Container>
    </section>
  );
} 