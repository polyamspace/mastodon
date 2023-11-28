import highlightjs from 'highlight.js';

// NB: This function can still return unsafe HTML
export const unescapeHTML = (html: string) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<[^>]*>/g, '');
  return wrapper.textContent;
};

/**
 * Highlights code in code tags.\
 * Uses highlight.js to convert content inside code tags to span elements with class attributes
 * @param content html content to highlight
 * @returns content with highlighted code
 */
export const highlightCode = (content: string) => {
  // highlightJS complains when unescaped html is given
  highlightjs.configure({ ignoreUnescapedHTML: true });

  // Create a new temporary element to work on
  const wrapper = document.createElement('div');
  wrapper.innerHTML = content;

  // Get code elements and run highlightJS on each.
  wrapper.querySelectorAll('code').forEach((code) => {
    if (!code.dataset.codelang) return;

    // Get language from data attribute containing code language of code element
    const lang = highlightjs.getLanguage(code.dataset.codelang);

    // Check if lang is a valid language
    if (lang !== undefined) {
      // Set codelang as class attribute, since highlightElement cannot be given a language
      // highlightJS will read this attribute and use it to highlight in the proper language
      code.setAttribute('class', code.dataset.codelang);

      if (lang.name) {
        // Set title attribute to language name, i.e. "js" will become "Javascript"
        code.setAttribute('title', lang.name);
      }

      // Replace <br> as highlightJS removes them, messing up formatting
      const brTags = Array.from(code.getElementsByTagName('br'));
      for (const br of brTags) {
        br.replaceWith('\n');
      }

      // Highlight the code element
      highlightjs.highlightElement(code);

      // highlightJS adds own class attribute, remove it again to not mess up styling
      code.removeAttribute('class');
    } else {
      // Remove data attribute as it's not a valid language.
      delete code.dataset.codelang;
    }
  });

  // return content with highlighted code
  return wrapper.innerHTML;
};
