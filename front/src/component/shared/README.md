# 📚 Component Library - BuddyCoach

Bibliothèque de composants réutilisables pour l'application BuddyCoach.

## 🎯 Objectif

Réduire la duplication de code, améliorer la cohérence visuelle et faciliter la maintenance.

---

## 🧩 Composants Disponibles

### 1. Button

Bouton réutilisable avec plusieurs variantes et états.

**Import :**
```jsx
import { Button } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
// Bouton principal
<Button variant="primary" onClick={handleClick}>
  Cliquer ici
</Button>

// Bouton sport avec chargement
<Button variant="sport" loading={isLoading} fullWidth>
  Connexion
</Button>

// Bouton danger petit
<Button variant="danger" size="sm">
  Supprimer
</Button>
```

**Props :**
- `variant`: `'primary'` | `'sport'` | `'nutrition'` | `'secondary'` | `'danger'` | `'outline'`
- `size`: `'sm'` | `'md'` | `'lg'`
- `loading`: `boolean` - Affiche un spinner
- `disabled`: `boolean`
- `fullWidth`: `boolean` - Prend toute la largeur
- `onClick`: `Function`
- `type`: `'button'` | `'submit'` | `'reset'`

---

### 2. Input

Input de formulaire avec label, erreur et icône optionnels.

**Import :**
```jsx
import { Input } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
// Input simple
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="votre@email.com"
  required
/>

// Input avec erreur
<Input
  label="Mot de passe"
  type="password"
  value={password}
  onChange={handleChange}
  error={errors.password}
/>

// Input avec icône
<Input
  label="Recherche"
  icon={<SearchIcon />}
  value={search}
  onChange={handleSearch}
/>
```

**Props :**
- `label`: `string` - Label de l'input
- `type`: `string` - Type HTML (text, email, password, etc.)
- `value`: `string`
- `onChange`: `Function`
- `placeholder`: `string`
- `required`: `boolean`
- `disabled`: `boolean`
- `error`: `string` - Message d'erreur à afficher
- `icon`: `ReactNode` - Icône à afficher

---

### 3. Modal

Modal/Dialog réutilisable avec gestion du clavier (Escape) et du scroll.

**Import :**
```jsx
import { Modal, useModal } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
function MyComponent() {
  const [isOpen, open, close] = useModal();

  return (
    <>
      <Button onClick={open}>Ouvrir la modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Confirmation"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={close}>Annuler</Button>
            <Button variant="primary" onClick={handleConfirm}>Confirmer</Button>
          </div>
        }
      >
        <p>Êtes-vous sûr de vouloir continuer ?</p>
      </Modal>
    </>
  );
}
```

**Props :**
- `isOpen`: `boolean` - Modal ouverte ou fermée
- `onClose`: `Function` - Callback de fermeture
- `title`: `string` - Titre de la modal
- `children`: `ReactNode` - Contenu
- `footer`: `ReactNode` - Footer personnalisé (optionnel)
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'` | `'full'`
- `showCloseButton`: `boolean` - Afficher le X de fermeture

**Hook useModal :**
```jsx
const [isOpen, open, close] = useModal();
// isOpen: boolean
// open: () => void
// close: () => void
```

---

### 4. Card

Carte réutilisable pour afficher du contenu.

**Import :**
```jsx
import { Card } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
// Card simple
<Card>
  <h3>Titre</h3>
  <p>Contenu de la carte</p>
</Card>

// Card cliquable avec hover
<Card hoverable onClick={handleClick}>
  Cliquez-moi !
</Card>

// Card sans padding
<Card noPadding>
  <img src="banner.jpg" />
  <div className="p-6">
    <h3>Titre</h3>
  </div>
</Card>
```

**Props :**
- `children`: `ReactNode`
- `className`: `string` - Classes additionnelles
- `hoverable`: `boolean` - Effet hover (scale + shadow)
- `onClick`: `Function`
- `noPadding`: `boolean` - Pas de padding interne

---

### 5. Alert

Alerte/notification pour afficher des messages.

**Import :**
```jsx
import { Alert } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
// Succès
<Alert variant="success">
  Profil mis à jour avec succès !
</Alert>

// Erreur avec fermeture
<Alert variant="error" onClose={() => setError(null)}>
  {error}
</Alert>

// Warning
<Alert variant="warning">
  Attention, cette action est irréversible.
</Alert>

// Info
<Alert variant="info">
  Vérifiez votre email pour confirmer votre compte.
</Alert>
```

**Props :**
- `variant`: `'success'` | `'error'` | `'warning'` | `'info'`
- `children`: `ReactNode` - Message
- `onClose`: `Function` - Callback de fermeture (affiche un X)

---

### 6. LoadingSpinner

Spinner de chargement.

**Import :**
```jsx
import { LoadingSpinner } from '../component/shared';
```

**Exemple d'utilisation :**
```jsx
// Spinner simple
<LoadingSpinner />

// Spinner avec texte
<LoadingSpinner size="lg" text="Chargement en cours..." />

// Spinner plein écran
<LoadingSpinner fullScreen text="Chargement..." />

// Spinner personnalisé
<LoadingSpinner size="xl" color="text-nutrition" />
```

**Props :**
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'`
- `color`: `string` - Classe Tailwind de couleur (ex: `'text-sport'`)
- `text`: `string` - Texte à afficher sous le spinner
- `fullScreen`: `boolean` - Spinner plein écran avec backdrop

---

## 📦 Import groupé

```jsx
// Import de plusieurs composants à la fois
import { Button, Input, Modal, useModal, Alert, Card, LoadingSpinner } from '../component/shared';
```

---

## ✅ Avantages

1. **Cohérence visuelle** - Tous les boutons/inputs ont le même style
2. **Moins de code** - Réutilisation au lieu de copier-coller
3. **Maintenabilité** - Modifier 1 fichier au lieu de 30
4. **Type-safe** - Prêt pour TypeScript
5. **Accessible** - Gestion du clavier, ARIA labels, etc.

---

## 🔄 Migration d'un composant existant

**Avant :**
```jsx
<button
  type="submit"
  className="w-full bg-sport hover:brightness-110 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
  disabled={loading}
>
  {loading ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">...</svg>
      Chargement...
    </span>
  ) : (
    'Se connecter'
  )}
</button>
```

**Après :**
```jsx
<Button variant="sport" fullWidth loading={loading} type="submit">
  {loading ? 'Chargement...' : 'Se connecter'}
</Button>
```

**Gain :** 12 lignes → 3 lignes (-75% de code) ✅

---

## 📝 TODO - Composants futurs

- [ ] Select / Dropdown
- [ ] Checkbox / Radio
- [ ] Badge / Tag
- [ ] Tooltip
- [ ] Toast / Notification
- [ ] Tabs
- [ ] Accordion
- [ ] Pagination

---

**Créé le :** 2026-02-15
**Version :** 1.0
