module.exports = {

"[project]/src/store/dataStore.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useDataStore": (()=>useDataStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
// API Configuration
const API_CONFIG = {
    baseUrl: 'http://localhost:5001',
    endpoints: {
        status: '/api/status',
        process: '/api/process',
        emailDistribution: '/api/distribution/email',
        dateDistribution: '/api/distribution/date',
        sentiment: '/api/data/sentiment',
        wordcloud: '/api/wordcloud',
        documentSummary: '/api/document/summary'
    }
};
const useDataStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        // Initial data status
        dataStatus: {
            emailDistribution: false,
            dateDistribution: false,
            sentimentChart: false,
            sentimentChartV2: false,
            wordCloud: false,
            documentSummary: false
        },
        // Set status for a single component
        setComponentStatus: (component, status)=>set((state)=>({
                    dataStatus: {
                        ...state.dataStatus,
                        [component]: status
                    }
                })),
        // Set status for multiple components at once
        setAllComponentStatus: (statuses)=>set((state)=>({
                    dataStatus: {
                        ...state.dataStatus,
                        ...statuses
                    }
                })),
        // Global processing status
        processingStatus: 'checking',
        setProcessingStatus: (status)=>set({
                processingStatus: status
            }),
        // Status message
        statusMessage: '',
        setStatusMessage: (message)=>set({
                statusMessage: message
            }),
        // API URL getter
        getApiUrl: (endpoint)=>`${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`,
        // Check data status from the backend
        checkDataStatus: async ()=>{
            try {
                set({
                    processingStatus: 'checking'
                });
                // Check if backend is available
                const response = await fetch(get().getApiUrl('status'));
                const data = await response.json();
                console.log('Status response:', data);
                // Update component status
                if (data.components) {
                    const components = data.components;
                    const documentSummaryAvailable = !!(components.document_summary || components.cleaned_data);
                    console.log('Document summary available:', documentSummaryAvailable);
                    console.log('Components status:', components);
                    set({
                        dataStatus: {
                            emailDistribution: components.email_distribution,
                            dateDistribution: components.date_distribution,
                            sentimentChart: components.sentiment_chart,
                            sentimentChartV2: components.sentiment_chart,
                            wordCloud: components.wordcloud,
                            documentSummary: documentSummaryAvailable
                        }
                    });
                }
                // Update global status
                if (data.status === 'ready') {
                    set({
                        processingStatus: 'ready'
                    });
                } else if (data.status === 'not_ready') {
                    set({
                        processingStatus: 'not_ready'
                    });
                } else if (data.status === 'error') {
                    set({
                        processingStatus: 'error',
                        statusMessage: 'Error processing data'
                    });
                }
                return data;
            } catch (error) {
                console.error('Error checking data status:', error);
                set({
                    processingStatus: 'error',
                    statusMessage: 'Error connecting to the backend server. Please make sure it is running.'
                });
                throw error;
            }
        },
        // Process data
        processData: async ()=>{
            try {
                set({
                    processingStatus: 'processing',
                    statusMessage: 'Processing data... This may take a few minutes.'
                });
                // Trigger data processing
                await fetch(get().getApiUrl('process'));
                // Start polling for status updates
                const pollInterval = setInterval(async ()=>{
                    try {
                        const statusData = await get().checkDataStatus();
                        // If processing is complete or there was an error, stop polling
                        if (statusData.status === 'ready' || statusData.status === 'error') {
                            clearInterval(pollInterval);
                        }
                    } catch (error) {
                        console.error('Error during polling:', error);
                        clearInterval(pollInterval);
                    }
                }, 2000);
                // Don't return the cleanup function, as it violates the Promise<void> return type
                // Instead, we'll store it in a variable that gets garbage collected when the component unmounts
                const cleanup = ()=>clearInterval(pollInterval);
            } catch (error) {
                console.error('Error processing data:', error);
                set({
                    processingStatus: 'error',
                    statusMessage: 'Error processing data'
                });
                throw error;
            }
        },
        // Data fetching functions for components
        fetchEmailDistribution: async ()=>{
            try {
                const response = await fetch(get().getApiUrl('emailDistribution'));
                if (response.status === 503) {
                    throw new Error('Data is being processed. Please try again in a moment.');
                }
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }
                // Return the CSV text directly
                const csvText = await response.text();
                return csvText;
            } catch (error) {
                console.error('Error fetching email distribution data:', error);
                throw error;
            }
        },
        fetchDateDistribution: async ()=>{
            try {
                const response = await fetch(get().getApiUrl('dateDistribution'));
                if (response.status === 503) {
                    throw new Error('Data is being processed. Please try again in a moment.');
                }
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }
                // Return the CSV text directly
                const csvText = await response.text();
                return csvText;
            } catch (error) {
                console.error('Error fetching date distribution data:', error);
                throw error;
            }
        },
        fetchSentimentData: async ()=>{
            try {
                const response = await fetch(get().getApiUrl('sentiment'));
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching sentiment data:', error);
                throw error;
            }
        },
        fetchWordCloudData: async ()=>{
            try {
                const response = await fetch(get().getApiUrl('wordcloud'));
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching word cloud data:', error);
                throw error;
            }
        },
        fetchDocumentSummary: async ()=>{
            try {
                const response = await fetch(get().getApiUrl('documentSummary'));
                if (response.status === 503) {
                    throw new Error('Data is being processed. Please try again in a moment.');
                }
                if (!response.ok) {
                    console.error(`Document summary fetch failed with status: ${response.status}`);
                    throw new Error(`Failed to load document summary: ${response.statusText}`);
                }
                const data = await response.json();
                // If we received an error message from the backend
                if (data && data.status === 'error') {
                    throw new Error(data.message || 'Failed to fetch document summary data');
                }
                return data;
            } catch (error) {
                console.error('Error fetching document summary:', error);
                throw error;
            }
        }
    }));
}}),
"[project]/src/components/SentimentChart_v2.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-time-format/src/defaultLocale.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/extent.js [app-ssr] (ecmascript) <export default as extent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/time.js [app-ssr] (ecmascript) <export default as scaleTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/max.js [app-ssr] (ecmascript) <export default as max>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/linear.js [app-ssr] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/area.js [app-ssr] (ecmascript) <export default as area>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasis$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/curve/basis.js [app-ssr] (ecmascript) <export default as curveBasis>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-axis/src/axis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$pointer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__pointer$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/pointer.js [app-ssr] (ecmascript) <export default as pointer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/line.js [app-ssr] (ecmascript) <export default as line>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/curve/catmullRom.js [app-ssr] (ecmascript) <export default as curveCatmullRom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$brush$2f$src$2f$brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-brush/src/brush.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/dataStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
// Utility function to decimate data points
const decimateData = (data, maxPoints)=>{
    if (data.length <= maxPoints) return data;
    // Use LTTB (Largest-Triangle-Three-Buckets) algorithm for data decimation
    const bucketSize = Math.floor(data.length / maxPoints);
    const decimated = [];
    // Always keep the first point
    decimated.push(data[0]);
    for(let i = 1; i < maxPoints - 1; i++){
        const bucketStart = Math.floor(i * data.length / maxPoints);
        const bucketEnd = Math.floor((i + 1) * data.length / maxPoints);
        // Find point with max value in bucket
        let maxPoint = data[bucketStart];
        let maxValue = data[bucketStart].value;
        for(let j = bucketStart; j < bucketEnd; j++){
            if (data[j].value > maxValue) {
                maxValue = data[j].value;
                maxPoint = data[j];
            }
        }
        decimated.push(maxPoint);
    }
    // Always keep the last point
    decimated.push(data[data.length - 1]);
    return decimated;
};
// Debounce function
const debounce = (func, wait)=>{
    let timeout = null;
    return (...args)=>{
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(()=>func(...args), wait);
    };
};
const SentimentChartV2 = ({ skipLoading = false })=>{
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const brushRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [chartWidth, setChartWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [sentimentData, setSentimentData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [dateRange, setDateRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const tooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const verticalLineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Get data fetching function from store
    const { fetchSentimentData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDataStore"])();
    // Memoize parseTime function to avoid recreating it
    const parseTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeParse"])('%Y-%m-%dT%H:%M:%SZ'), []);
    const formatDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%b %d, %Y'), []);
    // Fetch data only once on initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchData = async ()=>{
            try {
                setLoading(true);
                // Use the data store function instead of direct fetch
                const data = await fetchSentimentData();
                // Sort data by sentiment value from -2 to +2 (ascending order)
                data.sort((a, b)=>{
                    const aNum = parseInt(a.name.replace('+', ''));
                    const bNum = parseInt(b.name.replace('+', ''));
                    return aNum - bNum;
                });
                setSentimentData(data);
                // Initialize with full date range
                const allDates = data.flatMap((d)=>d.values.map((v)=>parseTime(v[0]))).filter((d)=>d !== null);
                if (allDates.length > 0) {
                    const extent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"])(allDates);
                    setDateRange({
                        start: extent[0],
                        end: extent[1]
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error loading sentiment data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [
        parseTime,
        fetchSentimentData
    ]);
    // Handle resize with debouncing
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!chartRef.current) return;
        // Get initial dimensions
        setChartWidth(chartRef.current.clientWidth);
        // Debounced resize handler
        const handleResize = debounce(()=>{
            if (chartRef.current) {
                setChartWidth(chartRef.current.clientWidth);
            }
        }, 150); // 150ms debounce
        // Only add resize handler on the client
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
    }, []);
    // Render chart whenever data, date range or size changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!chartRef.current || !sentimentData.length || !dateRange) return;
        renderChart();
        renderBrush();
        // Clean up tooltip when component unmounts
        return ()=>{
            if (tooltipRef.current) {
                tooltipRef.current.remove();
                tooltipRef.current = null;
            }
        };
    }, [
        sentimentData,
        dateRange,
        chartWidth,
        parseTime,
        formatDate
    ]);
    const getSentimentColor = (sentiment)=>{
        switch(sentiment){
            case '-2':
                return '#4fc3f7'; // Vivid blue for very negative
            case '-1':
                return '#9575cd'; // Purple for slightly negative
            case '0':
                return '#e0e0e0'; // Light gray for neutral
            case '+1':
                return '#ffb74d'; // Amber for slightly positive
            case '+2':
                return '#ff8a65'; // Coral/orange for very positive
            default:
                return '#e0e0e0';
        }
    };
    const renderChart = ()=>{
        if (!chartRef.current || !dateRange) return;
        const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(chartRef.current);
        // Create tooltip only once
        if (!tooltipRef.current) {
            tooltipRef.current = container.append('div').attr('class', 'tooltip').style('position', 'absolute').style('visibility', 'hidden').style('background-color', 'rgba(255, 255, 255, 0.9)').style('border', '1px solid #ddd').style('border-radius', '4px').style('padding', '8px').style('box-shadow', '2px 2px 6px rgba(0, 0, 0, 0.2)').style('pointer-events', 'none').style('font-size', '12px').style('z-index', '10').style('transition', 'left 0.15s ease-out, top 0.15s ease-out'); // Smooth position transitions
        }
        container.selectAll('svg').remove();
        // Set dimensions
        const margin = {
            top: 40,
            right: 40,
            bottom: 40,
            left: 50
        };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const chartCount = sentimentData.length;
        const chartHeight = 70; // Slightly smaller height for each small chart to match the image
        const spacing = 15; // Less spacing between charts to match the compact look
        const totalHeight = chartHeight * chartCount + spacing * (chartCount - 1) + margin.top + margin.bottom;
        // Only proceed if we have valid dimensions
        if (width <= 0) return;
        // Create SVG with a clipping path for smooth transitions
        const svg = container.append('svg').attr('width', width + margin.left + margin.right).attr('height', totalHeight).append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // // Add title with smaller font and different position
        // svg.append('text')
        //   .attr('x', width / 2)
        //   .attr('y', -margin.top / 2)
        //   .attr('text-anchor', 'middle')
        //   .attr('class', 'text-md font-medium')
        //   .text('Sentiment Categories');
        // Format the data
        const formattedData = sentimentData.map((d)=>({
                name: d.name,
                values: d.values.map((v)=>{
                    const date = parseTime(v[0]);
                    return {
                        date: date,
                        value: v[1]
                    };
                }).filter((point)=>point.date !== null && point.date >= dateRange.start && point.date <= dateRange.end).sort((a, b)=>a.date.getTime() - b.date.getTime())
            }));
        // Apply data decimation based on available width
        const maxPointsPerLine = Math.max(100, Math.floor(width / 3));
        const decimatedData = formattedData.map((series)=>({
                name: series.name,
                values: decimateData(series.values, maxPointsPerLine)
            }));
        if (decimatedData.length === 0 || decimatedData.every((d)=>d.values.length === 0)) {
            svg.append('text').attr('x', width / 2).attr('y', totalHeight / 2).attr('text-anchor', 'middle').text('No data points in the selected date range');
            return;
        }
        // Global scales
        const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__["scaleTime"])().domain([
            dateRange.start,
            dateRange.end
        ]).range([
            0,
            width
        ]);
        // Draw each chart
        decimatedData.forEach((series, i)=>{
            const yPos = i * (chartHeight + spacing);
            // Find max value for this series
            const maxValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(series.values, (d)=>d.value) || 1;
            // Local y scale for this chart
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                maxValue * 1.1
            ]) // Add 10% padding
            .range([
                chartHeight,
                0
            ]).nice();
            // Create a clipping path for this chart
            svg.append('defs').append('clipPath').attr('id', `clip-${i}`).append('rect').attr('width', width).attr('height', chartHeight);
            // Create a group for this chart
            const chartGroup = svg.append('g').attr('transform', `translate(0,${yPos})`).attr('clip-path', `url(#clip-${i})`);
            // Add border for this chart
            svg.append('rect').attr('x', 0).attr('y', yPos).attr('width', width).attr('height', chartHeight).style('fill', 'none').style('stroke', '#eaeaea') // Lighter gray border
            .style('stroke-width', 0.25); // Thinner border
            // Add Y axis label (sentiment value) with enhanced visibility
            svg.append('text').attr('x', -15).attr('y', yPos + chartHeight / 2).attr('text-anchor', 'end').attr('dominant-baseline', 'middle').attr('class', 'text-xs font-medium').style('fill', getSentimentColor(String(series.name))).text(series.name);
            // Add indicator label to suggest sentiment meaning
            const sentimentLabel = ()=>{
                switch(series.name){
                    case '-2':
                        return 'Very Negative';
                    case '-1':
                        return 'Negative';
                    case '0':
                        return 'Neutral';
                    case '1':
                    case '+1':
                        return 'Positive';
                    case '2':
                    case '+2':
                        return 'Very Positive';
                    default:
                        return '';
                }
            };
            // Add the sentiment meaning label at the top of each chart
            svg.append('text').attr('x', 10).attr('y', yPos + 15) // Position near the top of each chart
            .attr('class', 'text-xs').style('opacity', 0.7).style('fill', getSentimentColor(String(series.name))).text(sentimentLabel());
            // Create gradient for this chart
            const gradientId = `gradient-${i}`;
            const gradient = svg.append('defs').append('linearGradient').attr('id', gradientId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            gradient.append('stop').attr('offset', '0%').attr('stop-color', getSentimentColor(String(series.name))).attr('stop-opacity', 0.95);
            gradient.append('stop').attr('offset', '100%').attr('stop-color', getSentimentColor(String(series.name))).attr('stop-opacity', 0.6);
            // Generate the area
            const area = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__["area"])().x((d)=>x(d.date)).y0(chartHeight) // Baseline
            .y1((d)=>y(d.value)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$basis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveBasis$3e$__["curveBasis"]) // Smoother curve that matches the image
            .defined((d)=>!isNaN(d.value)); // Skip undefined or NaN values
            // Add the area
            chartGroup.append('path').datum(series.values).attr('class', 'area').attr('d', area).style('fill', `url(#${gradientId})`).style('opacity', 0.9).style('stroke', 'none');
            // Add a thin baseline
            chartGroup.append('line').attr('x1', 0).attr('x2', width).attr('y1', chartHeight).attr('y2', chartHeight).style('stroke', '#ddd').style('stroke-width', 0.5);
        });
        // Add X axis at the bottom
        svg.append('g').attr('transform', `translate(0,${chartCount * (chartHeight + spacing) - spacing})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(width > 600 ? 6 : 4) // Fewer ticks to match the image
        .tickSize(5).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%Y')) // Just show years to match the image
        ).attr('class', 'text-xs').call((g)=>g.select('.domain').attr('stroke-width', 0.5)) // Thinner axis line
        .call((g)=>g.selectAll('.tick line').attr('stroke-width', 0.5)); // Thinner tick marks
        // Add more specific labels for months - create more evenly spaced labels
        // Calculate appropriate number of month labels based on width
        const monthsPerYear = width > 800 ? 4 : width > 600 ? 3 : 2;
        const startYear = dateRange.start.getFullYear();
        const endYear = dateRange.end.getFullYear();
        const timeLabels = [];
        // Generate month labels for each year in the range
        for(let year = startYear; year <= endYear; year++){
            for(let month = 0; month < 12; month += 12 / monthsPerYear){
                const labelDate = new Date(year, month, 1);
                if (labelDate >= dateRange.start && labelDate <= dateRange.end) {
                    timeLabels.push(labelDate);
                }
            }
        }
        timeLabels.forEach((date)=>{
            svg.append('text').attr('x', x(date)).attr('y', chartCount * (chartHeight + spacing) - spacing + 25).attr('text-anchor', 'middle').attr('class', 'text-xs text-gray-500').text((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%b')(date));
        });
        // Add a shared vertical line for tooltips
        const verticalLine = svg.append('line').attr('class', 'vertical-line').style('stroke', '#999').style('stroke-width', '1px').style('stroke-dasharray', '3,3').style('opacity', 0).attr('y1', 0).attr('y2', chartCount * (chartHeight + spacing) - spacing);
        verticalLineRef.current = verticalLine;
        // Create a rect to capture mouse events
        const mouseArea = svg.append('rect').attr('width', width).attr('height', chartCount * (chartHeight + spacing) - spacing).style('fill', 'none').style('pointer-events', 'all');
        // Prepare data for hover interactions - create a lookup table by date
        const dateValues = new Map();
        decimatedData.forEach((series)=>{
            series.values.forEach((point)=>{
                const timestamp = point.date.getTime();
                if (!dateValues.has(timestamp)) {
                    dateValues.set(timestamp, new Map());
                }
                dateValues.get(timestamp)?.set(series.name, point.value);
            });
        });
        // Get sorted timestamps
        const sortedTimestamps = Array.from(dateValues.keys()).sort((a, b)=>a - b);
        // Create a throttled mousemove handler for better performance
        let lastMove = 0;
        const throttleDelay = 30; // ms
        // Handle mouse events
        mouseArea.on('mouseover', ()=>{
            if (tooltipRef.current) tooltipRef.current.style('visibility', 'visible');
            verticalLine.style('opacity', 1);
        }).on('mousemove', (event)=>{
            const now = Date.now();
            if (now - lastMove < throttleDelay) return;
            lastMove = now;
            const [mouseX] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$pointer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__pointer$3e$__["pointer"])(event);
            if (sortedTimestamps.length === 0) return;
            // Binary search to find closest timestamp
            const mouseDate = x.invert(mouseX).getTime();
            let left = 0;
            let right = sortedTimestamps.length - 1;
            let closestIndex = 0;
            while(left <= right){
                const mid = Math.floor((left + right) / 2);
                if (Math.abs(sortedTimestamps[mid] - mouseDate) < Math.abs(sortedTimestamps[closestIndex] - mouseDate)) {
                    closestIndex = mid;
                }
                if (sortedTimestamps[mid] < mouseDate) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
            const selectedTimestamp = sortedTimestamps[closestIndex];
            const selectedDate = new Date(selectedTimestamp);
            // Position the vertical line
            verticalLine.attr('x1', x(selectedDate)).attr('x2', x(selectedDate));
            // Build tooltip content with more minimal styling
            let tooltipContent = `<div class="font-medium text-xs mb-1" style="color:#555;">${formatDate(selectedDate)}</div>`;
            // Add values for each sentiment category with minimal styling
            tooltipContent += `<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">`;
            decimatedData.forEach((series)=>{
                const seriesValues = dateValues.get(selectedTimestamp);
                const value = seriesValues?.get(series.name) ?? 0;
                tooltipContent += `
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-1" style="background-color: ${getSentimentColor(String(series.name))};"></span>
              <span style="color:#555;">Sentiment ${series.name}</span>
            </div>
            <div class="font-medium text-right">${value}</div>
          `;
            });
            tooltipContent += `</div>`;
            // Position and populate the tooltip
            if (tooltipRef.current) {
                // First, update the content
                tooltipRef.current.html(tooltipContent);
                // Get the tooltip dimensions
                const tooltipNode = tooltipRef.current.node();
                const tooltipWidth = tooltipNode ? tooltipNode.getBoundingClientRect().width : 200;
                // Get the chart container dimensions
                const chartContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(chartRef.current).node();
                const containerWidth = chartContainer ? chartContainer.getBoundingClientRect().width : 0;
                // Check if there's enough space on the right
                const spaceOnRight = containerWidth - event.offsetX;
                const tooltipX = spaceOnRight < tooltipWidth + 20 ? `${event.offsetX - tooltipWidth - 10}px` : `${event.offsetX + 15}px`; // Position to the right of the cursor
                // Update the position
                tooltipRef.current.style('left', tooltipX).style('top', `${event.offsetY - 28}px`);
            }
        }).on('mouseout', ()=>{
            if (tooltipRef.current) tooltipRef.current.style('visibility', 'hidden');
            verticalLine.style('opacity', 0);
        });
    };
    // Render the brush component (date range selector)
    const renderBrush = ()=>{
        if (!brushRef.current || !dateRange) return;
        const container = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(brushRef.current);
        container.selectAll('svg').remove();
        // Match margin settings to the main chart for consistent width
        const margin = {
            top: 10,
            right: 40,
            bottom: 20,
            left: 50
        };
        const width = brushRef.current.clientWidth - margin.left - margin.right;
        const height = 60 - margin.top - margin.bottom;
        // Create SVG
        const svg = container.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // Get all dates for the overview
        const allDates = sentimentData.flatMap((d)=>d.values.map((v)=>parseTime(v[0]))).filter((d)=>d !== null);
        // Find the full date range
        const fullDateRange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"])(allDates);
        // Create a smaller, decimated version of the dataset for the brush component
        const overviewData = sentimentData.map((series)=>{
            const values = series.values.map((v)=>({
                    date: parseTime(v[0]),
                    value: v[1]
                })).filter((d)=>d.date !== null).sort((a, b)=>a.date.getTime() - b.date.getTime());
            // Decimate data for the mini chart
            return {
                name: series.name,
                values: decimateData(values, 50) // Fewer points for mini chart
            };
        });
        // X scale for the brush
        const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__["scaleTime"])().domain(fullDateRange).range([
            0,
            width
        ]);
        // Max value for Y scale
        const maxValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(overviewData, (d)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(d.values, (v)=>v.value)) || 0;
        // Y scale for the brush
        const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
            0,
            maxValue * 1.05
        ]).range([
            height,
            0
        ]);
        // Line generator for the brush
        const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__["line"])().x((d)=>x(d.date)).y((d)=>y(d.value)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5)); // Smoother curve
        // Add mini charts for each series to the brush area
        overviewData.forEach((series)=>{
            if (series.values.length > 0) {
                // Create area generator for the mini chart
                const area = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__["area"])().x((d)=>x(d.date)).y0(height) // Baseline at bottom
                .y1((d)=>y(d.value)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5));
                // Add filled area with transparency
                svg.append('path').datum(series.values).attr('class', 'mini-area').attr('d', area).style('fill', getSentimentColor(String(series.name))).style('fill-opacity', 0.3).style('stroke', getSentimentColor(String(series.name))).style('stroke-width', 0.75).style('stroke-opacity', 0.8);
            }
        });
        // Add X axis to the brush with improved month/year format
        svg.append('g').attr('transform', `translate(0,${height})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(5).tickSize(-height).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%b %Y'))).call((g)=>g.select('.domain').remove()).call((g)=>g.selectAll('.tick line').attr('stroke', '#ccc').attr('stroke-dasharray', '2,2')).call((g)=>g.selectAll('.tick text') // Make sure tick labels don't overlap
            .style('text-anchor', 'middle').attr('dy', '1em'));
        // Create brush component
        const brush = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$brush$2f$src$2f$brush$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["brushX"])().extent([
            [
                0,
                0
            ],
            [
                width,
                height
            ]
        ]).on('brush', (event)=>{
            // Handle brush movement in real-time for smoother feedback
            if (!event.sourceEvent || !event.selection) return;
        // Update the brush area visually (don't redraw the main chart for performance)
        }).on('end', (event)=>{
            if (!event.sourceEvent) return; // Only respond to user events
            if (!event.selection) return; // Skip if no selection
            const [x0, x1] = event.selection;
            const newStart = x.invert(x0);
            const newEnd = x.invert(x1);
            // Update date range state
            setDateRange({
                start: newStart,
                end: newEnd
            });
        });
        // Add the brush to the SVG
        const brushGroup = svg.append('g').attr('class', 'brush').call(brush);
        // Set initial brush position based on current date range
        if (dateRange) {
            brushGroup.call(brush.move, [
                x(dateRange.start),
                x(dateRange.end)
            ]);
        }
        // Style the brush
        svg.selectAll('.selection').attr('fill', '#69b3a2').attr('fill-opacity', 0.3).attr('stroke', '#69b3a2');
        // Style the brush handles
        svg.selectAll('.handle').attr('fill', '#69b3a2').attr('stroke', '#69b3a2').attr('stroke-width', 0.5);
        // Add reset button
        const resetButton = container.append('button').attr('class', 'reset-button').style('position', 'absolute').style('top', '10px').style('right', '40px') // Match the right margin
        .style('background-color', '#f3f4f6').style('border', '1px solid #d1d5db').style('border-radius', '4px').style('padding', '2px 8px').style('font-size', '10px').style('cursor', 'pointer').text('Reset Zoom').on('click', ()=>{
            // Reset to full date range
            setDateRange({
                start: fullDateRange[0],
                end: fullDateRange[1]
            });
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md p-4 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-semibold mb-2 text-gray-800 border-b pb-2",
                children: "Sentiment Analysis by Category"
            }, void 0, false, {
                fileName: "[project]/src/components/SentimentChart_v2.tsx",
                lineNumber: 723,
                columnNumber: 7
            }, this),
            loading && !skipLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center h-[400px]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500",
                    children: "Loading sentiment data..."
                }, void 0, false, {
                    fileName: "[project]/src/components/SentimentChart_v2.tsx",
                    lineNumber: 727,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/SentimentChart_v2.tsx",
                lineNumber: 726,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: chartRef,
                        className: "w-full relative"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SentimentChart_v2.tsx",
                        lineNumber: 731,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500 mt-4 mb-1 ml-1",
                        children: "Drag to select date range:"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SentimentChart_v2.tsx",
                        lineNumber: 733,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: brushRef,
                        className: "w-full h-[65px] relative mt-2"
                    }, void 0, false, {
                        fileName: "[project]/src/components/SentimentChart_v2.tsx",
                        lineNumber: 737,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SentimentChart_v2.tsx",
        lineNumber: 722,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = SentimentChartV2;
}}),
"[project]/src/components/ChartModal.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$zoom$2f$src$2f$zoom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__zoom$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-zoom/src/zoom.js [app-ssr] (ecmascript) <export default as zoom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$zoom$2f$src$2f$transform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__identity__as__zoomIdentity$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-zoom/src/transform.js [app-ssr] (ecmascript) <export identity as zoomIdentity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/max.js [app-ssr] (ecmascript) <export default as max>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$bin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__bin$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/bin.js [app-ssr] (ecmascript) <export default as bin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__range$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/range.js [app-ssr] (ecmascript) <export default as range>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/linear.js [app-ssr] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-axis/src/axis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-format/src/defaultLocale.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$pointer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__pointer$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/pointer.js [app-ssr] (ecmascript) <export default as pointer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-time-format/src/defaultLocale.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/extent.js [app-ssr] (ecmascript) <export default as extent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/time.js [app-ssr] (ecmascript) <export default as scaleTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/area.js [app-ssr] (ecmascript) <export default as area>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/curve/catmullRom.js [app-ssr] (ecmascript) <export default as curveCatmullRom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/line.js [app-ssr] (ecmascript) <export default as line>");
'use client';
;
;
;
const ChartModal = ({ isOpen, onClose, title, chartData, chartType })=>{
    const modalChartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const zoomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const marginRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [zoomLevel, setZoomLevel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen || !modalChartRef.current || !chartData || chartData.length === 0) return;
        const container = modalChartRef.current;
        const margin = {
            top: 40,
            right: 60,
            bottom: 80,
            left: 70
        };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;
        // Clear any existing chart
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(container).selectAll('*').remove();
        // Create base SVG
        const baseSvg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(container).append('svg').attr('width', container.clientWidth).attr('height', container.clientHeight);
        const chartGroup = baseSvg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // Set initial transform
        const initialScale = 0.85; // Slightly zoomed out to show all labels
        const initialX = margin.left;
        const initialY = margin.top - 20; // Move up slightly to show bottom labels better
        // Add zoom behavior
        const zoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$zoom$2f$src$2f$zoom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__zoom$3e$__["zoom"])().scaleExtent([
            0.5,
            5
        ]).on('zoom', (event)=>{
            chartGroup.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
            setZoomLevel(event.transform.k);
        });
        // Store zoom behavior and margins in ref for external control
        zoomRef.current = zoom;
        marginRef.current = margin;
        // Apply zoom behavior
        baseSvg.call(zoom).on('dblclick.zoom', null).style('cursor', 'grab').on('mousedown', function() {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).style('cursor', 'grabbing');
        }).on('mouseup', function() {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).style('cursor', 'grab');
        });
        // Apply initial transform
        baseSvg.call(zoom.transform, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$zoom$2f$src$2f$transform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__identity__as__zoomIdentity$3e$__["zoomIdentity"].translate(initialX, initialY).scale(initialScale));
        // Update zoom level display
        setZoomLevel(initialScale);
        if (chartType === 'date') {
            // Date distribution chart
            const parseTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeParse"])('%Y-%m-%d');
            // Format data
            const formattedData = chartData.map((d)=>{
                const timeKey = 'time' in d ? 'time' : Object.keys(d)[0];
                const countKey = 'count' in d ? 'count' : Object.keys(d)[1];
                const timeValue = d[timeKey];
                const countValue = +d[countKey];
                return {
                    time: parseTime(timeValue),
                    count: countValue
                };
            }).filter((d)=>d.time !== null);
            // Set up scales
            // Safely create domain extents
            const timeExtent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"])(formattedData, (d)=>d.time);
            const xDomain = [
                timeExtent[0] ? new Date(timeExtent[0]) : new Date(),
                timeExtent[1] ? new Date(timeExtent[1]) : new Date()
            ];
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__["scaleTime"])().domain(xDomain).range([
                0,
                width
            ]);
            const maxCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(formattedData, (d)=>Number(d.count)) || 10;
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                maxCount
            ]).nice().range([
                height,
                0
            ]);
            // Add X axis with more space for labels
            const xAxis = chartGroup.append('g').attr('transform', `translate(0,${height})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(6).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%b %Y')));
            xAxis.selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '1em');
            // Add Y axis
            chartGroup.append('g').call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisLeft"])(y));
            // Sort data by date for smoother line
            formattedData.sort((a, b)=>a.time.getTime() - b.time.getTime());
            // Add area under the line with gradient
            const areaGradient = chartGroup.append('defs').append('linearGradient').attr('id', 'area-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.3);
            areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.05);
            // Create area generator
            const area = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__["area"])().defined((d)=>!isNaN(d.count)).x((d)=>x(d.time)).y0(height).y1((d)=>y(d.count)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5)); // Smoother curve
            // Add the area
            chartGroup.append('path').datum(formattedData).attr('fill', 'url(#area-gradient)').attr('d', area);
            // Add line with smoother curve
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__["line"])().defined((d)=>!isNaN(d.count)).x((d)=>x(d.time)).y((d)=>y(d.count)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5)); // Smoother curve
            chartGroup.append('path').datum(formattedData).attr('fill', 'none').attr('stroke', '#4F46E5') // Indigo color for line
            .attr('stroke-width', 2.5).attr('d', line);
            // Add points with hover effect
            const dots = chartGroup.selectAll('.dot').data(formattedData).enter().append('circle').attr('class', 'dot').attr('cx', (d)=>x(d.time)).attr('cy', (d)=>y(d.count)).attr('r', 3) // Smaller points
            .attr('fill', '#F59E0B') // Amber color for points
            .attr('stroke', '#ffffff').attr('stroke-width', 1.5).attr('opacity', 0.8);
            // Add tooltip
            const tooltip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(container).append('div').attr('class', 'tooltip').style('position', 'absolute').style('background-color', 'rgba(0, 0, 0, 0.8)').style('color', 'white').style('padding', '8px').style('border-radius', '4px').style('font-size', '12px').style('pointer-events', 'none').style('opacity', 0).style('z-index', 10).style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)').style('max-width', '200px').style('transition', 'opacity 0.2s');
            // Add hover effects
            dots.on('mouseover', function(_event, d) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).attr('r', 6).attr('opacity', 1);
                const date = d.time.toLocaleDateString();
                // Calculate tooltip position
                const svgRect = container.getBoundingClientRect();
                const circleRect = this.getBoundingClientRect();
                // Position tooltip next to the point
                const tooltipX = circleRect.right - svgRect.left + 5;
                let tooltipY = circleRect.top - svgRect.top - 10;
                // Make sure tooltip is visible within the container
                const tooltipWidth = 150; // Approximate width
                if (tooltipX + tooltipWidth > svgRect.width) {
                    // If tooltip would go outside right edge, position it to the left of the point
                    tooltip.style('left', circleRect.left - svgRect.left - tooltipWidth - 5 + 'px').style('top', tooltipY + 'px');
                } else {
                    tooltip.style('left', tooltipX + 'px').style('top', tooltipY + 'px');
                }
                tooltip.html(`Date: ${date}<br>Count: ${d.count}`).style('opacity', 1);
            }).on('mouseout', function() {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).attr('r', 3).attr('opacity', 0.8);
                tooltip.style('opacity', 0);
            });
            // Add labels
            chartGroup.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', height + margin.bottom - 10).text('Date').attr('class', 'text-sm text-gray-600');
            chartGroup.append('text').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).text('Count').attr('class', 'text-sm text-gray-600');
        } else if (chartType === 'email') {
            // Emails per day histogram
            const getEmailValue = (d)=>{
                if ('emails_per_day' in d) {
                    return +d.emails_per_day;
                }
                const firstKey = Object.keys(d)[0];
                return +d[firstKey];
            };
            const values = chartData.map(getEmailValue).filter((v)=>!isNaN(v));
            if (values.length === 0) {
                console.error('No valid email count values found');
                container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse email count data</p>';
                return;
            }
            // Create histogram data
            const maxValue = Number((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(values)) || 10;
            const histogram = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$bin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__bin$3e$__["bin"])().domain([
                0,
                maxValue + 1
            ]).thresholds((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__range$3e$__["range"])(0, maxValue + 2))(values);
            // Set up scales
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                maxValue + 1
            ]).range([
                0,
                width
            ]);
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(histogram, (d)=>d.length) || 0
            ]).nice().range([
                height,
                0
            ]);
            // Add X axis with more space for labels
            chartGroup.append('g').attr('transform', `translate(0,${height})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(Math.min(maxValue + 1, 15)).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["format"])('d'))).selectAll('text').style('text-anchor', 'middle').attr('dy', '1em');
            // Add Y axis
            chartGroup.append('g').call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisLeft"])(y).ticks(5));
            // Add gradient for bars
            const barGradient = chartGroup.append('defs').append('linearGradient').attr('id', 'bar-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            barGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.9);
            barGradient.append('stop').attr('offset', '100%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.6);
            // Add tooltip
            const tooltip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(container).append('div').attr('class', 'tooltip').style('position', 'absolute').style('background-color', 'rgba(0, 0, 0, 0.8)').style('color', 'white').style('padding', '8px').style('border-radius', '4px').style('font-size', '12px').style('pointer-events', 'none').style('opacity', 0).style('z-index', 10).style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)').style('max-width', '200px').style('transition', 'opacity 0.2s');
            // Add bars with hover effect and tooltip
            const bars = chartGroup.selectAll('rect').data(histogram).enter().append('rect').attr('x', (d)=>x(d.x0)).attr('y', (d)=>y(d.length)).attr('width', (d)=>Math.max(0, x(d.x1) - x(d.x0) - 1)).attr('height', (d)=>height - y(d.length)).attr('fill', 'url(#bar-gradient)').attr('stroke', '#ffffff').attr('stroke-width', 1).attr('rx', 2) // Rounded corners
            .attr('opacity', 0.9);
            // Add hover effect with tooltip
            bars.on('mouseover', function(event, d) {
                // Highlight bar
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).attr('opacity', 1);
                // Calculate tooltip position
                const [mouseX, mouseY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$pointer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__pointer$3e$__["pointer"])(event, container);
                // Show tooltip with data
                tooltip.html(`Emails: ${d.x0} - ${d.x1}<br>Count: ${d.length}`).style('left', mouseX + 10 + 'px').style('top', mouseY - 25 + 'px').style('opacity', 1);
            }).on('mouseout', function() {
                // Restore bar opacity
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).attr('opacity', 0.9);
                // Hide tooltip
                tooltip.style('opacity', 0);
            });
            // Add labels
            chartGroup.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', height + margin.bottom - 10).text('Emails per Day').attr('class', 'text-sm text-gray-600');
            chartGroup.append('text').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).text('Frequency').attr('class', 'text-sm text-gray-600');
        }
    }, [
        isOpen,
        chartData,
        chartType,
        title
    ]);
    // Handle zoom in
    const handleZoomIn = ()=>{
        if (zoomRef.current && modalChartRef.current) {
            const baseSvg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(modalChartRef.current).select('svg');
            baseSvg.transition().duration(300).call(zoomRef.current.scaleBy, 1.2);
        }
    };
    // Handle zoom out
    const handleZoomOut = ()=>{
        if (zoomRef.current && modalChartRef.current) {
            const baseSvg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(modalChartRef.current).select('svg');
            baseSvg.transition().duration(300).call(zoomRef.current.scaleBy, 0.8);
        }
    };
    // Handle reset zoom
    const handleResetZoom = ()=>{
        if (zoomRef.current && modalChartRef.current && marginRef.current) {
            const baseSvg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(modalChartRef.current).select('svg');
            const margin = marginRef.current;
            // Reset to initial transform
            baseSvg.transition().duration(300).call(zoomRef.current.transform, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$zoom$2f$src$2f$transform$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__identity__as__zoomIdentity$3e$__["zoomIdentity"].translate(margin.left, margin.top - 20).scale(0.85));
        }
    };
    // Toggle tips visibility
    const toggleTips = ()=>{
        const tipElement = document.getElementById('chart-tip');
        if (tipElement) {
            tipElement.classList.toggle('hidden');
            // Update button text
            const tipButton = document.querySelector('[data-tip-button]');
            if (tipButton) {
                tipButton.textContent = tipElement.classList.contains('hidden') ? 'Show Tips' : 'Hide Tips';
            }
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-xl shadow-lg w-full max-w-[1400px] h-[700px] flex flex-col overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center px-8 py-3 bg-gray-50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-medium text-gray-800",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 475,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs bg-blue-500 text-white px-2 py-0.5 rounded",
                                        children: [
                                            "Zoom: ",
                                            Math.round(zoomLevel * 100),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 476,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 474,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center",
                                title: "Close",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-5 h-5",
                                    fill: "currentColor",
                                    viewBox: "0 0 20 20",
                                    xmlns: "http://www.w3.org/2000/svg",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 486,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChartModal.tsx",
                                    lineNumber: 485,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 480,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChartModal.tsx",
                        lineNumber: 473,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative flex-grow overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: modalChartRef,
                                className: "absolute inset-0 bg-white px-8 py-6"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 493,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-4 right-8 flex items-center gap-2 z-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleZoomIn,
                                        className: "p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer",
                                        title: "Zoom In",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 508,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChartModal.tsx",
                                            lineNumber: 507,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 502,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleZoomOut,
                                        className: "p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer",
                                        title: "Zoom Out",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 517,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChartModal.tsx",
                                            lineNumber: 516,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 511,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleResetZoom,
                                        className: "p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer",
                                        title: "Reset Zoom",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-4 w-4",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 526,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChartModal.tsx",
                                            lineNumber: 525,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 520,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 501,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChartModal.tsx",
                        lineNumber: 492,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-8 py-3 bg-gray-50 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm font-medium text-gray-700 flex items-center relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-4 h-4 mr-1",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ChartModal.tsx",
                                            lineNumber: 536,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 535,
                                        columnNumber: 17
                                    }, this),
                                    "Chart Navigation",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        id: "chart-tip",
                                        className: "hidden absolute bottom-8 left-0 text-xs text-gray-700 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-center mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium text-gray-800",
                                                        children: "Chart Navigation Tips"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 543,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: toggleTips,
                                                        className: "text-gray-400 hover:text-gray-600",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-3 h-3",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            xmlns: "http://www.w3.org/2000/svg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                                lineNumber: 549,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/ChartModal.tsx",
                                                            lineNumber: 548,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 544,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 542,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: "list-disc pl-5 space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "Drag to pan around the chart"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "Use mouse wheel to zoom in and out"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 555,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "Use the + and - buttons for precise zoom control"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 556,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "Click the home button to reset the view"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 557,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: "Hover over data points for detailed information"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/ChartModal.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 553,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ChartModal.tsx",
                                                lineNumber: 560,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ChartModal.tsx",
                                        lineNumber: 541,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 534,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: toggleTips,
                                    "data-tip-button": true,
                                    className: "px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer",
                                    children: "Show Tips"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ChartModal.tsx",
                                    lineNumber: 565,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChartModal.tsx",
                                lineNumber: 564,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ChartModal.tsx",
                        lineNumber: 533,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChartModal.tsx",
                lineNumber: 471,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ChartModal.tsx",
            lineNumber: 470,
            columnNumber: 9
        }, this)
    }, void 0, false);
};
const __TURBOPACK__default__export__ = ChartModal;
}}),
"[project]/src/components/ChartSkeleton.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const ChartSkeleton = ({ type, height })=>{
    const generateSkeletonPaths = ()=>{
        if (type === 'line') {
            // Line chart skeleton
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "50",
                        y: height - 30,
                        width: "80%",
                        height: "2",
                        rx: "1",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 15,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "50",
                        y: "30",
                        width: "2",
                        height: height - 60,
                        rx: "1",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: `M 50 ${height * 0.7} 
                C ${height * 0.3} ${height * 0.5}, ${height * 0.5} ${height * 0.2}, ${height * 0.7} ${height * 0.4} 
                S ${height * 1.2} ${height * 0.7}, ${height * 1.5} ${height * 0.3}`,
                        className: "stroke-gray-300 animate-pulse",
                        fill: "none",
                        strokeWidth: "3",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "50",
                        cy: height * 0.7,
                        r: "4",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 30,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: height * 0.3,
                        cy: height * 0.5,
                        r: "4",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 31,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: height * 0.7,
                        cy: height * 0.4,
                        r: "4",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: height * 1.2,
                        cy: height * 0.7,
                        r: "4",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: height * 1.5,
                        cy: height * 0.3,
                        r: "4",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChartSkeleton.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this);
        } else if (type === 'bar') {
            // Bar chart skeleton
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "50",
                        y: height - 30,
                        width: "80%",
                        height: "2",
                        rx: "1",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "50",
                        y: "30",
                        width: "2",
                        height: height - 60,
                        rx: "1",
                        className: "fill-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "80",
                        y: "70",
                        width: "30",
                        height: height - 100,
                        rx: "2",
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 46,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "130",
                        y: "100",
                        width: "30",
                        height: height - 130,
                        rx: "2",
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "180",
                        y: "60",
                        width: "30",
                        height: height - 90,
                        rx: "2",
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "230",
                        y: "120",
                        width: "30",
                        height: height - 150,
                        rx: "2",
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "280",
                        y: "90",
                        width: "30",
                        height: height - 120,
                        rx: "2",
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChartSkeleton.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this);
        } else {
            // Pie chart skeleton
            const centerX = height / 2;
            const centerY = height / 2;
            const radius = height / 3;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: centerX,
                        cy: centerY,
                        r: radius,
                        className: "fill-gray-200"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 0 1 ${centerX + radius * 0.7} ${centerY - radius * 0.7} Z`,
                        className: "fill-gray-300 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: `M ${centerX} ${centerY} L ${centerX + radius * 0.7} ${centerY - radius * 0.7} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY} Z`,
                        className: "fill-gray-400 animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartSkeleton.tsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ChartSkeleton.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            width: "100%",
            height: height,
            className: "max-w-full",
            children: [
                generateSkeletonPaths(),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                    x: "50%",
                    y: height - 10,
                    textAnchor: "middle",
                    className: "fill-gray-400 text-xs",
                    children: "Loading data..."
                }, void 0, false, {
                    fileName: "[project]/src/components/ChartSkeleton.tsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ChartSkeleton.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ChartSkeleton.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = ChartSkeleton;
}}),
"[project]/src/components/ChartError.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
const ChartError = ({ message = 'Failed to load chart data', onRetry })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-[400px] flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-8 h-8 text-red-500",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChartError.tsx",
                            lineNumber: 22,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ChartError.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ChartError.tsx",
                    lineNumber: 15,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-lg font-medium text-gray-900 mb-2",
                    children: "Unable to Load Data"
                }, void 0, false, {
                    fileName: "[project]/src/components/ChartError.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-gray-500 mb-4",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/src/components/ChartError.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                onRetry && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onRetry,
                    className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-4 h-4 mr-2",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ChartError.tsx",
                                lineNumber: 47,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ChartError.tsx",
                            lineNumber: 41,
                            columnNumber: 13
                        }, this),
                        "Retry"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ChartError.tsx",
                    lineNumber: 37,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ChartError.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ChartError.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = ChartError;
}}),
"[project]/src/components/DataDistribution.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$dsv$2f$src$2f$csv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-dsv/src/csv.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/max.js [app-ssr] (ecmascript) <export default as max>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$bin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__bin$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/bin.js [app-ssr] (ecmascript) <export default as bin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__range$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/range.js [app-ssr] (ecmascript) <export default as range>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/linear.js [app-ssr] (ecmascript) <export default as scaleLinear>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-axis/src/axis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-format/src/defaultLocale.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-time-format/src/defaultLocale.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/time.js [app-ssr] (ecmascript) <export default as scaleTime>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-array/src/extent.js [app-ssr] (ecmascript) <export default as extent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/area.js [app-ssr] (ecmascript) <export default as area>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/curve/catmullRom.js [app-ssr] (ecmascript) <export default as curveCatmullRom>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-shape/src/line.js [app-ssr] (ecmascript) <export default as line>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChartModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartSkeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChartSkeleton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChartError.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/dataStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const DataDistribution = ({ title, description, type, skipLoading = false, disableHover = false })=>{
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [chartType, setChartType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(type);
    // Get data fetching functions from store
    const { fetchEmailDistribution, fetchDateDistribution } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDataStore"])();
    // Fetch data with retry functionality
    const fetchDistributionData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            setLoading(true);
            setError(null);
            let csvText;
            if (type === 'email') {
                const emailData = await fetchEmailDistribution();
                csvText = emailData;
                setChartType('email');
            } else if (type === 'date') {
                const dateData = await fetchDateDistribution();
                csvText = dateData;
                setChartType('date');
            } else {
                throw new Error('Invalid distribution type specified');
            }
            // Parse CSV data
            const parsedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$dsv$2f$src$2f$csv$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["csvParse"])(csvText);
            console.log('Parsed data:', parsedData);
            setData(parsedData);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally{
            setLoading(false);
        }
    }, [
        type,
        fetchEmailDistribution,
        fetchDateDistribution
    ]);
    // Fetch data on component mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchDistributionData();
    }, [
        fetchDistributionData
    ]);
    // Render chart when data is available
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!data.length || !chartRef.current) return;
        // Clear any existing chart
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(chartRef.current).selectAll('*').remove();
        const container = chartRef.current;
        const margin = {
            top: 20,
            right: 30,
            bottom: 60,
            left: 50
        };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;
        const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(container).append('svg').attr('width', container.clientWidth).attr('height', container.clientHeight).append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        // Create chart based on chart type
        if (chartType === 'date') {
            // Date distribution chart - Bar chart
            const parseTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeParse"])('%Y-%m-%d');
            // Ensure data is properly formatted
            const formattedData = data.map((d)=>{
                // Get the key names which might vary depending on how the CSV is parsed
                const timeKey = 'time' in d ? 'time' : Object.keys(d)[0];
                const countKey = 'count' in d ? 'count' : Object.keys(d)[1];
                const timeValue = d[timeKey];
                const countValue = +d[countKey];
                // Parse the date string
                const parsedDate = parseTime(timeValue);
                return {
                    time: parsedDate,
                    count: countValue
                };
            }).filter((d)=>d.time !== null);
            if (formattedData.length === 0) {
                console.error('No valid dates found in the data');
                container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse date data</p>';
                return;
            }
            // Sort data by date
            formattedData.sort((a, b)=>{
                if (!a.time || !b.time) return 0;
                return a.time.getTime() - b.time.getTime();
            });
            // Set up scales
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$time$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleTime$3e$__["scaleTime"])().domain((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$extent$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__extent$3e$__["extent"])(formattedData, (d)=>d.time)).range([
                0,
                width
            ]);
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(formattedData, (d)=>d.count)
            ]).nice().range([
                height,
                0
            ]);
            // Add X axis
            const xAxis = svg.append('g').attr('transform', `translate(0,${height})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(6).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$time$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["timeFormat"])('%b %Y')));
            xAxis.selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end').attr('dx', '-.8em').attr('dy', '.15em');
            // Add Y axis
            svg.append('g').call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisLeft"])(y).ticks(5));
            // Add area under the line with gradient
            const areaGradient = svg.append('defs').append('linearGradient').attr('id', 'area-gradient-' + container.id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.3);
            areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.05);
            // Create area generator
            const area = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$area$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__area$3e$__["area"])().defined((d)=>d.time !== null).x((d)=>x(d.time)).y0(height).y1((d)=>y(d.count)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5)); // Smoother curve
            // Add the area
            svg.append('path').datum(formattedData).attr('fill', 'url(#area-gradient-' + container.id + ')').attr('d', area);
            // Add line chart with smoother curve
            const line = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__line$3e$__["line"])().defined((d)=>d.time !== null).x((d)=>x(d.time)).y((d)=>y(d.count)).curve(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$shape$2f$src$2f$curve$2f$catmullRom$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__curveCatmullRom$3e$__["curveCatmullRom"].alpha(0.5)); // Smoother curve
            // Add the line path
            svg.append('path').datum(formattedData).attr('fill', 'none').attr('stroke', '#4F46E5') // Indigo color for line
            .attr('stroke-width', 2.5).attr('d', line);
            // Add points without hover effects
            svg.selectAll('.dot').data(formattedData).enter().append('circle').attr('class', 'dot').attr('cx', (d)=>x(d.time)).attr('cy', (d)=>y(d.count)).attr('r', 3) // Smaller points
            .attr('fill', '#F59E0B') // Amber color for points
            .attr('stroke', '#ffffff').attr('stroke-width', 1.5).attr('opacity', 0.8);
            // Add labels
            svg.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', height + margin.bottom - 10).text('Date').attr('class', 'text-sm text-gray-600');
            svg.append('text').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).text('Count').attr('class', 'text-sm text-gray-600');
            // Add title
            svg.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', -5).text('Email Count Over Time').attr('class', 'text-xs font-semibold text-gray-700');
        } else if (chartType === 'email') {
            // Emails per day histogram
            const getEmailValue = (d)=>{
                if ('emails_per_day' in d) {
                    return +d.emails_per_day;
                }
                // If the key isn't exactly 'emails_per_day', find the first key
                const firstKey = Object.keys(d)[0];
                return +d[firstKey];
            };
            const values = data.map(getEmailValue).filter((v)=>!isNaN(v));
            if (values.length === 0) {
                console.error('No valid email count values found');
                container.innerHTML = '<p class="text-red-500 text-center">Error: Could not parse email count data</p>';
                return;
            }
            // Create histogram data
            const maxValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(values);
            const histogram = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$bin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__bin$3e$__["bin"])().domain([
                0,
                maxValue + 1
            ]).thresholds((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__range$3e$__["range"])(0, maxValue + 2))(values);
            // Set up scales
            const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                maxValue + 1
            ]).range([
                0,
                width
            ]);
            const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$linear$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLinear$3e$__["scaleLinear"])().domain([
                0,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$array$2f$src$2f$max$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__max$3e$__["max"])(histogram, (d)=>d.length)
            ]).nice().range([
                height,
                0
            ]);
            // Add X axis
            svg.append('g').attr('transform', `translate(0,${height})`).call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisBottom"])(x).ticks(Math.min(maxValue + 1, 10)).tickFormat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$format$2f$src$2f$defaultLocale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["format"])('d')));
            // Add Y axis
            svg.append('g').call((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$axis$2f$src$2f$axis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["axisLeft"])(y).ticks(5));
            // Add gradient for bars
            const barGradient = svg.append('defs').append('linearGradient').attr('id', 'bar-gradient-' + container.id).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            barGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.9);
            barGradient.append('stop').attr('offset', '100%').attr('stop-color', '#4F46E5').attr('stop-opacity', 0.6);
            // Add bars without hover effects for small chart
            svg.selectAll('rect').data(histogram).enter().append('rect').attr('class', 'dot').attr('x', (d)=>x(d.x0)).attr('width', (d)=>Math.max(0, x(d.x1) - x(d.x0) - 1)).attr('y', (d)=>y(d.length)).attr('height', (d)=>height - y(d.length)).attr('fill', 'url(#bar-gradient-' + container.id + ')') // Gradient fill
            .attr('rx', 2) // Rounded corners
            .attr('opacity', 0.9).attr('stroke', '#ffffff').attr('stroke-width', 0.5);
            // Add labels
            svg.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', height + margin.bottom - 10).text('Emails per Day').attr('class', 'text-sm text-gray-600');
            svg.append('text').attr('text-anchor', 'middle').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).text('Frequency').attr('class', 'text-sm text-gray-600');
            // Add title
            svg.append('text').attr('text-anchor', 'middle').attr('x', width / 2).attr('y', -5).text('Distribution of Emails per Day').attr('class', 'text-xs font-semibold text-gray-700');
        } else {
            console.warn('Could not determine chart type:', {
                data,
                type
            });
            container.innerHTML = '<p class="text-red-500 text-center">Error: Could not determine chart type</p>';
        }
    }, [
        data,
        chartType
    ]);
    // Handle opening the modal
    const handleOpenModal = ()=>{
        setIsModalOpen(true);
    };
    // Handle closing the modal
    const handleCloseModal = ()=>{
        setIsModalOpen(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md p-4 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold text-gray-800",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/src/components/DataDistribution.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this),
                    data.length > 0 && !loading && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleOpenModal,
                        className: "inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer relative group",
                        "aria-label": "Expand chart",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "h-5 w-5",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 1.5,
                                    d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/DataDistribution.tsx",
                                    lineNumber: 373,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/DataDistribution.tsx",
                                lineNumber: 372,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                                children: "Expand"
                            }, void 0, false, {
                                fileName: "[project]/src/components/DataDistribution.tsx",
                                lineNumber: 375,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/DataDistribution.tsx",
                        lineNumber: 367,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/DataDistribution.tsx",
                lineNumber: 364,
                columnNumber: 7
            }, this),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-600 mb-4",
                children: description
            }, void 0, false, {
                fileName: "[project]/src/components/DataDistribution.tsx",
                lineNumber: 381,
                columnNumber: 23
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: chartRef,
                className: "w-full h-64 bg-gray-50 rounded flex items-center justify-center cursor-pointer",
                onClick: data.length > 0 && !loading && !error ? handleOpenModal : undefined,
                children: loading && !skipLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartSkeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    type: chartType === 'date' ? 'line' : 'bar',
                    height: 256
                }, void 0, false, {
                    fileName: "[project]/src/components/DataDistribution.tsx",
                    lineNumber: 389,
                    columnNumber: 11
                }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    message: error,
                    onRetry: fetchDistributionData
                }, void 0, false, {
                    fileName: "[project]/src/components/DataDistribution.tsx",
                    lineNumber: 391,
                    columnNumber: 11
                }, this) : data.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500",
                    children: "No data available"
                }, void 0, false, {
                    fileName: "[project]/src/components/DataDistribution.tsx",
                    lineNumber: 396,
                    columnNumber: 11
                }, this) : null
            }, void 0, false, {
                fileName: "[project]/src/components/DataDistribution.tsx",
                lineNumber: 383,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isModalOpen,
                onClose: handleCloseModal,
                title: title,
                chartData: data,
                chartType: chartType
            }, void 0, false, {
                fileName: "[project]/src/components/DataDistribution.tsx",
                lineNumber: 401,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DataDistribution.tsx",
        lineNumber: 363,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = DataDistribution;
}}),
"[project]/src/components/WordCloud/constants.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Constants for Word Cloud
__turbopack_context__.s({
    "CUSTOM_COLORS": (()=>CUSTOM_COLORS),
    "DEBOUNCE_DELAY": (()=>DEBOUNCE_DELAY),
    "DEFAULT_CUSTOM_STOPWORDS": (()=>DEFAULT_CUSTOM_STOPWORDS),
    "ENGLISH_STOPWORDS": (()=>ENGLISH_STOPWORDS),
    "FONT_FAMILIES": (()=>FONT_FAMILIES),
    "STOPWORDS_OPTIONS": (()=>STOPWORDS_OPTIONS),
    "TRANSITION_DURATION": (()=>TRANSITION_DURATION),
    "WHITELIST_OPTIONS": (()=>WHITELIST_OPTIONS)
});
const TRANSITION_DURATION = 750;
const DEBOUNCE_DELAY = 300;
const STOPWORDS_OPTIONS = [
    "Auto-detect",
    "None",
    "English",
    "Custom"
];
const WHITELIST_OPTIONS = [
    "None",
    "Custom"
];
const FONT_FAMILIES = [
    "Palatino",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia"
];
const ENGLISH_STOPWORDS = [
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "don",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "just",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "now",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "s",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "t",
    "than",
    "that",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "would",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves"
];
const DEFAULT_CUSTOM_STOPWORDS = [];
const CUSTOM_COLORS = [
    "#ff6b6b",
    "#4ecdc4",
    "#1a535c",
    "#ffe66d",
    "#ff9f1c",
    "#6a0572",
    "#ab83a1",
    "#1a936f",
    "#114b5f",
    "#88d498"
];
}}),
"[project]/src/components/WordCloud/useWordCloudVisualization.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useWordCloudVisualization": (()=>useWordCloudVisualization)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2f$src$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/d3/src/index.js [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$log$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLog$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-scale/src/log.js [app-ssr] (ecmascript) <export default as scaleLog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__ = __turbopack_context__.i("[project]/node_modules/d3-selection/src/select.js [app-ssr] (ecmascript) <export default as select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$cloud$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/d3-cloud/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$debounce$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lodash/debounce.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/constants.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const useWordCloudVisualization = ({ svgRef, words, dimensions, fontFamily, colorSelection, isLoading, selectedWordRef, isPanelVisibleRef, shouldUpdateLayoutRef, modalsOpenRef, isWordSelectionActionRef, onWordSelect })=>{
    const [isUpdating, setIsUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const wordColorsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    const zoomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const svgInitializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const previousWordsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    const dimensionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        width: dimensions.width,
        height: dimensions.height,
        lastUpdate: 0
    });
    // Add a ref to track the last update time to prevent duplicate renders
    const lastUpdateTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Add a cache key to identify unique render requests
    const renderRequestRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("");
    // Minimum time between full renders in milliseconds
    const RENDER_THROTTLE_MS = 300;
    // Use a ref to track if a render is in progress
    const renderInProgressRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Track render count for debugging
    const renderCountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Get color for a word
    const getWordColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((d)=>{
        // For random colors, ensure consistency by storing in ref
        if (colorSelection === "random") {
            if (!wordColorsRef.current[d.text]) {
                wordColorsRef.current[d.text] = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"][Math.floor(Math.random() * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length)];
            }
            return wordColorsRef.current[d.text];
        }
        const maxCount = Math.max(...words.map((w)=>w.count));
        const ratio = (d.originalData?.count || 0) / maxCount;
        switch(colorSelection){
            case "monochrome":
                return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
            case "category":
                // Use the selected color palette for categorical coloring
                const colorIndex = Math.floor(ratio * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length);
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"][Math.min(colorIndex, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length - 1)];
            default:
                return wordColorsRef.current[d.text] || "#333333";
        }
    }, [
        colorSelection,
        words
    ]);
    // Create word cloud layout
    const createWordCloudLayout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((words)=>{
        return new Promise((resolve)=>{
            // Make sure we have valid dimensions before creating layout
            const width = dimensions?.width || 500;
            const height = dimensions?.height || 400;
            const fontScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$scale$2f$src$2f$log$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__scaleLog$3e$__["scaleLog"])().domain([
                Math.min(...words.map((w)=>w.count)),
                Math.max(...words.map((w)=>w.count))
            ]).range([
                12,
                50
            ]);
            const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$cloud$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])().size([
                width,
                height
            ]).words(words.map((w)=>({
                    text: w.value,
                    size: fontScale(w.count),
                    originalData: w
                }))).padding(3).rotate((d)=>{
                // Only use 90-degree multiples for rotation (0, 90, 270)
                // Long words (more than 5 characters) always display horizontally (0 degrees)
                if (d.text.length > 5) return 0;
                // For short words, randomly select one of the 90-degree multiples
                const rotations = [
                    0,
                    90,
                    270
                ];
                return rotations[Math.floor(Math.random() * rotations.length)];
            }).font(fontFamily).fontSize((d)=>d.size);
            layout.on("end", resolve);
            layout.start();
        });
    }, [
        dimensions,
        fontFamily
    ]);
    // Enhanced debounced update function with better safeguards
    const debouncedUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$debounce$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async (words)=>{
        // Check if we're already updating (critical to prevent double renders)
        if (renderInProgressRef.current) {
            console.log("Skipping render: another render already in progress");
            return;
        }
        // Mark render as in progress
        renderInProgressRef.current = true;
        // Increment render count
        renderCountRef.current += 1;
        const currentRenderCount = renderCountRef.current;
        console.log(`Starting word cloud render #${currentRenderCount}`);
        if (!svgRef.current) {
            renderInProgressRef.current = false;
            return;
        }
        // Don't update if we're not visible
        if (svgRef.current.closest("div")?.offsetParent === null) {
            renderInProgressRef.current = false;
            return;
        }
        // Skip updates if modals are open
        if (modalsOpenRef.current) {
            console.log("Skipping update because modals are open");
            renderInProgressRef.current = false;
            return;
        }
        // IMPORTANT: Always clear the word cloud when there are no words to display
        if (words.length === 0) {
            setIsUpdating(true);
            console.log("No words to display, clearing word cloud");
            try {
                const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
                const wordsContainer = svg.select(".words-container");
                if (!wordsContainer.empty()) {
                    const wordsGroup = wordsContainer.select(".words-group");
                    if (!wordsGroup.empty()) {
                        // Remove all existing words with fade out animation
                        wordsGroup.selectAll("text").transition().duration(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRANSITION_DURATION"] / 2).style("opacity", 0).remove();
                    }
                }
                // Reset previous words to ensure they don't persist
                previousWordsRef.current = [];
            } catch (e) {
                console.error("Error clearing word cloud:", e);
            } finally{
                setIsUpdating(false);
                renderInProgressRef.current = false;
            }
            return;
        }
        // Generate a cache key based on words array and other relevant state
        const wordFingerprint = words.length > 0 ? `${words.length}:${words[0].value}:${words[words.length - 1].value}` : "";
        const currentCacheKey = JSON.stringify({
            wordFingerprint,
            dimensions: `${dimensions.width}x${dimensions.height}`,
            fontFamily,
            colorSelection,
            renderCount: currentRenderCount
        });
        // Prevent duplicate renders that happen too close together
        // Skip if this is the same render request or if not enough time has elapsed
        const now = new Date().getTime();
        const timeSinceLastRender = now - lastUpdateTimeRef.current;
        if (renderRequestRef.current === currentCacheKey && timeSinceLastRender < 2000 || !shouldUpdateLayoutRef.current && timeSinceLastRender < RENDER_THROTTLE_MS) {
            console.log(`Skipping duplicate render request #${currentRenderCount} - too similar to previous render`);
            renderInProgressRef.current = false;
            return;
        }
        // Update the cache key and timestamp for this render
        renderRequestRef.current = currentCacheKey;
        lastUpdateTimeRef.current = now;
        console.log(`Processing render #${currentRenderCount} for ${words.length} words`, {
            shouldUpdateLayout: shouldUpdateLayoutRef.current,
            isWordSelectionAction: isWordSelectionActionRef.current
        });
        // There are two cases where we want to avoid complete relayout:
        // 1. Word selection/panel interaction (tracked by isWordSelectionActionRef)
        // 2. Panel visibility change (opening or closing panel)
        const isPanelClosing = selectedWordRef.current === null && isWordSelectionActionRef.current;
        const isWordSelecting = isWordSelectionActionRef.current && selectedWordRef.current !== null;
        const isWordSelectionOrPanelAction = isWordSelecting || isPanelClosing;
        if (isPanelClosing) {
            console.log("Panel is closing, skipping layout update");
        }
        // Check if SVG needs readjustment after container size changes
        // (like when panel opens/closes)
        const needsSvgCentering = isPanelVisibleRef.current !== undefined && svgRef.current && svgRef.current.parentElement;
        // Special case: if there are no words to display, clear the word cloud
        if (words.length === 0) {
            setIsUpdating(true);
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            const wordsContainer = svg.select(".words-container");
            if (!wordsContainer.empty()) {
                const wordsGroup = wordsContainer.select(".words-group");
                if (!wordsGroup.empty()) {
                    // Remove all existing words with fade out animation
                    wordsGroup.selectAll("text").transition().duration(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRANSITION_DURATION"] / 2).style("opacity", 0).remove();
                }
            }
            previousWordsRef.current = [];
            setIsUpdating(false);
            renderInProgressRef.current = false;
            return;
        }
        // For panel changes or word selections:
        // - Don't relayout the cloud (preserve positions)
        // - But still update colors/fonts, ensure words are visible, and recenter if needed
        if (isWordSelectionOrPanelAction) {
            console.log(isPanelClosing ? "Panel closing detected" : "Word selection detected");
            console.log("Skipping layout update");
            // Check if we already have words displayed
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            const wordsContainer = svg.select(".words-container");
            if (wordsContainer.empty()) {
                // If container is empty, we need to do a full render anyway
                console.log("No existing words found, doing full render despite panel action");
            } else {
                const wordsGroup = wordsContainer.select(".words-group");
                const existingWords = wordsGroup.selectAll("text");
                // If we have words already displayed, just update colors/fonts without relayout
                if (!existingWords.empty() && existingWords.size() > 0) {
                    // 1. Update existing words' styling
                    existingWords.style("fill", getWordColor).style("font-family", fontFamily);
                    // 2. If panel state changed, recenter the visualization
                    if (needsSvgCentering || isPanelClosing) {
                        // Recenter words - make sure they're in the middle of the new container size
                        const svgWidth = parseInt(svg.style("width"));
                        const svgHeight = parseInt(svg.style("height"));
                        // Smoothly transition to new center position
                        wordsGroup.transition().duration(300).attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
                        console.log("Recentered words after panel state change");
                    }
                    renderInProgressRef.current = false;
                    return;
                } else {
                    console.log("No existing words found in group, proceeding with full render");
                }
            }
        }
        // Proceed with full render
        setIsUpdating(true);
        try {
            const cloudWords = await createWordCloudLayout(words);
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            // Update words group - need to access words-group inside words-container
            const wordsContainer = svg.select(".words-container");
            if (wordsContainer.empty()) return;
            const wordsGroup = wordsContainer.select(".words-group");
            if (wordsGroup.empty()) return;
            // Update existing words and add new ones
            const wordElements = wordsGroup.selectAll("text").data(cloudWords, (d)=>d.text);
            // Remove words that are no longer present with fade out
            wordElements.exit().transition().duration(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRANSITION_DURATION"] / 2).style("opacity", 0).remove();
            // Add new words
            const enterWords = wordElements.enter().append("text").style("opacity", 0).style("font-family", fontFamily).style("cursor", "pointer").attr("text-anchor", "middle").text((d)=>d.text).attr("class", "cloud-word");
            // Single transition for all words
            wordElements.merge(enterWords).style("fill", getWordColor).transition().duration(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TRANSITION_DURATION"]).style("opacity", 1).style("font-size", (d)=>`${d.size}px`).style("font-family", fontFamily).attr("transform", (d)=>`translate(${d.x},${d.y}) rotate(${d.rotate})`);
            // Add interaction handlers
            wordElements.merge(enterWords).on("click", (event, d)=>{
                if (d.originalData) {
                    onWordSelect(d.originalData);
                }
            }).on("mouseover", function() {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).style("opacity", 0.7);
            }).on("mouseout", function() {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(this).transition().duration(200).style("opacity", 1);
            });
            // Ensure words are centered in the SVG
            const svgWidth = parseInt(svg.style("width"));
            const svgHeight = parseInt(svg.style("height"));
            wordsGroup.attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
            // Save previous words state
            previousWordsRef.current = cloudWords;
            // Reset zoom to identity transform
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
        } finally{
            // Always reset these flags no matter what happens
            setIsUpdating(false);
            renderInProgressRef.current = false;
        }
    }, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEBOUNCE_DELAY"]), [
        createWordCloudLayout,
        getWordColor,
        fontFamily,
        dimensions,
        onWordSelect
    ]);
    // Initialize SVG with responsive container
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!svgRef.current) return;
        // Avoid repeated initialization of SVG structure when not needed
        if (svgInitializedRef.current && // Only reinitialize if dimensions actually changed significantly
        Math.abs(dimensions.width - svgRef.current.width.baseVal.value) < 5 && Math.abs(dimensions.height - svgRef.current.height.baseVal.value) < 5) {
            return;
        }
        svgInitializedRef.current = true;
        const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
        svg.selectAll("*").remove();
        // Add gradient background
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient").attr("id", "cloud-background").attr("gradientTransform", "rotate(45)");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f8f9fa");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#e9ecef");
        // Add background rect
        svg.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", "url(#cloud-background)").attr("class", "zoom-background");
        // Add group for words with responsive centering
        const wordsContainer = svg.append("g").attr("class", "words-container");
        const wordsGroup = wordsContainer.append("g").attr("class", "words-group");
        // Calculate initial transform to center
        const width = parseInt(svg.style("width"));
        const height = parseInt(svg.style("height"));
        // Set initial translation for words group to center of svg
        wordsGroup.attr("transform", `translate(${width / 2},${height / 2})`);
        // Add zoom behavior
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        // Add resize observer for responsive centering
        const resizeObserver = new ResizeObserver(()=>{
            // Update the words group transform for centering
            const svgWidth = parseInt(svg.style("width"));
            const svgHeight = parseInt(svg.style("height"));
            wordsGroup.attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
            // Update zoom controls position with better boundary handling
            const zoomControlsHeight = 120; // Height of the zoom controls
            const padding = 20; // Padding from edges
            // Calculate position to ensure controls are fully visible
            let yPosition;
            if (svgHeight < 200) {
                // For very small heights, position at top
                yPosition = padding;
            } else if (svgHeight < zoomControlsHeight + padding * 2) {
                // For heights that can't fit controls with padding at bottom
                yPosition = (svgHeight - zoomControlsHeight) / 2; // Center vertically
            } else {
                // Default position (bottom with padding)
                yPosition = svgHeight - zoomControlsHeight - padding;
            }
            svg.select(".zoom-controls").attr("transform", `translate(${padding}, ${yPosition})`);
        });
        if (svgRef.current) {
            resizeObserver.observe(svgRef.current);
        }
        return ()=>{
            resizeObserver.disconnect();
        };
    }, [
        dimensions
    ]);
    // Reset zoom when search/filter changes
    const resetZoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
    }, []);
    // Update SVG when dimensions change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Skip if no SVG ref available
        if (!svgRef.current) return;
        // Skip if dimensions haven't changed substantially
        if (dimensionsRef.current.width === dimensions.width && dimensionsRef.current.height === dimensions.height) {
            return;
        }
        console.log(`Dimensions updated to ${dimensions.width}x${dimensions.height}, adjusting SVG`);
        // Update the SVG dimensions
        const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
        svg.attr("width", dimensions.width).attr("height", dimensions.height).style("width", `${dimensions.width}px`).style("height", `${dimensions.height}px`);
        // Update dimensions ref
        dimensionsRef.current = {
            width: dimensions.width,
            height: dimensions.height,
            lastUpdate: Date.now()
        };
        // Force layout update if we have words
        if (words.length > 0 && !modalsOpenRef.current) {
            shouldUpdateLayoutRef.current = true;
            debouncedUpdate(words);
        }
    }, [
        dimensions,
        words,
        debouncedUpdate
    ]);
    // Monitor panel visibility changes and recenter visualization when needed
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!svgRef.current || !svgRef.current.parentElement) return;
        // Use a MutationObserver to detect container size changes
        // This will handle cases like panel opening/closing
        const container = svgRef.current.parentElement;
        const observer = new ResizeObserver(()=>{
            // Only proceed if we have words already and it's not during initial load
            if (previousWordsRef.current.length === 0 || isLoading || modalsOpenRef.current) {
                return;
            }
            // Update centering without relayout
            const svg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$d3$2d$selection$2f$src$2f$select$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__select$3e$__["select"])(svgRef.current);
            const wordsContainer = svg.select(".words-container");
            if (!wordsContainer.empty()) {
                const wordsGroup = wordsContainer.select(".words-group");
                if (!wordsGroup.empty()) {
                    // Get current size
                    const svgWidth = parseInt(svg.style("width"));
                    const svgHeight = parseInt(svg.style("height"));
                    // Smoothly transition to new center
                    wordsGroup.transition().duration(300).attr("transform", `translate(${svgWidth / 2},${svgHeight / 2})`);
                    console.log("Container resized, recentering words");
                }
            }
        });
        // Start observing the container
        observer.observe(container);
        // Clean up
        return ()=>{
            observer.disconnect();
        };
    }, [
        isLoading
    ]);
    return {
        isUpdating,
        zoomRef,
        resetZoom,
        debouncedUpdate
    };
};
}}),
"[project]/src/components/WordCloud/modals/OptionsModal.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/constants.ts [app-ssr] (ecmascript)");
;
;
;
const languageOptions = [
    {
        value: 'english',
        label: 'English'
    },
    {
        value: 'spanish',
        label: 'Spanish'
    },
    {
        value: 'french',
        label: 'French'
    },
    {
        value: 'german',
        label: 'German'
    },
    {
        value: 'custom',
        label: 'Custom'
    },
    {
        value: 'auto-detect',
        label: 'Auto-detect'
    }
];
const OptionsModal = ({ isOpen, options, tempOptions, setTempOptions, onClose, onSave, // Stoplist/Whitelist related props
selectedLanguage, stoplistActive, whitelistActive, setLanguage, toggleStoplist, toggleWhitelist, onOpenStopwordsModal, onOpenWhitelistModal })=>{
    // Add effect to prevent body scrolling when modal is open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            // Save the current overflow style
            const originalOverflow = document.body.style.overflow;
            // Lock scrolling
            document.body.style.overflow = 'hidden';
            // Restore scrolling when modal closes
            return ()=>{
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [
        isOpen
    ]);
    if (!isOpen) return null;
    const updateOption = (key, value)=>{
        setTempOptions({
            ...tempOptions,
            [key]: value
        });
    };
    const resetDefaults = ()=>{
        setTempOptions({
            fontFamily: "Palatino",
            colorSelection: "random",
            applyGlobally: true
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-lg w-full max-w-[550px] transition-all duration-200 overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-8 py-3 bg-gray-50 flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-medium text-gray-800",
                            children: "Word Cloud Options"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer",
                            "aria-label": "Close modal",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-md font-semibold mb-4 text-gray-800",
                                    children: "Word Filtering"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "stoplist-toggle",
                                                            type: "checkbox",
                                                            checked: stoplistActive,
                                                            onChange: toggleStoplist,
                                                            className: "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                            lineNumber: 110,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "stoplist-toggle",
                                                            className: "ml-2 block text-sm font-medium text-gray-700",
                                                            children: "Enable Stopwords"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                            lineNumber: 117,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 109,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: onOpenStopwordsModal,
                                                    disabled: !stoplistActive,
                                                    className: `px-2 py-1 text-xs font-medium rounded transition-colors
                            ${stoplistActive ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'}`,
                                                    title: !stoplistActive ? "Enable stopwords first to edit the list" : "Edit stopwords list",
                                                    children: "Edit List"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 108,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-sm font-medium text-gray-700 mb-1",
                                                    children: "Stopwords Language:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: selectedLanguage,
                                                    onChange: (e)=>setLanguage(e.target.value),
                                                    className: `form-select block w-full rounded-md border-gray-300 shadow-sm 
                            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                            ${!stoplistActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75' : ''}`,
                                                    disabled: !stoplistActive,
                                                    title: !stoplistActive ? "Enable stopwords first to select a language" : "",
                                                    children: languageOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: option.value,
                                                            children: option.label
                                                        }, option.value, false, {
                                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                            lineNumber: 149,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 135,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-xs text-gray-500",
                                            children: stoplistActive ? 'Stopwords are common words (like "the", "and", "to") that will be filtered out of the visualization.' : 'Stopwords filtering is disabled.'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 156,
                                            columnNumber: 15
                                        }, this),
                                        selectedLanguage === 'custom' && stoplistActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-xs text-blue-600",
                                            children: 'Using custom stoplist. Click "Edit List" to modify.'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this),
                                        selectedLanguage === 'auto-detect' && stoplistActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-xs text-blue-600",
                                            children: "Auto-detecting stopwords based on word frequency patterns."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            id: "whitelist-toggle",
                                                            type: "checkbox",
                                                            checked: whitelistActive,
                                                            onChange: toggleWhitelist,
                                                            className: "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                            lineNumber: 179,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "whitelist-toggle",
                                                            className: "ml-2 block text-sm font-medium text-gray-700",
                                                            children: "Enable Whitelist"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                            lineNumber: 186,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 178,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: onOpenWhitelistModal,
                                                    disabled: !whitelistActive,
                                                    className: `px-2 py-1 text-xs font-medium rounded transition-colors
                            ${whitelistActive ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'}`,
                                                    title: !whitelistActive ? "Enable whitelist first to edit the list" : "Edit whitelist",
                                                    children: "Edit List"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 177,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-xs text-gray-500",
                                            children: whitelistActive ? 'Whitelist will only show words explicitly included in your list.' : 'Whitelist filtering is disabled.'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 204,
                                            columnNumber: 15
                                        }, this),
                                        whitelistActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-xs text-green-600",
                                            children: 'Click "Edit List" to specify exactly which words should be shown.'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 211,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-md font-semibold mb-4 text-gray-800",
                                    children: "Visualization"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 220,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-700 w-36",
                                            children: "Font Family:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 224,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: tempOptions.fontFamily,
                                                onChange: (e)=>updateOption('fontFamily', e.target.value),
                                                className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FONT_FAMILIES"].map((font)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: font,
                                                        children: font
                                                    }, font, false, {
                                                        fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                        lineNumber: 236,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                lineNumber: 228,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 223,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium text-gray-700 w-36",
                                            children: "Color Scheme:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: tempOptions.colorSelection,
                                                onChange: (e)=>updateOption('colorSelection', e.target.value),
                                                className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "random",
                                                        children: "Colorful (Random)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "monochrome",
                                                        children: "Monochrome (Blue)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "category",
                                                        children: "Categorical (by frequency)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                                lineNumber: 250,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 249,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 245,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            id: "applyGlobally",
                                            checked: tempOptions.applyGlobally,
                                            onChange: (e)=>updateOption('applyGlobally', e.target.checked),
                                            className: "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 266,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "applyGlobally",
                                            className: "ml-2 block text-sm font-medium text-gray-700",
                                            children: "Apply settings globally to all word clouds"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                            lineNumber: 275,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                                    lineNumber: 265,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 219,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-gray-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: resetDefaults,
                            className: "px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer",
                            children: "Reset"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 283,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 289,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onSave,
                            className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm cursor-pointer",
                            children: "Save"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                            lineNumber: 295,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
                    lineNumber: 282,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/WordCloud/modals/OptionsModal.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = OptionsModal;
}}),
"[project]/src/components/WordCloud/modals/ListEditModal.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const ListEditModal = ({ isOpen, onClose, title, value, onChange, onSave, language = 'english' })=>{
    // Always declare all hooks at the top, regardless of conditions
    const isStoplist = title.includes("Stopwords") || title.includes("Stoplist");
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isDirty, setIsDirty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Reset dirty state when modal opens/closes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            setIsDirty(false);
        }
    }, [
        isOpen
    ]);
    // Focus textarea when modal opens and position cursor at end
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen && textareaRef.current) {
            // Set focus
            textareaRef.current.focus();
            // Position cursor at the end
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [
        isOpen
    ]);
    // Prevent body scrolling when modal is open
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            // Save the current overflow style
            const originalOverflow = document.body.style.overflow;
            // Lock scrolling
            document.body.style.overflow = 'hidden';
            // Restore scrolling when modal closes
            return ()=>{
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [
        isOpen
    ]);
    // Prevent event propagation to parent elements
    const handleContentClick = (e)=>{
        e.stopPropagation();
    };
    // Update onChange handler to sync textarea content with state
    const handleTextChange = (e)=>{
        onChange(e.target.value);
        if (!isDirty) setIsDirty(true);
    };
    // Handle save - directly use the value from state
    const handleSaveClick = ()=>{
        onSave();
        setIsDirty(false);
    };
    // Count words from value
    const wordCount = value.split("\n").filter((line)=>line.trim().length > 0).length;
    // Check for duplicates
    const lines = value.split("\n").map((line)=>line.trim().toLowerCase()).filter(Boolean);
    const uniqueLines = new Set(lines);
    const hasDuplicates = lines.length !== uniqueLines.size;
    // Return null instead of early return
    if (!isOpen) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-[60] p-4",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden",
            onClick: handleContentClick,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-8 py-3 bg-gray-50 flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-medium text-gray-800",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-gray-400 hover:text-gray-600 text-xl transition-colors cursor-pointer",
                            "aria-label": "Close modal",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6",
                    children: [
                        isStoplist && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mt-0.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        className: "w-5 h-5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 124,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                        lineNumber: 117,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 116,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-700 text-sm mb-1",
                                            children: "Enter one word per line that you want to exclude from the visualization."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 133,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-500 text-xs",
                                            children: `Currently using ${language} stopwords. Changes will be saved to your custom stoplist.`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 136,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 132,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 115,
                            columnNumber: 13
                        }, this),
                        !isStoplist && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mr-2 flex-shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 mt-0.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        className: "w-5 h-5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M5 13l4 4L19 7"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 152,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                        lineNumber: 145,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 144,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-700 text-sm mb-1",
                                            children: "Enter one word per line that you want to include in the visualization."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 161,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-500 text-xs",
                                            children: "Only words in this list will be shown if whitelist is enabled."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 164,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 160,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 143,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    ref: textareaRef,
                                    value: value,
                                    onChange: handleTextChange,
                                    placeholder: isStoplist ? "Enter words to exclude..." : "Enter words to include...",
                                    className: "w-full h-64 border border-gray-300 rounded-md p-3 font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500",
                                    "aria-label": isStoplist ? "Stopwords list" : "Whitelist"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 171,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between text-xs text-gray-500 mt-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: hasDuplicates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-amber-600",
                                                children: "⚠️ Contains duplicates"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                                lineNumber: 182,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                wordCount,
                                                " ",
                                                wordCount === 1 ? 'word' : 'words'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                            lineNumber: 187,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                    lineNumber: 179,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 170,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 rounded p-2.5 mb-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-gray-600",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Tips:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                        lineNumber: 195,
                                        columnNumber: 15
                                    }, this),
                                    " Words are case-insensitive. Empty lines and duplicates will be removed automatically.",
                                    isStoplist && " Common stopwords like 'the', 'and', 'to' should be included.",
                                    !isStoplist && " Add only the specific words you want to show."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 193,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-gray-100",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSaveClick,
                            disabled: !isDirty,
                            className: `px-4 py-2 rounded-lg transition-colors text-sm cursor-pointer
              ${isDirty ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`,
                            children: "Save Changes"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                            lineNumber: 209,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
                    lineNumber: 202,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
            lineNumber: 98,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/WordCloud/modals/ListEditModal.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = ListEditModal;
}}),
"[project]/src/components/WordCloud/WordDetailPanel.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const WordDetailPanel = ({ selectedWord, onClose, onFilterToWord, maxCount, allWords })=>{
    // Check if no word is selected
    if (!selectedWord) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-64 bg-gray-50 rounded p-4 border-l border-gray-200 flex-shrink-0 md:h-[550px] transition-all duration-300 ease-in-out",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold",
                        children: selectedWord.value
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "text-gray-500 hover:text-gray-700 transition-colors",
                        "aria-label": "Close panel",
                        children: "×"
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-600",
                                children: "Frequency:"
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 font-medium",
                                children: selectedWord.count
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-600",
                                children: "Relative Frequency:"
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 font-medium",
                                children: [
                                    (selectedWord.count / maxCount * 100).toFixed(2),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-600",
                                children: "Rank:"
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 font-medium",
                                children: allWords.sort((a, b)=>b.count - a.count).findIndex((w)=>w.value === selectedWord.value) + 1
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-3 border-t border-gray-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>onFilterToWord(selectedWord.value),
                            className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors",
                            children: "Filter to this word"
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/WordCloud/WordDetailPanel.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = WordDetailPanel;
}}),
"[project]/src/components/WordCloud/store.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useWordCloudStore": (()=>useWordCloudStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/constants.ts [app-ssr] (ecmascript)");
;
;
// Local storage keys
const STORAGE_KEYS = {
    LANGUAGE: 'wordcloud_language',
    CUSTOM_STOPLIST: 'wordcloud_custom_stoplist',
    STOPLIST_ACTIVE: 'wordcloud_stoplist_active',
    WHITELIST: 'wordcloud_whitelist',
    WHITELIST_ACTIVE: 'wordcloud_whitelist_active',
    MIN_FREQUENCY: 'wordcloud_min_frequency',
    MAX_WORDS: 'wordcloud_max_words'
};
// Helper function to safely parse JSON from localStorage
const safeJsonParse = (key, defaultValue)=>{
    try {
        if ("TURBOPACK compile-time truthy", 1) return defaultValue;
        "TURBOPACK unreachable";
        const storedValue = undefined;
    } catch (error) {
        console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};
const useWordCloudStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        // Initial states
        words: [],
        filteredWords: [],
        isLoading: true,
        error: null,
        searchTerm: "",
        minFrequency: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 0,
        // Default to 100 words and load from localStorage if available
        maxWords: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 100,
        dimensions: {
            width: 800,
            height: 500
        },
        selectedWord: null,
        isPanelVisible: false,
        isWordSelectionAction: false,
        options: {
            fontFamily: "Palatino",
            colorSelection: "random",
            applyGlobally: true
        },
        tempOptions: {
            fontFamily: "Palatino",
            colorSelection: "random",
            applyGlobally: true
        },
        isOptionsModalOpen: false,
        isStopwordsModalOpen: false,
        isWhitelistModalOpen: false,
        stopwordsEditText: "",
        whitelistEditText: "",
        originalStopwordsText: "",
        originalWhitelistText: "",
        // Initialize stoplist/whitelist from localStorage
        selectedLanguage: (("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'english') || 'english',
        stoplistActive: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : true,
        whitelistActive: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : false,
        customStopwords: safeJsonParse(STORAGE_KEYS.CUSTOM_STOPLIST, []),
        customWhitelist: safeJsonParse(STORAGE_KEYS.WHITELIST, []),
        autoDetectedStopwords: [],
        shouldUpdateLayout: false,
        isUpdating: false,
        modalsOpen: false,
        wordColors: {},
        // Cache for memoizing filter operations
        filterCacheKey: "",
        lastFilterOperation: 0,
        // Basic setters
        setWords: (words)=>set({
                words
            }),
        setLoading: (isLoading)=>set({
                isLoading
            }),
        setError: (error)=>set({
                error
            }),
        // Improved setFilteredWords with shallow equality check to prevent unnecessary updates
        setFilteredWords: (filteredWords)=>{
            const currentFiltered = get().filteredWords;
            // Only update if the array references are different AND
            // either the lengths differ or the first/last elements differ
            // This avoids unnecessary renders when the filter produces the same results
            if (currentFiltered !== filteredWords && (currentFiltered.length !== filteredWords.length || filteredWords.length > 0 && currentFiltered.length > 0 && (currentFiltered[0].value !== filteredWords[0].value || currentFiltered[currentFiltered.length - 1].value !== filteredWords[filteredWords.length - 1].value))) {
                set({
                    filteredWords
                });
            }
        },
        setSearchTerm: (searchTerm)=>{
            const currentSearchTerm = get().searchTerm;
            // Skip if the search term hasn't changed
            if (currentSearchTerm === searchTerm) {
                return;
            }
            // Set flag to force update layout on search term change
            // and ALWAYS reset word selection action flag
            set({
                searchTerm,
                shouldUpdateLayout: true,
                isWordSelectionAction: false // Always reset for search changes
            });
            // After setting search term, filter words
            setTimeout(()=>{
                get().filterWords();
            }, 0);
        },
        setMinFrequency: (minFrequency)=>{
            set({
                minFrequency,
                shouldUpdateLayout: true,
                isWordSelectionAction: false
            });
            // Save to localStorage
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            setTimeout(()=>{
                get().filterWords();
            }, 0);
        },
        setMaxWords: (maxWords)=>{
            set({
                maxWords,
                shouldUpdateLayout: true,
                isWordSelectionAction: false
            });
            // Save to localStorage
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            setTimeout(()=>{
                get().filterWords();
            }, 0);
        },
        setDimensions: (dimensions)=>set({
                dimensions
            }),
        setSelectedWord: (selectedWord)=>{
            // When selecting a word or closing panel, mark this as a word selection action
            // This flag helps prevent layout updates during panel interactions
            set({
                selectedWord,
                isPanelVisible: selectedWord !== null,
                shouldUpdateLayout: false,
                isWordSelectionAction: true // Always flag this as a word selection action, even when closing panel
            });
        },
        setShouldUpdateLayout: (shouldUpdateLayout)=>set({
                shouldUpdateLayout,
                isWordSelectionAction: false // Reset word selection flag
            }),
        setIsUpdating: (isUpdating)=>set({
                isUpdating
            }),
        // Modal actions
        openOptionsModal: ()=>{
            const { options } = get();
            set({
                isOptionsModalOpen: true,
                tempOptions: {
                    ...options
                },
                modalsOpen: true
            });
        },
        closeOptionsModal: ()=>{
            set({
                isOptionsModalOpen: false,
                modalsOpen: false
            });
        },
        saveOptions: ()=>{
            const { tempOptions, options, searchTerm } = get();
            // Check if options actually changed
            const optionsChanged = JSON.stringify(tempOptions) !== JSON.stringify(options);
            // Font family change requires layout update
            const requiresLayoutUpdate = tempOptions.fontFamily !== options.fontFamily;
            // Apply the new settings
            set({
                options: {
                    ...tempOptions
                },
                isOptionsModalOpen: false,
                modalsOpen: false,
                shouldUpdateLayout: requiresLayoutUpdate
            });
            // Handle filter updates if options changed
            if (optionsChanged) {
                setTimeout(()=>{
                    get().filterWords();
                }, 50);
            }
        },
        openStopwordsModal: ()=>{
            const { customStopwords, selectedLanguage, autoDetectedStopwords } = get();
            // Prepare text content for the modal
            let currentText = "";
            if (selectedLanguage === 'custom' && customStopwords.length > 0) {
                currentText = customStopwords.join("\n");
            } else if (selectedLanguage === 'english') {
                currentText = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ENGLISH_STOPWORDS"].join("\n");
            } else if (selectedLanguage === 'auto-detect') {
                currentText = autoDetectedStopwords.join("\n");
            } else {
                // Default example if no specific stopwords are selected
                currentText = [
                    "a",
                    "an",
                    "the",
                    "and",
                    "or",
                    "but",
                    "if",
                    "then",
                    "else",
                    "when",
                    "to",
                    "at",
                    "in",
                    "on",
                    "by"
                ].join("\n");
            }
            set({
                stopwordsEditText: currentText,
                originalStopwordsText: currentText,
                isStopwordsModalOpen: true,
                modalsOpen: true
            });
        },
        closeStopwordsModal: ()=>{
            set({
                isStopwordsModalOpen: false,
                modalsOpen: false
            });
        },
        saveStopwords: ()=>{
            const { stopwordsEditText, originalStopwordsText, searchTerm, selectedWord } = get();
            // Only process if changes were made
            const changesWereMade = stopwordsEditText !== originalStopwordsText;
            if (changesWereMade) {
                // Close the panel first if it's open
                if (selectedWord) {
                    set({
                        selectedWord: null,
                        isPanelVisible: false
                    });
                }
                // Parse the new stopwords from text
                const newStopwords = stopwordsEditText.split("\n").map((word)=>word.trim().toLowerCase()).filter((word)=>word.length > 0);
                // Update custom stopwords and change language to custom
                set({
                    customStopwords: newStopwords,
                    selectedLanguage: 'custom',
                    stoplistActive: true,
                    shouldUpdateLayout: true,
                    isStopwordsModalOpen: false,
                    modalsOpen: false,
                    isWordSelectionAction: false // Ensure this is not treated as a word selection
                });
                // Save to localStorage
                localStorage.setItem(STORAGE_KEYS.CUSTOM_STOPLIST, JSON.stringify(newStopwords));
                localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'custom');
                localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, 'true');
                // Save current search term to reapply it
                const currentSearchTerm = searchTerm;
                // Force update after modal closes
                setTimeout(()=>{
                    // Temporarily clear search term to ensure stopwords filter is applied
                    if (currentSearchTerm) {
                        set({
                            searchTerm: ''
                        });
                        // Then reapply the search term after a brief delay
                        setTimeout(()=>{
                            set({
                                searchTerm: currentSearchTerm
                            });
                            get().filterWords();
                        }, 100);
                    } else {
                        get().filterWords();
                    }
                }, 100); // Increased delay to ensure panel closes first
            } else {
                // Just close the modal without changes
                set({
                    isStopwordsModalOpen: false,
                    modalsOpen: false
                });
            }
        },
        openWhitelistModal: ()=>{
            const { customWhitelist } = get();
            // Show some example entries if whitelist is empty
            let currentText = "";
            if (customWhitelist.length === 0) {
                // Example whitelist terms
                currentText = [
                    "important",
                    "keyword",
                    "significant",
                    "relevant"
                ].join("\n");
            } else {
                currentText = customWhitelist.join("\n");
            }
            set({
                whitelistEditText: currentText,
                originalWhitelistText: currentText,
                isWhitelistModalOpen: true,
                modalsOpen: true
            });
        },
        closeWhitelistModal: ()=>{
            set({
                isWhitelistModalOpen: false,
                modalsOpen: false
            });
        },
        saveWhitelist: ()=>{
            const { whitelistEditText, originalWhitelistText, searchTerm, selectedWord } = get();
            // Only process if changes were made
            const changesWereMade = whitelistEditText !== originalWhitelistText;
            if (changesWereMade) {
                // Close the panel first if it's open
                if (selectedWord) {
                    set({
                        selectedWord: null,
                        isPanelVisible: false
                    });
                }
                // Parse the new whitelist from text
                const newWhitelist = whitelistEditText.split("\n").map((word)=>word.trim().toLowerCase()).filter((word)=>word.length > 0);
                // Update whitelist settings
                set({
                    customWhitelist: newWhitelist,
                    whitelistActive: true,
                    shouldUpdateLayout: true,
                    isWhitelistModalOpen: false,
                    modalsOpen: false,
                    isWordSelectionAction: false,
                    // Force a complete refiltering by invalidating the cache
                    filterCacheKey: String(Date.now())
                });
                // Save to localStorage
                localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(newWhitelist));
                localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, 'true');
                // Save current search term to reapply it
                const currentSearchTerm = searchTerm;
                // Handle search term separately if needed
                if (currentSearchTerm) {
                    // Temporarily clear search term
                    set({
                        searchTerm: ''
                    });
                    // Wait a tiny amount of time and reapply search term
                    // This helps ensure the whitelist filter is properly applied first
                    setTimeout(()=>{
                        set({
                            searchTerm: currentSearchTerm
                        });
                        get().filterWords(); // Update filtered words after search term is reapplied
                    }, 10);
                } else {
                    // If no search term, apply filtering immediately
                    get().filterWords();
                }
            } else {
                // Just close the modal without changes
                set({
                    isWhitelistModalOpen: false,
                    modalsOpen: false
                });
            }
        },
        // Language selection and toggles for stoplist/whitelist
        setLanguage: (language)=>{
            // Close the panel first if it's open
            const { selectedWord } = get();
            if (selectedWord) {
                set({
                    selectedWord: null,
                    isPanelVisible: false
                });
            }
            // Set new language with layout update flag
            set({
                selectedLanguage: language,
                shouldUpdateLayout: true,
                isWordSelectionAction: false
            });
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
            // Update filters immediately without setTimeout
            get().filterWords();
        },
        toggleStoplist: ()=>{
            // Get current state
            const { stoplistActive, selectedWord } = get();
            // Close the panel first if it's open
            if (selectedWord) {
                set({
                    selectedWord: null,
                    isPanelVisible: false
                });
            }
            // Calculate new value
            const newValue = !stoplistActive;
            // Update state directly without nested setTimeout
            // This ensures that state changes are immediately applied
            set({
                stoplistActive: newValue,
                shouldUpdateLayout: true,
                isWordSelectionAction: false,
                modalsOpen: false
            });
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, String(newValue));
            // Apply filtering immediately
            // This direct call ensures that filteredWords is updated right after state change
            get().filterWords();
        },
        toggleWhitelist: ()=>{
            // Get current state
            const { whitelistActive, customWhitelist, searchTerm, selectedWord } = get();
            // Close the panel first if it's open
            if (selectedWord) {
                set({
                    selectedWord: null,
                    isPanelVisible: false
                });
            }
            // Calculate new value
            const newWhitelistActive = !whitelistActive;
            // Update state directly without nested setTimeout
            // This ensures state changes are immediately applied
            set({
                whitelistActive: newWhitelistActive,
                shouldUpdateLayout: true,
                isWordSelectionAction: false,
                modalsOpen: false
            });
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, newWhitelistActive ? 'true' : 'false');
            // Always force filteredWords to be recomputed completely
            // This ensures the visualization updates properly when no words match the whitelist
            set({
                filterCacheKey: String(Date.now()) // Invalidate filter cache
            });
            // Handle search term separately if needed
            if (searchTerm) {
                // Temporarily clear search term
                set({
                    searchTerm: ''
                });
                // Wait a tiny amount of time and reapply search term
                // This helps ensure the whitelist filter is properly applied first
                setTimeout(()=>{
                    set({
                        searchTerm: searchTerm
                    });
                    get().filterWords(); // Update filtered words after search term is reapplied
                }, 10);
            } else {
                // If no search term, apply filtering immediately
                get().filterWords();
            }
        },
        // Utility actions
        updateTempOptions: (key, value)=>{
            set({
                tempOptions: {
                    ...get().tempOptions,
                    [key]: value
                }
            });
        },
        resetOptionsToDefaults: ()=>{
            set({
                tempOptions: {
                    fontFamily: "Palatino",
                    colorSelection: "random",
                    applyGlobally: true
                }
            });
        },
        setStopwordsEditText: (text)=>set({
                stopwordsEditText: text
            }),
        setWhitelistEditText: (text)=>set({
                whitelistEditText: text
            }),
        // Helper function to get active stopwords based on current option
        getActiveStopwords: ()=>{
            const { selectedLanguage, autoDetectedStopwords, customStopwords, stoplistActive } = get();
            // If stoplist is not active, return empty list
            if (!stoplistActive) return [];
            switch(selectedLanguage){
                case "auto-detect":
                    return autoDetectedStopwords;
                case "english":
                    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ENGLISH_STOPWORDS"];
                case "custom":
                    return customStopwords;
                default:
                    // For other languages (like spanish), this would come from an API
                    // but for now we'll just return the English list
                    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ENGLISH_STOPWORDS"];
            }
        },
        // Helper function to get active whitelist based on current option
        getActiveWhitelist: ()=>{
            const { customWhitelist, whitelistActive } = get();
            // If whitelist is not active, return empty list
            if (!whitelistActive) return [];
            return customWhitelist;
        },
        // Main word filtering function with memoization
        filterWords: ()=>{
            const state = get();
            const { words, searchTerm, minFrequency, maxWords, filterCacheKey, lastFilterOperation } = state;
            // Don't bother filtering if we have no words
            if (words.length === 0) {
                console.log("No words to filter");
                // 确保设置空数组，而不是保留旧数据
                set({
                    filteredWords: []
                });
                return;
            }
            // Create a cache key based on filter parameters
            const newCacheKey = JSON.stringify({
                searchTerm,
                minFrequency,
                maxWords,
                stoplistActive: state.stoplistActive,
                whitelistActive: state.whitelistActive,
                wordCount: words.length,
                timestamp: Date.now()
            });
            // Check if we need to recompute or can use cached results
            const now = Date.now();
            const cacheStillValid = filterCacheKey === newCacheKey;
            const withinThrottleWindow = now - lastFilterOperation < 300; // 300ms throttle window
            if (cacheStillValid && withinThrottleWindow) {
                console.log("Using cached filter results - skipping filter operation");
                return;
            }
            console.log("Computing new filtered words");
            // Update cache info
            set({
                filterCacheKey: newCacheKey,
                lastFilterOperation: now
            });
            // Get active stoplist and whitelist
            const stopwords = state.getActiveStopwords();
            const whitelist = state.getActiveWhitelist();
            // Apply all filters (search, frequency, stoplist/whitelist)
            let filtered = [
                ...words
            ];
            // Apply search filter if needed
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter((word)=>word.value.toLowerCase().includes(term));
            }
            // Apply frequency filter
            filtered = filtered.filter((word)=>word.count >= minFrequency);
            // Apply whitelist if active
            if (state.whitelistActive && whitelist.length > 0) {
                const whitelistFiltered = filtered.filter((word)=>whitelist.includes(word.value.toLowerCase()));
                // If whitelist is active but no words match, we should show an empty set
                filtered = whitelistFiltered;
                // Force a layout update if filtering resulted in empty set
                if (filtered.length === 0) {
                    set({
                        shouldUpdateLayout: true
                    });
                }
            }
            // Apply stoplist if active
            if (state.stoplistActive && stopwords.length > 0) {
                filtered = filtered.filter((word)=>!stopwords.includes(word.value.toLowerCase()));
            }
            // Limit to max words (sort by frequency first)
            if (filtered.length > maxWords) {
                filtered = [
                    ...filtered
                ].sort((a, b)=>b.count - a.count).slice(0, maxWords);
            }
            // Log the filter results
            if (filtered.length === 0) {
                console.log("No words match the current filters");
            } else {
                console.log(`Filtered words: ${filtered.length} words remain after applying filters`);
            }
            // Update filtered words - always update, even if empty (important for clearing visualizations)
            set({
                filteredWords: filtered
            });
            // If filtering resulted in no words, make sure we reset any selected word
            if (filtered.length === 0 && state.selectedWord !== null) {
                set({
                    selectedWord: null,
                    isPanelVisible: false
                });
            }
        },
        // Auto-detect stopwords based on word frequencies
        autoDetectStopwords: ()=>{
            const { words } = get();
            if (words.length > 10) {
                // Find common words that likely are stopwords based on frequency analysis
                const totalWords = words.reduce((sum, word)=>sum + word.count, 0);
                const averageFrequency = totalWords / words.length;
                const excludedWords = [
                    "name",
                    "year",
                    "data",
                    "info"
                ];
                // Words that appear much more frequently than average might be stopwords
                const potentialStopwords = words.filter((word)=>word.count > averageFrequency * 3 && // Much more frequent than average
                    word.value.length <= 4 && // Short words are often stopwords
                    !excludedWords.includes(word.value.toLowerCase()) // Exclude common meaningful short words
                ).map((word)=>word.value.toLowerCase());
                set({
                    autoDetectedStopwords: potentialStopwords
                });
            }
        },
        // Get color for a word
        getWordColor: (word)=>{
            const { options, wordColors, filteredWords } = get();
            // For random colors, ensure consistency by storing in state
            if (options.colorSelection === "random") {
                if (!wordColors[word]) {
                    // Create a new colors object to avoid mutating state directly
                    const newColors = {
                        ...wordColors
                    };
                    newColors[word] = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"][Math.floor(Math.random() * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length)];
                    set({
                        wordColors: newColors
                    });
                }
                return wordColors[word] || "#333333";
            }
            // For other color schemes, find the word data to get its count
            const wordData = filteredWords.find((w)=>w.value === word);
            if (!wordData) return "#333333";
            const maxCount = Math.max(...filteredWords.map((w)=>w.count));
            const ratio = wordData.count / maxCount;
            switch(options.colorSelection){
                case "monochrome":
                    return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`;
                case "category":
                    {
                        // Use the selected color palette for categorical coloring
                        const colorIndex = Math.floor(ratio * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length);
                        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"][Math.min(colorIndex, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CUSTOM_COLORS"].length - 1)];
                    }
                default:
                    return wordColors[word] || "#333333";
            }
        },
        // Fetch word cloud data
        fetchData: async ()=>{
            set({
                isLoading: true,
                error: null
            });
            try {
                // Import the dataStore
                const { fetchWordCloudData } = await __turbopack_context__.r("[project]/src/store/dataStore.ts [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i).then((module)=>module.useDataStore.getState());
                // Fetch data from the API
                const data = await fetchWordCloudData();
                // Calculate the minimum frequency in the dataset
                const minCount = Math.min(...data.wordCloudData.map((w)=>w.count));
                // Get current min frequency
                const { minFrequency } = get();
                // If minFrequency is 0, set it to the minimum value from the dataset
                const newMinFrequency = minFrequency === 0 ? minCount : minFrequency;
                // Set the words data and update minimum frequency if needed
                set({
                    words: data.wordCloudData,
                    filteredWords: data.wordCloudData,
                    minFrequency: newMinFrequency,
                    isLoading: false
                });
                // Save min frequency to localStorage if it was updated
                if ("TURBOPACK compile-time falsy", 0) {
                    "TURBOPACK unreachable";
                }
                // Auto-detect stopwords after loading data
                setTimeout(()=>{
                    get().autoDetectStopwords();
                    get().filterWords();
                }, 0);
            } catch (error) {
                console.error('Error fetching word cloud data:', error);
                set({
                    error: error instanceof Error ? error.message : 'An unknown error occurred',
                    isLoading: false
                });
            }
        }
    }));
}}),
"[project]/src/components/WordCloud/index.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$useWordCloudVisualization$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/useWordCloudVisualization.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$modals$2f$OptionsModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/modals/OptionsModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$modals$2f$ListEditModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/modals/ListEditModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$WordDetailPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/WordDetailPanel.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChartError.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$debounce$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lodash/debounce.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
const WordCloud = ({ skipLoading = false })=>{
    // Get SVG ref for d3 visualization
    const svgRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Get state and actions from store
    const { // Data states
    words, filteredWords, isLoading, error, // UI states
    searchTerm, minFrequency, maxWords, dimensions, selectedWord, isPanelVisible, isWordSelectionAction, // Options and modal states
    options, tempOptions, isOptionsModalOpen, isStopwordsModalOpen, isWhitelistModalOpen, // List edit states
    stopwordsEditText, whitelistEditText, // Stoplist/Whitelist states
    selectedLanguage, stoplistActive, whitelistActive, // Flags
    shouldUpdateLayout, isUpdating, // Actions
    setSearchTerm, setMinFrequency, setMaxWords, setDimensions, setSelectedWord, setShouldUpdateLayout, setIsUpdating, // Modal actions
    openOptionsModal, closeOptionsModal, saveOptions, openStopwordsModal, closeStopwordsModal, saveStopwords, openWhitelistModal, closeWhitelistModal, saveWhitelist, // Stoplist/Whitelist actions
    setLanguage, toggleStoplist, toggleWhitelist, // Option actions
    updateTempOptions, resetOptionsToDefaults, setStopwordsEditText, setWhitelistEditText, // Data actions
    fetchData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWordCloudStore"])();
    // References for controlling the wordcloud visualization
    const shouldUpdateLayoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(shouldUpdateLayout);
    const selectedWordRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(selectedWord);
    const isPanelVisibleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(isPanelVisible);
    const modalsOpenRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen);
    const isWordSelectionActionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(isWordSelectionAction);
    // Track the last render timestamp to prevent duplicate renders
    const lastRenderTimestampRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const RENDER_DEBOUNCE_MS = 500;
    // Keep refs in sync with store state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        shouldUpdateLayoutRef.current = shouldUpdateLayout;
    }, [
        shouldUpdateLayout
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        selectedWordRef.current = selectedWord;
    }, [
        selectedWord
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        isPanelVisibleRef.current = isPanelVisible;
    }, [
        isPanelVisible
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        modalsOpenRef.current = isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen;
    }, [
        isOptionsModalOpen,
        isStopwordsModalOpen,
        isWhitelistModalOpen
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        isWordSelectionActionRef.current = isWordSelectionAction;
    }, [
        isWordSelectionAction
    ]);
    // Word cloud visualization hook (using our store state through refs)
    const { resetZoom, debouncedUpdate } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$useWordCloudVisualization$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWordCloudVisualization"])({
        svgRef,
        words: filteredWords,
        dimensions,
        fontFamily: options.fontFamily,
        colorSelection: options.colorSelection,
        isLoading,
        selectedWordRef,
        isPanelVisibleRef,
        shouldUpdateLayoutRef,
        modalsOpenRef,
        isWordSelectionActionRef,
        onWordSelect: (word)=>{
            // Let the store handle all state updates
            setSelectedWord(word);
            console.log("Word selected:", word.value);
        }
    });
    // Update dimensions when window size changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleResize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lodash$2f$debounce$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(()=>{
            const container = svgRef.current?.parentElement;
            if (!container) return;
            // Calculate dimensions based on container size only
            // Panel state will be handled by CSS flex layout
            const containerWidth = container.clientWidth;
            // Set new dimensions (with minimum width guarantee)
            const newWidth = Math.max(containerWidth - 32, 400); // account for padding
            const newHeight = Math.min(550, window.innerHeight * 0.6);
            // Update dimensions in store
            setDimensions({
                width: newWidth,
                height: newHeight
            });
            console.log(`Dimensions updated: ${newWidth}x${newHeight}`);
        }, 250);
        // Only add resize listener on client side
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
    }, [
        setDimensions
    ]);
    // Reset zoom when search/filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // If this is a slider change, we DO want to reset zoom
        const isSliderChange = shouldUpdateLayout === true;
        // Skip zoom reset if:
        // - This is a panel state change (isPanelVisible changed)
        // - OR a word selection/deselection 
        // BUT don't skip for slider changes or search term changes
        if (!isSliderChange && (selectedWord !== null || isWordSelectionAction || !shouldUpdateLayout)) {
            return;
        }
        // Reset zoom when filtered words change (search, filter, etc.)
        resetZoom();
    }, [
        filteredWords,
        minFrequency,
        maxWords,
        searchTerm,
        resetZoom,
        selectedWord,
        isWordSelectionAction,
        shouldUpdateLayout
    ]);
    // Fetch data on initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // If skipLoading is true, do not execute fetchData
        if (!skipLoading) {
            fetchData();
        }
    }, [
        fetchData,
        skipLoading
    ]);
    // Single unified effect to handle all word cloud updates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Only proceed if we have the SVG reference and words to display
        if (!svgRef.current || !filteredWords.length) {
            return;
        }
        // Skip updates when loading or modals are open
        if (isLoading || modalsOpenRef.current) {
            console.log("Skipping word cloud update: loading or modal open");
            return;
        }
        console.log("Word cloud update triggered", {
            wordCount: filteredWords.length,
            shouldUpdateLayout,
            isWordSelectionAction,
            timestamp: new Date().toISOString()
        });
        // Set the layout flag based on current state
        shouldUpdateLayoutRef.current = shouldUpdateLayout;
        // Add a small delay for initial render to ensure SVG is ready
        const delay = 100;
        // Use setTimeout to prevent React 18 double-rendering issues in dev mode
        const timerId = setTimeout(()=>{
            debouncedUpdate(filteredWords);
        }, delay);
        return ()=>clearTimeout(timerId);
    }, [
        // Dependencies that should trigger an update
        filteredWords,
        isLoading,
        shouldUpdateLayout,
        // Don't add isWordSelectionAction as dependency 
        // to prevent unnecessary renders from panel interactions
        debouncedUpdate
    ]);
    // Min/max count for sliders - initialize with defaults for SSR
    const minCount = words.length > 0 ? Math.min(...words.map((w)=>w.count)) : 0;
    const maxCount = words.length > 0 ? Math.max(...words.map((w)=>w.count)) : 100;
    // Initialize minFrequency based on data available at render time
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (words.length > 0 && minFrequency === 0) {
            // Only set if not already set and we have data
            setMinFrequency(minCount);
        }
    }, [
        words.length,
        minCount,
        minFrequency,
        setMinFrequency
    ]);
    // Handle panel close with smooth transition
    const handlePanelClose = ()=>{
        // Let the store handle the state updates
        // The store will set isWordSelectionAction to true, preventing layout
        setSelectedWord(null);
        // Record panel close in console for debugging
        console.log("Panel closed with smooth transition");
    };
    // When panel state changes (appearing or disappearing),
    // ensure the container adjusts properly but doesn't trigger relayout
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const container = svgRef.current?.parentElement?.parentElement;
        if (!container) return;
        // Force container to adjust its size without triggering wordcloud relayout
        const adjustContainerSize = ()=>{
            requestAnimationFrame(()=>{
                // Just accessing clientWidth can sometimes trigger reflow 
                // without causing full recalculation
                const _ = container.clientWidth;
            });
        };
        adjustContainerSize();
        // After transition completes (300ms is our transition duration)
        const timer = setTimeout(()=>{
            adjustContainerSize();
        }, 350);
        return ()=>clearTimeout(timer);
    }, [
        isPanelVisible
    ]);
    // Handle filtering to a selected word
    const handleFilterToWord = (word)=>{
        // This is explicitly NOT a word selection action
        // but rather a search action, so we need to:
        // 1. Make sure isWordSelectionAction is reset
        // 2. Force layout update since we're filtering to a specific word
        // Close the panel first
        handlePanelClose();
        // Short delay to ensure panel close is registered
        setTimeout(()=>{
            // Now set search term with force update
            shouldUpdateLayoutRef.current = true;
            // Reset word selection flag via store action
            // This ensures the layout is fully recomputed
            setShouldUpdateLayout(true);
            // Set the search term to filter to this word
            setSearchTerm(word);
            console.log("Filtering to word:", word);
        }, 50);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md p-4 w-full overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold text-gray-800 pb-2",
                        children: "Word Cloud"
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordCloud/index.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: openOptionsModal,
                        className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer",
                        children: "Options"
                    }, void 0, false, {
                        fileName: "[project]/src/components/WordCloud/index.tsx",
                        lineNumber: 328,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 326,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1",
                                children: "Search terms"
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 338,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: searchTerm,
                                onChange: (e)=>{
                                    if (e.target.value === "") {
                                        setSearchTerm("");
                                    } else {
                                        setSearchTerm(e.target.value);
                                    }
                                },
                                placeholder: "Filter words...",
                                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 h-10 text-sm transition-colors"
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 341,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/index.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1",
                                children: [
                                    "Minimum frequency:",
                                    " ",
                                    ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 357,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center h-10",
                                children: "undefined" !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: minCount,
                                    max: maxCount,
                                    value: minFrequency,
                                    onChange: (e)=>{
                                        const newValue = Number(e.target.value);
                                        setMinFrequency(newValue);
                                    },
                                    className: "w-full cursor-pointer"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 363,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 361,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/index.tsx",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-sm font-medium text-gray-700 mb-1",
                                children: [
                                    "Max words to display:",
                                    " ",
                                    ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center h-10",
                                children: "undefined" !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "range",
                                    min: 10,
                                    // Calculate a reasonable maximum: either 500 or double the total words count, whichever is smaller
                                    max: words.length,
                                    value: maxWords,
                                    onChange: (e)=>{
                                        // Update max words in store when slider changes
                                        // This will automatically save to localStorage via the store action
                                        setMaxWords(Number(e.target.value));
                                    },
                                    className: "w-full cursor-pointer"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 385,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                lineNumber: 383,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/WordCloud/index.tsx",
                        lineNumber: 378,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 336,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row gap-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `grid transition-all duration-300 ease-in-out gap-4 ${isPanelVisible ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr]"}`,
                    style: {
                        width: "100%"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-828af5de18c23a12" + " " + "h-[550px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden relative wordcloud-container",
                            children: [
                                isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-828af5de18c23a12" + " " + "absolute inset-0 bg-white/50 flex items-center justify-center z-10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-828af5de18c23a12" + " " + "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-828af5de18c23a12" + " " + "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                lineNumber: 416,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-828af5de18c23a12" + " " + "text-gray-500",
                                                children: "Loading..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                lineNumber: 417,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                        lineNumber: 415,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 414,
                                    columnNumber: 15
                                }, this),
                                error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    message: error,
                                    onRetry: fetchData
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 423,
                                    columnNumber: 15
                                }, this) : isUpdating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-828af5de18c23a12" + " " + "absolute inset-0 bg-white/50 flex items-center justify-center z-10",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-828af5de18c23a12" + " " + "flex items-center space-x-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-828af5de18c23a12" + " " + "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                lineNumber: 427,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-828af5de18c23a12" + " " + "text-gray-500",
                                                children: "Updating..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                lineNumber: 428,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                        lineNumber: 426,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 425,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        !isLoading && filteredWords.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-828af5de18c23a12" + " " + "absolute inset-0 flex flex-col items-center justify-center z-5 bg-white shadow-inner rounded",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-828af5de18c23a12" + " " + "text-gray-600 text-center p-6 max-w-md bg-gray-50 rounded-lg border border-gray-100 shadow-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        xmlns: "http://www.w3.org/2000/svg",
                                                        fill: "none",
                                                        viewBox: "0 0 24 24",
                                                        stroke: "currentColor",
                                                        className: "jsx-828af5de18c23a12" + " " + "h-14 w-14 mx-auto mb-3 text-gray-400",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 1.5,
                                                            d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                                                            className: "jsx-828af5de18c23a12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/WordCloud/index.tsx",
                                                            lineNumber: 437,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                        lineNumber: 436,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "jsx-828af5de18c23a12" + " " + "text-xl font-semibold mb-2",
                                                        children: "No Words to Display"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                        lineNumber: 439,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "jsx-828af5de18c23a12" + " " + "mb-4 text-gray-500",
                                                        children: "Your current filters don't match any words."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                        lineNumber: 440,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-828af5de18c23a12" + " " + "space-y-3 text-left",
                                                        children: [
                                                            searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-828af5de18c23a12" + " " + "p-3 bg-purple-50 rounded-md text-purple-700 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-828af5de18c23a12" + " " + "font-semibold block mb-1",
                                                                        children: "Search term has no matches"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                                        lineNumber: 445,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    'Your search term "',
                                                                    searchTerm,
                                                                    "\" doesn't match any words."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                                lineNumber: 444,
                                                                columnNumber: 27
                                                            }, this),
                                                            minFrequency > minCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-828af5de18c23a12" + " " + "p-3 bg-amber-50 rounded-md text-amber-700 text-sm",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-828af5de18c23a12" + " " + "font-semibold block mb-1",
                                                                        children: "Frequency threshold too high"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                                        lineNumber: 452,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    "Minimum frequency is set to ",
                                                                    minFrequency,
                                                                    ". Try lowering it."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                                lineNumber: 451,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/WordCloud/index.tsx",
                                                        lineNumber: 442,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/WordCloud/index.tsx",
                                                lineNumber: 435,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/index.tsx",
                                            lineNumber: 434,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            ref: svgRef,
                                            width: "100%",
                                            height: "100%",
                                            style: {
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                cursor: "grab"
                                            },
                                            className: "jsx-828af5de18c23a12" + " " + ((isUpdating ? "opacity-50" : "opacity-100") || "")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/WordCloud/index.tsx",
                                            lineNumber: 460,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    id: "828af5de18c23a12",
                                    children: ".wordcloud-container.jsx-828af5de18c23a12 svg.jsx-828af5de18c23a12:active{cursor:grabbing}.cloud-word.jsx-828af5de18c23a12{user-select:none}"
                                }, void 0, false, void 0, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/index.tsx",
                            lineNumber: 412,
                            columnNumber: 11
                        }, this),
                        selectedWord && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$WordDetailPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            selectedWord: selectedWord,
                            onClose: handlePanelClose,
                            onFilterToWord: handleFilterToWord,
                            maxCount: maxCount,
                            allWords: words
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/index.tsx",
                            lineNumber: 486,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/index.tsx",
                    lineNumber: 405,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 403,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-2 justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: "Loading word statistics..."
                            }, void 0, false)
                        }, void 0, false, {
                            fileName: "[project]/src/components/WordCloud/index.tsx",
                            lineNumber: 500,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4 text-xs",
                            children: [
                                stoplistActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full",
                                    children: selectedLanguage === "custom" ? "Custom Stopwords" : `${selectedLanguage} Stopwords`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 525,
                                    columnNumber: 15
                                }, this) : null,
                                whitelistActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-2 py-1 bg-green-50 text-green-700 rounded-full",
                                    children: "Whitelist Active"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/WordCloud/index.tsx",
                                    lineNumber: 533,
                                    columnNumber: 15
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/WordCloud/index.tsx",
                            lineNumber: 523,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/WordCloud/index.tsx",
                    lineNumber: 499,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 498,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$modals$2f$OptionsModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isOptionsModalOpen,
                options: options,
                tempOptions: tempOptions,
                setTempOptions: (newOptions)=>{
                    // Update each option individually
                    Object.entries(newOptions).forEach(([key, value])=>{
                        updateTempOptions(key, value);
                    });
                },
                onClose: closeOptionsModal,
                onSave: saveOptions,
                // Stoplist/Whitelist related props
                selectedLanguage: selectedLanguage,
                stoplistActive: stoplistActive,
                whitelistActive: whitelistActive,
                setLanguage: setLanguage,
                toggleStoplist: toggleStoplist,
                toggleWhitelist: toggleWhitelist,
                onOpenStopwordsModal: openStopwordsModal,
                onOpenWhitelistModal: openWhitelistModal
            }, void 0, false, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 542,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$modals$2f$ListEditModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isStopwordsModalOpen,
                onClose: closeStopwordsModal,
                title: "Edit Stoplist",
                value: stopwordsEditText,
                onChange: setStopwordsEditText,
                onSave: saveStopwords,
                language: selectedLanguage
            }, void 0, false, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 566,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$modals$2f$ListEditModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isWhitelistModalOpen,
                onClose: closeWhitelistModal,
                title: "Edit Whitelist",
                value: whitelistEditText,
                onChange: setWhitelistEditText,
                onSave: saveWhitelist
            }, void 0, false, {
                fileName: "[project]/src/components/WordCloud/index.tsx",
                lineNumber: 577,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/WordCloud/index.tsx",
        lineNumber: 325,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = WordCloud;
}}),
"[project]/src/components/WordCloud.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Re-export the refactored WordCloud component
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud/index.tsx [app-ssr] (ecmascript)");
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
}}),
"[project]/src/components/DocumentSummary.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ChartError.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/dataStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const DocumentSummary = ({ skipLoading = false })=>{
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { fetchDocumentSummary } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDataStore"])();
    // Define fetchSummary as a component method for reuse with error retry
    const fetchSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        console.log("Fetching document summary data...");
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchDocumentSummary();
            console.log("Document summary data received:", data);
            setSummary(data);
        } catch (error) {
            console.error('Error fetching document summary:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally{
            setIsLoading(false);
        }
    }, [
        fetchDocumentSummary
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log("DocumentSummary component loaded, skipLoading:", skipLoading);
        fetchSummary();
    }, [
        fetchSummary
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md p-4 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-semibold mb-4 text-gray-800 border-b pb-2",
                children: "Document Summary"
            }, void 0, false, {
                fileName: "[project]/src/components/DocumentSummary.tsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full bg-gray-50 rounded p-6 overflow-auto",
                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex items-center justify-center py-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "Loading document summary..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/DocumentSummary.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/DocumentSummary.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ChartError$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    message: error,
                    onRetry: fetchSummary
                }, void 0, false, {
                    fileName: "[project]/src/components/DocumentSummary.tsx",
                    lineNumber: 59,
                    columnNumber: 11
                }, this) : summary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "prose max-w-none",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-700 leading-relaxed mb-6",
                            children: [
                                "This corpus has ",
                                summary.totalDocuments.toLocaleString(),
                                " document",
                                summary.totalDocuments !== 1 ? 's' : '',
                                " with ",
                                summary.totalWords.toLocaleString(),
                                " total words and ",
                                summary.uniqueWords.toLocaleString(),
                                " unique word forms. Created ",
                                summary.created,
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DocumentSummary.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium mb-1",
                                            children: "Vocabulary Density:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 72,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xl font-bold text-indigo-600",
                                            children: summary.vocabularyDensity.toFixed(3)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 73,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DocumentSummary.tsx",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium mb-1",
                                            children: "Readability Index:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 77,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xl font-bold text-blue-600",
                                            children: summary.readabilityIndex.toFixed(3)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 78,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DocumentSummary.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium mb-1",
                                            children: "Average Words Per Sentence:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 82,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xl font-bold text-green-600",
                                            children: summary.wordsPerSentence.toFixed(1)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DocumentSummary.tsx",
                                    lineNumber: 81,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-medium mb-2",
                                            children: "Most frequent words in the corpus:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 87,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "list-disc list-inside space-y-1 pl-4",
                                            children: summary.frequentWords.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "text-gray-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium text-yellow-600",
                                                            children: item.word
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                                            lineNumber: 91,
                                                            columnNumber: 23
                                                        }, this),
                                                        " (",
                                                        item.count.toLocaleString(),
                                                        ")"
                                                    ]
                                                }, index, true, {
                                                    fileName: "[project]/src/components/DocumentSummary.tsx",
                                                    lineNumber: 90,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/DocumentSummary.tsx",
                                            lineNumber: 88,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/DocumentSummary.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/DocumentSummary.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/DocumentSummary.tsx",
                    lineNumber: 64,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-red-500",
                    children: "No document summary available."
                }, void 0, false, {
                    fileName: "[project]/src/components/DocumentSummary.tsx",
                    lineNumber: 99,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/DocumentSummary.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DocumentSummary.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = DocumentSummary;
}}),
"[project]/src/components/SkeletonLoader.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
const SkeletonLoader = ({ height = 'h-64', title = true, description = true, type = 'chart' })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md p-4 w-full",
        children: [
            title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/src/components/SkeletonLoader.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this),
            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/src/components/SkeletonLoader.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${height} bg-gray-100 rounded flex items-center justify-center`,
                children: [
                    (type === 'chart' || type === 'line') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 text-gray-300 mb-2",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                                    lineNumber: 33,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 35,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-gray-500",
                                children: "Loading chart data..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SkeletonLoader.tsx",
                        lineNumber: 31,
                        columnNumber: 11
                    }, this),
                    type === 'bar' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 text-gray-300 mb-2",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                                    lineNumber: 43,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-gray-500",
                                children: "Loading chart data..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 46,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SkeletonLoader.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    type === 'area' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 text-gray-300 mb-2",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                                    lineNumber: 53,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 52,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-gray-500",
                                children: "Loading chart data..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 56,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SkeletonLoader.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this),
                    type === 'wordcloud' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 text-gray-300 mb-2",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                                    lineNumber: 63,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-gray-500",
                                children: "Generating word cloud..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SkeletonLoader.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this),
                    type === 'document' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-10 h-10 text-gray-300 mb-2",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                xmlns: "http://www.w3.org/2000/svg",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SkeletonLoader.tsx",
                                    lineNumber: 73,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-gray-500",
                                children: "Processing document data..."
                            }, void 0, false, {
                                fileName: "[project]/src/components/SkeletonLoader.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SkeletonLoader.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SkeletonLoader.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SkeletonLoader.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = SkeletonLoader;
}}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SentimentChart_v2$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SentimentChart_v2.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DataDistribution$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DataDistribution.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/WordCloud.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DocumentSummary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DocumentSummary.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SkeletonLoader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/dataStore.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
function Home() {
    // Get state and actions from the zustand store
    const { dataStatus, processingStatus, statusMessage, checkDataStatus, processData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$dataStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDataStore"])();
    // Log data status when it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log("Data status updated:", dataStatus);
    }, [
        dataStatus
    ]);
    // Check data status on load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchData = async ()=>{
            try {
                console.log("Checking initial data status");
                // Check initial data status
                const statusData = await checkDataStatus();
                console.log("Initial status data:", statusData);
                // If data needs processing, start it automatically
                if (statusData.status === 'not_ready') {
                    console.log("Data not ready, starting processing");
                    processData();
                }
            } catch (error) {
                console.error('Error in initial data fetch:', error);
            }
        };
        fetchData();
    }, [
        checkDataStatus,
        processData
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen p-6 bg-gray-50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "text-center mb-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold mb-2 text-gray-800",
                        children: "Text Analysis Visualization Hub"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Interactive analysis developed by ClioX"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    processingStatus === 'processing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 bg-blue-100 text-blue-800 p-3 rounded-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: statusMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 w-full h-2 bg-blue-200 rounded-full overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-full bg-blue-500 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 58,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 56,
                        columnNumber: 11
                    }, this),
                    processingStatus === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 bg-red-100 text-red-800 p-3 rounded-md",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: statusMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>window.location.reload(),
                                className: "mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors",
                                children: "Retry"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-6xl mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",
                        children: [
                            dataStatus.emailDistribution ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DataDistribution$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                title: "Data Distribution on Email Counts",
                                description: "Shows the distribution of email counts over time",
                                type: "email",
                                skipLoading: true,
                                disableHover: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                type: "chart",
                                height: "h-64"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this),
                            dataStatus.dateDistribution ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DataDistribution$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                title: "Data Distribution on Date",
                                description: "Shows the distribution of emails by date",
                                type: "date",
                                skipLoading: true,
                                disableHover: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                type: "chart",
                                height: "h-64"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: dataStatus.sentimentChartV2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SentimentChart_v2$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            skipLoading: true
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            type: "chart",
                            height: "h-64"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: dataStatus.wordCloud ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$WordCloud$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 122,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            type: "wordcloud",
                            height: "h-96"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 124,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: dataStatus.documentSummary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DocumentSummary$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            skipLoading: false
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 130,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SkeletonLoader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            type: "document",
                            height: "h-64"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 132,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg shadow-md p-4 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold mb-4 text-gray-800 border-b pb-2",
                                children: "Further more ..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600",
                                children: "Additional visualizations and analysis tools will be added here."
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "mt-12 text-center text-gray-500 text-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: [
                        "© ",
                        new Date().getFullYear(),
                        " ClioX"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 143,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_83e2fd45._.js.map