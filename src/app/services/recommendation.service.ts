import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface TopicSeed {
  topic: string;
  teaser: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  // Category adjacency map (70% user interests, 20% adjacent, 10% wildcard)
  private readonly adjacencyMap: Record<string, string[]> = {
    'Technology': ['Science', 'Business'],
    'Business': ['Economics', 'Technology'],
    'Economics': ['Business', 'Politics'],
    'Psychology': ['Health', 'Philosophy', 'Parenting'],
    'Philosophy': ['Psychology', 'History'],
    'History': ['Philosophy', 'Culture', 'Art'],
    'Art': ['Culture', 'History'],
    'Science': ['Technology', 'Nature', 'Health'],
    'Health': ['Science', 'Psychology', 'Parenting'],
    'Parenting': ['Psychology', 'Health'],
    'Politics': ['Economics', 'History'],
    'Culture': ['Art', 'History', 'Philosophy'],
    'Nature': ['Science', 'Health']
  };

  // Seed topics by category (10-30 topics each)
  private readonly seedTopics: Record<string, TopicSeed[]> = {
    'Technology': [
      { topic: 'Quantum Computing', teaser: 'How computers could use quantum mechanics to solve impossible problems' },
      { topic: 'Neural Networks', teaser: 'How machines learn to recognize patterns like the human brain' },
      { topic: 'Blockchain', teaser: 'A distributed ledger that makes trust between strangers possible' },
      { topic: 'Edge Computing', teaser: 'Why processing data closer to its source changes everything' },
      { topic: 'WebAssembly', teaser: 'How native-speed code runs safely in your browser' },
      { topic: 'Container Orchestration', teaser: 'Managing thousands of tiny applications as one system' },
      { topic: 'GraphQL', teaser: 'A smarter way to ask for exactly the data you need' },
      { topic: 'Serverless Architecture', teaser: 'Running code without managing servers' },
      { topic: 'Microservices', teaser: 'Breaking large applications into independent pieces' },
      { topic: '5G Networks', teaser: 'Why the fifth generation of wireless will enable new possibilities' },
      { topic: 'Augmented Reality', teaser: 'Overlaying digital information onto the physical world' },
      { topic: 'API Design', teaser: 'Creating interfaces that make software talk to software' },
      { topic: 'Encryption', teaser: 'How mathematics keeps your secrets safe' },
      { topic: 'DevOps Culture', teaser: 'Why breaking down silos between development and operations matters' },
      { topic: 'Progressive Web Apps', teaser: 'Websites that feel like native mobile apps' }
    ],
    'Business': [
      { topic: 'Network Effects', teaser: 'Why some products become more valuable as more people use them' },
      { topic: 'Flywheel Effect', teaser: 'How small wins compound into unstoppable momentum' },
      { topic: 'Opportunity Cost', teaser: 'The hidden price of every choice you make' },
      { topic: 'Economies of Scale', teaser: 'Why bigger companies can produce things cheaper' },
      { topic: 'Moats', teaser: 'What protects successful businesses from competition' },
      { topic: 'Product-Market Fit', teaser: 'The moment when what you build matches what people want' },
      { topic: 'Unit Economics', teaser: 'Understanding profitability one customer at a time' },
      { topic: 'Pivot Strategy', teaser: 'When changing direction is the smartest move' },
      { topic: 'Blue Ocean Strategy', teaser: 'Finding uncontested market space instead of fighting competitors' },
      { topic: 'Freemium Models', teaser: 'How giving away products for free can make money' },
      { topic: 'Vertical Integration', teaser: 'Why some companies control their entire supply chain' },
      { topic: 'Subscription Economy', teaser: 'The shift from ownership to ongoing relationships' },
      { topic: 'Market Segmentation', teaser: 'Dividing customers into meaningful groups' },
      { topic: 'Lean Startup', teaser: 'Building businesses through rapid experimentation' },
      { topic: 'Brand Equity', teaser: 'Why some names are worth billions' }
    ],
    'Economics': [
      { topic: 'Inflation', teaser: 'Why your money buys less over time' },
      { topic: 'Supply and Demand', teaser: 'The invisible forces that set prices' },
      { topic: 'Compound Interest', teaser: 'How small amounts grow into fortunes over time' },
      { topic: 'Comparative Advantage', teaser: 'Why countries trade even when one is better at everything' },
      { topic: 'Moral Hazard', teaser: 'Why insurance can make people take bigger risks' },
      { topic: 'Tragedy of the Commons', teaser: 'When individual incentives destroy shared resources' },
      { topic: 'Marginal Utility', teaser: 'Why the first slice of pizza tastes better than the fifth' },
      { topic: 'Game Theory', teaser: 'Mathematical strategies for competitive situations' },
      { topic: 'Price Elasticity', teaser: 'How sensitive buyers are to price changes' },
      { topic: 'Monetary Policy', teaser: 'How central banks try to control the economy' },
      { topic: 'GDP', teaser: 'Measuring the total value of everything a country produces' },
      { topic: 'Fiscal Policy', teaser: 'How governments use spending and taxes to influence the economy' },
      { topic: 'Opportunity Cost in Economics', teaser: 'What society gives up when making resource choices' },
      { topic: 'Market Failure', teaser: 'When free markets don\'t produce the best outcomes' },
      { topic: 'Behavioral Economics', teaser: 'Why people make irrational economic decisions' }
    ],
    'Psychology': [
      { topic: 'Confirmation Bias', teaser: 'Why we see what we expect to see' },
      { topic: 'Cognitive Dissonance', teaser: 'The mental discomfort of holding contradictory beliefs' },
      { topic: 'Growth Mindset', teaser: 'Why believing you can improve actually helps you improve' },
      { topic: 'Dunning-Kruger Effect', teaser: 'Why incompetent people don\'t know they\'re incompetent' },
      { topic: 'Loss Aversion', teaser: 'Why losing $100 hurts more than gaining $100 feels good' },
      { topic: 'Anchoring Bias', teaser: 'How the first number you hear influences your judgment' },
      { topic: 'Imposter Syndrome', teaser: 'Why successful people feel like frauds' },
      { topic: 'Flow State', teaser: 'When you\'re so absorbed in an activity that time disappears' },
      { topic: 'Maslow\'s Hierarchy', teaser: 'The ladder of human needs from survival to self-actualization' },
      { topic: 'Neuroplasticity', teaser: 'How your brain physically changes when you learn' },
      { topic: 'Intrinsic Motivation', teaser: 'Why internal drive beats external rewards' },
      { topic: 'Projection', teaser: 'Seeing your own traits in others' },
      { topic: 'Sunk Cost Fallacy', teaser: 'Why we stick with bad decisions because we\'ve already invested' },
      { topic: 'Availability Heuristic', teaser: 'Why recent events feel more common than they are' },
      { topic: 'Emotional Intelligence', teaser: 'Understanding and managing emotions in yourself and others' }
    ],
    'Philosophy': [
      { topic: 'Occam\'s Razor', teaser: 'Why the simplest explanation is often correct' },
      { topic: 'Ship of Theseus', teaser: 'If you replace every part, is it still the same thing?' },
      { topic: 'Stoicism', teaser: 'Ancient wisdom about controlling what you can and accepting what you can\'t' },
      { topic: 'The Trolley Problem', teaser: 'A thought experiment about ethics and difficult choices' },
      { topic: 'Existentialism', teaser: 'Finding meaning in a universe without inherent purpose' },
      { topic: 'Utilitarianism', teaser: 'The greatest good for the greatest number' },
      { topic: 'Plato\'s Cave', teaser: 'Are we all prisoners mistaking shadows for reality?' },
      { topic: 'Social Contract', teaser: 'The implicit agreement that holds society together' },
      { topic: 'Determinism vs Free Will', teaser: 'Are our choices truly free or already predetermined?' },
      { topic: 'Categorical Imperative', teaser: 'Kant\'s test: what if everyone did what you\'re doing?' },
      { topic: 'Nihilism', teaser: 'If nothing has inherent meaning, what should we do?' },
      { topic: 'Epistemology', teaser: 'How do we know what we know?' },
      { topic: 'The Veil of Ignorance', teaser: 'Designing a fair society without knowing your place in it' },
      { topic: 'Absurdism', teaser: 'Finding freedom in life\'s meaninglessness' },
      { topic: 'Solipsism', teaser: 'What if only your mind exists?' }
    ],
    'History': [
      { topic: 'The Printing Press', teaser: 'How one invention democratized knowledge forever' },
      { topic: 'The Silk Road', teaser: 'Ancient trade routes that connected East and West' },
      { topic: 'The Scientific Revolution', teaser: 'When observation replaced tradition as truth' },
      { topic: 'The Industrial Revolution', teaser: 'How machines transformed human civilization' },
      { topic: 'The Renaissance', teaser: 'Europe\'s rebirth of art, science, and humanism' },
      { topic: 'The Enlightenment', teaser: 'When reason and individual rights challenged authority' },
      { topic: 'The Cold War', teaser: 'Decades of tension without direct conflict between superpowers' },
      { topic: 'The Fall of Rome', teaser: 'How the greatest empire collapsed from within' },
      { topic: 'The Agricultural Revolution', teaser: 'When humans stopped hunting and started farming' },
      { topic: 'The Space Race', teaser: 'Competition that put humans on the moon' },
      { topic: 'The Black Death', teaser: 'How plague reshaped medieval Europe' },
      { topic: 'Colonial Era', teaser: 'European expansion and its lasting global impact' },
      { topic: 'The Great Depression', teaser: 'Economic collapse that changed government\'s role' },
      { topic: 'The Information Age', teaser: 'How digital technology transformed society' },
      { topic: 'Ancient Democracy', teaser: 'The birth of citizen governance in Athens' }
    ],
    'Art': [
      { topic: 'Impressionism', teaser: 'Capturing fleeting moments of light and color' },
      { topic: 'The Golden Ratio', teaser: 'A mathematical proportion that appears beautiful to humans' },
      { topic: 'Surrealism', teaser: 'Art that explores the unconscious mind and dreams' },
      { topic: 'Minimalism', teaser: 'Finding more by using less' },
      { topic: 'Perspective Drawing', teaser: 'The Renaissance trick that made paintings look real' },
      { topic: 'Abstract Expressionism', teaser: 'When emotion becomes the subject of art' },
      { topic: 'Street Art', teaser: 'How graffiti became legitimate contemporary art' },
      { topic: 'Color Theory', teaser: 'Why some color combinations work and others don\'t' },
      { topic: 'Baroque Art', teaser: 'Drama, emotion, and movement in visual form' },
      { topic: 'Conceptual Art', teaser: 'When the idea matters more than the object' },
      { topic: 'Japanese Aesthetics', teaser: 'Wabi-sabi and the beauty of imperfection' },
      { topic: 'Cubism', teaser: 'Picasso\'s revolution: showing multiple viewpoints at once' },
      { topic: 'Art Nouveau', teaser: 'Organic, flowing lines inspired by nature' },
      { topic: 'Pop Art', teaser: 'Elevating consumer culture to fine art' },
      { topic: 'Renaissance Sculpture', teaser: 'Reviving classical ideals in marble and bronze' }
    ],
    'Science': [
      { topic: 'Evolution by Natural Selection', teaser: 'How life\'s diversity emerged without a designer' },
      { topic: 'The Big Bang', teaser: 'How the universe began from a single point' },
      { topic: 'Relativity', teaser: 'Why time and space aren\'t what they seem' },
      { topic: 'DNA', teaser: 'The elegant code that builds all living things' },
      { topic: 'Photosynthesis', teaser: 'How plants turn sunlight into chemical energy' },
      { topic: 'Black Holes', teaser: 'Where gravity is so strong that nothing escapes' },
      { topic: 'CRISPR', teaser: 'Gene editing that could cure diseases or change humanity' },
      { topic: 'Climate Systems', teaser: 'Why Earth\'s temperature is changing faster than ever' },
      { topic: 'Antibiotics', teaser: 'How we discovered medicine in mold' },
      { topic: 'Plate Tectonics', teaser: 'Why continents drift and earthquakes happen' },
      { topic: 'Vaccines', teaser: 'Teaching your immune system to fight before infection' },
      { topic: 'Quantum Mechanics', teaser: 'Where particles exist in multiple states at once' },
      { topic: 'Dark Matter', teaser: 'The invisible substance that makes up most of the universe' },
      { topic: 'The Microbiome', teaser: 'The trillions of bacteria that keep you alive' },
      { topic: 'Entropy', teaser: 'Why disorder always increases' }
    ],
    'Health': [
      { topic: 'Intermittent Fasting', teaser: 'Why when you eat might matter as much as what you eat' },
      { topic: 'Sleep Cycles', teaser: 'The stages your brain goes through every night' },
      { topic: 'The Placebo Effect', teaser: 'Why believing treatment works actually makes it work' },
      { topic: 'Inflammation', teaser: 'Your body\'s double-edged immune response' },
      { topic: 'Gut-Brain Axis', teaser: 'How your stomach and brain communicate' },
      { topic: 'Metabolic Rate', teaser: 'Why some people burn calories faster than others' },
      { topic: 'Cortisol', teaser: 'The stress hormone that can save or harm you' },
      { topic: 'Mitochondria', teaser: 'The powerhouses that energize every cell' },
      { topic: 'Autophagy', teaser: 'Your body\'s cellular recycling system' },
      { topic: 'The Immune System', teaser: 'Your personal army fighting invisible invaders' },
      { topic: 'Circadian Rhythm', teaser: 'Your internal clock that runs on a 24-hour cycle' },
      { topic: 'Oxidative Stress', teaser: 'When free radicals damage your cells' },
      { topic: 'Neurogenesis', teaser: 'Growing new brain cells throughout life' },
      { topic: 'Hormesis', teaser: 'Why small doses of stress make you stronger' },
      { topic: 'Muscle Memory', teaser: 'Why skills come back quickly after a break' }
    ],
    'Parenting': [
      { topic: 'Attachment Theory', teaser: 'How early bonds shape relationships for life' },
      { topic: 'Executive Function', teaser: 'The mental skills children need to succeed' },
      { topic: 'Positive Discipline', teaser: 'Teaching without punishment or permissiveness' },
      { topic: 'Theory of Mind', teaser: 'When children understand others have different thoughts' },
      { topic: 'Growth Mindset for Kids', teaser: 'Teaching children that abilities can be developed' },
      { topic: 'Emotional Regulation', teaser: 'Helping kids manage big feelings' },
      { topic: 'Natural Consequences', teaser: 'When reality is the best teacher' },
      { topic: 'Scaffolding', teaser: 'Providing just enough support for children to succeed' },
      { topic: 'Play-Based Learning', teaser: 'Why children learn best through play' },
      { topic: 'Authoritative Parenting', teaser: 'Balancing warmth with clear boundaries' },
      { topic: 'Mirror Neurons', teaser: 'Why children imitate what they see' },
      { topic: 'Language Acquisition', teaser: 'How babies learn to speak without formal teaching' },
      { topic: 'Separation Anxiety', teaser: 'Why young children fear being apart from caregivers' },
      { topic: 'Siblings Rivalry', teaser: 'Competition and its role in development' },
      { topic: 'Critical Periods', teaser: 'Windows of time when learning certain skills is easiest' }
    ],
    'Politics': [
      { topic: 'Separation of Powers', teaser: 'Why government is divided into competing branches' },
      { topic: 'Federalism', teaser: 'Splitting power between national and local governments' },
      { topic: 'Gerrymandering', teaser: 'Drawing voting districts to win elections' },
      { topic: 'The Electoral College', teaser: 'Why the U.S. doesn\'t elect presidents by popular vote' },
      { topic: 'Lobbying', teaser: 'How interest groups influence lawmakers' },
      { topic: 'Checks and Balances', teaser: 'Each branch limiting the others\' power' },
      { topic: 'Parliamentary Systems', teaser: 'When the legislature chooses the executive' },
      { topic: 'Judicial Review', teaser: 'Courts striking down unconstitutional laws' },
      { topic: 'Direct Democracy', teaser: 'Citizens voting on issues instead of representatives' },
      { topic: 'Political Polarization', teaser: 'Why left and right are moving further apart' },
      { topic: 'Soft Power', teaser: 'Influence through culture and values, not military force' },
      { topic: 'Term Limits', teaser: 'The trade-offs of forcing leaders out' },
      { topic: 'Campaign Finance', teaser: 'Money\'s controversial role in elections' },
      { topic: 'Filibuster', teaser: 'Talking indefinitely to block legislation' },
      { topic: 'Populism', teaser: 'Appealing to ordinary people against elites' }
    ],
    'Culture': [
      { topic: 'Cultural Appropriation', teaser: 'When borrowing from another culture becomes problematic' },
      { topic: 'Rituals', teaser: 'Symbolic acts that bind communities together' },
      { topic: 'Oral Traditions', teaser: 'Passing knowledge through storytelling' },
      { topic: 'Cultural Relativism', teaser: 'Understanding practices within their own context' },
      { topic: 'Subcultures', teaser: 'Groups with distinct values within larger society' },
      { topic: 'Cultural Evolution', teaser: 'How ideas spread and change over time' },
      { topic: 'Mythology', teaser: 'Stories that explain the world and human nature' },
      { topic: 'Rites of Passage', teaser: 'Ceremonies marking life transitions' },
      { topic: 'Globalization', teaser: 'How cultures blend and clash worldwide' },
      { topic: 'Folk Art', teaser: 'Traditional crafts passed through generations' },
      { topic: 'Music Theory', teaser: 'The universal language of rhythm and melody' },
      { topic: 'Festivals', teaser: 'Celebrations that reinforce shared identity' },
      { topic: 'Language and Thought', teaser: 'How words shape how we see the world' },
      { topic: 'Food Culture', teaser: 'Why what we eat is about more than nutrition' },
      { topic: 'Cultural Identity', teaser: 'How we define who we are through group membership' }
    ],
    'Nature': [
      { topic: 'Symbiosis', teaser: 'When different species depend on each other' },
      { topic: 'Keystone Species', teaser: 'Animals whose presence shapes entire ecosystems' },
      { topic: 'Bioluminescence', teaser: 'Living things that create their own light' },
      { topic: 'Mycelium Networks', teaser: 'Underground fungal networks connecting forests' },
      { topic: 'Migration Patterns', teaser: 'Why animals travel thousands of miles annually' },
      { topic: 'Pollination', teaser: 'The partnership between plants and pollinators' },
      { topic: 'Biomimicry', teaser: 'Solving human problems by copying nature' },
      { topic: 'Ecosystem Services', teaser: 'What nature provides that we take for granted' },
      { topic: 'Trophic Cascades', teaser: 'How top predators shape everything below them' },
      { topic: 'Coral Reefs', teaser: 'Underwater cities built by tiny animals' },
      { topic: 'Old-Growth Forests', teaser: 'Ancient ecosystems that can\'t be replicated' },
      { topic: 'Animal Communication', teaser: 'How creatures share information without words' },
      { topic: 'Extremophiles', teaser: 'Life thriving in impossible conditions' },
      { topic: 'Regeneration', teaser: 'Animals that can regrow lost body parts' },
      { topic: 'Phenology', teaser: 'How organisms time life events with seasons' }
    ]
  };

  constructor(private storage: StorageService) {}

  /**
   * Choose today's topic based on user interests and recommendation algorithm
   */
  async chooseTopicForToday(userInterests: string[]): Promise<{ topic: string; teaser: string; category: string }> {
    if (userInterests.length === 0) {
      // Fallback: pick random category and topic
      const allCategories = Object.keys(this.seedTopics);
      const category = this.getRandomItem(allCategories);
      const topicSeed = this.getRandomItem(this.seedTopics[category]);
      return { ...topicSeed, category };
    }

    // Get last 14 topics to avoid repetition
    const recentTopics = await this.storage.getLast14Topics();

    // 70% from user interests, 20% adjacent, 10% wildcard
    const roll = Math.random();
    let selectedCategory: string;

    if (roll < 0.7) {
      // User interest
      selectedCategory = this.getRandomItem(userInterests);
    } else if (roll < 0.9) {
      // Adjacent category
      const baseCategory = this.getRandomItem(userInterests);
      const adjacentCategories = this.adjacencyMap[baseCategory] || [];
      selectedCategory = adjacentCategories.length > 0 
        ? this.getRandomItem(adjacentCategories)
        : this.getRandomItem(userInterests);
    } else {
      // Wildcard
      const allCategories = Object.keys(this.seedTopics);
      selectedCategory = this.getRandomItem(allCategories);
    }

    // Get topics from selected category
    const availableTopics = this.seedTopics[selectedCategory] || [];
    
    // Filter out recently used topics
    const freshTopics = availableTopics.filter(t => !recentTopics.includes(t.topic));
    
    // If all topics recently used, use any topic from the category
    const topicsPool = freshTopics.length > 0 ? freshTopics : availableTopics;
    const selectedTopic = this.getRandomItem(topicsPool);

    return {
      topic: selectedTopic.topic,
      teaser: selectedTopic.teaser,
      category: selectedCategory
    };
  }

  /**
   * Get alternative topics for "Pick another" feature
   */
  async getAlternativeTopics(currentTopic: string, userInterests: string[], count: number = 2): Promise<Array<{ topic: string; teaser: string; category: string }>> {
    const alternatives: Array<{ topic: string; teaser: string; category: string }> = [];
    const recentTopics = await this.storage.getLast14Topics();
    
    for (let i = 0; i < count; i++) {
      const result = await this.chooseTopicForToday(userInterests);
      // Make sure it's not the current topic or already selected
      if (result.topic !== currentTopic && !alternatives.find(a => a.topic === result.topic)) {
        alternatives.push(result);
      }
    }
    
    return alternatives;
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Object.keys(this.seedTopics);
  }

  /**
   * Get topics for a specific category
   */
  getTopicsForCategory(category: string): TopicSeed[] {
    return this.seedTopics[category] || [];
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
