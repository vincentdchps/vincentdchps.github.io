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

- **Image du héros stockée localement** : aucun appel externe pour le visuel NASA.
- **Canvas particle network** dans le héros : pause automatique via `visibilitychange` quand l'onglet est masqué.
- **IntersectionObserver** pour le scroll-reveal : aucun listener `scroll` global (sauf le nav).
- **`prefers-reduced-motion`** respecté : toutes les animations sont désactivées si l'OS le demande.
- Image du héros : photo locale de la Terre prise depuis l'ISS (NASA/Jessica Meir).
- Le visuel NASA est conservé dans `assets/earth-at-night.jpg` pour éviter une requête externe.
- Source et crédit : [NASA — Space Station View of Earth at Night](https://www.nasa.gov/image-article/space-station-view-of-earth-at-night/).

---

## Structure des fichiers

```
vincentdchps.github.io/
├── index.html   # Markup HTML5 sémantique
├── style.css    # Design system + responsive + animations
├── script.js    # Nav, reveal, counters, canvas, copy email, scroll spy
├── assets/
│   └── earth-at-night.jpg # Photo NASA/Jessica Meir
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
| Photo du héros | Image NASA locale, superposée au canvas réseau |
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
