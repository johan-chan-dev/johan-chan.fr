/* eslint-disable @typescript-eslint/no-explicit-any */
// Self-hosted Cal.com inline embed. The loader IIFE below is Cal's official
// snippet (kept structurally verbatim — it creates `window.Cal` as a queue and
// injects embed.js, so calls made before the script loads are replayed). Only
// the parts we call are typed; the vendor glue uses `any` by necessity.

declare global {
	interface Window {
		Cal: any;
	}
}

export interface CalInlineOptions {
	/** Origin of the self-hosted Cal instance, e.g. https://cal.lagraineducraft.fr */
	origin: string;
	/** Event link path, e.g. "johan.chan/30min" */
	calLink: string;
	/** Embed namespace (one per event type), e.g. "30min" */
	namespace: string;
	/** CSS selector for the target element */
	selector: string;
	/** Cal theme, mapped from the site's daisyUI theme */
	theme: 'light' | 'dark';
}

/**
 * Mount the Cal inline embed into `selector`. Browser-only — call from onMount.
 */
export function mountCalInline({
	origin,
	calLink,
	namespace,
	selector,
	theme
}: CalInlineOptions): void {
	// --- Vendor loader (Cal.com official snippet) ---
	(function (C: any, A: string, L: string) {
		const p = function (a: any, ar: any) {
			a.q.push(ar);
		};
		const d = C.document;
		C.Cal =
			C.Cal ||
			function () {
				const cal = C.Cal;
				// eslint-disable-next-line prefer-rest-params
				const ar = arguments;
				if (!cal.loaded) {
					cal.ns = {};
					cal.q = cal.q || [];
					d.head.appendChild(d.createElement('script')).src = A;
					cal.loaded = true;
				}
				if (ar[0] === L) {
					const api = function () {
						// eslint-disable-next-line prefer-rest-params
						p(api, arguments);
					};
					const namespace = ar[1];
					(api as any).q = (api as any).q || [];
					if (typeof namespace === 'string') {
						cal.ns[namespace] = cal.ns[namespace] || api;
						p(cal.ns[namespace], ar);
						p(cal, ['initNamespace', namespace]);
					} else p(cal, ar);
					return;
				}
				p(cal, ar);
			};
	})(window, `${origin}/embed/embed.js`, 'init');
	// --- End vendor loader ---

	const Cal = window.Cal;
	Cal('init', namespace, { origin });
	Cal.ns[namespace]('inline', {
		elementOrSelector: selector,
		config: { layout: 'week_view', useSlotsViewOnSmallScreen: false, theme },
		calLink
	});
	Cal.ns[namespace]('ui', { theme, hideEventTypeDetails: false, layout: 'week_view' });
}
