# Ambient audio

Empty on purpose. With no file here, the site synthesises its own cinematic
drone in the browser with the Web Audio API — original by construction, nothing
to licence, nothing to download.

To use a track instead:

1. Put the file here, e.g. `ambient.mp3`. Use something you own or something
   licensed for this use.
2. Set it in `src/content/site.ts`:

   ```ts
   export const audio: { track: string | null } = {
     track: 'audio/ambient.mp3',
   };
   ```

If the file fails to load or is blocked, the synthesised drone takes over — the
page never goes silently broken.

Keep it long and loopable, quiet, and low on transients. It plays under
everything, and it is never the point.
