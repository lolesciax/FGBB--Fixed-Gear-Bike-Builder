# TRACKLAB — MASTER IMPLEMENTATION CONTINUATION
## Complete All Phases with Integrated UI/UX Improvements and a Distinct Color Identity

### PRIMARY OBJECTIVE

Continue developing TrackLab according to the complete original implementation specification.

The goal is to deliver a functional, production-ready, responsive hybrid 2D and 3D fixed-gear bicycle builder.

**NEW REQUIREMENT: Integrate the improved UI/UX, page layouts, responsiveness, and distinct TrackLab color identity throughout the entire development process. Do not postpone these improvements until the final phase.**

This is not a request to abandon the original plan, create another project, or redesign only the landing page.

All original functional requirements remain in effect.

---

# 1. CONTINUE AND COMPLETE THE ORIGINAL IMPLEMENTATION

First, inspect the actual repository and determine which phases and features have already been implemented.

Review:

- Existing frontend and backend.
- Database architecture.
- Authentication.
- Guest restrictions.
- User build limitations.
- Rate-limiting implementation.
- Brand and component catalog.
- Compatibility validation.
- 2D bicycle renderer.
- 3D bicycle renderer.
- My Garage.
- Product source verification.
- Optional legitimate pricing integration.
- Administrative maintenance.
- Existing design system.
- Tests and deployment configuration.

Do not assume features are implemented simply because files or UI elements exist.

For each original phase, classify its current status:

- Completed and verified.
- Implemented but not fully verified.
- Partially implemented.
- Not started.
- Blocked.

Continue from the real current implementation rather than restarting development.

Preserve all working code, business rules, and database behavior.

Do not replace working backend functionality with mock data to simplify UI development.

---

# 2. REPLACE THE CURRENT GREEN THEME

The existing green design looks too similar to my other projects, especially my portfolio.

**TrackLab must have its own visual identity.**

Do not reuse the portfolio's color scheme, card styling, design patterns, navigation style, or decorative effects.

## New visual direction

Create a premium industrial cycling configurator inspired by:

- High-end bicycle customization studios.
- Modern product configurators.
- Minimalist automotive interfaces.
- Industrial product design.
- Professional cycling equipment websites.

The overall feeling should be technical, refined, precise, and modern.

Avoid making the system look like a generic SaaS dashboard or another developer portfolio.

## Preferred colors

Use these as the starting design tokens:

| Token | Dark mode | Light mode |
|---|---|---|
| Background | #101319 | #F5F6F8 |
| Surface | #1B2029 | #FFFFFF |
| Elevated Surface | #252C37 | #EDEFF3 |
| Primary Accent | #6684FF | #3659DB |
| Primary Text | #F5F6FA | #171C26 |
| Secondary Text | #A5AEBD | #596373 |
| Borders | #343C49 | #DCE1E8 |

Refine these values if necessary to improve visual balance and accessibility.

The primary identity should use graphite, titanium, off-white, and electric blue.

Do not use green as:

- The main brand accent.
- Primary action button color.
- Navigation selection color.
- Hero decorative color.
- Primary card highlight.
- Default icon highlight.

Green can remain for semantic success states or verified compatibility.

## Theme architecture

- Use centralized CSS variables and Tailwind semantic tokens.
- Implement complete light and dark modes.
- Preserve user-selected theme preferences.
- Ensure WCAG 2.2 AA text contrast.
- Avoid scattered hardcoded colors.
- Ensure icons, inputs, cards, overlays, and modals follow the same tokens.

Changing the color palette alone is not sufficient. Improve the complete visual hierarchy and design system.

---

# 3. GLOBAL UI/UX IMPROVEMENTS

Review every page and reusable component.

Improve:

1. Layout structure.
2. Navigation hierarchy.
3. Typography.
4. Spacing and padding.
5. Card dimensions.
6. Component alignment.
7. Content width.
8. Forms and inputs.
9. Buttons and icon controls.
10. Modal and drawer behavior.
11. Loading and empty states.
12. Accessibility.
13. Responsive behavior.
14. Selection feedback.
15. Hover and focus states.
16. UI consistency.

