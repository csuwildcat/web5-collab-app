
import type { BytemdPlugin } from 'bytemd'
import type { default as Mermaid, MermaidConfig } from 'mermaid'

const icons = {
  ChartGraph: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 48 48"><path stroke="currentColor" stroke-linejoin="round" stroke-width="4" d="M17 6h14v9H17zM6 33h14v9H6zM28 33h14v9H28z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24 16v8M13 33v-9h22v9"/></svg>'
};

const en = {
  "bold": "Bold",
  "boldText": "bold text",
  "cheatsheet": "Markdown Cheatsheet",
  "closeHelp": "Close help",
  "closeToc": "Close table of contents",
  "code": "Code",
  "codeBlock": "Code block",
  "codeLang": "lang",
  "codeText": "code",
  "exitFullscreen": "Exit fullscreen",
  "exitPreviewOnly": "Exit preview only",
  "exitWriteOnly": "Exit write only",
  "fullscreen": "Fullscreen",
  "h1": "Heading 1",
  "h2": "Heading 2",
  "h3": "Heading 3",
  "h4": "Heading 4",
  "h5": "Heading 5",
  "h6": "Heading 6",
  "headingText": "heading",
  "help": "Help",
  "hr": "Horizontal rule",
  "image": "Image",
  "imageAlt": "alt",
  "imageTitle": "title",
  "italic": "Italic",
  "italicText": "italic text",
  "limited": "The maximum character limit has been reached",
  "lines": "Lines",
  "link": "Link",
  "linkText": "link text",
  "ol": "Ordered list",
  "olItem": "item",
  "preview": "Preview",
  "previewOnly": "Preview only",
  "quote": "Quote",
  "quotedText": "quoted text",
  "shortcuts": "Shortcuts",
  "source": "Source code",
  "sync": "Scroll sync",
  "toc": "Table of contents",
  "top": "Scroll to top",
  "ul": "Unordered list",
  "ulItem": "item",
  "words": "Words",
  "write": "Write",
  "writeOnly": "Write only"
}

type Locale = {
  mermaid: string
  flowchart: string
  sequence: string
  class: string
  state: string
  er: string
  uj: string
  gantt: string
  pie: string
  mindmap: string
  timeline: string
}

export interface BytemdPluginMermaidOptions extends MermaidConfig {
  locale?: Partial<Locale>
}

export default function mermaid({
  locale: _locale,
  ...mermaidConfig
}: BytemdPluginMermaidOptions = {}): BytemdPlugin {
  const locale = { ...en, ..._locale } as Locale
  let m: typeof Mermaid

  const actionItems = [
    {
      title: locale.flowchart,
      code: `graph TD
Start --> Stop`,
    },
    {
      title: locale.sequence,
      code: `sequenceDiagram
Alice->>John: Hello John, how are you?
John-->>Alice: Great!
Alice-)John: See you later!`,
    },
    {
      title: locale.class,
      code: `classDiagram
Animal <|-- Duck
Animal <|-- Fish
Animal <|-- Zebra
Animal : +int age
Animal : +String gender
Animal: +isMammal()
Animal: +mate()
class Duck{
+String beakColor
+swim()
+quack()
}
class Fish{
-int sizeInFeet
-canEat()
}
class Zebra{
+bool is_wild
+run()
}`,
    },
    {
      title: locale.state,
      code: `stateDiagram-v2
[*] --> Still
Still --> [*]

Still --> Moving
Moving --> Still
Moving --> Crash
Crash --> [*]`,
    },
    {
      title: locale.er,
      code: `erDiagram
CUSTOMER ||--o{ ORDER : places
ORDER ||--|{ LINE-ITEM : contains
CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
    },
    {
      title: locale.uj,
      code: `journey
title My working day
section Go to work
Make tea: 5: Me
Go upstairs: 3: Me
Do work: 1: Me, Cat
section Go home
Go downstairs: 5: Me
Sit down: 5: Me`,
    },
    {
      title: locale.gantt,
      code: `gantt
title A Gantt Diagram
dateFormat  YYYY-MM-DD
section Section
A task           :a1, 2014-01-01, 30d
Another task     :after a1  , 20d
section Another
Task in sec      :2014-01-12  , 12d
another task      : 24d`,
    },
    {
      title: locale.pie,
      code: `pie title Pets adopted by volunteers
"Dogs" : 386
"Cats" : 85
"Rats" : 15`,
    },
    {
      title: locale.mindmap,
      code: `mindmap
      Root
          A
            B
            C
    `,
    },
    {
      title: locale.timeline,
      code: `timeline
      title History of Social Media Platform
      2002 : LinkedIn
      2004 : Facebook
           : Google
      2005 : Youtube
      2006 : Twitter
      `,
    },
  ]

  return {
    viewerEffect({ markdownBody }) {
      ;(async () => {
        const els = markdownBody.querySelectorAll<HTMLElement>(
          'pre>code.language-mermaid'
        )
        if (els.length === 0) return

        if (!m) {
          m = await import('mermaid').then((c) => c.default)
          if (mermaidConfig) {
            m.initialize(mermaidConfig)
          }
        }

        els.forEach((el, i) => {

          const source = el.innerText;
          const pre = el.parentElement!
          const container = document.createElement('div')
          const instanceId = `bytemd-mermaid-${Date.now()}-${i}`;

          container.classList.add('bytemd-mermaid', instanceId)
          container.style.lineHeight = 'initial';
          container.innerHTML = source;
          pre.replaceWith(container)

          m.render(instanceId, source)
            .then((svgCode) => {
              container.innerHTML = svgCode.svg
            })
            .catch((err) => {
              console.error(err);
            })
        })
      })()
    },
    actions: [
      {
        title: locale.mermaid,
        icon: icons.ChartGraph,
        cheatsheet: '```mermaid',
        handler: {
          type: 'dropdown',
          actions: actionItems.map(({ title, code }) => ({
            title,
            handler: {
              type: 'action',
              click({ editor, appendBlock, codemirror }) {
                const { line } = appendBlock('```mermaid\n' + code + '\n```')
                editor.setSelection(
                  codemirror.Pos(line + 1, 0),
                  codemirror.Pos(line + code.split('\n').length)
                )
                editor.focus()
              },
            },
          })),
          ...locale,
        },
      },
    ],
  }
}