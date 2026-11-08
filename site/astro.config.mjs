// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	integrations: [
		starlight({
			title: 'PCB Fiber Laser Guide',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kpkrisnop/PCB-Fiber-Laser-Fabrication-Instruction' }],
			sidebar: [
				{ label: '1. Overview', link: '/' },
				{ label: '2. Designing', items: ['designing/design-rules', 'designing/export-gerbers'] },
				{ label: '3. Preparing', items: ['preparing/install-skills', 'preparing/prepare-files', 'preparing/the-files'] },
				{
					label: '4. Machining',
					items: [
						'machining/alignment',
						'machining/1-cnc-pins-stock',
						'machining/2-laser-jig-copper',
						'machining/3-bench-paint',
						'machining/4-laser-mask-silk',
						'machining/5-cnc-drill-cut',
					],
				},
				{
					label: 'Reference',
					items: [
						'reference/safety',
						'reference/requirements',
						'reference/install-software',
						'reference/software-setup',
						'reference/pen-settings',
						'reference/laser-calibration',
						'reference/manual-preparation',
					],
				},
			],
		}),
	],
});
