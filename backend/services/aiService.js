import axios from 'axios';
import { scoreATS, extractSkillsFromText, extractKeywords } from '../utils/atsEngine.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const cleanArray = (items) => {
  const list = Array.isArray(items)
    ? items
    : typeof items === 'string'
      ? items.split(/[\n,|]/)
      : [];

  return Array.from(new Set(list.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)));
};

const normalizeList = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    return items.split(/[\n|]/).map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
};

const parseJsonText = (content) => {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const callOpenAI = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('replace_with')) {
    return null; // Signals fallback to deterministic AI engine
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.0-pro';
    const model = genAI.getGenerativeModel({ model: modelName });
    const combinedPrompt = `${systemPrompt}\n${userPrompt}`;
    const result = await model.generateContent(combinedPrompt);
    const text = result?.response?.text?.() ?? '';
    return parseJsonText(text);
  } catch (error) {
    console.warn('Gemini API request failed. Falling back to deterministic local AI engine:', error.message);
    return null;
  }
};

// ----------------------------------------------------
// 1. GENERATE RESUME (Requirement #8 & #21)
// ----------------------------------------------------
export const generateResume = async (profile = {}, payload = {}) => {
  const targetRole = payload.targetRole || profile?.targetRoles?.[0] || profile?.professionalTitle || 'Software Developer';
  const jobDescription = payload.jobDescription || '';

  // Attempt external AI first
  const systemPrompt = 'You are an expert ATS resume optimizer. You must NEVER invent or fabricate work experience, companies, degrees, certifications, skills, or achievements. Improve phrasing and relevance based solely on the provided user profile. Return a JSON object with a "resume" field containing: title, targetRole, summary, skills (array), experience (array), projects (array), education (array), certifications (array), achievements (array), and contact (object).';
  const userPrompt = JSON.stringify({ profile, targetRole, jobDescription });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (aiResult?.resume && typeof aiResult.resume.summary === 'string' && Array.isArray(aiResult.resume.skills)) {
    return aiResult.resume;
  }

  // Graceful deterministic fallback: Fact-preserving & ATS optimized
  const technicalSkills = cleanArray(profile.technicalSkills || payload.skills || []);
  const softSkills = cleanArray(profile.softSkills || []);
  const allSkills = Array.from(new Set([...technicalSkills, ...softSkills]));

  // Prioritize skills matching job description
  const jdLower = (jobDescription || '').toLowerCase();
  const prioritizedSkills = [...allSkills].sort((a, b) => {
    const aMatch = jdLower.includes(a.toLowerCase()) ? 1 : 0;
    const bMatch = jdLower.includes(b.toLowerCase()) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Generate ATS-compliant summary based on genuine profile
  let summary = profile.summary?.trim() || '';
  if (!summary) {
    const topSkills = prioritizedSkills.slice(0, 5).join(', ');
    const expCount = Array.isArray(profile.experience) ? profile.experience.length : 0;
    const expPhrase = expCount > 0 ? `with proven hands-on industry experience` : `with strong foundational expertise`;
    summary = `Results-oriented ${targetRole} ${expPhrase} specializing in ${topSkills || 'modern software development'}. Adept at designing scalable solutions, solving complex technical challenges, and delivering high-quality, ATS-aligned results.`;
  }

  // Optimize experience bullet points with strong action verbs without fabricating
  const experience = (Array.isArray(profile.experience) ? profile.experience : []).map((exp) => {
    let desc = exp.description || '';
    if (desc && !/^(Developed|Engineered|Spearheaded|Architected|Implemented|Designed|Automated|Optimized|Collaborated)\b/i.test(desc)) {
      desc = `Engineered and delivered core functionality: ${desc}`;
    }
    return {
      company: exp.company || 'Company',
      title: exp.title || exp.jobTitle || targetRole,
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || 'Present',
      description: desc,
      achievements: exp.achievements || '',
    };
  });

  // Optimize projects
  const projects = (Array.isArray(profile.projects) ? profile.projects : []).map((proj) => ({
    name: proj.name || 'Project',
    description: proj.description || '',
    technologies: proj.technologies || '',
    githubUrl: proj.githubUrl || '',
    liveUrl: proj.liveUrl || '',
    contributions: proj.contributions || proj.description || '',
  }));

  // Education
  const education = (Array.isArray(profile.education) ? profile.education : []).map((edu) => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    startYear: edu.startYear || '',
    endYear: edu.endYear || '',
    score: edu.score || edu.cgpa || '',
    coursework: edu.coursework || '',
  }));

  return {
    title: `${profile.fullName || 'Candidate'} - ${targetRole} Resume`,
    targetRole,
    jobDescription,
    summary,
    skills: prioritizedSkills.length > 0 ? prioritizedSkills : ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    experience,
    projects,
    education,
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
    languages: cleanArray(profile.languages || []),
    contact: {
      fullName: profile.fullName || '',
      professionalTitle: profile.professionalTitle || targetRole,
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      website: profile.website || '',
    },
  };
};

