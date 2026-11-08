# Contributing

Set up with Bun 1.3.14+ and Node 24.14.1+: run `bun install` at the root, then `bun run dev`.

## Adding a wallpaper
- Only add images that are legal to redistribute. The code is MIT; each wallpaper keeps its creator's rights.
- Add images to `wallpapers/` only; the manifest sync script enforces accepted formats and size.
- Credit the creator and link the source in `wallpapers.json` whenever either is known.
- Ship the image and its manifest entry in the same commit.
- `public/files/` is generated output; never edit or commit it by hand.
- `src/assets/wallpapers/` is a stale duplicate that nothing reads; don't add to it or copy from it.

## Working agreement
Run `bun run verify` before handoff, add focused tests for the behavior you touched, and let CI own the full suite. Keep content and infrastructure changes separate — don't touch dependencies or workflows while adding wallpapers.

Use Conventional Commits; the allowed types live in `commitlint.config.ts`. Never commit straight to main, and squash-merge when the owner approves. Pull requests stay open for owner review; never merge one yourself.

There is no changelog; release notes are not maintained by hand.
