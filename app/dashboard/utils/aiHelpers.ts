// AI helpers for EXEAI application
import { Note } from '../types/notes';

export interface AICallSuggestion {
  hasAgenda: boolean;
  suggestedAgenda: string | null;
  importance: 'low' | 'medium' | 'high';
  suggestedFollowup: string | null;
}

export function getAICallSuggestions(content: string): AICallSuggestion {
  // Check if content contains "call" or related terms
  const isCallRelated = /\b(call|phone|dial|reach out to|contact|speak with|talk to)\b/i.test(content);
  
  if (!isCallRelated) {
    return {
      hasAgenda: false,
      suggestedAgenda: null,
      importance: 'low',
      suggestedFollowup: null
    };
  }
  
  // Extract person's name (simple implementation)
  const nameMatch = content.match(/\b(call|phone|dial|reach out to|contact|speak with|talk to)\s+(\w+)/i);
  const personName = nameMatch ? nameMatch[2] : null;
  
  // Check if content includes agenda or purpose
  const hasAgenda = /\b(about|regarding|discuss|agenda|purpose|reason)\b/i.test(content);
  
  // Generate suggested agenda if none exists
  let suggestedAgenda = null;
  if (!hasAgenda && personName) {
    suggestedAgenda = `Discuss project updates with ${personName} and share current status`;
  }
  
  // Determine call importance (simplified logic)
  let importance: 'low' | 'medium' | 'high' = 'medium';
  if (/\b(urgent|asap|important|critical|deadline)\b/i.test(content)) {
    importance = 'high';
  } else if (/\b(when (you|u) can|sometime|eventually|later)\b/i.test(content)) {
    importance = 'low';
  }
  
  // Suggest follow-up if appropriate
  let suggestedFollowup = null;
  if (personName && importance === 'high') {
    suggestedFollowup = `Send summary email to ${personName} after the call`;
  }
  
  return {
    hasAgenda,
    suggestedAgenda,
    importance,
    suggestedFollowup
  };
}