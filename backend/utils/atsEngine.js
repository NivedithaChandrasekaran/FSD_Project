// Comprehensive Deterministic ATS Scoring & Job Description Matching Engine

const ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'analyzed', 'architected', 'automated',
  'built', 'championed', 'collaborated', 'configured', 'constructed', 'coordinated',
  'created', 'decreased', 'delivered', 'designed', 'developed', 'devised',
  'directed', 'engineered', 'enhanced', 'established', 'executed', 'expanded',
  'formulated', 'generated', 'guided', 'implemented', 'improved', 'increased',
  'initiated', 'innovated', 'integrated', 'launched', 'led', 'managed',
  'maximized', 'mentored', 'minimized', 'modernized', 'optimized', 'orchestrated',
  'overhauled', 'pioneered', 'planned', 'programmed', 'reduced', 'refactored',
  'resolved', 'revamped', 'scaled', 'spearheaded', 'streamlined', 'strengthened',
  'supervised', 'trained', 'transformed', 'upgraded'
];

const KNOWN_TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust', 'php', 'swift', 'kotlin',
  'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'angular', 'next.js', 'svelte', 'html', 'html5', 'css', 'css3', 'sass', 'tailwind', 'bootstrap',
  'node', 'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'asp.net',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'sql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'firebase',
  'git', 'github', 'gitlab', 'docker', 'kubernetes', 'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'ci/cd', 'jenkins', 'linux',
  'rest', 'rest api', 'restful', 'graphql', 'grpc', 'microservices', 'websockets', 'kafka', 'rabbitmq',
  'jest', 'mocha', 'cypress', 'selenium', 'unit testing', 'tdd', 'agile', 'scrum', 'jira',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'ai', 'computer vision', 'data science'
];

const STOP_WORDS = new Set([
  'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already',
  'also', 'although', 'always', 'among', 'and', 'another', 'any', 'anybody', 'anyone', 'anything', 'anywhere',
  'are', 'area', 'areas', 'around', 'ask', 'asked', 'asking', 'asks', 'back', 'backed', 'backing', 'backs',
  'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'began', 'behind', 'being', 'beings',
  'best', 'better', 'between', 'big', 'both', 'candidate', 'candidates', 'can', 'cannot', 'case', 'cases',
  'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'did', 'differ', 'different', 'differently',
  'does', 'done', 'down', 'downed', 'downing', 'downs', 'during', 'each', 'early', 'either', 'end', 'ended',
  'ending', 'ends', 'enough', 'even', 'evenly', 'ever', 'every', 'everybody', 'everyone', 'everything',
  'everywhere', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few', 'fewer', 'find', 'finds', 'first',
  'for', 'four', 'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'gave', 'general',
  'generally', 'get', 'gets', 'give', 'given', 'gives', 'good', 'goods', 'got', 'great', 'greater', 'greatest',
  'group', 'grouped', 'grouping', 'groups', 'had', 'has', 'have', 'having', 'her', 'here', 'herself', 'high',
  'higher', 'highest', 'him', 'himself', 'his', 'how', 'however', 'important', 'interest', 'interested',
  'interesting', 'interests', 'into', 'its', 'itself', 'just', 'keep', 'keeps', 'kind', 'knew', 'know',
  'known', 'knows', 'large', 'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like',
  'likely', 'long', 'longer', 'longest', 'made', 'make', 'making', 'man', 'many', 'may', 'member', 'members',
  'men', 'might', 'more', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'myself', 'name', 'named', 'names',
  'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'newer', 'newest', 'next', 'nobody',
  'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'off', 'often', 'old', 'older',
  'oldest', 'once', 'one', 'only', 'open', 'opened', 'opening', 'opens', 'order', 'ordered', 'ordering',
  'orders', 'other', 'others', 'our', 'out', 'over', 'part', 'parted', 'parting', 'parts', 'per', 'perhaps',
  'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting',
  'presents', 'problem', 'problems', 'put', 'puts', 'quite', 'rather', 'really', 'right', 'room', 'rooms',
  'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems',
  'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since',
  'small', 'smaller', 'smallest', 'some', 'somebody', 'someone', 'something', 'somewhere', 'state', 'states',
  'still', 'such', 'sure', 'take', 'taken', 'than', 'that', 'the', 'their', 'them', 'then', 'there',
  'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those', 'though', 'thought',
  'thoughts', 'three', 'through', 'thus', 'today', 'together', 'too', 'took', 'toward', 'turn', 'turned',
  'turning', 'turns', 'two', 'under', 'until', 'upon', 'use', 'used', 'uses', 'very', 'want', 'wanted',
  'wanting', 'wants', 'was', 'way', 'ways', 'well', 'wells', 'went', 'were', 'what', 'when', 'where',
  'whether', 'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without', 'work',
  'worked', 'working', 'works', 'year', 'years', 'you', 'young', 'younger', 'youngest', 'your', 'yours',
  'experience', 'responsibilities', 'requirements', 'qualifications', 'preferred', 'required', 'join',
  'team', 'role', 'company', 'looking', 'opportunity', 'skills', 'position'
]);

