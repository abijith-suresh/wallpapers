# wallpapers — agent brief

A small, personal wallpaper gallery. The owner adds images they are legally allowed to share, and the site — a static Astro build published on GitHub Pages — presents them with credit where the creator and source are known. It is for anyone who wants a wallpaper they can keep.

## The Project
Core promise: every image in `wallpapers/` appears in the gallery, credited whenever `wallpapers.json` records who made it and where it came from.
Non-goals: uploads, accounts, a backend, or runtime image processing — this is a gallery, not a wallpaper service.
Status: dormant — one wallpaper shipped, no active feature work.

Non-negotiables:
- Only add images that are legal to redistribute. The code is MIT; each wallpaper keeps its creator's rights.
- Add images to `wallpapers/` only. `src/assets/wallpapers/` is a stale duplicate that nothing reads; don't add to it or copy from it.
- `public/files/` is generated output. Never edit or commit the generated copy by hand.
- Credit the creator and link the source in `wallpapers.json` whenever either is known.

## How I Work Here
- Quality gate: run `bun run verify` before handoff. Add focused tests for the behavior you touched; CI owns the full suite.
- Commits: Conventional Commits; the allowed types live in commitlint.config.ts. Squash merges; never commit to main.
- Pull requests stay open for owner review; never merge one yourself.
- Keep content and infrastructure changes separate: don't touch dependencies or workflows while adding wallpapers.
- Ship a wallpaper's image and its `wallpapers.json` entry in the same commit.

## Sources of Truth
| Fact | Where |
|---|---|
| Product intent | § The Project (this file) |
| Runtime behavior | code + tests |
| Commands & deps | package.json |
| Commit rules | commitlint.config.ts |

Code and tests are the authority; this file never overrides executable truth.
