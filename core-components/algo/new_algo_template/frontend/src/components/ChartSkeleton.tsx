'use client';

interface ChartSkeletonProps {
  type?: 'line' | 'bar' | 'area';
  height?: number;
}

const ChartSkeleton = ({ type = 'line', height = 400 }: ChartSkeletonProps) => {
  return (
    <div className="animate-pulse">
      {/* Chart Title Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      
      {/* Controls Skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
      
      {/* Chart Area Skeleton */}
      <div 
        className="relative w-full rounded-lg bg-gray-100 overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Y-axis Skeleton */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-200"></div>
        
        {/* Chart Content Skeleton */}
        <div className="absolute left-16 right-4 top-4 bottom-16 flex items-end">
          {type === 'line' && (
            <>
              {/* Simulated Line Chart */}
              <div className="w-full h-full flex items-end">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-200 mx-1 rounded-t"
                    style={{
                      height: `${30 + (i % 3) * 20}%`,
                      opacity: 0.7 + (i / 20)
                    }}
                  ></div>
                ))}
              </div>
            </>
          )}
          
          {type === 'bar' && (
            <>
              {/* Simulated Bar Chart */}
              <div className="w-full h-full flex items-end justify-around">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 bg-gray-200 rounded-t"
                    style={{
                      height: `${40 + (i % 4) * 15}%`,
                      opacity: 0.7 + (i / 20)
                    }}
                  ></div>
                ))}
              </div>
            </>
          )}
          
          {type === 'area' && (
            <>
              {/* Simulated Area Chart */}
              <div className="w-full h-full bg-gradient-to-t from-gray-200 to-transparent rounded-lg"></div>
            </>
          )}
        </div>
        
        {/* X-axis Skeleton */}
        <div className="absolute left-16 right-4 bottom-0 h-12 bg-gray-200"></div>
      </div>
      
      {/* Legend Skeleton */}
      <div className="flex gap-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
