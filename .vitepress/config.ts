import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Jjodel Docs',
  description: 'Documentation for the Jjodel metamodeling tool',

  themeConfig: {
    nav: [
      { text: 'Tutorials', link: '/tutorials/01-first-metamodel' },
      { text: 'Reference', link: '/reference/jjel/overview' },
      { text: 'Concepts', link: '/concepts/what-is-mde' },
      { text: 'Examples', link: '/examples/library' },
    ],

    sidebar: [
      {
        text: 'Concepts',
        items: [
          { text: 'What is MDE?', link: '/concepts/what-is-mde' },
          { text: 'Metamodel vs Model', link: '/concepts/metamodel-vs-model' },
          { text: 'The modeling layers', link: '/concepts/modeling-layers' },
          { text: 'Classes and attributes', link: '/concepts/classes-attributes' },
          { text: 'References', link: '/concepts/references' },
          // coming soon
          // { text: 'Viewpoints', link: '/concepts/viewpoints-theory' },
          // { text: 'Transformations', link: '/concepts/transformations-theory' },
          // { text: 'Co-evolution', link: '/concepts/co-evolution-theory' },
          // { text: 'Megamodel', link: '/concepts/megamodel' },
        ]
      },
      {
        text: 'Tutorials',
        items: [
          // coming soon
          // { text: 'Your first metamodel', link: '/tutorials/01-first-metamodel' },
          // { text: 'Your first model', link: '/tutorials/02-first-model' },
          // { text: 'Viewpoints', link: '/tutorials/03-viewpoints' },
          // { text: 'Your first transformation', link: '/tutorials/04-first-transformation' },
          // { text: 'Using Jjodie', link: '/tutorials/05-jjodie-intro' },
          // { text: 'Co-evolution', link: '/tutorials/06-co-evolution' },
        ]
      },
      {
        text: 'Reference',
        collapsed: true,
        items: [
          {
            text: 'JjEL',
            items: [
              // coming soon
              // { text: 'Overview', link: '/reference/jjel/overview' },
              // { text: 'Syntax', link: '/reference/jjel/syntax' },
              // { text: 'Operators', link: '/reference/jjel/operators' },
              // { text: 'Property paths', link: '/reference/jjel/property-paths' },
              // { text: 'Examples', link: '/reference/jjel/examples' },
            ]
          },
          {
            text: 'JjTL',
            items: [
              // coming soon
              // { text: 'Overview', link: '/reference/jjtl/overview' },
              // { text: 'Syntax', link: '/reference/jjtl/syntax' },
              // { text: 'Guards', link: '/reference/jjtl/guards' },
              // { text: 'Collections', link: '/reference/jjtl/collections' },
              // { text: 'Trace model', link: '/reference/jjtl/trace-model' },
              // { text: 'Examples', link: '/reference/jjtl/examples' },
            ]
          },
          {
            text: 'JjScript',
            items: [
              // coming soon
              // { text: 'Overview', link: '/reference/jjscript/overview' },
              // { text: 'Commands', link: '/reference/jjscript/commands' },
              // { text: 'Extension', link: '/reference/jjscript/extension' },
              // { text: 'Examples', link: '/reference/jjscript/examples' },
            ]
          },
        ]
      },
      {
        text: 'Examples',
        collapsed: true,
        items: [
          // coming soon
          // { text: 'Library', link: '/examples/library' },
          // { text: 'State machine', link: '/examples/state-machine' },
          // { text: 'Class diagram', link: '/examples/class-diagram' },
          // { text: 'Library → Catalog (JjTL)', link: '/examples/transformation-library-to-catalog' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jjodel-modeling/jjodel-docs' }
    ],

    footer: {
      message: 'Jjodel is an academic open-source project.',
      copyright: 'University of L\'Aquila — MDE Group'
    }
  }
})
