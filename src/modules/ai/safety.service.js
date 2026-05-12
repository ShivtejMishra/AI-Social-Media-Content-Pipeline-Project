/**
 * Safety Service
 * Validates user inputs for potential prompt injection attacks
 * and blocks clearly malicious content before sending to Gemini
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a\s+)?(?!generating|creating|writing)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(?!a\s+(brand|social|content|marketing))/i,
  /disregard\s+(all\s+)?(your\s+)?(previous\s+)?(instructions?|rules?|guidelines?)/i,
  /forget\s+(everything|all)\s+(you\s+)?(were\s+)?(told|instructed)/i,
  /system\s*:\s*/i,
  /<\s*\/?system\s*>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /###\s*instruction/i,
  /jailbreak/i,
  /DAN\s+mode/i,
];

const HARMFUL_CONTENT_PATTERNS = [
  /create\s+(fake|false)\s+(news|information|evidence)/i,
  /generate\s+spam/i,
  /phishing/i,
  /scam/i,
  /illegal\s+activities/i,
];

/**
 * Check if any text input contains potential injection attacks
 */
const detectInjection = (text) => {
  if (!text || typeof text !== 'string') return false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
};

/**
 * Check if text contains harmful content requests
 */
const detectHarmfulContent = (text) => {
  if (!text || typeof text !== 'string') return false;

  for (const pattern of HARMFUL_CONTENT_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
};

/**
 * Sanitize user-provided text by stripping dangerous characters
 */
const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\{\{/g, '{ {')
    .replace(/\}\}/g, '} }')
    .trim()
    .substring(0, 2000); // Cap at 2000 chars
};

/**
 * Validate all string fields in an object recursively
 */
const validateRequestInputs = (obj, fieldPath = '') => {
  const issues = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = fieldPath ? `${fieldPath}.${key}` : key;

    if (typeof value === 'string') {
      if (detectInjection(value)) {
        issues.push({ field: currentPath, issue: 'potential_injection' });
      }
      if (detectHarmfulContent(value)) {
        issues.push({ field: currentPath, issue: 'harmful_content' });
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      issues.push(...validateRequestInputs(value, currentPath));
    }
  }

  return issues;
};

module.exports = {
  detectInjection,
  detectHarmfulContent,
  sanitizeInput,
  validateRequestInputs,
};
