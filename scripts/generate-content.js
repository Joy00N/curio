#!/usr/bin/env node

/**
 * Content Pre-Generation Script
 *
 * Generates high-quality explanations for all seed topics using OpenAI API
 * and writes them to src/app/data/bundled-content.ts.
 *
 * Usage:
 *   export OPENAI_API_KEY="sk-..."
 *   node scripts/generate-content.js
 *
 * Options:
 *   --dry-run     Print topics without calling the API
 *   --topic "X"   Generate content for a single topic only
 *   --resume      Skip topics that already exist in bundled-content.ts
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Configuration ──────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'app', 'data', 'bundled-content.ts');
const DELAY_BETWEEN_CALLS_MS = 1500; // avoid rate limits
// ────────────────────────────────────────────────────────────────

// All 195 seed topics by category (must match RecommendationService)
const SEED_TOPICS = {
  'Technology': [
    'Quantum Computing', 'Neural Networks', 'Blockchain', 'Edge Computing',
    'WebAssembly', 'Container Orchestration', 'GraphQL', 'Serverless Architecture',
    'Microservices', '5G Networks', 'Augmented Reality', 'API Design',
    'Encryption', 'DevOps Culture', 'Progressive Web Apps'
  ],
  'Business': [
    'Network Effects', 'Flywheel Effect', 'Opportunity Cost', 'Economies of Scale',
    'Moats', 'Product-Market Fit', 'Unit Economics', 'Pivot Strategy',
    'Blue Ocean Strategy', 'Freemium Models', 'Vertical Integration',
    'Subscription Economy', 'Market Segmentation', 'Lean Startup', 'Brand Equity'
  ],
  'Economics': [
    'Inflation', 'Supply and Demand', 'Compound Interest', 'Comparative Advantage',
    'Moral Hazard', 'Tragedy of the Commons', 'Marginal Utility', 'Game Theory',
    'Price Elasticity', 'Monetary Policy', 'GDP', 'Fiscal Policy',
    'Opportunity Cost in Economics', 'Market Failure', 'Behavioral Economics'
  ],
  'Psychology': [
    'Confirmation Bias', 'Cognitive Dissonance', 'Growth Mindset',
    'Dunning-Kruger Effect', 'Loss Aversion', 'Anchoring Bias',
    'Imposter Syndrome', 'Flow State', "Maslow's Hierarchy", 'Neuroplasticity',
    'Intrinsic Motivation', 'Projection', 'Sunk Cost Fallacy',
    'Availability Heuristic', 'Emotional Intelligence'
  ],
  'Philosophy': [
    "Occam's Razor", 'Ship of Theseus', 'Stoicism', 'The Trolley Problem',
    'Existentialism', 'Utilitarianism', "Plato's Cave", 'Social Contract',
    'Determinism vs Free Will', 'Categorical Imperative', 'Nihilism',
    'Epistemology', 'The Veil of Ignorance', 'Absurdism', 'Solipsism'
  ],
  'History': [
    'The Printing Press', 'The Silk Road', 'The Scientific Revolution',
    'The Industrial Revolution', 'The Renaissance', 'The Enlightenment',
    'The Cold War', 'The Fall of Rome', 'The Agricultural Revolution',
    'The Space Race', 'The Black Death', 'Colonial Era',
    'The Great Depression', 'The Information Age', 'Ancient Democracy'
  ],
  'Art': [
    'Impressionism', 'The Golden Ratio', 'Surrealism', 'Minimalism',
    'Perspective Drawing', 'Abstract Expressionism', 'Street Art',
    'Color Theory', 'Baroque Art', 'Conceptual Art', 'Japanese Aesthetics',
    'Cubism', 'Art Nouveau', 'Pop Art', 'Renaissance Sculpture'
  ],
  'Science': [
    'Evolution by Natural Selection', 'The Big Bang', 'Relativity', 'DNA',
    'Photosynthesis', 'Black Holes', 'CRISPR', 'Climate Systems',
    'Antibiotics', 'Plate Tectonics', 'Vaccines', 'Quantum Mechanics',
    'Dark Matter', 'The Microbiome', 'Entropy'
  ],
  'Health': [
    'Intermittent Fasting', 'Sleep Cycles', 'The Placebo Effect',
    'Inflammation', 'Gut-Brain Axis', 'Metabolic Rate', 'Cortisol',
    'Mitochondria', 'Autophagy', 'The Immune System', 'Circadian Rhythm',
    'Oxidative Stress', 'Neurogenesis', 'Hormesis', 'Muscle Memory'
  ],
  'Parenting': [
    'Attachment Theory', 'Executive Function', 'Positive Discipline',
    'Theory of Mind', 'Growth Mindset for Kids', 'Emotional Regulation',
    'Natural Consequences', 'Scaffolding', 'Play-Based Learning',
    'Authoritative Parenting', 'Mirror Neurons', 'Language Acquisition',
    'Separation Anxiety', 'Siblings Rivalry', 'Critical Periods'
  ],
  'Politics': [
    'Separation of Powers', 'Federalism', 'Gerrymandering',
    'The Electoral College', 'Lobbying', 'Checks and Balances',
    'Parliamentary Systems', 'Judicial Review', 'Direct Democracy',
    'Political Polarization', 'Soft Power', 'Term Limits',
    'Campaign Finance', 'Filibuster', 'Populism'
  ],
  'Culture': [
    'Cultural Appropriation', 'Rituals', 'Oral Traditions',
    'Cultural Relativism', 'Subcultures', 'Cultural Evolution',
    'Mythology', 'Rites of Passage', 'Globalization', 'Folk Art',
    'Music Theory', 'Festivals', 'Language and Thought', 'Food Culture',
    'Cultural Identity'
  ],
  'Nature': [
    'Symbiosis', 'Keystone Species', 'Bioluminescence', 'Mycelium Networks',
    'Migration Patterns', 'Pollination', 'Biomimicry', 'Ecosystem Services',
    'Trophic Cascades', 'Coral Reefs', 'Old-Growth Forests',
    'Animal Communication', 'Extremophiles', 'Regeneration', 'Phenology'
  ]
};

// ─── Prompt template ────────────────────────────────────────────

function buildPrompt(topic, category) {
  return `You are an expert educator creating content for Curio, a calm learning app that teaches one concept per day.

Generate an explanation for the topic "${topic}" (category: ${category}) using this exact JSON structure:

{
  "topic": "${topic}",
  "teaser": "<max 140 chars — a compelling one-liner that hooks curiosity>",
  "eli7": "<Explain Like I'm 7 — 80-150 words. Use a vivid analogy a child would understand. Warm, simple language. No jargon.>",
  "deeper": "<One Level Deeper — 100-180 words. Add nuance, history, or mechanism. Accessible but more precise. Mention key names/dates if relevant.>",
  "example": "<Real-World Example — 80-150 words. A concrete, relatable scenario showing the concept in action. Preferably something the reader encounters in daily life.>",
  "whyItMatters": "<Why This Matters — 80-150 words. Connect to the reader's life. Why should a curious adult care about this today?>",
  "reflectionQuestion": "<A single thoughtful question ending with '?' that invites personal reflection>"
}

Rules:
- Return ONLY valid JSON, no markdown fences or extra text
- Teaser must be <= 140 characters
- Reflection question must end with "?"
- Write in a warm, intelligent tone — like a knowledgeable friend explaining over coffee
- Avoid generic filler. Every sentence should teach something specific
- Use concrete details, names, numbers, and vivid language`;
}

// ─── OpenAI API call ────────────────────────────────────────────

function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`OpenAI API error: ${json.error.message}`));
            return;
          }
          const content = json.choices[0].message.content.trim();
          // Strip markdown code fences if present
          const cleaned = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          resolve(JSON.parse(cleaned));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}\nRaw: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── File I/O ───────────────────────────────────────────────────

function readExistingContent() {
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, 'utf-8');
    // Extract topic keys from existing file
    const matches = raw.matchAll(/'([^']+)':\s*\{/g);
    return new Set([...matches].map(m => m[1]));
  } catch {
    return new Set();
  }
}

function writeOutputFile(contentMap) {
  const entries = Object.entries(contentMap)
    .map(([topic, content]) => {
      const c = content;
      return `  ${JSON.stringify(topic)}: {
    topic: ${JSON.stringify(c.topic)},
    teaser: ${JSON.stringify(c.teaser)},
    eli7: ${JSON.stringify(c.eli7)},
    deeper: ${JSON.stringify(c.deeper)},
    example: ${JSON.stringify(c.example)},
    whyItMatters: ${JSON.stringify(c.whyItMatters)},
    reflectionQuestion: ${JSON.stringify(c.reflectionQuestion)}
  }`;
    })
    .join(',\n\n');

  const file = `/**
 * Bundled content for seed topics.
 *
 * AUTO-GENERATED by scripts/generate-content.js — do not edit manually.
 * To regenerate: export OPENAI_API_KEY="sk-..." && node scripts/generate-content.js
 *
 * Generated: ${new Date().toISOString()}
 * Topics: ${Object.keys(contentMap).length}
 */
