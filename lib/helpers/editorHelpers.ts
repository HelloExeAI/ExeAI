// lib/helpers/editorHelpers.ts

/**
 * Debounce function for auto-save with cancel support
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
    let timeoutId: NodeJS.Timeout;
    
    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    
    debounced.cancel = () => {
      clearTimeout(timeoutId);
    };
    
    return debounced;
  };
  
  /**
   * Check if content has unsaved changes
   */
  export const hasUnsavedChanges = (
    currentContent: string,
    savedContent: string
  ): boolean => {
    return currentContent.trim() !== savedContent.trim();
  };
  
  /**
   * Get word count from content
   */
  export const getWordCount = (content: string): number => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };
  
  /**
   * Get character count from content
   */
  export const getCharCount = (content: string): number => {
    return content.length;
  };
  
  /**
   * Get line count from content
   */
  export const getLineCount = (content: string): number => {
    if (!content.trim()) return 0;
    return content.split('\n').length;
  };
  
  /**
   * Extract lines from content
   */
  export const getLines = (content: string): string[] => {
    return content.split('\n');
  };
  
  /**
   * Check if line is empty
   */
  export const isEmptyLine = (line: string): boolean => {
    return line.trim() === '';
  };
  
  /**
   * Detect slash command in line
   * Returns command name if found, null otherwise
   */
  export const detectSlashCommand = (line: string): string | null => {
    const match = line.match(/^\/(\w+)/);
    return match ? match[1].toLowerCase() : null;
  };
  
  /**
   * Check if line contains page link [[PageName]]
   */
  export const hasPageLink = (line: string): boolean => {
    return /\[\[([^\]]+)\]\]/.test(line);
  };
  
  /**
   * Extract page links from line
   * Returns array of page names
   */
  export const extractPageLinks = (line: string): string[] => {
    const matches = line.matchAll(/\[\[([^\]]+)\]\]/g);
    return Array.from(matches, m => m[1]);
  };
  
  /**
   * Check if content is likely a task
   * Detects patterns like "call", "email", "meeting", "finish", etc.
   */
  export const looksLikeTask = (content: string): boolean => {
    const taskKeywords = [
      'call', 'email', 'meeting', 'finish', 'complete', 'send',
      'review', 'schedule', 'prepare', 'create', 'update', 'buy',
      'todo', 'task', 'remind', 'follow up'
    ];
    
    const lowerContent = content.toLowerCase();
    return taskKeywords.some(keyword => lowerContent.includes(keyword));
  };
  
  /**
   * Check if content is likely an expense
   * Detects patterns like "$50", "paid", "bought", etc.
   */
  export const looksLikeExpense = (content: string): boolean => {
    const expensePatterns = [
      /\$\d+/, // $50
      /\d+\s*(dollars|usd|inr|rupees)/i, // 50 dollars
      /(paid|bought|purchased|spent)/i, // paid, bought, etc.
      /(lunch|dinner|breakfast|coffee|groceries)/i // common expenses
    ];
    
    return expensePatterns.some(pattern => pattern.test(content));
  };
  
  /**
   * Extract amount from expense text
   * Returns number or null
   */
  export const extractAmount = (content: string): number | null => {
    // Match $50 or 50 dollars
    const dollarMatch = content.match(/\$(\d+(?:\.\d{2})?)/);
    if (dollarMatch) return parseFloat(dollarMatch[1]);
    
    const numberMatch = content.match(/(\d+(?:\.\d{2})?)\s*(dollars|usd|inr|rupees)/i);
    if (numberMatch) return parseFloat(numberMatch[1]);
    
    return null;
  };
  
  /**
   * Format content for display (basic markdown-like formatting)
   */
  export const formatContent = (content: string): string => {
    // This is a placeholder for future rich text formatting
    return content;
  };
  
  /**
   * Get cursor position in textarea
   */
  export const getCursorPosition = (element: HTMLTextAreaElement): number => {
    return element.selectionStart;
  };
  
  /**
   * Set cursor position in textarea
   */
  export const setCursorPosition = (
    element: HTMLTextAreaElement,
    position: number
  ): void => {
    element.setSelectionRange(position, position);
    element.focus();
  };
  
  /**
   * Insert text at cursor position
   */
  export const insertTextAtCursor = (
    element: HTMLTextAreaElement,
    text: string
  ): void => {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const currentValue = element.value;
    
    const newValue = 
      currentValue.substring(0, start) + 
      text + 
      currentValue.substring(end);
    
    element.value = newValue;
    
    // Set cursor after inserted text
    const newCursorPos = start + text.length;
    setCursorPosition(element, newCursorPos);
  };