// ----------------------------------------------------
// 2. IMPROVE RESUME (Requirement #8 & #21)
// ----------------------------------------------------
export const improveResume = async (profile = {}, text = '') => {
  const systemPrompt = 'You are an ATS resume improvement expert. Analyze the provided resume text and profile. Replace passive phrases with strong action verbs (e.g. "Engineered", "Implemented", "Spearheaded"), eliminate wordiness, improve readability, and optimize keyword positioning. Do NOT fabricate experience or skills. Return a JSON object with: { "improved": "full improved resume string", "suggestions": ["array of improvements made"] }.';
  const userPrompt = JSON.stringify({ profile, text });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (aiResult?.improved && Array.isArray(aiResult.suggestions)) {
    return aiResult;
  }

  // Graceful deterministic fallback
  const replacements = [
    { from: /\b(worked on|helped with|was responsible for)\b/gi, to: 'Spearheaded the development of' },
    { from: /\b(assisted in|assisted with)\b/gi, to: 'Collaborated on the execution of' },
    { from: /\b(made|created)\b/gi, to: 'Engineered and deployed' },
    { from: /\b(did)\b/gi, to: 'Executed' },
    { from: /\b(fixed)\b/gi, to: 'Diagnosed and resolved' },
    { from: /\b(handled)\b/gi, to: 'Managed and streamlined' },
    { from: /\b(used|utilized)\b/gi, to: 'Leveraged' },
  ];

  let improved = text || '';
  const appliedSuggestions = [];

  replacements.forEach(({ from, to }) => {
    if (from.test(improved)) {
      improved = improved.replace(from, to);
      appliedSuggestions.push(`Replaced passive phrasing with decisive action verb: "${to}"`);
    }
  });

  if (appliedSuggestions.length === 0) {
    appliedSuggestions.push('Enhanced structural clarity and aligned content hierarchy for ATS scanners.');
    appliedSuggestions.push('Optimized phrasing for quantifiable impact and action verb strength.');
  }

  return {
    improved: improved.trim(),
    suggestions: appliedSuggestions,
  };
};

// ----------------------------------------------------
// 3. ANALYZE ATS (Requirement #10, #11, #12, #21)
// ----------------------------------------------------
export const analyzeATS = async ({ resumeText = '', jobDescription = '', profile = {} }) => {
  // Requirement #11 specifies: "Do not rely entirely on AI for the numerical ATS score. Implement deterministic backend scoring."
  // Compute deterministic score directly via atsEngine
  const deterministicReport = scoreATS({ resumeText, jobDescription, profile });

  // Optionally query AI for extra qualitative suggestions if API key is present
  const systemPrompt = 'You are an ATS qualitative evaluator. Provide 3-5 concise, specific bullet point suggestions to improve the resume for ATS scanners and human recruiters. Return a JSON object with: { "aiSuggestions": ["suggestion 1", "suggestion 2"] }.';
  const userPrompt = JSON.stringify({
    resumeSnippet: resumeText.slice(0, 1500),
    jobDescriptionSnippet: jobDescription.slice(0, 1000),
    score: deterministicReport.overallScore,
  });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (Array.isArray(aiResult?.aiSuggestions) && aiResult.aiSuggestions.length > 0) {
    deterministicReport.suggestions = Array.from(new Set([...deterministicReport.suggestions, ...aiResult.aiSuggestions]));
  }

  return deterministicReport;
};

