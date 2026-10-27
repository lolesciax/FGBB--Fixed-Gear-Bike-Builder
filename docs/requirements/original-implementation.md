# MASTER IMPLEMENTATION PROMPT
# TRACKLAB — HYBRID 2D & 3D FIXED-GEAR BIKE BUILDER

## ROLE AND RESPONSIBILITIES

Act as a Senior Full-Stack Engineer, Software Architect, UI/UX Designer, 3D Web Developer, Database Architect, Security Engineer, and Quality Assurance Engineer.

Your responsibility is to design and implement **TrackLab**, a production-ready, responsive, hybrid 2D and 3D fixed-gear bicycle configurator.

This must be a functional application, not a static mockup, simple landing page, or visual-only demonstration.

Implement the system using clean architecture, maintainable code, reusable components, comprehensive validation, secure APIs, responsive design, and appropriate testing.

**Mandatory development rules:**

1. Inspect the existing repository before writing or modifying code. If no repository exists, initialize the recommended architecture.
2. Follow existing design conventions, dependencies, components, and configuration where applicable.
3. Do not unnecessarily redesign existing working modules.
4. Do not invent product specifications, prices, brand partnerships, or compatibility claims.
5. Do not hardcode catalog data into frontend components.
6. Do not introduce unlimited configuration creation, unlimited saved builds, or unrestricted API usage.
7. Keep sensitive operations and quota enforcement on the backend.
8. Keep the entire application responsive, accessible, theme-aware, and optimized.
9. Never remove working features to simplify implementation.
10. Run appropriate tests and report the actual results, including any limitations.
11. Do not claim incomplete modules are finished.
12. Implement incrementally, following the phases below, without replacing functional code with placeholders.

---

# 1. PROJECT OVERVIEW

**Project Name:** TrackLab

**Application Type:** Interactive Fixed-Gear Bicycle Builder and Personal Bike Garage

**Platform:** Responsive Web Application and Progressive Web App

**Primary Users:** Fixed-gear enthusiasts, bicycle collectors, hobbyists, and users who want to design and visualize their preferred bicycle configurations.

## Main Objective

Allow users to create realistic fixed-gear bicycle configurations by selecting different bicycle parts from actual manufacturers.

The application must support:

- Interactive 2D bicycle customization.
- Interactive 3D bicycle visualization.
- Real bicycle brands and model variants.
- Frameset and individual component customization.
- Component specifications.
- Compatibility checking.
- Guest preview access with strict limitations.
- Registered accounts with limited saved configurations.
- Personal bike garage.
- Build management and sharing.
- Optional verified retailer pricing.
- Brand ownership acknowledgments.
- Secure and rate-limited APIs.
- Administrative catalog maintenance.
- Fully responsive mobile and desktop interfaces.

The application must work as a standalone generic system where users have separate accounts and private build collections.

---

# 2. REQUIRED TECHNOLOGY STACK

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Lucide icons

## Rendering

**2D:**
- SVG-based bicycle composition.
- React rendering components.
- Dynamic layer positioning.
- Configurable parts and transformations.

**3D:**
- Three.js
- React Three Fiber
- Drei
- GLB/glTF assets
- Modular 3D component assembly.
- Optimized 3D asset loading.

## Backend

- Node.js
- Express.js
- TypeScript
- Zod validation.
- Centralized API error handling.
- Secure authentication and session management.
- Server-side authorization and quota enforcement.

## Database and Infrastructure

- MongoDB Atlas
- Mongoose
- Redis-compatible centralized rate-limit storage, such as a managed Redis service.
- Object storage and CDN for images, SVG assets, GLB models, and textures.

## Testing

- Vitest
- React Testing Library
- Supertest
- Playwright
- TypeScript checking
- ESLint

## Deployment

- Vercel for frontend.
- Render for backend.
- MongoDB Atlas for database.
- Managed Redis-compatible service for rate limits.
- CDN/object storage for media.
- Installable PWA.

Use compatible current stable package versions, verified against their official documentation.

---

# 3. APPLICATION ACCESS AND USER TYPES

TrackLab must support three authorization levels.

## 3.1 Guest

A guest is an unauthenticated visitor.

Guest access is intended only to demonstrate the bike builder.

Guests must not receive the same privileges as registered accounts.

Guests can:

- View the landing page.
- Browse the public brand and component catalog.
- View public build details.
- Open the limited bike builder.
- Customize one temporary bicycle.
- Switch components within strict usage limits.
- Use the basic 2D viewer.
- Access one limited 3D preview per rolling 24-hour period.
- View available specifications.
- Read compatibility feedback.
- Register or sign in.

Guests cannot:

- Save bike configurations.
- Create permanent builds.
- Access My Garage.
- Publish builds.
- Export saved configurations.
- Duplicate saved public builds into a personal garage.
- Use unrestricted 3D preview sessions.
- Bypass component-change limits.
- Manage the catalog.
- Access private data.
- Access administrative functions.

**Guest quotas:**

| Resource | Limit |
|---|---|
| Simultaneous temporary builds | 1 |
| Component changes | 12 per rolling 24 hours |
| 3D preview grants | 1 per rolling 24 hours |
| Permanently saved builds | 0 |
| Public build publishing | 0 |
| Exporting builds | Not allowed |

A temporary guest build must remain in application memory only, rather than becoming a permanent server-side build or local saved configuration.

Refreshing or closing the page may discard the temporary configuration. Explain this clearly before the guest leaves the workspace.

Guest usage counters must survive page reloads and simple session resets.

Use a signed, server-issued guest identifier stored in a secure first-party cookie, plus centralized quota counters.

Apply proportionate IP-based abuse detection as a secondary measure, taking shared networks into account. Do not rely exclusively on IP addresses or invasive browser fingerprinting.

Do not claim these controls can prevent every attempt to circumvent a public client application. Enforce official builder actions through server-validated requests.

When guests reach their limit:

