# Design System: SelfTwin
## Style Guidelines
The brand personality is clinical yet premium, evoking the feeling of a high-end laboratory or a high-performance terminal. It avoids "soft" AI tropes in favor of a technical, angular, and authoritative visual language.

The style is a hybrid of **Minimalism** and **Emerald Glassmorphism**. It utilizes extreme contrast between deep, near-black surfaces and vibrant, neon-adjacent emerald accents. Geometric rigidity is a core principle, emphasizing structured information over organic flow.

## Colors
- **Primary Emerald (#00CC66):** Used for critical actions, active states, and brand-defining accents.
- **Teal Accent (#00B3B3):** Used for secondary interactive elements or to differentiate data types.
- **Background:** #0d150e

## Typography
Headlines are tight and heavy to command attention, while body text prioritizes generous line heights for readability in dark mode. **Inter** for UI, **JetBrains Mono** for data.

## Elevation & Depth
Depth is achieved through **Emerald Glassmorphism** (20px blur) and tinted shadows: `0 8px 32px rgba(0, 204, 102, 0.15)`.

## Shapes
Rounded corners are prohibited (0px radius). All containers, buttons, and inputs feature sharp 90-degree angles. User and AI avatars are strictly **hexagon** clipped.

---
## Technical Tokens (JSON)
```json
{
  "colorVariant": "FIDELITY",
  "overridePrimaryColor": "#00CC66",
  "overrideSecondaryColor": "#00B3B3",
  "theme": {
    "colorMode": "DARK",
    "font": "INTER",
    "customColor": "#00CC66",
    "namedColors": {
      "background": "#0d150e",
      "primary": "#41e97f",
      "secondary": "#4fdad9",
      "surface": "#0d150e"
    }
  }
}
```
