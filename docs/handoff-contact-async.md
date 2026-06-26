# Handoff — contact async (`/contact`) + rendre le CTA visible

> Source : le cockpit (repo privé). Pour l'agent qui travaille sur `johan-chan.fr`. Copie ci-dessous **figée, sans em dash**. Ne la réécris pas.

## Pourquoi

Aujourd'hui la page de réservation `/call` (embed Cal.com, créneau `johan.chan/30min`) **existe mais n'est liée nulle part** (ni nav, ni hero, ni home, ni footer). Personne ne peut la trouver. C'est une fuite de conversion à 100%.

Décision de Johan : **ne pas exposer `/call` en open bar.** Son offre est sélective (il qualifie avant de donner un créneau). Donc :

- La **porte publique** devient un **formulaire de contact async** (`/contact`).
- Johan **trie** les messages et **renvoie lui-même le lien `/call`** aux prospects qualifiés.
- **`/call` reste en place mais non listé** : aucun lien public vers lui. Il est partagé à la main.

## La tâche

1. **Créer la route `/contact`** avec un formulaire (champs ci-dessous). Calque le pattern des autres pages.
2. **Rendre le CTA visible** : bouton **« Me contacter »** vers `/contact`
   - dans le **hero** de la home (CTA primaire),
   - dans la **nav** (`+layout.svelte`, en bouton mis en avant, distinct des liens de contenu),
   - **répété en bas** de `/about` et de la future page `/projets`.
3. **Ne mettre aucun lien public vers `/call`.** Le laisser accessible par URL directe uniquement.

## Le formulaire — comportement

- Champ **email** : requis, validation type email.
- Champ **« Où en êtes-vous ? »** : optionnel, select à 4 options (voir copie).
- Champ **« Qu'est-ce qui est coincé ? »** : requis, textarea (2-3 lignes).
- **Anti-spam** : honeypot natif Formspree via le champ caché `_gotcha` (Formspree ignore la soumission s'il est rempli). Pas de captcha lourd.
- **Envoi** : **Formspree**, endpoint `https://formspree.io/f/mqevpjqj`. Pas de backend à maintenir, les messages arrivent sur l'email du compte Formspree de Johan (à lui de confirmer que c'est la bonne adresse côté Formspree).
- **Intégration (SvelteKit / Svelte 5)** : **POST AJAX via `fetch`**, pas le form HTML basique (qui redirige vers une page Formspree) ni la lib React. Envoyer un `FormData` avec l'en-tête `Accept: application/json` pour garder la **confirmation inline** sans quitter la page. Voir snippet de référence plus bas.

## Copie figée (verbatim, sans em dash)

**Intro (au-dessus du formulaire) :**
> Dites-moi en deux lignes ce qui est coincé. Je réponds vite, et si c'est dans mes cordes, on cale un appel.

**Labels des champs :**
- `Votre email`
- `Où en êtes-vous ?` (options : `Une idée`, `Un prototype ou un POC`, `Déjà en production`, `Autre`)
- `Qu'est-ce qui est coincé ?` (placeholder : `En deux lignes.`)

**Bouton d'envoi :** `Envoyer`

**Confirmation après envoi :**
> Message reçu. Je reviens vers vous rapidement.

**Label du CTA (hero + nav + bas de pages) :** `Me contacter`

## Contraintes

- **Aucun em dash (—)** dans toute la copie sortante.
- Ne pas ajouter de remplissage marketing : ces textes sont volontairement directs.
- Honnêteté : pas de promesse de délai chiffrée autre que « vite » / « rapidement » (Johan ne s'engage pas sur un SLA).
- i18n : si le site est multilingue (paraglide `m[...]`), ajouter les clés correspondantes ; la version FR fait foi.

## Mapping des champs Formspree

| Champ formulaire | `name=` HTML | Note |
| --- | --- | --- |
| Votre email | `email` | Formspree l'utilise comme reply-to |
| Où en êtes-vous ? | `stage` | select optionnel |
| Qu'est-ce qui est coincé ? | `message` | textarea requis |
| (sujet de l'email) | `_subject` | champ caché, ex. `Nouveau contact johan-chan.fr` |
| (honeypot) | `_gotcha` | champ caché anti-spam |

## Snippet de référence (Svelte 5, à styliser/i18n par toi)

> Point de départ, pas du copier-coller final : adapte le style (daisyUI/tailwind), branche les clés i18n paraglide, garde les **chaînes sortantes telles quelles** (sans em dash). L'option vide du select ne doit pas afficher d'em dash.

```svelte
<script lang="ts">
	let status = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = 'submitting';
		const form = e.currentTarget as HTMLFormElement;
		const res = await fetch('https://formspree.io/f/mqevpjqj', {
			method: 'POST',
			headers: { Accept: 'application/json' },
			body: new FormData(form)
		});
		status = res.ok ? 'success' : 'error';
		if (res.ok) form.reset();
	}
</script>

{#if status === 'success'}
	<p>Message reçu. Je reviens vers vous rapidement.</p>
{:else}
	<form onsubmit={submit}>
		<p>Dites-moi en deux lignes ce qui est coincé. Je réponds vite, et si c'est dans mes cordes, on cale un appel.</p>
		<input type="hidden" name="_subject" value="Nouveau contact johan-chan.fr" />
		<input type="text" name="_gotcha" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />

		<label>Votre email
			<input type="email" name="email" required />
		</label>
		<label>Où en êtes-vous ?
			<select name="stage">
				<option value="">Au choix</option>
				<option>Une idée</option>
				<option>Un prototype ou un POC</option>
				<option>Déjà en production</option>
				<option>Autre</option>
			</select>
		</label>
		<label>Qu'est-ce qui est coincé ?
			<textarea name="message" required placeholder="En deux lignes."></textarea>
		</label>

		{#if status === 'error'}<p>Un souci à l'envoi. Réessayez dans un instant.</p>{/if}
		<button type="submit" disabled={status === 'submitting'}>Envoyer</button>
	</form>
{/if}
```

## Décision ouverte restante

- **Adresse de réception** : les messages arrivent sur l'email rattaché au compte Formspree (`mqevpjqj`). Johan : vérifie que c'est bien l'adresse où tu veux les recevoir (réglable dans les settings du formulaire Formspree).
