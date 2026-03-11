import { browser } from '$app/environment';

class Theme {
	current: string | undefined = $state();
	toggleCounter: number = $state(0);

	constructor() {
		// initialize the store
		if (browser) {
			const defaultDataTheme =
				(document.documentElement.getAttribute('data-theme') ??
				window.matchMedia('(prefers-color-scheme: dark)').matches)
					? 'abyss'
					: 'autumn';
			const userDataTheme = localStorage.getItem('theme');
			this.current = userDataTheme ?? defaultDataTheme;
		}
	}

	toggle() {
		const nextTheme = this.current === 'abyss' ? 'autumn' : 'abyss';
		localStorage.setItem('theme', nextTheme);
		document.documentElement.setAttribute('data-theme', nextTheme);
		this.current = nextTheme;
		this.toggleCounter++;
	}
}

export const theme = new Theme();
