/**
 * Extract tech stack keywords from job title and description
 */

// Comprehensive list of tech keywords to detect
const TECH_PATTERNS: { pattern: RegExp; tag: string }[] = [
  // Frontend Frameworks
  { pattern: /\breact\.?js\b|\breact\b(?!\s*native)/i, tag: 'React' },
  { pattern: /\breact\s*native\b/i, tag: 'React Native' },
  { pattern: /\bvue\.?js\b|\bvuejs\b|\bvue\b/i, tag: 'Vue.js' },
  { pattern: /\bangular\.?js\b|\bangular\b/i, tag: 'Angular' },
  { pattern: /\bnext\.?js\b|\bnextjs\b/i, tag: 'Next.js' },
  { pattern: /\bsvelte\b/i, tag: 'Svelte' },
  { pattern: /\bnuxt\.?js\b|\bnuxtjs\b/i, tag: 'Nuxt.js' },

  // Backend Frameworks
  { pattern: /\bnode\.?js\b|\bnodejs\b/i, tag: 'Node.js' },
  { pattern: /\bexpress\.?js\b|\bexpressjs\b|\bexpress\b/i, tag: 'Express' },
  { pattern: /\bnestjs\b|\bnest\.?js\b/i, tag: 'NestJS' },
  { pattern: /\bdjango\b/i, tag: 'Django' },
  { pattern: /\bflask\b/i, tag: 'Flask' },
  { pattern: /\bfastapi\b/i, tag: 'FastAPI' },
  { pattern: /\bspring\s*boot\b/i, tag: 'Spring Boot' },
  { pattern: /\bspring\b(?!\s*boot)/i, tag: 'Spring' },
  { pattern: /\bruby\s*on\s*rails\b|\brails\b/i, tag: 'Rails' },
  { pattern: /\blaravel\b/i, tag: 'Laravel' },
  { pattern: /\b\.net\s*core\b|\.net\b|asp\.net\b/i, tag: '.NET' },

  // Languages
  { pattern: /\bjavascript\b/i, tag: 'JavaScript' },
  { pattern: /\btypescript\b/i, tag: 'TypeScript' },
  { pattern: /\bpython\b/i, tag: 'Python' },
  { pattern: /\bjava\b(?!\s*script)/i, tag: 'Java' },
  { pattern: /\bgolang\b|\bgo\s+developer\b|\bgo\s+engineer\b/i, tag: 'Go' },
  { pattern: /\brust\b/i, tag: 'Rust' },
  { pattern: /\bruby\b(?!\s*on)/i, tag: 'Ruby' },
  { pattern: /\bphp\b/i, tag: 'PHP' },
  { pattern: /\bc#\b|\bcsharp\b/i, tag: 'C#' },
  { pattern: /\bswift\b/i, tag: 'Swift' },
  { pattern: /\bkotlin\b/i, tag: 'Kotlin' },
  { pattern: /\bscala\b/i, tag: 'Scala' },

  // Databases
  { pattern: /\bmongodb\b|\bmongo\b/i, tag: 'MongoDB' },
  { pattern: /\bpostgresql\b|\bpostgres\b/i, tag: 'PostgreSQL' },
  { pattern: /\bmysql\b/i, tag: 'MySQL' },
  { pattern: /\bredis\b/i, tag: 'Redis' },
  { pattern: /\belasticsearch\b|\belastic\s*search\b/i, tag: 'Elasticsearch' },
  { pattern: /\bdynamodb\b/i, tag: 'DynamoDB' },
  { pattern: /\bfirebase\b/i, tag: 'Firebase' },
  { pattern: /\bsupabase\b/i, tag: 'Supabase' },

  // Cloud & DevOps
  { pattern: /\baws\b|\bamazon\s*web\s*services\b/i, tag: 'AWS' },
  { pattern: /\bgcp\b|\bgoogle\s*cloud\b/i, tag: 'GCP' },
  { pattern: /\bazure\b/i, tag: 'Azure' },
  { pattern: /\bdocker\b/i, tag: 'Docker' },
  { pattern: /\bkubernetes\b|\bk8s\b/i, tag: 'Kubernetes' },
  { pattern: /\bterraform\b/i, tag: 'Terraform' },
  { pattern: /\bci\/cd\b|\bcicd\b/i, tag: 'CI/CD' },
  { pattern: /\bdevops\b/i, tag: 'DevOps' },

  // Mobile
  { pattern: /\bflutter\b/i, tag: 'Flutter' },
  { pattern: /\bios\s*developer\b|\bios\s*engineer\b|\bswiftui\b/i, tag: 'iOS' },
  { pattern: /\bandroid\s*developer\b|\bandroid\s*engineer\b/i, tag: 'Android' },

  // AI/ML
  { pattern: /\bmachine\s*learning\b/i, tag: 'Machine Learning' },
  { pattern: /\bdeep\s*learning\b/i, tag: 'Deep Learning' },
  { pattern: /\btensorflow\b/i, tag: 'TensorFlow' },
  { pattern: /\bpytorch\b/i, tag: 'PyTorch' },
  { pattern: /\bopenai\b/i, tag: 'OpenAI' },
  { pattern: /\bllm\b|\blarge\s*language\s*model/i, tag: 'LLM' },
  { pattern: /\blangchain\b/i, tag: 'LangChain' },
  { pattern: /\bgpt-?\d?\b|\bchatgpt\b/i, tag: 'GPT' },
  { pattern: /\bdata\s*science\b|\bdata\s*scientist\b/i, tag: 'Data Science' },
  { pattern: /\bnlp\b|\bnatural\s*language\b/i, tag: 'NLP' },

  // Other
  { pattern: /\bgraphql\b/i, tag: 'GraphQL' },
  { pattern: /\brest\s*api\b|\brestful\b/i, tag: 'REST API' },
  { pattern: /\bmicroservices\b/i, tag: 'Microservices' },
  { pattern: /\bblockchain\b/i, tag: 'Blockchain' },
  { pattern: /\bweb3\b/i, tag: 'Web3' },
  { pattern: /\bsolidity\b/i, tag: 'Solidity' },
];

/**
 * Extract tech tags from text (title + description)
 */
export function extractTechTags(text: string): string[] {
  const tags = new Set<string>();

  // Remove HTML tags for cleaner matching
  const cleanText = text.replace(/<[^>]*>/g, ' ');

  for (const { pattern, tag } of TECH_PATTERNS) {
    if (pattern.test(cleanText)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

/**
 * Check if a job matches the given tech stack filters
 */
export function jobMatchesTech(
  title: string,
  description: string,
  existingTags: string[],
  searchTech: string[]
): boolean {
  if (searchTech.length === 0) return true;

  // Extract tags from title + description
  const extractedTags = extractTechTags(`${title} ${description}`);

  // Combine with existing tags
  const allTags = [...new Set([...existingTags, ...extractedTags])].map((t) =>
    t.toLowerCase()
  );

  const searchLower = searchTech.map((t) => t.toLowerCase());

  // Check if any search term matches
  return searchLower.some((search) => {
    // Direct match
    if (allTags.includes(search)) return true;

    // Partial match (e.g., "react" matches "react native")
    if (allTags.some((tag) => tag.includes(search))) return true;

    // Check title with word boundary
    const titleRegex = new RegExp(`\\b${search}\\b`, 'i');
    if (titleRegex.test(title)) return true;

    return false;
  });
}
