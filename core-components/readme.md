# ClioX Installation Guide

## Backend Setup

1. Create the conda environment with all dependencies:
```
conda env create -f environment.yml
```

2. Activate the environment:
```
conda activate clioX
```

3. Run the backend:
```
python app.py
```

## Frontend Setup

1. Install dependencies:
```
npm install --legacy-peer-deps
```

2. Start the development server:
```
npm run dev
```

## Project Architecture
- **templates**: HTML files
- **static**: CSS, JS files, and data/images (subfolders permitted)