- Prevent further official component selection operations.
- Keep the current bicycle visible.
- Explain which limit has been reached.
- Display the quota reset time.
- Offer registration or login for expanded functionality.
- Never discard their current work silently.

Guest browsing and opening specification panels must not unnecessarily consume component-change quotas.

A quota-consuming change is a successfully accepted selection of a different product variant or supported configurable option. Navigating categories, rotating the preview, selecting an already-selected item, or receiving a failed compatibility validation must not consume this quota.

## 3.2 Registered User

Registered users have accounts and can permanently save their bicycle builds.

Registered users can:

- Access the complete available component catalog.
- Use both 2D and supported 3D rendering modes.
- Customize compatible components.
- Save bicycle configurations.
- Edit existing saved configurations.
- Delete saved builds.
- Duplicate builds within their quotas.
- Access their private garage.
- View component specifications.
- Use compatibility checking.
- Generate permitted build screenshots.
- Publish supported builds through shareable public links.
- Manage their profile and appearance settings.

**Default registered-user quotas:**

| Resource | Limit |
|---|---|
| Active saved builds | 5 |
| New builds created | 3 per rolling 24 hours |
| New builds created | 20 per rolling 30 days |
| Concurrent active editor | 1 editor per build, with conflict detection |
| Save/update requests | 30 per hour |
| Successful 3D preview activations | Subject to reasonable API/asset rate limits |
| Publicly published builds | Maximum 3 |
| Export requests | 5 per rolling 24 hours |

Users may edit existing builds without consuming another build slot.

Creating a duplicate consumes a new build slot and creation quota.

Deleting a build frees its active slot, but must not refund the historical build-creation quota. This prevents unlimited creation through repeated deletion.

Where soft deletion is used, clearly define whether a build consumes a slot while recoverable. Apply the same rule consistently throughout the UI and backend.

Saving a modified existing build must not be treated as creating a new build.

When a user reaches five saved builds:

- Disable creation and duplication actions.
- Continue allowing permitted editing.
- Show a clear informational message.
- Explain that a build must be deleted before another can be created.
- Never silently overwrite a saved build.

All limits must be enforced server-side and safely handle simultaneous requests.

## 3.3 Administrator

Administrators manage the catalog and application configuration.

Administrators may:

- Manage brands.
- Manage products and variants.
- Add verified specifications.
- Publish or archive models.
- Register 2D and 3D assets.
- Review asset usage permissions.
- Manage compatibility metadata.
- Configure public disclaimers.
- Manage verified pricing providers.
- Configure permitted usage limits within system guardrails.
- View aggregate API usage.
- Review error and abuse logs.
- Maintain public catalog information.

Administrative functions must use explicit authorization checks and must never be accessible by guest or standard user sessions.

---

# 4. AUTHENTICATION AND ACCOUNT MANAGEMENT

Implement secure authentication using backend-managed sessions.

Required functionality:

1. Register.
2. Sign in.
3. Sign out.
4. Account email verification.
5. Forgot password.
6. Password reset.
7. Change password.
8. View profile.
9. Update allowed account information.
10. Revoke active sessions.
11. Delete account and associated personal data according to the retention policy.

Security requirements:

- Use secure, HttpOnly cookies.
- Use appropriate SameSite settings for the actual deployed origins.
- Implement CSRF protection for cookie-authenticated mutations.
- Hash passwords with a suitable modern password hashing algorithm.
- Never expose passwords or password hashes.
- Never store authentication secrets in localStorage.
- Use short-lived recovery tokens.
- Rate-limit sensitive authentication operations.
- Prevent account enumeration where practical.
- Rotate sessions after authentication and sensitive changes.
- Validate authorization on every protected operation.

Do not require authentication merely to browse the catalog.

Registration should clearly communicate its main purpose: saving and managing bicycle builds.

---

# 5. RATE LIMITING AND ABUSE PREVENTION

Implement centralized, configurable rate limiting.

Do not rely exclusively on frontend throttling or in-memory Express counters.

Use Redis-backed atomic counters or an equivalent distributed rate-limiting solution.

## 5.1 Default API limits

| Endpoint category | Default limit |
|---|---|
| Public catalog requests | 60/minute per client |
| Authenticated catalog requests | 120/minute per account |
| General API requests | 120/minute per authenticated account |
| Guest build mutations | 12/24 hours per guest |
| Guest 3D preview grants | 1/24 hours per guest |
| Compatibility checks | 30/minute per authenticated account |
| Build saves/updates | 30/hour per account |
| New build creation | 3/24 hours and 20/30 days per account |
| Build exports | 5/24 hours per account |
| Login attempts | 5/15 minutes per account identifier and relevant client signal |
| Registration attempts | 3/hour per client |
| Password recovery requests | 3/hour per account identifier and relevant client signal |
| Administrative write operations | Separate stricter policy |

These values are initial defaults and must be configurable.

Implement an additional infrastructure-level abuse threshold without unfairly blocking legitimate users behind shared public or school networks.

## 5.2 Enforcement

Every protected endpoint must:

- Identify the appropriate quota subject.
- Validate the subject's permissions.
- Enforce applicable short-term rate limits.
- Enforce long-term business quotas.
- Prevent counter races.
- Avoid charging successful-operation quotas for failed operations.
- Return consistent error responses.

Use HTTP 429 for request rate limits.