Remove unnecessary whitespace without making the interface cramped.

Avoid oversized cards containing very little information.

Do not use tiny text as a workaround for poor layout.

Use appropriate icon sizes and standard readable typography.

All actions must provide appropriate feedback.

Avoid excessive gradients, neon effects, glow effects, and unnecessary animations.

---

# 4. PRIORITIZE THE BIKE BUILDER EXPERIENCE

The Bike Builder is TrackLab's primary feature.

Its interface must be the strongest part of the application.

## Desktop layout

Implement a dedicated customization workspace with three functional regions.

### Left — Component navigation

Provide compact navigation for:

- Frameset.
- Wheels.
- Tires.
- Cockpit.
- Drivetrain.
- Seating.
- Pedals.
- Brakes.
- Accessories.

Use icons and readable labels.

Make the selected category immediately recognizable.

Use a compact sidebar rather than large navigation cards.

### Center — Bicycle preview

Make the bicycle preview the largest region.

Requirements:

- Prominent bicycle visualization.
- 2D/3D toggle.
- Camera reset.
- Zoom controls.
- Supported camera presets.
- Component selection highlighting.
- Loading and error feedback.
- Proper bicycle centering.
- Responsive scaling.

Avoid excessive blank space surrounding a very small bicycle.

Ensure frames and wheels are not clipped.

Keep important viewing controls visible.

### Right — Component selector

Provide:

- Category heading.
- Product search.
- Brand filtering.
- Model list.
- Product variants.
- Technical specifications.
- Compatibility indicators.
- Select/replace action.
- Available rendering modes.

Use consistent, compact component cards.

Do not overwhelm users with unnecessary details.

The selected part and available alternatives should be easy to distinguish.

## Workspace behavior

The bicycle preview should remain visible while users customize parts.

Changing component categories must not reset the bicycle.

Switching between 2D and 3D must preserve the selected configuration.

Do not create separate business logic for the 2D and 3D interfaces.

---

# 5. MOBILE AND TABLET EXPERIENCE

Do not simply shrink the desktop layout.

## Tablet

Adapt the interface to the available width.

Use collapsible panels where appropriate.

The bicycle preview must remain prominent.

Avoid displaying three cramped columns.

## Mobile

Implement:

- Compact header.
- Clear build name.
- Prominent bicycle preview.
- Accessible 2D/3D toggle.
- Category navigation.
- Component-selection bottom sheet.
- Compact build summary.
- Accessible Save action.
- Guest quota information.

The component bottom sheet must:

- Open and close reliably.
- Have a visible handle or trigger.
- Provide accessible controls.
- Support internal scrolling.
- Respect safe areas.
- Avoid covering essential actions.
- Work with the on-screen keyboard.
- Avoid gesture conflicts with the 3D preview.

Do not place the component-selection interface far below the bicycle preview.

Do not require users to repeatedly scroll between the bicycle and its component controls.

Test mobile portrait and landscape layouts.

---

# 6. IMPROVE EVERY MAIN PAGE

## Landing Page

Create a unique TrackLab homepage.

Suggested headline:

"Build Your Perfect Fixed Gear."

The landing page should immediately communicate that TrackLab is an interactive bicycle configurator.

Include:

- Strong hero section.
- Prominent bicycle visual.
- Start Building action.
- Explore Components action.
- How It Works.
- 2D/3D features.
- Component compatibility information.
- Supported brands.
- My Garage introduction.
- Brand acknowledgments.
- Footer.

Do not copy the portfolio's landing-page structure.

## Parts Catalog

Create a structured component browser.

Implement:

- Product search.
- Category filters.
- Brand filters.
- Consistent product visuals.
- Model and variant information.
- Source-backed specifications.
- Visualization availability.
- Accessible mobile filtering.

Do not display invented prices or unavailable specifications.

## My Garage

Create a personal bike collection experience.

Display:

