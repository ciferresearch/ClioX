import SentimentChart from '../components/SentimentChart';
import SentimentChartV2 from '../components/SentimentChart_v2';
import DataDistribution from '../components/DataDistribution';
import WordCloud from '@/components/WordCloud';
import TagCloud from '@/components/TagCloud';
import DocumentSummary from '../components/DocumentSummary';

export default function Home() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Text Analysis Visualization Hub</h1>
        <p className="text-gray-600">Interactive analysis developed by ClioX</p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <DataDistribution 
            title="Data Distribution on Email Counts" 
            description="Shows the distribution of email counts over time"
            dataSource="/data/email_per_day_distribution_data.csv"
          />
          
          <DataDistribution 
            title="Data Distribution on Date" 
            description="Shows the distribution of emails by date"
            dataSource="/data/date_distribution_data.csv"
          />
        </div>

        <div className="mb-6">
          <SentimentChart />
        </div>

        <div className="mb-6">
          <SentimentChartV2 />
        </div>

        <div className="mb-6">
          <WordCloud />
        </div>

        {/* <div className="mb-6">
          <TagCloud />
        </div> */}

        <div className="mb-6">
          <DocumentSummary />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Further more ...</h2>
          <p className="text-gray-600">Additional visualizations and analysis tools will be added here.</p>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ClioX</p>
      </footer>
    </div>
  );
}