export const extractKeywords = (text = '') => {
  if (!text) return [];
  const normalized = text.toLowerCase();
  const tokens = normalized.match(/[a-z0-9+#.-]{2,}/g) || [];
  const counts = {};

  tokens.forEach((token) => {
    const clean = token.replace(/^[.-]+|[.-]+$/g, '');
    if (clean.length > 2 && !STOP_WORDS.has(clean) && !/^\d+$/.test(clean)) {
      counts[clean] = (counts[clean] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
};

export const extractSkillsFromText = (text = '') => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_TECH_SKILLS.filter((skill) => {
    const regex = new RegExp(`(^|[^a-z0-9+#.-])${skill.replace(/[.+]/g, '\\$&')}([^a-z0-9+#.-]|$)`, 'i');
    return regex.test(lower);
  });
};

export const scoreATS = ({ resumeText = '', jobDescription = '', profile = {} }) => {
  const suggestions = [];
  const resumeLower = (resumeText || '').toLowerCase();
  const jdLower = (jobDescription || '').toLowerCase();

  // 1. Keyword Match (30 pts)
  const jdKeywords = extractKeywords(jobDescription);
  let keywordScore = 0;
  let matchedKeywords = [];
  let missingKeywords = [];
  let keywordCoverage = 100;

  if (jdKeywords.length > 0) {
    const targetKeywords = jdKeywords.slice(0, 20);
    matchedKeywords = targetKeywords.filter((kw) => resumeLower.includes(kw));
    missingKeywords = targetKeywords.filter((kw) => !resumeLower.includes(kw));
    const ratio = matchedKeywords.length / targetKeywords.length;
    keywordScore = Math.round(ratio * 30);
    keywordCoverage = Math.round(ratio * 100);

    if (missingKeywords.length > 0) {
      suggestions.push(`Integrate critical target keywords into your bullet points: ${missingKeywords.slice(0, 5).join(', ')}.`);
    }
  } else {
    // When no job description is provided, score general industry keyword richness
    const generalKeywords = extractKeywords(resumeText);
    keywordScore = Math.min(30, Math.max(18, Math.round(generalKeywords.length * 0.75)));
    matchedKeywords = generalKeywords.slice(0, 10);
    keywordCoverage = 85;
  }

  // 2. Skills Match (20 pts)
  let skillsScore = 0;
  let matchedSkills = [];
  let missingSkills = [];

  const resumeSkills = Array.from(new Set([
    ...extractSkillsFromText(resumeText),
    ...(profile.technicalSkills || []).map((s) => String(s).toLowerCase()),
  ]));

  if (jobDescription.trim()) {
    const jdSkills = extractSkillsFromText(jobDescription);
    if (jdSkills.length > 0) {
      matchedSkills = jdSkills.filter((sk) => resumeSkills.some((rs) => rs.includes(sk) || sk.includes(rs)));
      missingSkills = jdSkills.filter((sk) => !matchedSkills.includes(sk));
      const skillRatio = matchedSkills.length / jdSkills.length;
      skillsScore = Math.min(20, Math.round(skillRatio * 20));

      if (missingSkills.length > 0) {
        suggestions.push(`Add verified skills requested by the job description: ${missingSkills.slice(0, 4).join(', ')}.`);
      }
    } else {
      skillsScore = Math.min(20, Math.max(12, Math.round(resumeSkills.length * 1.5)));
      matchedSkills = resumeSkills.slice(0, 6);
    }
  } else {
    skillsScore = Math.min(20, Math.max(14, Math.round(resumeSkills.length * 1.6)));
    matchedSkills = resumeSkills.slice(0, 8);
  }

  // 3. Structure & Sections (15 pts)
  let structureScore = 0;
  const sectionsToCheck = [
    { name: 'Summary / Objective', regex: /summary|objective|profile|about/i, pts: 3 },
    { name: 'Experience / Work History', regex: /experience|employment|work history/i, pts: 4 },
    { name: 'Projects', regex: /projects|portfolio/i, pts: 3 },
    { name: 'Education', regex: /education|degree|university|college/i, pts: 3 },
    { name: 'Skills', regex: /skills|competencies|technologies/i, pts: 2 },
  ];

  sectionsToCheck.forEach((sec) => {
    if (sec.regex.test(resumeText)) {
      structureScore += sec.pts;
    } else {
      suggestions.push(`Include a dedicated "${sec.name}" section to satisfy standard ATS parsing hierarchies.`);
    }
  });

  // 4. Action Verbs (10 pts)
  const foundActionVerbs = ACTION_VERBS.filter((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(resumeText);
  });
  const actionVerbScore = Math.min(10, Math.max(2, Math.round((foundActionVerbs.length / 8) * 10)));
  if (foundActionVerbs.length < 5) {
    suggestions.push('Strengthen bullet points by beginning with high-impact action verbs like "Architected", "Optimized", "Engineered", and "Spearheaded".');
  }

  // 5. Quantifiable Achievements (10 pts)
  // Check for metrics: percentages (%), currency ($), numbers with units or increases/decreases
  const metricMatches = resumeText.match(/(\d+%\s*|\$\s*\d+|\b\d+\s*(users|clients|latency|scale|x|times|revenue|percent|teams|projects|reduction|growth)\b)/gi) || [];
  const achievementScore = Math.min(10, Math.max(2, Math.round(metricMatches.length * 2.5)));
  if (metricMatches.length < 3) {
    suggestions.push('Quantify accomplishments with concrete numbers, percentages, time savings, or performance metrics (e.g. "reduced load time by 35%").');
  }

  // 6. Contact Information (5 pts)
  let contactScore = 0;
  if (/@|\bemail\b/i.test(resumeText) || profile.email) contactScore += 2;
  if (/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(resumeText) || profile.phone) contactScore += 1;
  if (/linkedin\.com|github\.com|http|www/i.test(resumeText) || profile.linkedin || profile.github) contactScore += 2;
  if (contactScore < 5) {
    suggestions.push('Ensure complete contact details (email, phone, LinkedIn/GitHub links) are easily accessible at the top.');
  }

  // 7. Formatting & Completeness (10 pts)
  let formatScore = 10;
  const wordCount = (resumeText.match(/\S+/g) || []).length;
  if (wordCount < 150) {
    formatScore -= 4;
    suggestions.push('Resume content is too brief. Expand with comprehensive details on key projects and work history.');
  } else if (wordCount > 1200) {
    formatScore -= 2;
    suggestions.push('Resume exceeds optimal single/two-page length. Condense wording to highlight only the most relevant accomplishments.');
  }
  // Check bullet point formatting
  if (!/[•\-\*]/.test(resumeText)) {
    formatScore = Math.max(4, formatScore - 3);
    suggestions.push('Use structured bullet points rather than dense paragraphs for optimal ATS parsing.');
  }

  const overallScore = Math.min(100, Math.max(25,
    keywordScore + skillsScore + structureScore + actionVerbScore + achievementScore + contactScore + formatScore
  ));

  return {
    overallScore,
    estimatedScore: overallScore,
    keywordScore,
    skillsScore,
    structureScore,
    actionVerbScore,
    achievementScore,
    contactScore,
    formatScore,
    breakdown: {
      keywordMatch: { score: keywordScore, max: 30, label: 'Keyword Match' },
      skillsMatch: { score: skillsScore, max: 20, label: 'Skills Match' },
      structure: { score: structureScore, max: 15, label: 'Structure & Sections' },
      actionVerbs: { score: actionVerbScore, max: 10, label: 'Action Verbs' },
      achievements: { score: achievementScore, max: 10, label: 'Quantifiable Achievements' },
      contact: { score: contactScore, max: 5, label: 'Contact Information' },
      formatting: { score: formatScore, max: 10, label: 'Formatting & Completeness' },
    },
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    missingSkills,
    keywordCoverage,
    suggestions: suggestions.length > 0 ? suggestions : [
      'Resume exhibits excellent keyword density and ATS compliance.',
      'Maintain active metrics on recent project contributions.'
    ],
    disclaimer: 'Estimated optimization score based on ATS heuristics. Does not guarantee job interview outcomes.',
  };
};

export default {
  extractKeywords,
  extractSkillsFromText,
  scoreATS,
};