Include `Retry-After` where appropriate.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You've reached the allowed number of requests.",
    "retryAfterSeconds": 120
  }
}
```

Business quota exhaustion should use a distinct machine-readable code, such as `BUILD_LIMIT_REACHED`, with an appropriate HTTP status.

## 5.3 Additional protections

- Maximum request body size.
- Maximum query page size.
- Pagination limits.
- API timeouts.
- Input validation.
- Rate-limited search.
- Upload restrictions.
- Safe file type handling.
- SSRF protection for externally fetched resources.
- No unbounded batch operations.
- Restricted CORS origins.
- Security headers.
- Audit logs.
- Request tracing.
- Provider-specific external API quotas.
- Provider spending limits and billing alerts.

Create reusable middleware for rate limits, permission enforcement, and quota validation.

---

# 6. BRAND AND MODEL CATALOG

TrackLab must support genuine bicycle manufacturers and real product models.

## 6.1 Initial candidate brands

Frame and bicycle manufacturers:

- Cinelli
- Dosnoventa
- Engine11
- Leader
- Tsunami

Potential additional component manufacturers:

- SRAM
- Shimano
- Miche
- Sugino
- H Plus Son
- Velocity
- Continental
- KMC
- Brooks

These are candidate brands only.

Before publishing models or product representations, verify the manufacturer's identity, relevant product catalog, technical specifications, and asset permissions.

Do not assume that every listed brand makes every component category or that every current/historical model is available.

## 6.2 Brand records

Each brand should contain:

- Brand ID.
- Brand name.
- Slug.
- Manufacturer website.
- Description.
- Supported component categories.
- Country of origin, if verified.
- Logo asset, if its usage is permitted.
- Brand acknowledgment text.
- Affiliation/permission status.
- Source references.
- Publication status.
- Creation and update timestamps.

## 6.3 Product records

Each product should contain:

- Product ID.
- Brand reference.
- Product name.
- Model identifier.
- Model year or revision, when applicable.
- Component category.
- Product description.
- Technical specifications.
- Variant references.
- Compatible interfaces.
- Manufacturing or geometry details when verified.
- Approved media assets.
- Manufacturer source URL.
- Source verification date.
- Catalog status.
- 2D support status.
- 3D support status.
- Availability of verified retailer offers.

Product variants must be modeled independently.

For example, two frame sizes must not automatically share the same geometry or fitment information.

## 6.4 Data integrity

- Never fabricate model names.
- Never invent specifications.
- Never assume compatibility based only on brand.
- Never represent a product as available without source information.
- Never automatically publish imported product records.
- Archive discontinued catalog items instead of destroying references used by saved builds.
- Store specification provenance and verification dates.

---

# 7. BRAND DISCLAIMER AND OWNERSHIP STATEMENTS

This section is mandatory.

TrackLab is an independent project and must not falsely imply endorsement, partnership, sponsorship, or authorization from featured bicycle manufacturers.

## 7.1 Required global disclaimer

Display the following statement in appropriate sections:

**Brand & Trademark Disclaimer**

"TrackLab is an independent bicycle customization and visualization platform. TrackLab is not affiliated with, sponsored by, or officially endorsed by Cinelli, Dosnoventa, or any other bicycle brand featured in this application. All brand names, trademarks, product names, and logos remain the property of their respective owners. Brand and product references are provided for identification and informational purposes. Product specifications, visual representations, and compatibility information may be incomplete or subject to change."

## 7.2 Required technical disclaimer

Display this in the builder's specification or compatibility information:

"TrackLab provides bicycle visualization and component compatibility information for planning purposes only. Visual representations may be illustrative, and compatibility results are based on the specifications currently available. Always verify measurements, component suitability, and safe assembly requirements with the manufacturer or a qualified bicycle mechanic."

## 7.3 Placement

Place relevant disclosures in:

- Website footer.
- About TrackLab page.
- Dedicated Brand Acknowledgments page.
- Brand details pages.
- Relevant product details.
- Builder help/information panel.
- Exported build information when brand identification is included.

Use a concise statement with an accessible link to the complete policy instead of repeating a lengthy notice inside every component card.

## 7.4 Brand-specific acknowledgments

Support database-managed statements for individual brands.

For example:

"Cinelli is a trademark of its respective owner. TrackLab is an independent project and is not officially affiliated with Cinelli."

Use equivalent wording for other brands without suggesting legal permission that has not been granted.

## 7.5 Intellectual property requirements

A disclaimer does not automatically grant rights to reproduce logos, product photos, or 3D models.

Therefore:

- Verify permission before using protected manufacturer imagery or assets.
- Prefer licensed, authorized, or independently created assets.
- Do not extract proprietary 3D models without authorization.
- Do not remove required copyright notices.
- Do not suggest brand partnerships that do not exist.
- Maintain records of licenses and permitted uses.
- Support removal or replacement of disputed assets.
- Use text-based brand identification when visual trademark usage is not cleared.

Create a dedicated data field to track asset licensing and permissions.

---

# 8. COMPONENT CUSTOMIZATION SYSTEM

The application must use a reusable, variant-aware bicycle component system.

## Categories

### Frameset
- Frame.
- Fork.
- Frame size.
- Frame finish.
- Headset.
- Frame-specific hardware.

### Wheels
- Front wheel.
- Rear wheel.
- Front hub.
- Rear hub.
- Rim.
- Spokes, when individually supported.

### Tires
- Front tire.
- Rear tire.
- Tire specifications.

### Cockpit
- Handlebar.
- Stem.
- Grips or bar tape.

### Drivetrain
- Crankset.
- Bottom bracket.
- Chainring.
- Chain.
- Rear cog.
- Lockring.

### Seating
- Saddle.
- Seatpost.
- Seat clamp.

### Contact points
- Pedals.
- Compatible foot-retention accessories.

### Braking
- Front braking components.
- Rear braking components.
- Compatible mounting equipment.

### Accessories
- Compatible mounts.
- Bottle cages.
- Supported decorative and functional accessories.

Do not automatically add optional components when the selected frame does not support their mounting system.

Maintain separate part slots for components that can differ between the front and rear of the bicycle.

Support component bundles and framesets that already include certain parts.

Prevent duplicate selection or billing of bundled components.

---

# 9. COMPONENT COMPATIBILITY ENGINE

Implement a structured compatibility engine.

The engine must evaluate selected product variants and their required interfaces.

## Essential rules

- Frame and fork compatibility.
- Headset and steerer compatibility.
- Dropout and axle specifications.
- Wheel diameter.
- Tire clearance.
- Tire-to-rim compatibility.
- Bottom bracket shell.
- Crankset and spindle compatibility.
- Chainring mounting specifications.
- Chain width and cog compatibility.
- Chainline where sufficient data exists.
- Seatpost dimensions.
- Stem and handlebar clamping dimensions.
- Brake mounting compatibility.
- Frame-specific hardware requirements.

## Compatibility results

Use three states:

**Compatible**
Available verified data satisfies implemented compatibility rules.

**Incompatible**
A known required specification is not satisfied.

**Needs Verification**
Relevant technical information is incomplete.

Never display "Compatible" simply because no failing rule was executed.

The engine must return:

- Overall validation state.
- Individual rule results.
- Affected component IDs.
- Human-readable explanations.
- Missing required measurements.
- Suggested next actions.
- Source references when available.

## Selection behavior

When users select a new component:

1. Check their access and quotas.
2. Validate the requested variant.
3. Evaluate compatibility with existing components.
4. Reject invalid selections or explicitly allow an incomplete draft with a warning, according to the operation's defined policy.
5. Show the result.
6. Update the shared bike configuration.
7. Update both renderers.
8. Recalculate displayed specifications.

If changing a frame invalidates existing components, identify the affected parts and request appropriate replacement decisions.

Do not silently swap components.

## Calculated specifications

Calculate:

- Gear ratio.
- Gear inches, if effective wheel diameter is known.
- Relevant component dimensions.
- Known component weights.
- Total known weight, clearly indicating incomplete totals.
- Number of selected parts.
- Number of unresolved compatibility checks.

Do not add cost calculations unless the verified pricing module is active and sufficiently complete.

---

# 10. HYBRID 2D AND 3D RENDERING

Both rendering modes must use the same canonical bicycle configuration.

Never create separate incompatible customization models for 2D and 3D.

## 10.1 Shared configuration store

Use Zustand for builder state.

Track:

- Build identifier.
- Selected product variants by slot.
- Frame size.
- Supported color/finish options.
- Camera/view preferences.
- Selected component category.
- Compatibility results.
- Undo/redo history.
- Unsaved changes.
- Loading states.
- Usage quotas.
- Current viewer mode.

Use reusable typed domain models.

## 10.2 2D builder

Implement:

- Accurate side-profile composition.
- Layered SVG assets.
- Consistent scaling.
- Standardized attachment anchors.
- Component highlighting.
- Component swapping.
- Pan and zoom.
- Reset view.
- Loading states.
- Fitment warnings.
- Component information overlays.

Use a consistent coordinate system.

Frame geometry should determine where other components are attached.

Avoid manually positioned unrelated image overlays that break when components are changed.

## 10.3 3D builder

Implement:

- Interactive 3D scene.
- Camera rotation.
- Zoom.
- Camera reset.
- Side/front/rear/three-quarter views.
- Component selection.
- Material and finish support.
- Studio lighting.
- Optimized loading.
- Lazy-loaded GLB assets.
- Device capability checks.
- Graceful fallback to 2D.

3D assemblies must use standardized units, orientation, coordinate systems, and part attachment transforms.

Do not represent a generic 3D placeholder as an authentic branded product.

For unsupported components, either display a clearly labeled illustrative representation or explain that authentic 3D visualization is unavailable.

The application must remain functional when WebGL is unavailable.

## 10.4 Guest 3D restriction

Guests receive one authorized 3D preview activation per rolling 24-hour period.

The preview should use a limited approved demonstration setup.

Require server authorization before issuing protected preview session access through the normal application flow.

Avoid claiming that browser-side timeouts or public assets provide tamper-proof digital rights enforcement.

Registered users may access supported 3D builds within normal system rate limits.

## 10.5 Performance

- Lazy-load Three.js and the 3D viewer.
- Avoid loading 3D assets on the landing page.
- Compress geometry and textures where appropriate.
- Use efficient material reuse.
- Avoid unnecessary React rerenders.
- Dispose of unused 3D resources.
- Support lower graphical quality on weaker devices.
- Use request cancellation for outdated asset loads.
- Preserve a responsive UI while loading.

---

# 11. PRICING SYSTEM — OPTIONAL, VERIFIED SOURCES ONLY

Do not implement manual or guessed product prices.

Pricing must be hidden by default.

The product should remain fully usable without pricing information.

## 11.1 Legitimate pricing integrations

Create a provider-based architecture capable of connecting to approved:

- Manufacturer product feeds.
- Authorized retailer APIs.
- Partner catalog feeds.
- Shopify Storefront APIs for approved individual stores.
- WooCommerce Store APIs for approved individual stores.

Research and verify the provider's actual API, access rights, display requirements, and permitted reuse before enabling the integration.

Do not assume a commerce platform API gives access to prices from all stores using that platform.

Marketplaces such as eBay must not be treated as authoritative manufacturer MSRP sources. Any future marketplace integration must clearly identify seller listing prices and meet the marketplace's access and usage terms.

Do not scrape websites or bypass restrictions to obtain prices.

## 11.2 Provider interface

Create a reusable `PricingProvider` interface.

Each provider should support, where available:

- Finding exact product variants.
- Retrieving current advertised prices.
- Returning currency information.
- Returning retailer information.
- Returning an official product/listing URL.
- Returning timestamps.
- Reporting unavailable or invalid data.
- Handling API errors and limits.

## 11.3 Product matching

Prices may be attached only after verified product identity matching.

Match using:

- Manufacturer.
- Product model.
- Manufacturer part number or SKU.
- GTIN, when available.
- Size or variant.
- Color/finish where relevant.
- Product revision/year where necessary.

Never match solely using a similar product name.

If a product match is ambiguous, exclude the offer.

## 11.4 Pricing records

Maintain a separate `price_offers` collection.

Fields:

- Product variant reference.
- Approved provider identifier.
- Retailer name.
- Original amount.
- Currency.
- Source URL.
- Retrieved timestamp.
- Last verified timestamp.
- Offer availability.
- Matching confidence/status.
- Provider-specific listing identifier.
- Active/expired state.

## 11.5 Pricing interface

When pricing is enabled and verified, display:

- Exact advertised price.
- Currency.
- Retailer or authorized source.
- Timestamp of the latest successful verification.
- Link to the source product listing.
- Appropriate retailer or listing disclaimer.

Example format:

`PHP [verified amount] · [Retailer] · Updated [timestamp]`

The amount must come from a valid provider response, not placeholder data.

Do not mix different currencies into one total without a separately verified exchange-rate policy.

Do not describe an aggregate as a final purchase price if taxes, shipping, availability, or required parts are unknown.

## 11.6 Fail-safe behavior

If pricing is unavailable, unverified, stale, or prohibited by provider terms:

- Do not show a fabricated price.
- Do not display zero as the product price.
- Do not show unsupported totals.
- Hide budget filtering if meaningful pricing is unavailable.
- Optionally show "No verified retailer price available."
- Keep the entire builder functional.

For v1, keep `PRICING_ENABLED=false` until an authorized, working source is established.

## 11.7 External API protection

- Fetch provider data through the backend.
- Protect API keys.
- Use domain allowlists.
- Use request timeouts.
- Cache results.
- Apply refresh intervals.
- Respect provider rate limits.
- Implement exponential backoff and circuit breaking.
- Avoid calls on every component click.
- Log failed integrations.
- Use spending limits where available.
- Never expose private credentials.

Pricing is an optional enhancement, not a dependency of the core builder.

---

# 12. MAIN APPLICATION PAGES

## 12.1 Landing Page

Create a premium, visually engaging homepage.

Include:

- TrackLab branding.
- Main navigation.
- Introductory hero section.
- Featured bicycle visualization.
- Start Building action.
- 2D/3D feature explanation.
- Supported brands section.
- How It Works.
- Sample bike configurations.
- Guest access explanation.
- Benefits of registering.
- Brand disclaimer.
- Footer.

Avoid excessive animations, decorative clutter, and irrelevant dashboard metrics.

The primary call to action must remain prominent on desktop and mobile.

## 12.2 Bike Builder

This is the most important page.

Desktop layout:

**Left:** Component category navigation.

**Center:** Large 2D/3D bicycle preview.

**Right:** Component catalog and selected-part details.

**Bottom or contextual area:** Compatibility and specification summary.

Required controls:

- Build name.
- 2D/3D toggle.
- Component categories.
- Brand filter.
- Model search.
- Variant selection.
- Component details.
- Compatibility state.
- Undo/redo.
- Reset view.
- Save, when permitted.
- Quota information.
- Build summary.

The preview must remain prominent.

Avoid creating a tall page where users must scroll away from the bicycle to locate customization controls.

## 12.3 Mobile Builder

Use an adaptive layout.

Include:

- Compact header.
- Visible bicycle preview.
- 2D/3D controls.
- Horizontal component categories or an accessible category selector.
- Bottom sheet for component selection.
- Collapsible specifications.
- Persistent access to the main actions.
- Quota status and clear feedback.
- Touch-friendly camera controls.

Do not duplicate desktop sidebars directly on mobile.

Ensure every sheet, filter, modal, and drawer works within the viewport.

## 12.4 Parts Catalog

Support:

- Categories.
- Brands.
- Model search.
- Product details.
- Technical specifications.
- Variant selection.
- 2D/3D availability indicators.
- Manufacturer information.
- Verified source links.
- Brand acknowledgment.
- Optional legitimate retailer offers.

Use backend pagination and filtering.

## 12.5 My Garage

Authenticated users only.

Display saved builds using visually consistent cards.

Each card should contain:

- Build name.
- Available preview.
- Frame brand/model.
- Updated date.
- Compatibility status.
- Public/private visibility.
- Open/Edit action.
- Duplicate action.
- Delete action.

Display usage as:

`3 of 5 builds used`

When at capacity, provide a clear explanation instead of silently failing.

Support empty states and confirmation for destructive actions.

## 12.6 Build Details

Show:

- Saved build visualization.
- Selected component breakdown.
- Brand/model information.
- Relevant technical specifications.
- Gear ratio.
- Compatibility summary.
- Share link when public.
- Ownership and publication metadata as appropriate.
- Brand and technical disclaimers.

A public viewer must not gain access to private account data or privileged editing actions.

## 12.7 Account Settings

Include:

- Profile.
- Authentication/security settings.
- Theme preferences.
- Preferred measurement units.
- Saved build usage.
- Privacy settings.
- Session controls.
- Account deletion.

## 12.8 Administration

Create a protected administration area.

Sections:

- Overview.
- Brands.
- Product catalog.
- Product variants.
- Specifications.
- Media assets.
- Compatibility metadata.
- Pricing providers.
- Usage limits.
- Audit logs.
- Brand acknowledgments.

Group related functions without creating unnecessary duplicate maintenance pages.

---

# 13. UI/UX DESIGN REQUIREMENTS

Design TrackLab as a premium, minimal, game-inspired bicycle configurator.

Do not use an overly complicated generic admin-dashboard design for the public-facing builder.

## Styling

- Consistent typography.
- Strong visual hierarchy.
- Semantic color tokens.
- Dark and light modes.
- User-selected theme persistence for registered accounts.
- Readable text.
- Consistent spacing.
- Clean card styling.
- Subtle borders.
- Appropriate empty states.
- Consistent icons.
- Visible focus states.

Use established component patterns across all screens.

Do not hardcode theme colors in individual components where design tokens should be used.

## Responsive design

Support:

- Small mobile screens.
- Large mobile screens.
- Tablets.
- Laptops.
- Desktop monitors.
- Wide displays.

Verify:

- No horizontal page overflow.
- No overlapping controls.
- No inaccessible action buttons.
- No clipped modals.
- No broken component panels.
- No illegibly small text.
- No sidebar covering critical content.
- No preview distorted by screen dimensions.

## Interactions

Provide:

- Smooth but restrained transitions.
- Hover feedback.
- Active states.
- Keyboard navigation.
- Selection feedback.
- Loading indicators.
- Error feedback.
- Toast notifications.
- Confirmation dialogs.
- Accessible modal behavior.
- Undo/redo feedback.
- Rate-limit messages.
- Save-status indicators.

Respect reduced-motion preferences.

Do not make essential actions depend exclusively on dragging, hovering, or animations.

Target WCAG 2.2 AA.

---

# 14. DATABASE DESIGN

Use MongoDB Atlas with Mongoose.

## Required collections

### users
- Account identity.
- Authentication fields.
- Role.
- Profile.
- Theme preferences.
- Status.
- Timestamps.

### sessions
- Session identifier.
- Owner reference.
- Expiration.
- Revocation information.

### brands
- Brand identity.
- Website.
- Description.
- Acknowledgment.
- Legal/permission metadata.
- Publication status.

### products
- Product identity.
- Brand reference.
- Model details.
- Category.
- Description.
- Publication status.

### product_variants
- Product reference.
- Model variant.
- Size.
- Finish.
- Technical specifications.
- Compatibility interfaces.
- Rendering support.

### media_assets
- Product/variant reference.
- Asset type.
- Storage reference.
- Dimensions/metadata.
- Registration points.
- Licensing information.
- Verification status.

### builds
- User owner reference.
- Build name.
- Configuration version.
- Selected variant references.
- Visual options.
- Compatibility snapshot.
- Visibility.
- Revision.
- Created/updated timestamps.

### catalog_sources
- Product or variant reference.
- Source type.
- URL.
- Verification timestamp.
- Specification provenance.

### price_providers
- Provider information.
- Integration type.
- Approved domains.
- Status.
- Refresh policy.

### price_offers
- Product variant.
- Retailer.
- Amount/currency.
- Source information.
- Freshness information.

### application_settings
- Guest usage policies.
- Account build limits.
- API policies.
- Feature flags.
- Rendering settings.
- Disclaimer version.
- Other validated configuration.

### audit_logs
- Administrator actions.
- Catalog modifications.
- Important configuration changes.
- Security-relevant administrative events.

Quota enforcement should additionally use centralized counters, with durable records for long-term creation limits.

Do not store every ordinary API access as a permanent MongoDB document.

## Database requirements

- Use indexes for common access patterns.
- Add unique constraints.
- Avoid unnecessary document duplication.
- Validate IDs and references.
- Support product archiving.
- Use schema versioning.
- Handle concurrent saves.
- Implement appropriate data retention.
- Avoid storing large 3D assets directly in MongoDB.
- Never expose internal database documents without response sanitization.

Build creation must use atomic operations or transactions so concurrent requests cannot bypass saved-build limits.

---

# 15. API ARCHITECTURE

Create a versioned REST API under:

`/api/v1`

## Public endpoints

- `GET /brands`
- `GET /brands/:id`
- `GET /products`
- `GET /products/:id`
- `GET /products/:id/variants`
- `GET /variants/:id`
- `GET /public-builds/:slug`

## Guest endpoints

- `POST /guest/session`
- `GET /guest/limits`
- `POST /guest/builder/change`
- `POST /guest/3d-preview`

Guest endpoints must enforce the appropriate anonymous authorization and quota rules.

## Authenticated endpoints

- `GET /auth/me`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `GET /builds`
- `POST /builds`
- `GET /builds/:id`
- `PATCH /builds/:id`
- `DELETE /builds/:id`
- `POST /builds/:id/duplicate`
- `POST /builds/:id/publish`
- `POST /builds/:id/unpublish`
- `GET /account/limits`

## Compatibility endpoints

- `POST /compatibility/check`

## Pricing endpoints

- `GET /variants/:id/offers`

Only expose this endpoint's pricing functionality when the pricing feature is enabled and authorized providers are configured.

## Administrative endpoints

Create protected routes for:

- Brand CRUD.
- Product CRUD.
- Variant CRUD.
- Specification management.
- Asset management.
- Provider management.
- Usage-limit configuration.
- Catalog publishing.
- Audit log viewing.

Never rely on hidden frontend buttons for authorization.

---

# 16. BUILD LIFECYCLE

Implement a consistent build lifecycle.

## Guest flow

1. Open website.
2. Select Start Building.
3. Receive a guest session.
4. Load an approved starter bicycle.
5. Select available components.
6. Consume quota only for accepted component changes.
7. Preview in 2D.
8. Optionally use permitted 3D demonstration access.
9. View remaining usage.
10. Register or sign in when permanent saving is desired.

Guests must never automatically acquire permanent database builds.

## Registered-user flow

1. Sign in.
2. Open Bike Builder.
3. Create a new configuration if quota permits.
4. Select supported components.
5. Receive compatibility feedback.
6. Switch between 2D and 3D.
7. Save configuration.
8. View build in My Garage.
9. Reopen and edit existing build.
10. Optionally publish a supported build.

## Save logic

Before saving:

- Verify authentication.
- Verify build ownership.
- Validate required fields.
- Validate component references.
- Evaluate compatibility.
- Check save quota.
- Check build slot quota for new builds.
- Check creation quota for new builds.
- Handle revision conflicts.
- Persist safely.

Use optimistic concurrency or an equivalent revision strategy to prevent silent overwrites.

If users sign in while holding a guest draft, offer an explicit option to bring the current configuration into the authenticated builder, subject to their build quota and compatibility validation.

Do not create a saved build automatically without user consent.

---

# 17. ERROR HANDLING AND FEEDBACK

Use consistent feedback throughout the application.

Required scenarios:

- Component successfully selected.
- Component incompatible.
- Compatibility unverified.
- Component asset unavailable.
- Guest limit reached.
- Build limit reached.
- Build successfully saved.
- Build successfully deleted.
- Build duplicated.
- Authentication required.
- Session expired.
- API request rate-limited.
- Network disconnected.
- Save failed.
- 3D preview unavailable.
- Product archived.
- Pricing source unavailable.
- External API failure.

Errors must explain what happened and what action the user can take.

Never show raw database errors or internal stack traces to public users.

All feedback must work on mobile and desktop.

---

# 18. PERFORMANCE AND SCALABILITY

Optimize for practical hosting and responsible resource usage.

Requirements:

- Route-level code splitting.
- Lazy loading.
- Image optimization.
- GLB asset compression where appropriate.
- Cached catalog queries.
- Paginated product lists.
- Search debouncing.
- Request deduplication.
- Efficient shared state.
- Controlled rendering updates.
- Asset CDN.
- Expiring cached price offers.
- Server-side rate limits.
- Database indexes.
- Connection pooling where appropriate.
- Appropriate server timeouts.

Set measurable performance budgets during implementation.

Measure real device behavior rather than assuming desktop performance translates to mobile.

Avoid excessive network requests each time a user switches component tabs.

---

# 19. TESTING REQUIREMENTS

Implement and execute tests for important system behavior.

## Authentication
- Successful login.
- Invalid login.
- Session expiration.
- Unauthorized access.
- Password recovery.
- Account ownership.

## Guest limitations
- Guest cannot save.
- Guest cannot publish.
- Guest cannot access garage.
- Guest cannot exceed 12 accepted component changes in 24 hours.
- Guest cannot obtain repeated official 3D preview grants inside the limit window.
- Failed changes do not consume successful-operation quotas.
- Page refresh does not reset guest quota counters.

## Registered-user quotas
- User cannot exceed five active saved builds.
- User cannot exceed creation limits.
- Duplicate creation consumes quota.
- Editing does not consume a new build slot.
- Deleting a build does not refund historical creation quota.
- Concurrent create requests cannot bypass limits.

## Data isolation
- User A cannot view User B's private builds.
- User A cannot edit User B's builds.
- Public builds expose only permitted data.
- Standard users cannot access admin routes.

## 2D/3D
- Selected components synchronize correctly.
- Switching modes preserves configuration.
- Missing assets trigger expected fallbacks.
- 3D rendering does not block the rest of the application.
- Unsupported devices can continue using 2D.

## Compatibility
- Valid combinations are accepted.
- Known invalid combinations are flagged.
- Unknown specifications are not treated as compatible.
- Changing frames recalculates dependent compatibility.

## Pricing
- Pricing disabled means no unverified price is displayed.
- Ambiguous product matches are rejected.
- Stale offers are hidden or explicitly marked according to policy.
- Unavailable providers do not break the builder.
- Currency and source attribution remain correct.
- Provider credentials are never exposed.

## UI/UX
- Mobile layout.
- Tablet layout.
- Desktop layout.
- Light theme.
- Dark theme.
- Keyboard accessibility.
- Modal and drawer behavior.
- Loading and empty states.
- Form errors.
- Focus management.

Run TypeScript checks, linting, unit tests, integration tests, and Playwright browser tests.

Report actual test results rather than claiming tests passed without execution.

---

# 20. IMPLEMENTATION ROADMAP

Implement the application in the following order.

## PHASE 1 — Project Foundation

- Initialize the repository.
- Configure TypeScript.
- Configure React and Vite.
- Configure Tailwind.
- Configure backend architecture.
- Establish shared domain packages.
- Create routing.
- Establish theme tokens.
- Create the reusable UI component system.
- Create the responsive application shell.

Deliver a functional frontend and backend foundation.

## PHASE 2 — Database, Authentication, and Security

- Connect MongoDB Atlas.
- Create user and session models.
- Implement authentication.
- Implement account permissions.
- Configure centralized rate limiting.
- Implement guest session identity.
- Implement usage quota enforcement.
- Add secure API validation.
- Add initial tests.

All sensitive backend operations must be protected before proceeding.

## PHASE 3 — Catalog and Administration

- Create brands.
- Create products.
- Create variants.
- Create specifications.
- Create source verification records.
- Add brand acknowledgments.
- Create catalog browsing.
- Implement administrative maintenance.
- Register starter catalog assets.
- Add catalog tests.

Do not mark the catalog complete using fabricated brand assets or invented technical data.

## PHASE 4 — 2D Bicycle Builder

- Create the shared build configuration model.
- Implement the 2D rendering engine.
- Register component anchor points.
- Implement component selection.
- Add compatible product filtering.
- Implement the guest experience.
- Enforce guest component limits.
- Add builder status feedback.
- Implement undo/redo.

Deliver a functioning 2D configurator before starting the full 3D expansion.

## PHASE 5 — Compatibility Engine

- Create structured rules.
- Implement variant validation.
- Add missing-data handling.
- Implement compatibility messages.
- Add specification calculations.
- Add required tests.

The engine must distinguish compatible, incompatible, and unverified results.

## PHASE 6 — 3D Builder

- Configure React Three Fiber.
- Create modular assembly.
- Register GLB assets.
- Standardize attachment transforms.
- Implement camera controls.
- Synchronize 2D/3D state.
- Add 3D preview authorization.
- Optimize load performance.
- Implement device fallbacks.

Use at least one complete, properly registered supported assembly as the initial 3D milestone.

## PHASE 7 — My Garage

- Implement saved builds.
- Enforce five-build limits.
- Enforce creation limits.
- Implement edit/update.
- Implement deletion.
- Implement duplication.
- Add private/public visibility.
- Add shareable build links.
- Add appropriate exports.

Verify account isolation and concurrent quota enforcement.

## PHASE 8 — Optional Pricing Integrations

- Research approved official providers.
- Verify provider access and permitted usage.
- Implement provider adapters.
- Implement verified variant matching.
- Implement price caching.
- Add retailer and timestamp attribution.
- Add provider failure handling.
- Add pricing-specific tests.

If legitimate authorized pricing sources cannot be established, keep the feature disabled and explicitly document why.

Do not block other milestones on pricing availability.

## PHASE 9 — PWA and Responsive Polish

- Configure installable PWA.
- Optimize desktop workspace.
- Optimize mobile bottom sheets.
- Optimize touch controls.
- Implement meaningful offline fallback.
- Polish loading feedback.
- Improve rendering performance.
- Verify theme compatibility.

## PHASE 10 — Security Review and Deployment

- Run complete tests.
- Review database indexes.
- Verify API protections.
- Audit guest quotas.
- Verify account build limits.
- Review brand asset permissions.
- Audit product sources.
- Check responsive layouts.
- Validate accessibility.
- Build production frontend.
- Build production backend.
- Deploy frontend to Vercel.
- Deploy API to Render.
- Connect MongoDB Atlas.
- Configure rate-limit infrastructure.
- Configure object storage.
- Verify production environment variables.
- Configure application monitoring.
- Document backup and recovery procedures.
- Validate the deployed application.

---

# 21. REPOSITORY STRUCTURE

Use this as an initial structure, adapting it if an existing repository has a suitable architecture.

```text
tracklab/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── authentication/
│   │   │   │   ├── builder/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── renderers/
│   │   │   │   │   │   ├── two-d/
│   │   │   │   │   │   └── three-d/
│   │   │   │   │   ├── store/
│   │   │   │   │   └── hooks/
│   │   │   │   ├── catalog/
│   │   │   │   ├── compatibility/
│   │   │   │   ├── garage/
│   │   │   │   ├── pricing/
│   │   │   │   └── administration/
│   │   │   ├── services/
│   │   │   └── styles/
│   │   └── public/
│   │
│   └── api/
│       └── src/
│           ├── config/
│           ├── database/
│           ├── middleware/
│           ├── modules/
│           │   ├── auth/
│           │   ├── guest/
│           │   ├── brands/
│           │   ├── products/
│           │   ├── variants/
│           │   ├── compatibility/
│           │   ├── builds/
│           │   ├── quotas/
│           │   ├── pricing/
│           │   └── administration/
│           └── utils/
│
├── packages/
│   ├── domain/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── compatibility/
│   │   └── calculations/
│   └── ui/
│
├── scripts/
│   ├── catalog-import/
│   └── asset-validation/
│
├── docs/
│   ├── architecture/
│   ├── security/
│   ├── product-data/
│   ├── legal-disclosures/
│   └── deployment/
│
└── README.md
```

---

# 22. PRODUCTION CONFIGURATION

Provide environment-variable templates for both frontend and backend.

At minimum, account for:

- Application environment.
- Frontend URL.
- API URL.
- MongoDB connection string.
- Secure session secret.
- Redis connection credentials.
- Object storage credentials.
- Approved CORS origins.
- Email provider credentials.
- API rate-limit policy defaults.
- Guest usage limits.
- Registered-user build limits.
- Pricing feature flag.
- Approved pricing-provider credentials.
- Asset CDN URL.
- Logging configuration.

Do not commit real secrets.

Provide development and production configuration guidance.

Use validated environment parsing and fail clearly when mandatory values are missing.

---

# 23. MANDATORY ACCEPTANCE CRITERIA

The project is ready for initial public release only when:

1. Guests can access the limited builder without registration.
2. Guest limits are enforced by the backend.
3. Guests cannot permanently save configurations.
4. Registered users can save and manage their own builds.
5. Registered users cannot exceed five active saved builds.
6. Build-creation quotas cannot be bypassed through deletion or concurrent requests.
7. Rate limits work in a distributed deployment.
8. The 2D bicycle preview responds correctly to supported component changes.
9. The 3D viewer works with properly registered assets.
10. Both viewers use the same selected configuration.
11. Compatibility results distinguish known valid, invalid, and unknown cases.
12. Product models and technical specifications come from verifiable sources.
13. Brand disclaimers are present and clearly visible.
14. Protected logos, imagery, and 3D assets have appropriate usage rights.
15. Pricing is not displayed unless obtained from an approved, verified source.
16. The system remains usable with pricing disabled.
17. Private builds cannot be accessed by other accounts.
18. The entire application works properly on mobile, tablet, and desktop.
19. Light and dark themes are consistent.
20. Loading, error, and empty states are implemented.
21. The PWA functions as intended.
22. Backend and frontend test suites have been executed and results documented.
23. The production deployment has been validated.
24. No unfinished function is misrepresented as implemented.
25. Documentation describes remaining limitations and future enhancements.

---

# 24. EXPECTED DELIVERABLES

Provide:

1. Complete project architecture.
2. Database schema and indexes.
3. Functional responsive frontend.
4. Secure Express backend.
5. Reusable component catalog system.
6. Working SVG 2D bicycle builder.
7. Modular Three.js 3D visualization.
8. Component compatibility engine.
9. Guest usage restrictions.
10. Registered account limits.
11. Centralized rate limiting.
12. Authentication and authorization.
13. My Garage and saved-build management.
14. Brand acknowledgments and disclaimers.
15. Optional verified pricing integration architecture.
16. Administrative maintenance.
17. Test coverage for critical functionality.
18. Production configuration templates.
19. Deployment documentation.
20. README and setup instructions.

Each phase must include the implemented changes, verification results, outstanding limitations, and next dependencies.

---

# FINAL IMPLEMENTATION INSTRUCTIONS

**Begin by inspecting the repository and establishing the architecture. Then implement TrackLab incrementally according to the roadmap.**

Prioritize a functional, accurate, responsive 2D builder with verified product data before expanding the 3D asset library.

Maintain one canonical component configuration across the entire system.

Do not prioritize appearance over functional correctness, but do not neglect the visual quality of the bicycle configurator.

Strictly enforce guest restrictions, registered-user build quotas, and backend API rate limits.

Do not allow unlimited saved configurations.

Do not display guessed product prices.

Do not claim affiliation with featured bicycle brands.

Do not introduce unsupported brand models or misleading 3D representations.

Preserve existing working functionality wherever applicable.

**The final application should feel like a polished fixed-gear bicycle-building game while remaining a technically credible, secure, maintainable, and deployable web platform.**