export function markdownItLineBreaks(md) {
  const fence = md.renderer.rules.fence.bind(md.renderer.rules);
  
  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    const token = tokens[idx];
    
    // Check if it's our special linebreak fence
    if (token.info.trim() === 'linebreak' || token.info.trim() === 'lb') {
      const content = token.content
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<span class="line-break-text">${md.utils.escapeHtml(line)}</span>`)
        .join('');
      
      return `<div class="line-break-container">${content}</div>`;
    }
    
    return fence(tokens, idx, options, env, slf);
  };
}