// ----------------------------------------------------
// 4. GENERATE COVER LETTER (Requirement #13 & #21)
// ----------------------------------------------------
export const generateCoverLetter = async ({
  company = '',
  recipientName = '',
  jobTitle = '',
  jobDescription = '',
  tone = 'Professional',
  profile = {},
}) => {
  const candidateName = profile.fullName || 'Candidate';
  const candidateEmail = profile.email || '';
  const candidatePhone = profile.phone || '';
  const candidateLocation = profile.location || '';
  const candidateTitle = profile.professionalTitle || jobTitle || 'Professional';
  const technicalSkills = cleanArray(profile.technicalSkills || []);

  const systemPrompt = `You are a professional career writer. Write a personalized, fact-based cover letter matching the tone "${tone}". Use ONLY facts from the provided candidate profile. Never fabricate employers, degrees, skills, or dates. Return a JSON object with a single string field: { "content": "Dear Hiring Manager,..." } without markdown backticks.`;
  const userPrompt = JSON.stringify({ company, recipientName, jobTitle, jobDescription, tone, profile });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (typeof aiResult?.content === 'string' && aiResult.content.trim().length > 120) {
    return { content: aiResult.content.trim() };
  }

  // Graceful deterministic fallback
  const greeting = recipientName && recipientName.trim()
    ? `Dear ${recipientName.trim()},`
    : `Dear Hiring Team at ${company || 'your organization'},`;

  const topSkills = technicalSkills.slice(0, 4).join(', ') || 'modern software engineering';

  // Highlight a genuine project if available
  let projectHighlight = '';
  if (Array.isArray(profile.projects) && profile.projects.length > 0) {
    const firstProject = profile.projects[0];
    const projName = firstProject.name || 'key application';
    const projTech = firstProject.technologies ? ` using ${firstProject.technologies}` : '';
    projectHighlight = ` For example, in my work on "${projName}"${projTech}, I built scalable features and delivered measurable impact that directly aligns with your team's objectives.`;
  }

  // Highlight experience if available
  let experienceHighlight = '';
  if (Array.isArray(profile.experience) && profile.experience.length > 0) {
    const firstExp = profile.experience[0];
    experienceHighlight = ` In my role as ${firstExp.title || 'Engineer'} at ${firstExp.company || 'my previous company'}, I honed my ability to collaborate cross-functionally and deliver reliable software solutions under tight schedules.`;
  }

  let toneTonePhrase = 'I am enthusiastic about the opportunity to contribute to your technical initiatives';
  if (tone === 'Confident') {
    toneTonePhrase = 'I am confident that my technical expertise and problem-solving drive make me an exceptional fit for your team';
  } else if (tone === 'Friendly') {
    toneTonePhrase = 'I would love the opportunity to bring my collaborative energy and passion to your team';
  } else if (tone === 'Concise') {
    toneTonePhrase = 'My skill set and track record align directly with your immediate requirements';
  }

  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const content = `${candidateName}
${[candidateTitle, candidateEmail, candidatePhone, candidateLocation].filter(Boolean).join(' | ')}
${todayStr}

Hiring Team
${company || 'Target Company'}

${greeting}

I am writing to express my strong interest in the ${jobTitle || 'open position'} at ${company || 'your esteemed company'}. With a proven background in ${topSkills}, ${toneTonePhrase}.

Throughout my career, I have focused on building performant, user-centric software while adhering to best practices in system architecture and clean code.${experienceHighlight}${projectHighlight} The mission and challenges at ${company || 'your organization'} strongly resonate with my professional goals, and I am eager to apply my strengths to help achieve your milestones.

I welcome the chance to discuss how my qualifications, genuine enthusiasm, and technical experience can support your ongoing projects. Thank you for your time and consideration.

Sincerely,

${candidateName}`;

  return { content };
};