- Saved bicycle previews.
- Build names.
- Main frameset models.
- Updated dates.
- Compatibility statuses.
- Visibility.
- Edit actions.
- Duplicate actions.
- Delete actions.

Show registered-user build usage clearly.

Example:

"3 of 5 Builds Used"

Prevent actions that exceed actual server-enforced limits.

## Authentication

Use a compact, clean, TrackLab-specific design.

Include:

- Login.
- Registration.
- Password recovery.
- Form validation.
- Loading states.
- Accessible error feedback.

Explain that accounts allow users to save configurations.

Do not require registration just to browse the public catalog.

## Account Settings

Improve profile, appearance, security, quota, and privacy settings.

## Administration

Keep administrative pages functional and visually consistent.

Use suitable tables and forms for catalog maintenance rather than forcing every admin feature into product-style cards.

---

# 7. PRESERVE ALL ORIGINAL SECURITY AND QUOTA RULES

Do not remove or weaken the restrictions established in the original specification.

## Guest

- One temporary bicycle configuration.
- Twelve accepted component changes per rolling 24 hours.
- One limited 3D preview grant per rolling 24 hours.
- No permanent build saving.
- No My Garage access.
- No build publishing.
- No unrestricted exports.

## Registered user

- Maximum five active saved builds.
- Maximum three new builds per rolling 24 hours.
- Maximum twenty new builds per rolling 30 days.
- Editing existing builds does not consume a new build slot.
- Duplicating a build consumes a new slot and creation quota.
- Deletion does not refund historical creation quotas.

## Backend protection

Preserve:

- Redis-backed distributed rate limits.
- Server-side quota enforcement.
- Secure sessions.
- Access control.
- Data ownership checks.
- Input validation.
- Abuse protection.
- API error handling.
- Concurrent-operation safeguards.

Never replace backend restrictions with frontend-only disabling.

The UI must display real quota information from the API.

---

# 8. PRESERVE BRAND AND PRICING POLICIES

## Brand information

Continue supporting verified real-world brands and models.

Keep brand disclaimer and trademark acknowledgment information visible in appropriate sections.

TrackLab must not falsely represent itself as officially affiliated with featured bicycle manufacturers.

Only use logos, photos, and 3D models where their usage is permitted.

## Pricing

Keep the existing verified-source pricing policy.

Do not invent prices.

Do not display arbitrary estimated prices.

Use approved manufacturer or retailer integrations only when legitimate access and exact variant matching have been verified.

If no approved source is available, keep pricing disabled.

Do not make pricing a prerequisite for finishing the builder.

---

# 9. INTEGRATE UI/UX QUALITY INTO EVERY PHASE

Revise the original development roadmap so that UI/UX is an ongoing requirement.

### Phase 1 — Foundation and Design System

Establish the distinct TrackLab theme, responsive application shell, typography, spacing, and reusable UI components.

### Phase 2 — Authentication, Database, and Security

Implement functional authentication and security with complete responsive forms, feedback, and loading states.

### Phase 3 — Brand and Component Catalog

Implement verified catalog data alongside the polished component browser and administration interface.

### Phase 4 — 2D Builder

Implement the SVG bicycle renderer within the final responsive customization workspace.

### Phase 5 — Compatibility Engine

Integrate validation results into the user interface with clear status indicators and explanations.

### Phase 6 — 3D Builder

Integrate 3D visualization into the same workspace, using the same configuration state and established design system.

### Phase 7 — My Garage

Implement saved configurations with polished build cards, quota indicators, and safe management actions.

### Phase 8 — Optional Verified Pricing

Implement only when an approved source is available. Keep disabled otherwise.

### Phase 9 — PWA and Mobile Optimization

Polish mobile interactions, responsive layout, performance, offline fallback, and installability.

### Phase 10 — Complete Verification and Deployment

Validate functionality, security, visual consistency, responsiveness, accessibility, and deployment.

If any phase is already implemented, inspect and improve it rather than recreating it unnecessarily.

---

# 10. CONTINUOUS IMPLEMENTATION WORKFLOW

