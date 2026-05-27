// Public API for content loading. Internals are split by concern across this
// directory (sources, scan, series, devlogs, detail, images); this barrel keeps
// the `$lib/utils/content` import path stable for all callers.

export type { IndexEntryWithCover, SeriesGroupInfo } from './types';

export {
	loadAllContent,
	loadAllContentForPrerender,
	loadContentByType,
	loadContentByTypeForPrerender
} from './scan';

export { loadSeriesGrouped, loadSeriesGroupedForPrerender, loadSeriesBySlug } from './series';

export { loadDevlogsGrouped } from './devlogs';

export { getContentBySlug } from './detail';

export { getCoverImageUrl, getHeroImageUrl, getOGImageUrl } from './images';
