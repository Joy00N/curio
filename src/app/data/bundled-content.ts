/**
 * Bundled content for seed topics.
 *
 * This file contains pre-generated, high-quality explanations for all seed
 * topics so the app works offline on day one. Content is keyed by topic name
 * (must match the seed topic names in RecommendationService exactly).
 *
 * To regenerate: run `node scripts/generate-content.js`
 */
import { GeneratedContent } from '../models';

export const BUNDLED_CONTENT: Record<string, GeneratedContent> = {
  // ──────────────────────────────────────────────
  // Technology
  // ──────────────────────────────────────────────
  'Quantum Computing': {
    topic: 'Quantum Computing',
    teaser: 'How computers could use quantum mechanics to solve impossible problems',
    eli7: 'Imagine you lost your toy somewhere in a huge maze. A normal computer would try every path one by one to find it. A quantum computer is like having a magical version of you that can walk down every path at the same time. When one of those magical copies finds the toy, all the others disappear and you have your answer. That\'s the basic idea — quantum computers can look at lots of possibilities all at once instead of one at a time.',
    deeper: 'Classical computers store information as bits — each one is either a 0 or a 1. Quantum computers use qubits, which exploit two principles from quantum physics: superposition and entanglement. Superposition lets a qubit exist as 0 and 1 simultaneously, and entanglement links qubits so the state of one instantly influences another. Together, these properties allow a quantum computer to explore an exponentially large number of solutions in parallel. For certain problem types — cryptography, molecular simulation, optimization — this provides a speed-up that no classical supercomputer can match.',
    example: 'Drug discovery is one of the most promising applications. To design a new medicine, researchers need to simulate how molecules interact. A modest protein can exist in an astronomically large number of configurations. Classical computers approximate these interactions, but a sufficiently powerful quantum computer could simulate them exactly. Companies like IBM and Google are already running early quantum experiments to model simple molecules, laying the groundwork for breakthroughs in materials science and pharmaceuticals.',
    whyItMatters: 'Quantum computing won\'t replace your laptop for everyday tasks, but it will unlock solutions to problems we currently consider intractable. Climate modeling, financial risk analysis, supply-chain optimization, and the design of new materials all stand to benefit. Understanding quantum computing now helps you anticipate which industries will be disrupted and how our relationship with computation is fundamentally changing.',
    reflectionQuestion: 'What problem in your field would you most want a quantum computer to solve?'
  },

  'Confirmation Bias': {
    topic: 'Confirmation Bias',
    teaser: 'Why we see what we expect to see',
    eli7: 'Imagine you think your friend always takes the biggest cookie. Now every time cookies come out, you watch them super carefully. When they do take a big one, you say "See! I knew it!" But you don\'t notice all the times they took a small one. Your brain is like a detective that only collects clues that match what it already believes and ignores the ones that don\'t. That\'s confirmation bias — your brain plays favorites with information.',
    deeper: 'Confirmation bias is a cognitive shortcut rooted in how our brains manage information overload. We process millions of sensory inputs daily, so the brain filters aggressively — prioritizing data that aligns with existing beliefs and downplaying contradictions. Psychologist Peter Wason demonstrated this in the 1960s with his famous card-selection task, showing that people consistently seek confirming rather than disconfirming evidence. The bias operates at every stage: what information we search for, how we interpret it, and what we remember afterward. Social media algorithms amplify this by feeding us content that matches our engagement history.',
    example: 'Consider investing. If you believe a particular stock will rise, you\'ll naturally gravitate toward bullish analyst reports and dismiss bearish ones. You might interpret neutral news as positive and remember the times your prediction was right while forgetting the misses. Professional investors combat this by actively seeking a "devil\'s advocate" opinion before making trades — a structured way to counteract the bias that affects everyone from novices to experts.',
    whyItMatters: 'Confirmation bias shapes political opinions, medical diagnoses, hiring decisions, and personal relationships. Being aware of it doesn\'t eliminate it — the bias is deeply wired — but awareness lets you build habits that counteract it: seeking disconfirming evidence, asking "what would change my mind?", and deliberately engaging with opposing viewpoints. In an era of information overload, this might be the single most important thinking skill to develop.',
    reflectionQuestion: 'When was the last time you changed your mind about something important, and what evidence convinced you?'
  },

  'The Printing Press': {
    topic: 'The Printing Press',
    teaser: 'How one invention democratized knowledge forever',
    eli7: 'Before the printing press, if you wanted a copy of a book, someone had to write the whole thing out by hand. That could take months! So books were super rare and expensive — only rich people and churches had them. Then a man named Johannes Gutenberg built a machine with tiny metal letters that could be covered in ink and pressed onto paper, over and over. Suddenly you could make hundreds of copies of the same book really fast. More people could read, learn, and share ideas. It was like the internet of the 1400s.',
    deeper: 'Gutenberg\'s movable-type press, introduced around 1440 in Mainz, Germany, combined several existing technologies — the screw press, oil-based ink, and cast metal type — into a system that reduced the cost of book production by roughly 80%. Within fifty years, an estimated 20 million volumes had been printed across Europe. The effects were cascading: literacy rates climbed, vernacular languages gained prestige over Latin, and ideas could spread faster than any authority could suppress them. Martin Luther\'s 95 Theses went viral in 1517 precisely because printers reproduced and distributed them across Germany within weeks.',
    example: 'The scientific revolution is arguably a direct consequence of the printing press. Before print, a scholar\'s observations might reach a handful of colleagues through handwritten letters. After print, Copernicus\'s "On the Revolutions of the Celestial Spheres" could be read by astronomers across Europe simultaneously. Errors could be publicly challenged, experiments replicated, and knowledge accumulated across generations in a reliable way. The standardization of texts also meant that two scientists in different countries could literally be on the same page.',
    whyItMatters: 'The printing press teaches us that the most transformative technologies are often those that democratize access to information. The same pattern repeated with radio, television, and the internet. Understanding this history helps us evaluate today\'s information revolutions — from social media to AI-generated content — with a sense of proportion and an eye for both the opportunities and the risks that come with radical democratization.',
    reflectionQuestion: 'What modern technology do you think is having a printing-press-level impact on how knowledge spreads?'
  },

  'Compound Interest': {
    topic: 'Compound Interest',
    teaser: 'How small amounts grow into fortunes over time',
    eli7: 'Imagine you plant one apple seed and it grows into a tree that gives you 10 apples. You plant those 10 seeds and get 10 more trees. Now you have 100 apples! And if you plant those... you can see where this is going. Compound interest works the same way with money. You earn a little bit of extra money on your savings, and then you earn extra money on the extra money too. Over a long time, even a tiny amount grows into something huge because the growth keeps building on itself.',
    deeper: 'Compound interest follows an exponential curve described by the formula A = P(1 + r/n)^(nt), where P is the principal, r is the annual rate, n is the compounding frequency, and t is time. The key insight is that growth accelerates because each period\'s interest is calculated on a larger base. At 7% annual return, money doubles roughly every 10 years (the "Rule of 72"). This means a 25-year-old who invests $10,000 once could see it grow to $160,000 by age 65 without adding another dollar. The exponential nature means most of the growth happens in the later years — patience is literally rewarded.',
    example: 'Warren Buffett acquired 99% of his $100+ billion fortune after his 50th birthday. He started investing at age 11 and built a modest fortune by 30, but the overwhelming majority of his wealth came from decades of compounding. This illustrates a counterintuitive truth: the most important variable in building wealth isn\'t the rate of return — it\'s time. Someone who starts investing at 22 with modest returns will almost certainly outperform someone who starts at 35 with exceptional returns.',
    whyItMatters: 'Compound interest works in both directions. Credit card debt at 20% APR compounds against you with the same relentless mathematics. Understanding compounding transforms how you think about every financial decision: starting a retirement account early, paying off high-interest debt first, and why even small regular investments matter enormously. Einstein may not have actually called it the eighth wonder of the world, but the sentiment holds — compounding is the most powerful force in personal finance.',
    reflectionQuestion: 'If you could go back in time and give your younger self one piece of financial advice based on compounding, what would it be?'
  },

  'Stoicism': {
    topic: 'Stoicism',
    teaser: 'Ancient wisdom about controlling what you can and accepting what you can\'t',
    eli7: 'Imagine it\'s raining outside and you really wanted to play in the park. You can\'t stop the rain — that\'s not up to you. But you can choose what to do about it: play inside, splash in puddles, or read a book. Stoicism is a way of thinking that says: don\'t waste your energy being upset about things you can\'t control (like rain). Instead, focus all your energy on things you can control (like your attitude and your choices). It\'s like having a superpower that keeps you calm no matter what happens.',
    deeper: 'Stoicism originated in Athens around 300 BCE and was refined by Roman thinkers like Seneca, Epictetus, and Marcus Aurelius. Its central framework is the dichotomy of control: distinguishing between what is "up to us" (our judgments, intentions, desires) and what is "not up to us" (other people\'s actions, external events, our reputation). Stoics argued that suffering comes not from events themselves but from our judgments about them. This isn\'t about suppressing emotions — it\'s about examining whether our emotional reactions are based on accurate assessments of reality. Modern cognitive behavioral therapy (CBT) draws directly from Stoic principles.',
    example: 'Marcus Aurelius, arguably the most powerful man in the world as Roman Emperor, wrote his private journal "Meditations" as a Stoic practice. In it, he reminds himself that fame is meaningless, obstacles are opportunities to practice virtue, and each day should be lived as if it could be the last. The book was never meant for publication, yet it became one of the most influential philosophical texts in history. Today, Stoic practices are used by Navy SEALs, Olympic athletes, and CEOs — anyone who must perform under pressure and accept outcomes beyond their control.',
    whyItMatters: 'In an age of constant notifications, outrage cycles, and comparison culture, Stoicism offers a practical antidote. It doesn\'t promise happiness — it promises equanimity: a stable foundation from which to engage with life\'s chaos. The Stoic practice of negative visualization (imagining losing what you have) cultivates gratitude, while the focus on virtue over outcomes reduces anxiety about things outside your influence. It\'s 2,300-year-old philosophy that feels urgently modern.',
    reflectionQuestion: 'What is one thing causing you stress right now that is actually outside your control?'
  }

  // ─────────────────────────────────────────────────────────────
  // Remaining seed topics will be populated by the generation script.
  // Run: node scripts/generate-content.js
  // ─────────────────────────────────────────────────────────────
};
