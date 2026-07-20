<div align="center">
  <img src="frontend/public/logo.png" alt="Stats-Tube Logo" style="width: 100px; height: auto;">
</div>

<div align="center">
  <h1>STATS-TUBE</h1>
</div>

Stats-Tube is a high-performance web application engineered to give content creators and enthusiasts deep, real-time analytics into YouTube channel metrics, subscriber milestone projections, and engagement velocities. Built on top of the YouTube API v3, the platform transforms raw programmatic statistics into a clean, highly responsive dashboard tailored to optimize screen real estate across desktop and mobile devices while enforcing rigorous anti-abuse guardrails.

<div align="center">
  <img src="https://img.shields.io/badge/Key%20Features-purple?style=for-the-badge" alt="Key Features" height="34">
</div>

*   **Real-time Insights via YouTube Proxy**: Seamlessly communicates with the YouTube API v3 to fetch unified channel configurations, playlist inventories, and direct video view/like distributions.
*   **Dynamic Milestone Mapping**: Evaluates active subscriber numbers against intelligent increments to calculate, track, and render progress bars toward the creator's next operational milestone.
*   **Adaptive Responsive Layouts**: Fully customized media-query structures that handle atomic interface variations—scaling sticky navigation row items and shifting status identity badges precisely between mobile viewports and monitor setups.
*   **Anti-Scraping Defenses**: Built-in serverless-safe sliding-window rate limiting to ensure underlying API tokens remain insulated against automated abuse, scanning, or scraping routines.
*   **Instant Real-time Feedback Loops**: An integrated bug reporting module executing background asynchronous requests to deliver form entries straight to real developer communication channels instantaneously.

<div align="center">
  <img src="https://img.shields.io/badge/Tech%20Stack-purple?style=for-the-badge" alt="Tech Stack" height="34">
</div>

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Rate Limiting / Memory Cache**: Upstash Redis & `@upstash/ratelimit`
-   **Data Provider**: YouTube Data API v3
-   **Real-time Delivery**: Web3Forms API
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **Deployment**: Vercel

<div align="center">
  <img src="https://img.shields.io/badge/Project Structure%20-purple?style=for-the-badge" alt="Project Structure" height="34">
</div>

The project follows a modular, serverless-optimized directory hierarchy.

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── youtube/
│   │   │       └── route.ts
│   │   ├── dashboard.tsx
│   │   ├── footer.tsx
│   │   ├── GlobalLoader.css
│   │   ├── GlobalLoader.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Compare.tsx
│   │   ├── Galaxy.css
│   │   ├── Galaxy.tsx
│   │   ├── TrendsCharts.tsx
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── ChannelHeader.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── input.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── skeleton.tsx
│   │   └── VideoGrid.tsx
│   ├── hooks/
│   │   └── useChannelData.ts
│   └── lib/
│       ├── analytics.ts
│       ├── ratelimit.ts
│       └── utils.ts
```


### Core Logic Highlights
-   **`src/app/api/youtube/route.ts`**: The central entry point for external telemetry requests. This handler reads incoming requests, extracts structural IP values, assesses the sliding-window limits, and proxy-fetches metrics directly from Google API resource trees safely.
-   **`src/lib/ratelimit.ts`**: Handles context setup across edge boundaries. It leverages isolated bucket prefixes inside Upstash Redis memory states to avoid collision layers while tracking multi-project metrics.
-   **`src/components/ui/ChannelHeader.tsx`**: Manages interactive dashboard states. It applies smooth visual adjustments like dynamic item wrapping, fluid `scrollIntoView` anchoring for section changes, and specific mobile element adjustments.
-   **`src/app/page.tsx`**: Powers the main application search mechanics and sets up the asynchronous fetch protocol pointing to the Web3Forms secure email delivery pipeline.

<div align="center">
  <img src="https://img.shields.io/badge/Setup &%20Installation-purple?style=for-the-badge" alt="Setup & Installation" height="34">
</div>



To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/utshochowdhury/stats-tube.git
    cd stats-tube
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the following context variables:

    ```env
    # Google API Console Access Key
    YOUTUBE_API_KEY="your_official_youtube_api_key"

    # Upstash Redis Configuration (Serverless Rate Limiting)
    UPSTASH_REDIS_REST_URL="https://your-database-cluster-endpoint.upstash.io"
    UPSTASH_REDIS_REST_TOKEN="your_actual_upstash_rest_token_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will launch and be available inside your local browser at `http://localhost:3000`.