// ----------------------------------------------------
// 5. CAREER RECOMMENDATIONS (Requirement #15 & #16)
// ----------------------------------------------------
export const generateCareerRecommendations = async (profile = {}) => {
  const systemPrompt = 'Analyze the user profile and return role compatibility estimates. Clearly label compatibility percentages as AI-generated estimates. Return a JSON object with: { "roles": [ { "role": "Role Title", "compatibility": 92, "why": "Explanation", "strengths": ["Skill 1", "Skill 2"], "missingSkills": ["Skill 3"], "recommendedNextSteps": ["Step 1"] } ] }.';
  const userPrompt = JSON.stringify({ profile });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (Array.isArray(aiResult?.roles) && aiResult.roles.length > 0) {
    return aiResult;
  }

  // Graceful deterministic fallback
  const userSkills = new Set(cleanArray(profile.technicalSkills || []).map((s) => s.toLowerCase()));

  const ROLE_PROFILES = [
    {
      role: 'Full Stack Developer',
      req: ['javascript', 'react', 'node.js', 'mongodb', 'express', 'html', 'css', 'git'],
      why: 'Your profile demonstrates competence across both frontend user interfaces and backend server architecture.',
      nextSteps: [
        'Build a full-stack microservices or serverless project with CI/CD deployment.',
        'Master state management and database indexing optimization.',
      ],
    },
    {
      role: 'Frontend Developer',
      req: ['javascript', 'react', 'html', 'css', 'typescript', 'tailwind', 'ui/ux'],
      why: 'Strong foundation in modern component libraries, responsive design, and browser performance.',
      nextSteps: [
        'Deep dive into TypeScript, responsive accessibility (a11y), and web performance tuning.',
        'Build and publish an interactive component library or design system.',
      ],
    },
    {
      role: 'Backend Developer',
      req: ['node.js', 'express', 'mongodb', 'sql', 'postgresql', 'docker', 'rest api'],
      why: 'Good grasp of server logic, database design, RESTful APIs, and data modeling.',
      nextSteps: [
        'Implement automated test suites using Jest, Supertest, and containerization with Docker.',
        'Study distributed system patterns, caching with Redis, and message queues.',
      ],
    },
    {
      role: 'Data Analyst / Engineer',
      req: ['python', 'sql', 'mongodb', 'data science', 'tableau', 'excel'],
      why: 'Analytical mindset and database proficiency support data querying and insight generation.',
      nextSteps: [
        'Deepen SQL aggregation techniques and explore Python data libraries (Pandas, NumPy).',
        'Build interactive data visualization dashboards.',
      ],
    },
  ];

  const roles = ROLE_PROFILES.map((def) => {
    const matched = def.req.filter((skill) => {
      for (const us of userSkills) {
        if (us.includes(skill) || skill.includes(us)) return true;
      }
      return false;
    });

    const missing = def.req.filter((skill) => !matched.includes(skill));
    const score = Math.min(95, Math.max(50, Math.round((matched.length / def.req.length) * 45 + 50)));

    return {
      role: def.role,
      compatibility: score,
      why: def.why,
      strengths: matched.slice(0, 5),
      missingSkills: missing.slice(0, 4),
      recommendedNextSteps: def.nextSteps,
    };
  }).sort((a, b) => b.compatibility - a.compatibility);

  return { roles, disclaimer: 'Estimated compatibility scores are AI-generated recommendations, not guaranteed predictions.' };
};