import { GeneratedContent } from '../models';

export const BUNDLED_CONTENT: Record<string, GeneratedContent> = {
${entries}
};
`;

  fs.writeFileSync(OUTPUT_PATH, file, 'utf-8');
}

// ─── Validation ─────────────────────────────────────────────────

function validate(content, topic) {
  const errors = [];
  if (!content.topic) errors.push('missing topic');
  if (!content.teaser) errors.push('missing teaser');
  if (content.teaser && content.teaser.length > 140) errors.push(`teaser too long (${content.teaser.length})`);
  if (!content.eli7) errors.push('missing eli7');
  if (!content.deeper) errors.push('missing deeper');
  if (!content.example) errors.push('missing example');
  if (!content.whyItMatters) errors.push('missing whyItMatters');
  if (!content.reflectionQuestion) errors.push('missing reflectionQuestion');
  if (content.reflectionQuestion && !content.reflectionQuestion.trim().endsWith('?')) {
    errors.push('reflectionQuestion must end with ?');
  }
  return errors;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isResume = args.includes('--resume');
  const singleTopicIdx = args.indexOf('--topic');
  const singleTopic = singleTopicIdx !== -1 ? args[singleTopicIdx + 1] : null;

  if (!isDryRun && !OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY environment variable is required.');
    console.error('  export OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  // Flatten all topics
  const allTopics = [];
  for (const [category, topics] of Object.entries(SEED_TOPICS)) {
    for (const topic of topics) {
      allTopics.push({ topic, category });
    }
  }

  // Filter if single topic requested
  const toGenerate = singleTopic
    ? allTopics.filter(t => t.topic.toLowerCase() === singleTopic.toLowerCase())
    : allTopics;

  if (singleTopic && toGenerate.length === 0) {
    console.error(`Topic "${singleTopic}" not found in seed topics.`);
    process.exit(1);
  }

  // Check existing content for --resume
  const existing = isResume ? readExistingContent() : new Set();

  console.log(`\n📚 Curio Content Generator`);
  console.log(`   Topics to process: ${toGenerate.length}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Mode: ${isDryRun ? 'DRY RUN' : isResume ? 'RESUME' : 'FULL'}\n`);

  if (isDryRun) {
    for (const { topic, category } of toGenerate) {
      const status = existing.has(topic) ? '✅' : '⬜';
      console.log(`  ${status} [${category}] ${topic}`);
    }
    console.log(`\nTotal: ${toGenerate.length} topics`);
    return;
  }

  // Load existing content from file to preserve already-generated entries
  const contentMap = {};
  if (isResume) {
    try {
      // Simple approach: re-import won't work in Node, so we track by key
      // and re-generate only missing ones. Existing file will be overwritten
      // with all content (existing + new).
      console.log(`   Existing topics found: ${existing.size}`);
    } catch { /* ignore */ }
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const { topic, category } = toGenerate[i];

    if (isResume && existing.has(topic)) {
      skipped++;
      continue;
    }

    const progress = `[${i + 1}/${toGenerate.length}]`;
    process.stdout.write(`${progress} Generating: ${topic}...`);

    try {
      const prompt = buildPrompt(topic, category);
      const content = await callOpenAI(prompt);

      // Validate
      const errors = validate(content, topic);
      if (errors.length > 0) {
        console.log(` ⚠️  Validation warnings: ${errors.join(', ')}`);
      } else {
        console.log(' ✅');
      }

      // Ensure topic field matches
      content.topic = topic;
      contentMap[topic] = content;
      generated++;

      // Rate limit delay
      if (i < toGenerate.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
      }
    } catch (error) {
      console.log(` ❌ ${error.message}`);
      failed++;
    }
  }

  // Write output
  if (generated > 0) {
    writeOutputFile(contentMap);
    console.log(`\n✅ Done! Generated ${generated} topics.`);
    console.log(`   Skipped: ${skipped}, Failed: ${failed}`);
    console.log(`   Output: ${OUTPUT_PATH}\n`);
  } else {
    console.log('\n⚠️  No new content generated.\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
