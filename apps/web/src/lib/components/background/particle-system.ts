import type { ParticleConfig } from './particle-config';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: string;
	phase: number; // For sine wave floating
}

export class ParticleSystem {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private particles: Particle[] = [];
	private config: ParticleConfig;
	private animationId: number | null = null;
	private resizeObserver: ResizeObserver;
	private mouseX = -1000;
	private mouseY = -1000;
	private time = 0;
	private dpr = 1;

	constructor(canvas: HTMLCanvasElement, config: ParticleConfig) {
		this.canvas = canvas;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Could not get canvas context');
		this.ctx = ctx;
		this.config = config;

		// Handle high DPI displays
		this.dpr = Math.min(window.devicePixelRatio || 1, 2);

		// Setup resize observer
		this.resizeObserver = new ResizeObserver(() => this.handleResize());
		this.resizeObserver.observe(canvas.parentElement || canvas);

		this.handleResize();
		this.initParticles();
		this.start();
	}

	private handleResize(): void {
		const parent = this.canvas.parentElement;
		const width = parent?.clientWidth || window.innerWidth;
		const height = parent?.clientHeight || window.innerHeight;

		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
		this.ctx.scale(this.dpr, this.dpr);
	}

	private initParticles(): void {
		const width = this.canvas.width / this.dpr;
		const height = this.canvas.height / this.dpr;

		this.particles = [];
		for (let i = 0; i < this.config.count; i++) {
			this.particles.push(this.createParticle(width, height));
		}
	}

	private createParticle(width: number, height: number): Particle {
		const { colors, minSize, maxSize, baseSpeed } = this.config;
		return {
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * baseSpeed,
			vy: (Math.random() - 0.5) * baseSpeed,
			size: minSize + Math.random() * (maxSize - minSize),
			color: colors[Math.floor(Math.random() * colors.length)],
			phase: Math.random() * Math.PI * 2
		};
	}

	updateConfig(newConfig: ParticleConfig): void {
		const oldCount = this.config.count;
		this.config = newConfig;

		// Update existing particle colors
		const colors = newConfig.colors;
		this.particles.forEach((p) => {
			p.color = colors[Math.floor(Math.random() * colors.length)];
		});

		// Adjust particle count if needed
		const width = this.canvas.width / this.dpr;
		const height = this.canvas.height / this.dpr;

		if (newConfig.count > oldCount) {
			for (let i = oldCount; i < newConfig.count; i++) {
				this.particles.push(this.createParticle(width, height));
			}
		} else if (newConfig.count < oldCount) {
			this.particles.length = newConfig.count;
		}
	}

	setMousePosition(x: number, y: number): void {
		this.mouseX = x;
		this.mouseY = y;
	}

	clearMousePosition(): void {
		this.mouseX = -1000;
		this.mouseY = -1000;
	}

	private update(): void {
		const width = this.canvas.width / this.dpr;
		const height = this.canvas.height / this.dpr;
		const { mouseRadius, interactionStrength, floatAmplitude, floatFrequency, baseSpeed } =
			this.config;

		this.time++;

		for (const p of this.particles) {
			// Gentle floating motion (sine wave)
			const floatOffsetX = Math.sin(this.time * floatFrequency + p.phase) * floatAmplitude;
			const floatOffsetY = Math.cos(this.time * floatFrequency * 0.7 + p.phase) * floatAmplitude;

			// Apply floating
			p.x += p.vx + floatOffsetX;
			p.y += p.vy + floatOffsetY;

			// Mouse interaction (push away)
			const dx = p.x - this.mouseX;
			const dy = p.y - this.mouseY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < mouseRadius && distance > 0) {
				const force = ((mouseRadius - distance) / mouseRadius) * interactionStrength;
				p.vx += (dx / distance) * force;
				p.vy += (dy / distance) * force;
			}

			// Apply friction
			p.vx *= 0.98;
			p.vy *= 0.98;

			// Clamp velocity
			const maxVel = baseSpeed * 3;
			p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
			p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

			// Edge wrapping (seamless)
			if (p.x < -p.size) p.x = width + p.size;
			if (p.x > width + p.size) p.x = -p.size;
			if (p.y < -p.size) p.y = height + p.size;
			if (p.y > height + p.size) p.y = -p.size;
		}
	}

	private draw(): void {
		const width = this.canvas.width / this.dpr;
		const height = this.canvas.height / this.dpr;

		// Reset transform and clear
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.ctx.clearRect(0, 0, width, height);

		// Draw particles
		for (const p of this.particles) {
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			this.ctx.fillStyle = p.color;
			this.ctx.fill();
		}
	}

	private loop = (): void => {
		this.update();
		this.draw();
		this.animationId = requestAnimationFrame(this.loop);
	};

	start(): void {
		if (this.animationId === null) {
			this.loop();
		}
	}

	stop(): void {
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	destroy(): void {
		this.stop();
		this.resizeObserver.disconnect();
		this.particles = [];
	}
}
