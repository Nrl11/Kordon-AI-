/* First-screen video. When the clip is ready, put it in public/video/ and set
   the path: on load it plays instead of the 3D diagram (muted, looped, with a
   pause button). While this is null, the diagram is shown. */
export const HERO_VIDEO: { src: string; poster?: string } | null = null;
