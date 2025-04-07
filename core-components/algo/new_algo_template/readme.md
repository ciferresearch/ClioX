Text Analysis Visualization Hub
A modern, interactive tool for visualizing text analysis results. This project features sentiment analysis, word clouds, and time-series visualizations using a decoupled architecture with a Flask backend API and React frontend.

Architecture
This project follows a modern frontend-backend separation architecture:

PETS-marketplace-adv/core-components/algo
├── backend/                # Flask API server
│   ├── app.py              # Main server application
│   ├── utils/              # Analysis utilities
│   ├── static/             # Generated data files
│   └── outputs/            # Analysis outputs
└── frontend/               # React application
    ├── public/             # Static assets
    ├── src/                # React source code
    │   ├── components/     # React components
    │   ├── styles/         # CSS styles
    │   └── utils/          # Frontend utilities
    └── package.json        # NPM configuration


Backend (Flask API)
The backend provides RESTful API endpoints for:

Email text analysis
Sentiment classification
PII (Personal Identifiable Information) detection and masking
Data transformation and visualization generation
Frontend (React)
The frontend provides a responsive user interface for:

Running analysis operations
Visualizing sentiment trends over time
Displaying word clouds
Providing interactive analysis tools
Technology Stack
Backend
Python 3.8+
Flask: Web framework
NLTK & spaCy: Natural language processing
Transformers: Machine learning for sentiment analysis
Presidio: PII detection and anonymization
Pandas: Data processing
Matplotlib & Seaborn: Data visualization
Frontend
React 18: UI library
D3.js: Interactive data visualizations
React Router: Navigation
CSS3: Styling
Fetch API: Data fetching