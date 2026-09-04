import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Site-wide banner: every page gets it unless its own frontmatter sets one.
// The text is replaced at runtime by public/scripts/release-banner.js, which
// counts down to the release date and switches wording once it has passed.
const releaseBanner = {
	content: 'Jjodel 3.0 lands on 15 September. <a href="/whats-new/">See what is coming</a>.',
};

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				banner: z.object({ content: z.string() }).default(releaseBanner),
			}),
		}),
	}),
};
