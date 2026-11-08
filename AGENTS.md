# wallpapers — agent brief

A small, personal wallpaper gallery. The owner adds images they are legally allowed to share, and the site — a static Astro build published on GitHub Pages — presents them with credit where the creator and source are known. It is for anyone who wants a wallpaper they can keep.

## The Project
Core promise: every image in `wallpapers/` appears in the gallery, credited whenever `wallpapers.json` records who made it and where it came from.
Philosophy: the collection is the product. The site should stay quiet and let the wallpapers carry it — no feeds, filters, or accounts.
Non-goals: uploads, accounts, a backend, or runtime image processing — this is a gallery, not a wallpaper service.
Status: dormant — one wallpaper shipped, no active feature work.

## Sources of Truth
| Fact | Where |
|---|---|
| Product intent | this file |
| Runtime behavior | code + tests |
| Commands & deps | package.json |
| How to work here | CONTRIBUTING.md |
| Wallpaper credits | wallpapers.json |
| Image source of truth | wallpapers/ (`public/files/` is generated) |

Code and tests are the authority; this file never overrides executable truth.
