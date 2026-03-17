/**
 * Content Images Vite Plugin
 *
 * Handles image serving and optimization for folder-based content structure.
 *
 * In development:
 * - Serves images from content folders via /@content-images/{typeDir}/{slug}/{filename}
 * - No processing, instant serving for fast iteration
 *
 * In production build:
 * - Scans all content folders for images
 * - Detects image usage (cover from meta.json, body from content.md)
 * - Generates sizes based on usage:
 *   - Cover: xs (200w) for card thumbnails + sm/md/lg for hero display
 *   - Body: sm (400w), md (800w), lg (1200w) for responsive content
 *   - Both: all sizes
 * - Outputs to static/images with content hashes
 * - Builds manifest for URL transformation
 */

import type { Plugin, ViteDevServer } from 'vite';
import fs from 'fs/promises';
import fss from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Dirent } from 'fs';

// ============================================================================
// Types
// ============================================================================

interface ContentImagesOptions {
	/** Content directory relative to project root */
	contentDir?: string;
	/** Output directory for optimized images (relative to static/) */
	outputDir?: string;
	/** Image sizes to generate */
	sizes?: Array<{ name: string; width: number }>;
	/** WebP quality (1-100) */
	quality?: number;
}

interface ImageManifestEntry {
	/** Original relative path: ./images/hero.webp */
	original: string;
	/** Optimized URL for body content (lg size): /images/articles/my-slug/hero-abc123.webp */
	optimized: string;
	/** Responsive srcset string for body content */
	srcset: string;
	/** Cover thumbnail URL (xs size): /images/articles/my-slug/hero-xs-abc123.webp */
	cover?: string;
	/** OG image URL (1200x630, cropped from top): /images/articles/my-slug/hero-og-abc123.webp */
	og?: string;
}

/** Image usage detection result */
type ImageUsage = 'cover' | 'body' | 'both';

/** OG crop position (maps to sharp's position option) */
type OGCropPosition = 'top' | 'center' | 'bottom';

interface ImageUsageResult {
	usage: ImageUsage;
	ogCrop: OGCropPosition;
}

// ============================================================================
// Constants
// ============================================================================

const CONTENT_IMAGE_PREFIX = '/@content-images';
const TYPE_DIRS = ['articles', 'series', 'devlogs', 'posts'];

const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.avif': 'image/avif'
};

/** Cover thumbnail size */
const COVER_SIZE = { name: 'xs', width: 200 };

/** OG image size (1200x630 for LinkedIn/social sharing) */
const OG_SIZE = { name: 'og', width: 1200, height: 630 };

/** Body content responsive sizes */
const BODY_SIZES = [
	{ name: 'sm', width: 400 },
	{ name: 'md', width: 800 },
	{ name: 'lg', width: 1200 }
];

/** All sizes (for backward compatibility with options.sizes) */
const DEFAULT_SIZES = [COVER_SIZE, ...BODY_SIZES];

// ============================================================================
// Image Manifest (populated at build time)
// ============================================================================

const imageManifest = new Map<string, ImageManifestEntry>();

/**
 * Get the image manifest for URL transformation
 */
export function getImageManifest(): Map<string, ImageManifestEntry> {
	return imageManifest;
}

// ============================================================================
// Image Usage Detection
// ============================================================================

/**
 * Detect how an image is used in a content folder.
 * - Reads meta.json to check if image is the cover
 * - Scans content.md to check if image is used in body
 *
 * @returns 'cover' | 'body' | 'both'
 */
