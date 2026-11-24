# vincentdeschamps.dev — Portfolio

Portfolio personnel de **Vincent Deschamps**, étudiant en L3 Informatique et candidat Master Cybersécurité.

🌐 **[vincentdeschamps.dev](https://vincentdeschamps.dev)**

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Markup | HTML5 sémantique (sections, article, nav, aria-*) |
| Style | CSS3 pur — custom properties, Grid, Flexbox, `clamp()` |
| Script | JavaScript ES2020+ pur — aucun framework, aucune dépendance |
| Police | Police système (`system-ui`, `-apple-system`) — aucun appel réseau |
| Hébergement | GitHub Pages (CNAME → `vincentdeschamps.dev`) |

**Aucune dépendance externe. Aucun CDN. Aucun tracker.**

---

## Sécurité

### Content-Security-Policy (CSP) stricte

La balise `<meta http-equiv="Content-Security-Policy">` dans `index.html` applique la politique suivante :

```
default-src 'none';
script-src  'self';
style-src   'self' 'unsafe-inline';
img-src     'self' data:;
connect-src 'none';
font-src    'none';
frame-src   'none';
object-src  'none';
base-uri    'self';
```

- `default-src 'none'` — tout bloqué par défaut.
- `script-src 'self'` — seul `script.js` local est autorisé.
- `style-src 'unsafe-inline'` — nécessaire pour les transitions CSS dynamiques ; aucune feuille externe chargée.
- `connect-src 'none'` — aucune requête réseau depuis le JS (pas de XHR, pas de fetch).
- `font-src 'none'` — polices système uniquement, zéro fingerprinting via Google Fonts.

> Pour une CSP encore plus stricte en production via un vrai serveur HTTP, déplacer la directive dans un header `Content-Security-Policy` et remplacer `'unsafe-inline'` par un `nonce` sur chaque balise `<style>`.

---

## Performances

- **Visuel du héros généré en Canvas** : aucune photo ni ressource externe pour le globe.
- **Canvas particle network** dans le héros : pause automatique via `visibilitychange` quand l'onglet est masqué.
- **IntersectionObserver** pour le scroll-reveal : aucun listener `scroll` global (sauf le nav).
- **`prefers-reduced-motion`** respecté : toutes les animations sont désactivées si l'OS le demande.
- Globe du héros : rendu Canvas procédural avec maillage sphérique et mouvement lent.
- Logo de navigation : `logo.svg`. Icône ronde de l’onglet : `favicon.svg`, avec `favicon.png` comme fallback.

---

## Structure des fichiers

```
vincentdchps.github.io/
├── index.html   # Markup HTML5 sémantique
├── style.css    # Design system + responsive + animations
├── script.js    # Nav, reveal, counters, canvas, copy email, scroll spy
├── logo.svg     # Logo vectoriel de navigation
├── favicon.svg  # Favicon vectoriel rond
├── logo.png     # Icône Apple Touch
├── favicon.png  # Fallback PNG pour l’onglet
├── CNAME        # → vincentdeschamps.dev
└── README.md    # Ce fichier
```

---

## Fonctionnalités JS

| Module | Mécanisme |
|--------|-----------|
| Nav scroll | `window.scroll` passif → toggle `.scrolled` |
| Menu mobile | Toggle ARIA `aria-expanded` + classe `.open` |
| Scroll reveal | `IntersectionObserver` (threshold 12 %) |
| Compteurs animés | `requestAnimationFrame` + easing `easeOut` cubique |
| Copier l'e-mail | `navigator.clipboard.writeText` + fallback `execCommand` |
| Canvas réseau | Particules `requestAnimationFrame`, pause sur `visibilitychange` |
| Globe réseau | Projection sphérique Canvas, maillage et particules animés |
| Scroll spy | `IntersectionObserver` sur `section[id]`, `aria-current` |

---

## Déploiement

```bash
git add .
git commit -m "feat: portfolio initial"
git push origin main
```

GitHub Pages publie automatiquement depuis la branche `main`. Le CNAME redirige vers `vincentdeschamps.dev`.

---

## Licence

Code source : [MIT](https://opensource.org/licenses/MIT) — Vincent Deschamps, 2026.
