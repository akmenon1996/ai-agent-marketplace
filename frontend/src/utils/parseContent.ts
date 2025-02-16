export const parseContent = (content: string): string => {
  try {
    // First try to parse as JSON
    const parsed = JSON.parse(content);
    
    // If it's already a string, return it
    if (typeof parsed === 'string') {
      return parsed;
    }
    
    // Handle common response formats
    if (typeof parsed === 'object') {
      // Direct text fields
      if (parsed.output_text) return parsed.output_text;
      if (parsed.input_text) return parsed.input_text;
      if (parsed.text) return parsed.text;
      
      // Interview prep format
      if (parsed.interview_prep?.topic) {
        return parsed.interview_prep.topic;
      }
      
      // Code review format
      if (parsed.code_review?.code) {
        return parsed.code_review.code;
      }
    }
    
    // If we can't extract meaningful content, return a clean stringified version
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If it's not JSON, return as is
    return content;
  }
};