async function detectImageUsage(
	contentFolderPath: string,
	imageFilename: string
): Promise<ImageUsageResult> {
	let isCover = false;
	let isBody = false;
	let ogCrop: OGCropPosition = 'center';

	// Check meta.json for cover image
	const metaPath = path.join(contentFolderPath, 'meta.json');
	try {
		const metaContent = await fs.readFile(metaPath, 'utf-8');
		const meta = JSON.parse(metaContent);
		const metaImage = meta.image?.replace(/^\.\/images\//, '');
		if (metaImage === imageFilename) {
			isCover = true;
		}
		if (meta.ogCrop === 'center' || meta.ogCrop === 'bottom') {
			ogCrop = meta.ogCrop;
		}
	} catch {
		// No meta.json or parse error - not a cover
	}

	// Check content.md for body usage
	const contentPath = path.join(contentFolderPath, 'content.md');
	try {
		const mdContent = await fs.readFile(contentPath, 'utf-8');
		// Match markdown image syntax: ![alt](./images/filename)
		const imagePattern = new RegExp(
			`!\\[[^\\]]*\\]\\(\\.?\\/images\\/${escapeRegex(imageFilename)}\\)`,
			'i'
		);
		if (imagePattern.test(mdContent)) {
			isBody = true;
		}
	} catch {
		// No content.md - not in body
	}

	let usage: ImageUsage;
	if (isCover && isBody) usage = 'both';
	else if (isCover) usage = 'cover';
	else if (isBody) usage = 'body';
	else usage = 'body'; // Default: backward compat

	return { usage, ogCrop };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Plugin Factory
// ============================================================================

export function contentImages(options: ContentImagesOptions = {}): Plugin {
	const contentDir = options.contentDir ?? 'src/content';
	const outputDir = options.outputDir ?? 'images/optimized';
	const sizes = options.sizes ?? DEFAULT_SIZES;
	const quality = options.quality ?? 80;

	let projectRoot: string;
	let resolvedContentDir: string;
	let isDev = true;

	return {
		name: 'content-images',

		configResolved(config) {
			projectRoot = config.root;
			isDev = config.command === 'serve';
			// Support absolute paths (e.g. DEV_CONTENT_DIR from .env)
			resolvedContentDir = path.isAbsolute(contentDir)
				? contentDir
				: path.join(projectRoot, contentDir);
		},

		// -----------------------------------------------------------------------
		// Dev Server: Serve images from content folders
		// -----------------------------------------------------------------------

		configureServer(server: ViteDevServer) {
			server.middlewares.use(async (req, res, next) => {
				// Only handle /@content-images/* requests
				if (!req.url?.startsWith(CONTENT_IMAGE_PREFIX)) {
					return next();
				}

				// Parse URL: supports both flat and nested paths
				// Flat:   /@content-images/{typeDir}/{slug}/{filename}
				// Nested: /@content-images/{typeDir}/{parentSlug}/{slug}/{filename}
				const pathAfterPrefix = req.url.slice(CONTENT_IMAGE_PREFIX.length);

				// Try 4-segment match first (nested series)
				let imagePath: string | undefined;
				const nestedMatch = pathAfterPrefix.match(/^\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
				if (nestedMatch) {
					const [, typeDir, parentSlug, slug, filename] = nestedMatch;
					if (TYPE_DIRS.includes(typeDir)) {
						// Could be series/{seriesSlug}/{chapterSlug}/{filename}
						// Image lives at: series/{seriesSlug}/{chapterSlug}/images/{filename}
						imagePath = path.join(
							resolvedContentDir, typeDir, parentSlug, slug, 'images', filename
						);
						// Also try: series/{seriesSlug}/images/{slug}/{filename} (series-level images in subfolders)
						// But first check if the nested chapter path exists
						try {
							const buffer = await fs.readFile(imagePath);
							const ext = path.extname(filename).toLowerCase();
							const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
							res.setHeader('Content-Type', mimeType);
							res.setHeader('Content-Length', buffer.length);
							res.setHeader('Cache-Control', 'no-cache');
							res.end(buffer);
							return;
						} catch {
							// Fall through to 3-segment match
						}
					}
				}

				// Try 3-segment match (flat: articles/slug/filename or series-level)
				const flatMatch = pathAfterPrefix.match(/^\/([^/]+)\/([^/]+)\/(.+)$/);
				if (!flatMatch) {
					return next();
				}

				const [, typeDir, slug, filename] = flatMatch;

				if (!TYPE_DIRS.includes(typeDir)) {
					return next();
				}

				// Build path to image in content folder
				imagePath = path.join(
					resolvedContentDir, typeDir, slug, 'images', filename
				);

				try {
					const buffer = await fs.readFile(imagePath);
					const ext = path.extname(filename).toLowerCase();
					const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

					res.setHeader('Content-Type', mimeType);
					res.setHeader('Content-Length', buffer.length);
					res.setHeader('Cache-Control', 'no-cache');
					res.end(buffer);
				} catch (err) {
					next();
				}
			});
		},

		// -----------------------------------------------------------------------
		// Build: Optimize images and generate manifest
		// -----------------------------------------------------------------------

		async buildStart() {
			if (isDev) return;

			// Dynamic import sharp only for production build
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let sharp: any;
			try {
				sharp = (await import('sharp')).default;
			} catch {
				console.warn('⚠️ sharp not available, skipping image optimization');
				return;
			}

			const contentRoot = resolvedContentDir;
			const outputRoot = path.join(projectRoot, 'static', outputDir);

			// Ensure output directory exists
			await fs.mkdir(outputRoot, { recursive: true });

			/**
			 * Process images in a content folder.
			 * @param contentFolderPath - Absolute path to the content folder
			 * @param contentPath - Relative manifest path like "articles/my-slug" or "series/parent/chapter"
			 */
			async function processContentImages(contentFolderPath: string, contentPath: string) {
				const imagesDir = path.join(contentFolderPath, 'images');

				let images: string[];
				try {
					images = await fs.readdir(imagesDir);
				} catch {
					return; // No images folder
				}

				for (const imageFile of images) {
					const ext = path.extname(imageFile).toLowerCase();
					if (!MIME_TYPES[ext]) continue;

					const imagePath = path.join(imagesDir, imageFile);
					const baseName = path.basename(imageFile, ext);

					try {
						const { usage, ogCrop } = await detectImageUsage(contentFolderPath, imageFile);
						const buffer = await fs.readFile(imagePath);

						const hash = crypto
							.createHash('md5')
							.update(buffer)
							.digest('hex')
							.slice(0, 8);

						const imageOutputDir = path.join(outputRoot, contentPath);
						await fs.mkdir(imageOutputDir, { recursive: true });

						const srcsetParts: string[] = [];
						let coverUrl: string | undefined;
						let ogUrl: string | undefined;
						let defaultUrl: string | undefined;

						if (usage === 'cover' || usage === 'both') {
							const coverName = `${baseName}-${COVER_SIZE.name}-${hash}.webp`;
							const coverPath = path.join(imageOutputDir, coverName);

							await sharp(buffer)
								.resize(COVER_SIZE.width, null, { withoutEnlargement: true })
								.webp({ quality })
								.toFile(coverPath);

							coverUrl = `/${outputDir}/${contentPath}/${coverName}`;

							// OG image: 1200x630 cropped with configurable position (meta.json ogCrop)
							const ogName = `${baseName}-${OG_SIZE.name}-${hash}.webp`;
							const ogPath = path.join(imageOutputDir, ogName);

							await sharp(buffer)
								.resize(OG_SIZE.width, OG_SIZE.height, { fit: 'cover', position: ogCrop })
								.webp({ quality })
								.toFile(ogPath);

							ogUrl = `/${outputDir}/${contentPath}/${ogName}`;
						}

						{
							for (const size of BODY_SIZES) {
								const outputName = `${baseName}-${size.name}-${hash}.webp`;
								const outputPath = path.join(imageOutputDir, outputName);

								await sharp(buffer)
									.resize(size.width, null, { withoutEnlargement: true })
									.webp({ quality })
									.toFile(outputPath);

								srcsetParts.push(
									`/${outputDir}/${contentPath}/${outputName} ${size.width}w`
								);
							}

							const defaultName = `${baseName}-${hash}.webp`;
							const defaultPath = path.join(imageOutputDir, defaultName);

							await sharp(buffer)
								.resize(BODY_SIZES[BODY_SIZES.length - 1].width, null, {
									withoutEnlargement: true
								})
								.webp({ quality })
								.toFile(defaultPath);

							defaultUrl = `/${outputDir}/${contentPath}/${defaultName}`;
						}

						const manifestKey = `${contentPath}/${imageFile}`;
						imageManifest.set(manifestKey, {
							original: `./images/${imageFile}`,
							optimized: defaultUrl || coverUrl || '',
							srcset: srcsetParts.join(', '),
							cover: coverUrl,
							og: ogUrl
						});
					} catch (err) {
						console.warn(`Failed to optimize image: ${imagePath}`, err);
					}
				}
			}

			// Process each content type directory
			for (const typeDir of TYPE_DIRS) {
				const typePath = path.join(contentRoot, typeDir);

				let slugDirs: Dirent[];
				try {
					slugDirs = fss.readdirSync(typePath, { withFileTypes: true });
				} catch {
					continue;
				}

				for (const slugDir of slugDirs) {
					if (!slugDir.isDirectory()) continue;

					const folderPath = path.join(typePath, String(slugDir.name));
					const hasContentMd = fss.existsSync(path.join(folderPath, 'content.md'));

					// For series: check if this is a series parent folder (no content.md)
					if (typeDir === 'series' && !hasContentMd) {
						// Process series-level images (cover etc.)
						await processContentImages(folderPath, `${typeDir}/${String(slugDir.name)}`);

						// Scan chapter subdirectories
						let chapterDirs: Dirent[];
						try {
							chapterDirs = fss.readdirSync(folderPath, { withFileTypes: true });
						} catch {
							continue;
						}

						for (const chapterDir of chapterDirs) {
							if (!chapterDir.isDirectory()) continue;
							const chapterPath = path.join(folderPath, String(chapterDir.name));
							const contentPath = `${typeDir}/${String(slugDir.name)}/${String(chapterDir.name)}`;
							await processContentImages(chapterPath, contentPath);
						}
					} else {
						// Standard flat content folder
						await processContentImages(folderPath, `${typeDir}/${String(slugDir.name)}`);
					}
				}
			}

			// Write manifest to JSON file for SSR to consume
			const manifestPath = path.join(contentRoot, '.image-manifest.json');
			const manifestObj = Object.fromEntries(imageManifest);
			await fs.mkdir(path.dirname(manifestPath), { recursive: true });
			await fs.writeFile(manifestPath, JSON.stringify(manifestObj, null, '\t'));

			// Count by usage type
			let coverCount = 0;
			let bodyCount = 0;
			for (const entry of imageManifest.values()) {
				if (entry.cover && entry.srcset) bodyCount++;
				else if (entry.cover) coverCount++;
				else if (entry.srcset) bodyCount++;
			}
			console.log(`✅ Optimized ${imageManifest.size} content images (${coverCount} cover-only, ${bodyCount} with body sizes)`);
		}
	};
}

// ============================================================================
// URL Transformation Utility
// ============================================================================

// Cached manifest for production (loaded lazily)
let cachedManifest: Map<string, ImageManifestEntry> | null = null;

/**
 * Load image manifest from file (for production SSR).
 * The manifest is written by the plugin during buildStart.
 * Searches common locations for the manifest file.
 */
function loadManifestFromFile(): Map<string, ImageManifestEntry> {
	if (cachedManifest) return cachedManifest;

	// Possible manifest locations (web app structure)
	const possiblePaths = [
		path.join(process.cwd(), 'src/content/.image-manifest.json'),
		path.join(process.cwd(), '../web/src/content/.image-manifest.json')
	];

	for (const manifestPath of possiblePaths) {
		try {
			const content = fss.readFileSync(manifestPath, 'utf-8');
			const obj = JSON.parse(content) as Record<string, ImageManifestEntry>;
			cachedManifest = new Map(Object.entries(obj));
			return cachedManifest;
		} catch {
			// Try next path
		}
	}

	// Manifest file doesn't exist yet (first build or dev mode)
	return new Map();
}

/**
 * Transform relative image URLs in markdown to environment-appropriate paths.
 *
 * Author writes:   ![alt](./images/hero.png)
 * Dev becomes:     ![alt](/@content-images/articles/my-slug/hero.png)
 * Prod becomes:    ![alt](/images/optimized/articles/my-slug/hero-abc123.webp)
 *
 * @param markdown - Markdown content
 * @param typeDir - Type directory (articles, series, etc.)
 * @param slug - Content slug
 * @param isDev - Whether in development mode
 */
export function transformImageUrls(
	markdown: string,
	typeDir: string,
	slug: string,
	isDev: boolean
): string {
	const contentPath = `${typeDir}/${slug}`;

	return markdown.replace(
		/!\[([^\]]*)\]\(\.\/images\/([^)]+)\)/g,
		(match, alt, filename) => {
			if (isDev) {
				// Dev: Use Vite middleware for instant serving
				return `![${alt}](${CONTENT_IMAGE_PREFIX}/${contentPath}/${filename})`;
			}

			// Prod: Look up optimized URL in manifest (load from file)
			const manifest = loadManifestFromFile();
			const key = `${contentPath}/${filename}`;
			const entry = manifest.get(key);

			if (entry) {
				return `![${alt}](${entry.optimized})`;
			}

			// Fallback: construct expected path (shouldn't happen if build ran correctly)
			console.warn(`Image not in manifest: ${key}`);
			return match;
		}
	);
}