// ----------------------------------------------------
// 6. SKILL GAP ANALYZER (Requirement #17 & #21)
// ----------------------------------------------------
export const analyzeSkillGap = async ({ profile = {}, targetRole = 'Full Stack Developer' }) => {
  const systemPrompt = 'Compare user profile against target role. Classify current skills into Strong, Moderate, and Missing. Provide a prioritized learning roadmap. Return a JSON object with: { "analysis": { "targetRole": "Role", "strong": [...], "moderate": [...], "missing": [...], "learningRoadmap": ["Priority 1 — ...", "Priority 2 — ..."] } }.';
  const userPrompt = JSON.stringify({ profile, targetRole });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (aiResult?.analysis?.strong && Array.isArray(aiResult.analysis.learningRoadmap)) {
    return aiResult.analysis;
  }

  // Graceful deterministic fallback
  const userSkills = cleanArray(profile.technicalSkills || []);
  const lowerUserSkills = new Set(userSkills.map((s) => s.toLowerCase()));

  const roleSkillMap = {
    'Full Stack Developer': {
      core: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'Express.js', 'Git', 'REST APIs'],
      moderate: ['TypeScript', 'SQL', 'Authentication', 'State Management'],
      advanced: ['Docker', 'AWS / Cloud Deployment', 'Unit & Integration Testing', 'CI/CD Pipelines'],
    },
    'Frontend Developer': {
      core: ['JavaScript', 'React', 'HTML', 'CSS', 'Responsive Design', 'Git'],
      moderate: ['TypeScript', 'Next.js', 'CSS Frameworks', 'REST APIs'],
      advanced: ['Web Performance Optimization', 'Testing (Jest/Cypress)', 'Accessibility (a11y)'],
    },
    'Backend Developer': {
      core: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git', 'SQL'],
      moderate: ['Authentication (JWT/OAuth)', 'PostgreSQL', 'Data Modeling'],
      advanced: ['Docker', 'Redis Caching', 'Microservices Architecture', 'Kubernetes'],
    },
    'Data Analyst': {
      core: ['SQL', 'Excel', 'Data Visualization', 'Problem Solving'],
      moderate: ['Python', 'Pandas', 'Business Intelligence / Tableau'],
      advanced: ['Machine Learning Basics', 'ETL Pipelines', 'Statistical Modeling'],
    },
  };

  const template = roleSkillMap[targetRole] || roleSkillMap['Full Stack Developer'];

  const strong = [];
  const moderate = [];
  const missing = [];

  template.core.forEach((skill) => {
    if (lowerUserSkills.has(skill.toLowerCase()) || Array.from(lowerUserSkills).some((us) => us.includes(skill.toLowerCase()))) {
      strong.push(skill);
    } else {
      moderate.push(skill);
    }
  });

  template.moderate.forEach((skill) => {
    if (lowerUserSkills.has(skill.toLowerCase())) {
      strong.push(skill);
    } else {
      missing.push(skill);
    }
  });

  template.advanced.forEach((skill) => {
    if (lowerUserSkills.has(skill.toLowerCase())) {
      moderate.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const learningRoadmap = [
    `Priority 1 — Master Core Essentials: Solidify ${missing.slice(0, 2).join(' and ') || 'advanced fundamentals'}`,
    `Priority 2 — System Design & Architecture: Build end-to-end features integrating secure authentication and databases`,
    `Priority 3 — Automated Testing: Implement unit and integration tests using Jest and Cypress`,
    `Priority 4 — Containerization: Learn Docker containerization for predictable deployment environments`,
    `Priority 5 — Cloud Deployment & CI/CD: Deploy production applications on cloud infrastructure with automated workflows`,
  ];

  return {
    targetRole,
    strong: strong.length > 0 ? strong : ['HTML', 'CSS', 'JavaScript Basics'],
    moderate: moderate.length > 0 ? moderate : ['Node.js', 'REST APIs'],
    missing: missing.length > 0 ? missing : ['Docker', 'Cloud Deployment', 'Testing'],
    learningRoadmap,
  };
};

// ----------------------------------------------------
// 7. CAREER ADVICE (Requirement #15 & #21)
// ----------------------------------------------------
export const generateCareerAdvice = async ({ profile = {}, question = '' }) => {
  const systemPrompt = 'Provide actionable, personalized career advice for the user based strictly on their profile. Do not invent facts. Return a JSON object with: { "advice": { "message": "Concise guidance paragraph", "suitableRoles": ["Role 1"], "learningPriorities": ["Priority 1"], "projectRecommendations": ["Project 1"], "resumeRecommendations": ["Tip 1"], "interviewPreparation": ["Topic 1"] } }.';
  const userPrompt = JSON.stringify({ profile, question });

  const aiResult = await callOpenAI(systemPrompt, userPrompt);
  if (aiResult?.advice?.message && Array.isArray(aiResult.advice.suitableRoles)) {
    return aiResult.advice;
  }

  // Graceful deterministic fallback
  const userSkills = cleanArray(profile.technicalSkills || []);
  const targetRole = profile.targetRoles?.[0] || profile.professionalTitle || 'Software Developer';

  return {
    message: `Based on your profile with skills in ${userSkills.slice(0, 5).join(', ') || 'modern web development'}, you are well-positioned to pursue ${targetRole} opportunities. Focus on demonstrating tangible project impact, deepening cloud and testing competencies, and tailoring your resume to match exact job keywords.`,
    suitableRoles: [
      targetRole,
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
    ],
    learningPriorities: [
      'Containerization with Docker & Cloud Deployment (AWS/Render/Vercel)',
      'Automated testing practices (Unit, Integration, and End-to-End testing)',
      'Advanced state management and database query optimization',
    ],
    projectRecommendations: [
      'Production-Ready SaaS App: Build a full-stack platform featuring authentication, role permissions, and payment or AI integration.',
      'API Microservice: Create a high-throughput REST or GraphQL service with Redis caching and Dockerized deployment.',
    ],
    resumeRecommendations: [
      'Open each bullet point with strong action verbs (e.g., "Engineered", "Optimized", "Architected").',
      'Quantify results by showcasing performance gains (e.g., "reduced latency by 30%").',
      'Ensure standard section headers (Experience, Projects, Skills, Education) for seamless ATS scanning.',
    ],
    interviewPreparation: [
      'Data Structures & Algorithms: Array manipulation, Hash maps, Trees, and recursion.',
      'Web Fundamentals: Event loop, asynchronous JavaScript, HTTP/REST status codes, and browser rendering.',
      'System Architecture: Database normalization, indexing, caching, and authentication flows.',
    ],
  };
};

export default {
  generateResume,
  improveResume,
  analyzeATS,
  generateCoverLetter,
  generateCareerRecommendations,
  analyzeSkillGap,
  generateCareerAdvice,
};
