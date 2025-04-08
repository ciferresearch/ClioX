# Text Analysis Visualization Hub

A Next.js application for visualizing text analysis results, including sentiment analysis, word clouds, and document summaries.

## Features

- **Sentiment Analysis**: Visualize sentiment over time using interactive D3 charts
- **Data Distribution**: View email distribution by count and date
- **Word Cloud**: Explore most frequent terms in the analyzed text
- **Document Summary**: Get insights into document content

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/components/` - React components for visualizations
- `public/data/` - JSON data files for visualizations
- `src/app/` - Next.js application pages

## Dependencies

- Next.js
- React
- D3.js
- Tailwind CSS

## Background

This project migrates visualization components from a Flask-based implementation to a modern Next.js application. The original implementation used Flask templates and D3.js for visualizations.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
