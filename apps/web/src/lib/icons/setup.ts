/**
 * Icon Setup
 *
 * Preloads only the icons we use to prevent CLS (Cumulative Layout Shift).
 * Icons are inlined at build time instead of fetched from CDN at runtime.
 */

import { addIcon } from '@iconify/svelte';

// Inlined icon data (extracted from @iconify-json packages)
// This avoids importing the full icon sets (which are huge)
const icons: Record<string, { body: string; width: number; height: number }> = {
	// Teenyicons (15x15)
	'teenyicons:book-outline': {
		body: '<path fill="currentColor" d="M1.5.5V0a.5.5 0 0 0-.5.5zm0 13H1a.5.5 0 0 0 .5.5zM4 0v15h1V0zM1.5 1h10V0h-10zM13 2.5v9h1v-9zM11.5 13h-10v1h10zm-9.5.5V.5H1v13zm11-2a1.5 1.5 0 0 1-1.5 1.5v1a2.5 2.5 0 0 0 2.5-2.5zM11.5 1A1.5 1.5 0 0 1 13 2.5h1A2.5 2.5 0 0 0 11.5 0zM7 5h4V4H7z"/>',
		width: 15,
		height: 15
	},
	'teenyicons:text-document-outline': {
		body: '<path fill="none" stroke="currentColor" d="M4.5 7h6M4.5 9.5h4m-6-7v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7.586a1 1 0 0 0-.293-.707l-2.914-2.914a1 1 0 0 0-.707-.293H3.5a1 1 0 0 0-1 1Zm7 0v3h3"/>',
		width: 15,
		height: 15
	},
	'teenyicons:edit-outline': {
		body: '<path fill="currentColor" d="m.5 10.5l-.354-.354l-.146.147v.207zm10-10l.354-.354a.5.5 0 0 0-.708 0zm4 4l.354.354a.5.5 0 0 0 0-.708zm-10 10v.5h.207l.147-.146zm-4 0H0a.5.5 0 0 0 .5.5zm.354-3.646l10-10l-.708-.708l-10 10zm9.292-10l4 4l.708-.708l-4-4zm4 3.292l-10 10l.708.708l10-10zM4.5 14h-4v1h4zm-3.5.5v-4H0v4z"/>',
		width: 15,
		height: 15
	},
	'teenyicons:github-outline': {
		body: '<path fill="currentColor" d="M5.65 12.477a.5.5 0 1 0-.3-.954zm-3.648-2.96l-.484-.128l-.254.968l.484.127zM9 14.5v.5h1v-.5zm.063-4.812l-.054-.498a.5.5 0 0 0-.299.852zM12.5 5.912h.5v-.001zm-.833-2.006l-.466-.18a.5.5 0 0 0 .112.533zm-.05-2.017l.456-.204a.5.5 0 0 0-.319-.276zm-2.173.792l-.126.484a.5.5 0 0 0 .398-.064zm-3.888 0l-.272.42a.5.5 0 0 0 .398.064zM3.383 1.89l-.137-.48a.5.5 0 0 0-.32.276zm-.05 2.017l.354.353a.5.5 0 0 0 .112-.534zM2.5 5.93H3v-.002zm3.438 3.758l.352.355a.5.5 0 0 0-.293-.851zM5.5 11H6l-.001-.037zM5 14.5v.5h1v-.5zm.35-2.977c-.603.19-.986.169-1.24.085c-.251-.083-.444-.25-.629-.49a5 5 0 0 1-.27-.402c-.085-.139-.182-.302-.28-.447c-.191-.281-.473-.633-.929-.753l-.254.968c.08.02.184.095.355.346c.082.122.16.252.258.412c.094.152.202.32.327.484c.253.33.598.663 1.11.832c.51.168 1.116.15 1.852-.081zm4.65-.585c0-.318-.014-.608-.104-.878c-.096-.288-.262-.51-.481-.727l-.705.71c.155.153.208.245.237.333c.035.105.053.254.053.562zm-.884-.753c.903-.097 1.888-.325 2.647-.982c.78-.675 1.237-1.729 1.237-3.29h-1c0 1.359-.39 2.1-.892 2.534c-.524.454-1.258.653-2.099.743zM13 5.91a3.35 3.35 0 0 0-.98-2.358l-.707.706c.438.44.685 1.034.687 1.655zm-.867-1.824c.15-.384.22-.794.21-1.207l-1 .025a2.1 2.1 0 0 1-.142.82zm.21-1.207a3.1 3.1 0 0 0-.27-1.195l-.913.408c.115.256.177.532.184.812zm-.726-.99c.137-.481.137-.482.136-.482h-.003l-.004-.002l-.03-.007l-.054-.01a1 1 0 0 0-.158-.013a2.2 2.2 0 0 0-.51.053c-.425.091-1.024.317-1.82.832l.542.84c.719-.464 1.206-.634 1.488-.694a1.2 1.2 0 0 1 .273-.032l.033.002l-.008-.001l-.01-.002l-.006-.002h-.003l-.002-.001c-.001 0-.002 0 .136-.482m-2.047.307a8.2 8.2 0 0 0-4.14 0l.252.968a7.2 7.2 0 0 1 3.636 0zm-3.743.064C5.03 1.746 4.43 1.52 4.005 1.43a2.2 2.2 0 0 0-.51-.053a1.3 1.3 0 0 0-.241.03l-.004.002h-.003l.136.481l.137.481h-.001l-.002.001l-.003.001l-.016.004l-.008.001h.008l.025-.002a1.2 1.2 0 0 1 .273.032c.282.06.769.23 1.488.694zm-2.9-.576a3.1 3.1 0 0 0-.27 1.195l1 .025a2.1 2.1 0 0 1 .183-.812zm-.27 1.195c-.01.413.06.823.21 1.207l.932-.362a2.1 2.1 0 0 1-.143-.82zm.322.673a3.4 3.4 0 0 0-.726 1.091l.924.38c.118-.285.292-.545.51-.765zm-.726 1.091A3.4 3.4 0 0 0 2 5.93l1-.003c0-.31.06-.616.177-.902zM2 5.93c0 1.553.458 2.597 1.239 3.268c.757.65 1.74.88 2.64.987l.118-.993C5.15 9.09 4.416 8.89 3.89 8.438C3.388 8.007 3 7.276 3 5.928zm3.585 3.404c-.5.498-.629 1.09-.584 1.704L6 10.963c-.03-.408.052-.683.291-.921zM5 11v3.5h1V11zm5 3.5V13H9v1.5zm0-1.5v-2.062H9V13z"/>',
		width: 15,
		height: 15
	},
	'teenyicons:linkedin-outline': {
		body: '<path fill="none" stroke="currentColor" d="M4.5 6v5m6 0V8.5a2 2 0 1 0-4 0V11V6M4 4.5h1M1.5.5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"/>',
		width: 15,
		height: 15
	},
	'teenyicons:message-outline': {
		body: '<path fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" d="m5.5 11.493l2 2.998l2-2.998h4a1 1 0 0 0 1-1V1.5a1 1 0 0 0-1-.999h-12a1 1 0 0 0-1 1v8.994c0 .552.447.999 1 .999z" clip-rule="evenodd"/>',
		width: 15,
		height: 15
	},
	'teenyicons:terminal-outline': {
		body: '<path fill="none" stroke="currentColor" d="m3.5 4.5l3 3l-3 3m4.5 0h4m-10.5-9h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"/>',
		width: 15,
		height: 15
	},

	'teenyicons:home-outline': {
		body: '<path fill="none" stroke="currentColor" d="M1 14.5V7.657a1 1 0 0 1 .343-.757L7.5.5L13.657 6.9a1 1 0 0 1 .343.757V14.5a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5Z"/>',
		width: 15,
		height: 15
	},

	// MDI (24x24)
	'mdi:open-in-new': {
		body: '<path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"/>',
		width: 24,
		height: 24
	}
};

// Register all icons
for (const [name, data] of Object.entries(icons)) {
	addIcon(name, data);
}
