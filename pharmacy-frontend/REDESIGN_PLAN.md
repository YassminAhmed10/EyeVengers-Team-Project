# Pharmacy Redesign Plan - Top Navigation with Animations

## Information Gathered

### Current Structure:
1. **App.jsx** - Main app with left sidebar, header, and content area
2. **Sidebar.jsx** - Left vertical sidebar with navigation menu
3. **Header.jsx** - Top header with search, notifications, profile
4. **Footer.jsx** - Bottom footer with copyright info
5. **Sidebar.css** - Custom styles for sidebar
6. **index.css** - Global styles and animations

### Current Layout:
- Left sidebar (280px width, collapsible to 80px)
- Header with search bar
- Main content area
- Footer

---

## Redesign Plan

### 1. Convert Left Sidebar to Top Navigation Bar
- Move navigation from left side to top horizontal bar
- Create a modern navbar with logo on left and menu items
- Add hamburger menu for mobile responsiveness
- Keep the logo and branding at the top

### 2. Add Smooth Animations
- Page transition animations (fade + slide)
- Menu item hover effects with scale and glow
- Active tab indicator animation
- Loading animations for cards and content
- Staggered entrance animations for list items

### 3. New Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  [Logo]  Dashboard | Inventory | Prescriptions ...  │  <- Top Navbar (60px)
│          [Search]              [Notif] [Dark] [Profile]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  Main Content Area                  │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4. Key Changes by File

#### App.jsx
- Remove sidebar margin-left
- Change layout to top navbar
- Add page transition animations

#### Sidebar.jsx (Rename to TopNavbar.jsx)
- Convert from vertical to horizontal layout
- Add animated active indicator
- Add hover animations
- Keep all menu items

#### Header.jsx
- Integrate into top navbar
- Keep search, notifications, profile dropdown

#### Footer.jsx
- Keep at bottom of content
- Adjust padding

#### index.css / Sidebar.css
- Add new animation keyframes
- Add navbar styles
- Add responsive styles

---

## Implementation Order

1. **Create TopNavbar component** (based on Sidebar.jsx)
2. **Update App.jsx** - new layout structure
3. **Update Header.jsx** - integrate with navbar
4. **Update Footer.jsx** - adjust styling
5. **Update CSS** - add animations and navbar styles
6. **Test and refine**

---

## Dependencies
- Lucide React icons (already installed)
- Tailwind CSS (already configured)
- Framer Motion (optional - can use CSS animations)

---

## Visual Style
- Modern gradient navbar
- Glass-morphism effects
- Smooth transitions (0.3s)
- Subtle shadows and depth
- Rounded corners (12px-16px)

