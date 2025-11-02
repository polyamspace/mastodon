import React from 'react';

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

interface QueueItem {
  node: Node;
  parent: React.ReactNode[];
  depth: number;
}

interface Options {
  maxDepth?: number;
  onText?: (text: string) => React.ReactNode;
  onElement?: (
    element: HTMLElement,
    children: React.ReactNode[],
  ) => React.ReactNode;
  onAttribute?: (
    name: string,
    value: string,
    tagName: string,
  ) => [string, unknown] | null;
  allowedTags?: Set<string>;
}
const DEFAULT_ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'cite',
  'code',
  'del',
  'dfn',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'ul',
]);

export function htmlStringToComponents(
  htmlString: string,
  options: Options = {},
) {
  const wrapper = document.createElement('template');
  wrapper.innerHTML = htmlString;

  const rootChildren: React.ReactNode[] = [];
  const queue: QueueItem[] = [
    { node: wrapper.content, parent: rootChildren, depth: 0 },
  ];

  const {
    maxDepth = 10,
    allowedTags = DEFAULT_ALLOWED_TAGS,
    onAttribute,
    onElement,
    onText,
  } = options;

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) {
      break;
    }

    const { node, parent, depth } = item;
    // If maxDepth is exceeded, skip processing this node.
    if (depth > maxDepth) {
      continue;
    }

    switch (node.nodeType) {
      // Just process children for fragments.
      case Node.DOCUMENT_FRAGMENT_NODE: {
        for (const child of node.childNodes) {
          queue.push({ node: child, parent, depth: depth + 1 });
        }
        break;
      }

      // Text can be added directly if it has any non-whitespace content.
      case Node.TEXT_NODE: {
        const text = node.textContent;
        if (text && text.trim() !== '') {
          if (onText) {
            parent.push(onText(text));
          } else {
            parent.push(text);
          }
        }
        break;
      }

      // Process elements with attributes and then their children.
      case Node.ELEMENT_NODE: {
        if (!(node instanceof HTMLElement)) {
          console.warn('Expected HTMLElement, got', node);
          continue;
        }

        // If the tag is not allowed, skip it and its children.
        if (!allowedTags.has(node.tagName.toLowerCase())) {
          continue;
        }

        // Create the element and add it to the parent.
        const children: React.ReactNode[] = [];
        let element: React.ReactNode = undefined;

        // If onElement is provided, use it to create the element.
        if (onElement) {
          const component = onElement(node, children);
          // Check for undefined to allow returning null.
          if (component !== undefined) {
            element = component;
          }
        }

        // If the element wasn't created, use the default conversion.
        if (element === undefined) {
          const props: Record<string, unknown> = {};
          for (const attr of node.attributes) {
            if (onAttribute) {
              const result = onAttribute(
                attr.name,
                attr.value,
                node.tagName.toLowerCase(),
              );
              if (result) {
                const [name, value] = result;
                props[name] = value;
              }
            } else {
              props[attr.name] = attr.value;
            }
          }
          element = React.createElement(
            node.tagName.toLowerCase(),
            props,
            children,
          );
        }

        // Push the element to the parent.
        parent.push(element);

        // Iterate over the node children with the newly created component.
        for (const child of node.childNodes) {
          queue.push({ node: child, parent: children, depth: depth + 1 });
        }
        break;
      }
    }
  }

  return rootChildren;
}

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
