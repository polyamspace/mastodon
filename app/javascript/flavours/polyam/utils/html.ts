import React from 'react';

import highlightjs from 'highlight.js';

import htmlConfig from '../../../config/html-tags.json';

// NB: This function can still return unsafe HTML
export const unescapeHTML = (html: string) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p><p>/g, '\n\n')
    .replace(/<[^>]*>/g, '');
  return wrapper.textContent;
};

interface AllowedTag {
  /* True means allow, false disallows global attributes, string renames the attribute name for React. */
  attributes?: Record<string, boolean | string>;
  /* If false, the tag cannot have children. Undefined or true means allowed. */
  children?: boolean;
}

type AllowedTagsType = {
  [Tag in keyof React.ReactHTML]?: AllowedTag;
};

const globalAttributes: Record<string, boolean | string> = htmlConfig.global;
const defaultAllowedTags: AllowedTagsType = htmlConfig.tags;

interface QueueItem {
  node: Node;
  parent: React.ReactNode[];
  depth: number;
}

export type OnElementHandler<
  Arg extends Record<string, unknown> = Record<string, unknown>,
> = (
  element: HTMLElement,
  props: Record<string, unknown>,
  children: React.ReactNode[],
  extra: Arg,
) => React.ReactNode;

export interface HTMLToStringOptions<
  Arg extends Record<string, unknown> = Record<string, unknown>,
> {
  maxDepth?: number;
  onText?: (text: string, extra: Arg) => React.ReactNode;
  onElement?: OnElementHandler<Arg>;
  onAttribute?: (
    name: string,
    value: string,
    tagName: string,
    extra: Arg,
  ) => [string, unknown] | null;
  allowedTags?: AllowedTagsType;
  extraArgs?: Arg;
}

let uniqueIdCounter = 0;

export function htmlStringToComponents<Arg extends Record<string, unknown>>(
  htmlString: string,
  options: HTMLToStringOptions<Arg> = {},
) {
  const wrapper = document.createElement('template');
  wrapper.innerHTML = htmlString;

  const rootChildren: React.ReactNode[] = [];
  const queue: QueueItem[] = [
    { node: wrapper.content, parent: rootChildren, depth: 0 },
  ];

  const {
    maxDepth = 10,
    allowedTags = defaultAllowedTags,
    onAttribute,
    onElement,
    onText,
    extraArgs = {} as Arg,
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
        if (text) {
          if (onText) {
            parent.push(onText(text, extraArgs));
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
        const tagName = node.tagName.toLowerCase();
        const tagInfo = allowedTags[tagName as keyof typeof allowedTags];
        if (!tagInfo) {
          continue;
        }

        // Create the element and add it to the parent.
        const children: React.ReactNode[] = [];
        let element: React.ReactNode = undefined;

        // Generate props from attributes.
        const key = `html-${uniqueIdCounter++}`; // Get the current key and then increment it.
        const props: Record<string, unknown> = { key };
        for (const attr of node.attributes) {
          let name = attr.name.toLowerCase();

          // Custom attribute handler.
          if (onAttribute) {
            const result = onAttribute(
              name,
              attr.value,
              node.tagName.toLowerCase(),
              extraArgs,
            );
            if (result) {
              const [cbName, value] = result;
              props[cbName] = value;
            }
          } else {
            // Check global attributes first, then tag-specific ones.
            const globalAttr = globalAttributes[name];
            const tagAttr = tagInfo.attributes?.[name];

            // Exit if neither global nor tag-specific attribute is allowed.
            if (!globalAttr && !tagAttr) {
              continue;
            }

            // Rename if needed.
            if (typeof tagAttr === 'string') {
              name = tagAttr;
            } else if (typeof globalAttr === 'string') {
              name = globalAttr;
            }

            let value: string | boolean | number = attr.value;

            // Handle boolean attributes.
            if (value === 'true') {
              value = true;
            } else if (value === 'false') {
              value = false;
            }

            props[name] = value;
          }
        }

        // If onElement is provided, use it to create the element.
        if (onElement) {
          const component = onElement(node, props, children, extraArgs);
          // Check for undefined to allow returning null.
          if (component !== undefined) {
            element = component;
          }
        }

        // If the element wasn't created, use the default conversion.
        if (element === undefined) {
          element = React.createElement(
            tagName,
            props,
            tagInfo.children !== false ? children : undefined,
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
