export function calculateReadability(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length || 1;
  const syllables = text.trim().split(/\s+/).reduce((count, word) => count + (word.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length || 1, 0);
  const fleschKincaid = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  const gradeLevel = Math.max(1, Math.round(fleschKincaid));
  let difficulty = 'Easy';
  if (gradeLevel > 12) difficulty = 'Very Difficult';
  else if (gradeLevel > 9) difficulty = 'Difficult';
  else if (gradeLevel > 6) difficulty = 'Standard';
  return { words, sentences, syllables, gradeLevel, difficulty };
}
