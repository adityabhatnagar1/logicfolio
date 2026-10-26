// README / notes renderer: GFM + LaTeX (KaTeX) + Shiki, with copy buttons on code blocks.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import type { Element, Root } from "hast";
import { SHIKI_THEMES } from "./highlight";

type Parent = Root | Element;

/** Depth-first walk over elements. Return false from visit to skip a node's children. */
function eachElement(
  parent: Parent,
  visit: (el: Element, parent: Parent, index: number) => boolean | void,
): void {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (!child || child.type !== "element") continue;
    if (visit(child, parent, i) === false) continue;
    eachElement(child, visit);
  }
}

/** Shift heading levels so the page keeps a single h1 (README h1 becomes h3, etc.). */
function rehypeDemoteHeadings(options: { by: number }) {
  return (tree: Root) =>
    eachElement(tree, (el) => {
      const match = /^h([1-6])$/.exec(el.tagName);
      if (match) el.tagName = `h${Math.min(6, Number(match[1]) + options.by)}`;
    });
}

const element = (
  tagName: string,
  properties: Element["properties"],
  children: Element["children"],
): Element => ({
  type: "element",
  tagName,
  properties,
  children,
});

/** Wrap every <pre> in .codeblock with a bar holding a copy button. */
function rehypeCodeBlocks() {
  return (tree: Root) =>
    eachElement(tree, (el, parent, index) => {
      if (el.tagName !== "pre") return;
      const button = element(
        "button",
        {
          type: "button",
          className: ["copy-btn"],
          "data-copy": "",
          "aria-label": "Copy code to clipboard",
        },
        [{ type: "text", value: "Copy" }],
      );
      const bar = element(
        "div",
        { className: ["codeblock-bar"], "data-pagefind-ignore": "" },
        [button],
      );
      (parent.children as Element[])[index] = element(
        "div",
        { className: ["codeblock"] },
        [bar, el],
      );
      return false;
    });
}

function createProcessor(headingOffset: number) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype) // raw HTML in notes is dropped, not passed through
    .use(rehypeDemoteHeadings, { by: headingOffset })
    .use(rehypeKatex)
    .use(rehypeShiki, {
      themes: SHIKI_THEMES,
      defaultColor: false,
      defaultLanguage: "text",
      fallbackLanguage: "text",
    })
    .use(rehypeCodeBlocks)
    .use(rehypeStringify);
}

const processors = new Map<number, ReturnType<typeof createProcessor>>();

export async function renderMarkdown(
  source: string,
  headingOffset = 1,
): Promise<string> {
  let processor = processors.get(headingOffset);
  if (!processor) {
    processor = createProcessor(headingOffset);
    processors.set(headingOffset, processor);
  }
  return String(await processor.process(source));
}