Maintain project tracking files in the repository.

Recommended documentation:

- `docs/PROJECT_SPEC.md` — consolidated requirements.
- `docs/IMPLEMENTATION_PLAN.md` — milestones and dependencies.
- `docs/IMPLEMENTATION_STATUS.md` — verified progress.
- `docs/DESIGN_SYSTEM.md` — colors, typography, layouts, components.
- `docs/KNOWN_ISSUES.md` — bugs, blockers, and technical limitations.
- `AGENTS.md` — repository-specific implementation conventions, if appropriate.

Reuse existing project documentation instead of creating redundant competing files.

For each phase:

1. Inspect the relevant implementation.
2. Identify missing or inconsistent requirements.
3. Plan the specific changes.
4. Implement the changes.
5. Run applicable checks.
6. Verify the interface in a browser where available.
7. Fix discovered issues.
8. Update the project status.
9. Proceed to the next feasible milestone when the environment and task budget allow.

Do not mark a feature complete just because its components exist.

A completed phase must satisfy its acceptance criteria and have supporting verification evidence.

Do not restart finished phases without a reason.

When blocked by unavailable licensed assets, external credentials, or unverified product information, clearly record the blocker and continue with independent implementation work where possible.

Do not fabricate external integrations or claim that deployment succeeded without actually verifying it.

Do not make unauthorized production changes, commits, or deployments.

---

# 11. REQUIRED RESPONSIVE AND VISUAL TESTING

Test at representative widths including:

- 320px
- 375px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

Verify:

- No horizontal overflow.
- No overlapping controls.
- No clipped bicycle previews.
- No inaccessible modals.
- No broken mobile sheets.
- No tiny text.
- No inconsistent card sizes.
- No hidden navigation actions.
- No incorrect theme colors.
- No poorly positioned buttons.
- No excessive blank areas.
- No unexpected page jumps.
- No 2D/3D state loss.

Use Playwright or available browser tooling to inspect rendered layouts, capture screenshots, and verify actual interactions.

Run:

- TypeScript checking.
- Linting.
- Unit tests.
- API integration tests.
- Browser tests.
- Production build checks.

Fix regressions before marking a phase complete.

---

# 12. FINAL ACCEPTANCE CRITERIA

TrackLab must provide:

1. A distinct graphite-and-blue identity instead of the original green theme.
2. Consistent and polished light/dark modes.
3. A premium desktop bicycle customization workspace.
4. A purpose-built mobile customization experience.
5. Functional synchronized 2D and 3D rendering for supported configurations.
6. Real, source-backed brand and component data.
7. Variant-aware compatibility validation.
8. Strict guest limitations.
9. Server-enforced registered-user build limits.
10. Distributed API rate limiting.
11. Secure authentication and account isolation.
12. Functional saved bike collections.
13. Appropriate brand/trademark disclosures.
14. No invented product prices or unsupported branded assets.
15. Fully responsive main and administrative pages.
16. Accessible and meaningful interactions.
17. Appropriate success, loading, error, and empty states.
18. No known critical regressions.
19. Documented testing results.
20. Verified deployment when production access is available.

---

# FINAL INSTRUCTION

**Continue implementing the entire original TrackLab project while applying this updated design system and improved UI/UX across every phase.**

Do not wait until all backend features are complete before polishing the user interface.

Do not replace the original requirements.

Do not remove existing features or bypass limitations.

Do not reuse the green theme or layouts from my other projects.

Do not stop after changing colors or redesigning the landing page.

Prioritize the Bike Builder, since it is the application's defining experience.

Use the existing repository as the source of truth, implement milestone by milestone, verify each completed feature, and keep documentation synchronized with actual progress.

Continue through all feasible phases within the available execution environment. If a phase becomes genuinely blocked, document what is missing, complete independent work where possible, and report precisely what is implemented, verified, or still unfinished.

The finished TrackLab application should feel like a professional, premium fixed-gear bicycle customization platform—not a portfolio clone, generic dashboard, or incomplete visual demonstration.