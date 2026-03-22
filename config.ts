import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Jjodel Docs',
  description: 'Documentation for the Jjodel metamodeling tool',
  themeConfig: {
    nav: [
      { text: 'Tutorials', link: '/tutorials/01-first-metamodel' },
      { text: 'Reference', link: '/reference/jjel/overview' },
      { text: 'Concepts', link: '/concepts/what-is-mde' },
    ],
    sidebar: [
      {
        text: 'Tutorials',
        items: [
          { text: 'Your first metamodel', link: '/tutorials/01-first-metamodel' },
          { text: 'Your first model', link: '/tutorials/02-first-model' },
          { text: 'Your first transformation', link: '/tutorials/04-first-transformation' },
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'JjEL', link: '/reference/jjel/overview' },
          { text: 'JjTL', link: '/reference/jjtl/overview' },
          { text: 'JjScript', link: '/reference/jjscript/overview' },
        ]
      },
      {
        text: 'Concepts',
        items: [
          { text: 'What is MDE?', link: '/concepts/what-is-mde' },
          { text: 'Metamodel vs Model', link: '/concepts/metamodel-vs-model' },
        ]
      }
    ]
  }
})
