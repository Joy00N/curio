# Curio - Learn Intentionally

A commute-first mobile app that helps curious learners understand one concept per day using a calm, structured explanation format.

## Features

- **Daily Topic Recommendations** - One carefully selected topic per day based on your interests
- **4-Block Explanation Format** - Every concept explained through:
  1. Explain Like I'm 7
  2. One Level Deeper
  3. Real-World Example
  4. Why This Matters
- **Reflection Questions** - Thoughtful prompts to deepen understanding
- **Audio Playback** - Listen to explanations with text-to-speech (variable speed)
- **Custom Topics** - Enter any concept or question to learn about
- **Offline History** - All learned topics accessible without internet
- **Interest-Based Recommendations** - Smart topic selection across 13 categories

## Tech Stack

- **Frontend**: Ionic Framework + Angular 17
- **Mobile Runtime**: Capacitor 5
- **Language**: TypeScript
- **Storage**: Capacitor Preferences
- **TTS**: Capacitor Community Text-to-Speech plugin
- **Platform**: iOS (with Android support possible)

## Project Structure

```
curio/
├── src/
│   ├── app/
│   │   ├── guards/           # Route guards (onboarding)
│   │   ├── models/           # TypeScript interfaces
│   │   ├── pages/            # Page components
│   │   │   ├── onboarding/
│   │   │   ├── tabs/
│   │   │   ├── home/
│   │   │   ├── history/
│   │   │   ├── settings/
│   │   │   └── explanation/
│   │   ├── services/         # Business logic services
│   │   │   ├── storage.service.ts
│   │   │   ├── recommendation.service.ts
│   │   │   ├── content-generation.service.ts
│   │   │   └── tts.service.ts
│   │   └── app.module.ts
│   ├── environments/         # Environment configs
│   ├── theme/               # Global styles
│   └── index.html
├── capacitor.config.ts
├── ionic.config.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Ionic CLI: `npm install -g @ionic/cli`
- For iOS builds:
  - macOS with Xcode 14+
  - CocoaPods: `sudo gem install cocoapods`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in browser** (development):
   ```bash
   ionic serve
   ```
   or
   ```bash
   npm start
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

### Building for iOS

1. **Build the web assets**:
   ```bash
   ionic build
   ```

2. **Add iOS platform** (first time only):
   ```bash
   npx cap add ios
   ```

3. **Sync changes to iOS**:
   ```bash
   npx cap sync ios
   ```

4. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

5. **In Xcode**:
   - Select your development team (Signing & Capabilities)
   - Choose a device or simulator
   - Press Run (⌘R)

### Subsequent iOS Builds

After making changes:
```bash
ionic build
npx cap sync ios
npx cap open ios
```

## Configuration

### API Endpoint

The app is configured to use mock content generation by default. To connect to a real backend API:

1. Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiBaseUrl: 'https://your-api-url.com',
     useMockGeneration: false,
     appVersion: '1.0.0'
   };
   ```

2. For production (`src/environments/environment.prod.ts`):
   ```typescript
   export const environment = {
     production: true,
     apiBaseUrl: 'https://api.curio.app',
     useMockGeneration: false,
     appVersion: '1.0.0'
   };
   ```

### API Contract

Expected POST endpoint: `{apiBaseUrl}/generate`

Request:
```json
{
  "topic": "string",
  "depth": "light|normal",
  "userInterests": ["string"],
  "context": {
    "date": "YYYY-MM-DD",
    "locale": "en-US"
  }
}
```

Response:
```json
{
  "topic": "string",
  "teaser": "string (<= 140 chars)",
  "eli7": "string",
  "deeper": "string",
  "example": "string",
  "whyItMatters": "string",
  "reflectionQuestion": "string (ends with '?')"
}
```

## Features & Screens

### Onboarding
- Interest selection (13 categories: Technology, Business, Economics, Psychology, Philosophy, History, Art, Science, Health, Parenting, Politics, Culture, Nature)
- Minimum 3 interests required

### Home
- Today's Topic card with topic, teaser, and category
- "Teach me this" - generates/opens explanation
- "Pick another" - shows 2 alternative topics
- Manual topic entry with custom text input

### Explanation
- 4-section structured format
- Audio playback with play/pause/stop controls
- Speed adjustment (0.8x, 1.0x, 1.2x)
- Reflection question
- Favorite toggle

### History
- Search bar for filtering topics
- Chronological list of all learned topics
- Offline access to all content
- Displays category, date, and teaser

### Settings
- Edit interests
- Explanation depth preference (Light/Normal)
- Audio toggle
- Clear all data
- About information

## Recommendation Algorithm

- **70%** topics from user-selected interests
- **20%** topics from adjacent categories (via adjacency map)
- **10%** wildcard topics from any category
- Avoids repeating topics within last 14 days
- Local seed lists with 10-30 topics per category

## Development Notes

### Mock Content Generation
The app includes a deterministic mock generator that creates consistent placeholder content for development and testing without requiring a backend API.

### Storage Strategy
- User preferences: Capacitor Preferences
- Today's Topic: Persisted by date key (YYYY-MM-DD)
- Topic entries: Full history with offline access
- Last 14 topics: Tracked for deduplication

### Testing
Run unit tests:
```bash
npm test
```

Key test coverage:
- Recommendation service (category selection, topic deduplication)
- Content generation validation (required fields, character limits)
- Mock content generation (deterministic output)

## Design Principles

1. **Intentional Learning** - One primary topic per day, no infinite feeds
2. **Calm UX** - Minimal interface, purposeful interactions
3. **Structured Format** - Every explanation follows the same 4-block pattern
4. **Offline First** - All history accessible without connectivity
5. **Commute-Optimized** - Audio support for hands-free learning

## License

Proprietary

## Support

For questions or issues, contact the development team.
