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


Getting Started

Setting Up the Backend
Navigate to the backend directory:
cd backend
`cd backend`

Create a virtual environment:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
`pip install -r requirements.txt`

Download required NLTK data:
`python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"`

Download spaCy model:
`python -m spacy download en_core_web_sm`

Start the Flask server:
`python app.py`

The API server will be available at http://localhost:5001

Setting Up the Frontend
Navigate to the frontend directory:
`cd frontend`

Install dependencies:
`npm install`

Start the development server:
`npm start`

The frontend will be available at http://localhost:3000

Setting Up Voyant Server
Download Voyant Server from https://voyant-tools.org/
Start the server on port 8888

API Endpoints
| Endpoint | Method	| Description|
| :-----| :---- | :---- |
|/api/analyze	                | POST	| Analyze email data from a CSV file|
|/api/data/sentiment	        | GET	| Get sentiment analysis data|
|/api/images/date_distribution	| GET	| Get date distribution image|
| /api/images/email_per_day	    | GET	| Get email count distribution image|



Data Flow
1. User uploads data or selects sample data
2. Frontend sends analysis request to backend
3. Backend performs:
    * Text extraction and cleaning
    * PII detection and masking
    * Sentiment analysis
    * Data transformation
4. Results stored in `/static/data` and `outputs`
5. Frontend fetches visualization data
6. Interactive visualizations render in browser

Customization
Styling
All styles are organized in the `frontend/src/styles` directory:

* `App.css`: Main application styles
* `Dashboard.css`: Dashboard layout styles
* `SentimentAnalysis.css`: Sentiment visualization styles
* `HorizonChart.css`: Horizon chart styles

Adding New Visualizations
Create a new component in `frontend/src/components`
Add corresponding styles in `frontend/src/styles`
Integrate the component in the Dashboard

Backend Extensions
To add new analysis capabilities:

1. Add new utility functions in `backend/utils`
2. Create new API endpoints in `app.py`
3. Update frontend to use the new endpoints
