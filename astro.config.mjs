import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.jjodel.io',
  integrations: [
    starlight({
      title: 'Jjodel',
      logo: {
        src: './src/assets/jjodel-logo.png',
        alt: 'Jjodel',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/jjodel-modeling' },
      ],
      editLink: {
        baseUrl: 'https://github.com/jjodel-modeling/jjodel-docs/edit/main/src/content/docs/',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'User Guide',
          autogenerate: { directory: 'user-guide' },
        },
        {
          label: 'Concepts',
          autogenerate: { directory: 'concepts' },
        },
        {
          label: 'Tutorials',
          autogenerate: { directory: 'tutorials' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Installation',
          autogenerate: { directory: 'installation' },
        },
        {
          label: 'FAQ',
          link: '/faq/',
        },
        {
          label: 'Video Tutorials',
          link: '/video-pills/',
        },
      ],
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon.png',
            type: 'image/png',
          },
        },
      ],
      components: {
        // Override header to add "Try Jjodel" button
        SiteTitle: './src/components/SiteTitle.astro',
      },
    }),
  ],
});
