import { loadContentByType } from './scan';
import type { IndexEntryWithCover } from './types';

/**
 * Load devlogs grouped by project (for devlog view).
 */
export function loadDevlogsGrouped(): Map<
	string,
	{ posts: IndexEntryWithCover[]; title: string; latestPost: { title: string; date: string } }
> {
	const devlogItems = loadContentByType('devlog');
	const grouped = new Map<
		string,
		{ posts: IndexEntryWithCover[]; title: string; latestPost: { title: string; date: string } }
	>();

	for (const item of devlogItems) {
		const projectId = item.parent || 'uncategorized';

		if (!grouped.has(projectId)) {
			grouped.set(projectId, {
				posts: [],
				title: projectId,
				latestPost: { title: '', date: '' }
			});
		}

		grouped.get(projectId)!.posts.push(item);
	}

	// Sort posts by date and set latest post
	for (const [, project] of grouped) {
		project.posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		if (project.posts.length > 0) {
			project.latestPost = {
				title: project.posts[0].title,
				date: project.posts[0].date
			};
		}
	}

	return grouped;
}
