import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { REDIRECTS } from '$lib/redirects';

const handleRedirects: Handle = ({ event, resolve }) => {
	const path = event.url.pathname;
	for (const { from, to } of REDIRECTS) {
		if (path === from) redirect(301, to);
		if (path.startsWith(from + '/')) redirect(301, path.replace(from, to));
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(handleRedirects, handleParaglide);
