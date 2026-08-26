"use client";

import { useSyncExternalStore } from "react";
import { PolaroidCameraIcon } from "./Icons";

const PHOTOGRAPHY_TIPS = [
  {
    title: "Perspective comes from position",
    detail: "Focal length changes your framing, but moving the camera is what changes the relationship between subjects in a scene.",
    prompt: "Take the same frame from two distances before changing lenses.",
  },
  {
    title: "Clouds are a giant softbox",
    detail: "Overcast light spreads gently across a face, softening shadows and making colour easier to manage.",
    prompt: "Look for portraits and close-ups when the sky turns white.",
  },
  {
    title: "A histogram is an exposure map",
    detail: "It shows where brightness lives in your image. It does not decide whether the photo is bright enough for your idea.",
    prompt: "Check for clipped highlights, then expose for the feeling you want.",
  },
  {
    title: "Shutter speed tells a story",
    detail: "Fast shutter speeds freeze a moment; slower ones let motion become part of the composition.",
    prompt: "Photograph moving water once sharp and once blurred on purpose.",
  },
  {
    title: "The eye follows bright edges",
    detail: "Small bright spots near a frame edge can pull attention away from your subject before the viewer notices why.",
    prompt: "Before sharing, scan the edges and crop accidental distractions.",
  },
  {
    title: "A smaller f-number means a wider opening",
    detail: "At f/1.8 the lens gathers more light and depth of field becomes shallower than it is at f/8.",
    prompt: "Use a wide aperture when separation supports the story, not just for blur.",
  },
  {
    title: "Golden hour is mostly about direction",
    detail: "Low sun creates long shadows and warm side light, but the angle of light matters more than the clock.",
    prompt: "Turn your subject until the light starts shaping their face or texture.",
  },
  {
    title: "Blue hour can hold a scene together",
    detail: "Just after sunset, sky and artificial lights often sit closer in brightness than they do at midday.",
    prompt: "Expose for the sky, then let the city lights become the accents.",
  },
  {
    title: "ISO amplifies more than brightness",
    detail: "Higher ISO helps you make an exposure, but it can also reduce detail and colour fidelity depending on the camera.",
    prompt: "Stabilize or open the aperture before raising ISO when the scene allows it.",
  },
  {
    title: "White balance is a creative choice",
    detail: "A warmer or cooler white balance can change the emotional temperature of a photograph without changing the light itself.",
    prompt: "Try one neutral edit and one intentionally warm or cool edit before deciding.",
  },
  {
    title: "RAW keeps more editing latitude",
    detail: "RAW files retain more tonal and colour information than a finished JPEG, especially in bright highlights and deep shadows.",
    prompt: "Use RAW when you expect to spend time refining the final image.",
  },
  {
    title: "Look for the light before the subject",
    detail: "A familiar subject can feel new when it enters a pocket of interesting light, shadow, or reflection.",
    prompt: "Find the light you like first, then wait for a person or gesture to complete it.",
  },
  {
    title: "The rule of thirds is a starting point",
    detail: "Placing a subject away from the centre can create balance, but a centred frame can be just as strong when it serves the image.",
    prompt: "Make one off-centre frame and one centred frame, then compare the energy.",
  },
  {
    title: "Negative space gives a subject room",
    detail: "Empty areas can make a small subject feel intentional, isolated, calm, or powerful.",
    prompt: "Leave more space than feels comfortable, then see what the image starts to say.",
  },
  {
    title: "Leading lines need a destination",
    detail: "A road, shadow, or railing is useful when it guides the eye toward a subject or a meaningful exit from the frame.",
    prompt: "Ask where each line leads before you press the shutter.",
  },
  {
    title: "Catchlights bring portraits alive",
    detail: "A small reflection in the eyes can make a portrait feel more connected and three-dimensional.",
    prompt: "Move a few steps until a window or soft light appears in the eyes.",
  },
  {
    title: "Shadows are part of the exposure",
    detail: "Trying to lift every dark area can flatten a photograph. Some shadows give the image depth and mood.",
    prompt: "Protect the detail you need, then let the rest of the shadow stay quiet.",
  },
  {
    title: "Exposure compensation is your fast dial",
    detail: "In aperture or shutter priority, exposure compensation lets you tell the camera that its meter needs a nudge.",
    prompt: "Try -1 for a bright window scene or +1 for a snowy, pale scene.",
  },
  {
    title: "A tripod slows your seeing",
    detail: "Beyond keeping the camera steady, a tripod gives you time to refine edges, timing, and layers in the frame.",
    prompt: "Use one for a scene you normally would shoot quickly.",
  },
  {
    title: "Side light reveals texture",
    detail: "Light skimming across a surface makes texture visible because tiny changes in depth create small shadows.",
    prompt: "Photograph fabric, stone, or food from the side rather than head-on.",
  },
  {
    title: "A polarizer is strongest at an angle",
    detail: "Polarizing filters can reduce reflections and deepen some skies, but their effect changes as you turn relative to the sun.",
    prompt: "Rotate the filter slowly and stop when it helps the subject, not just the sky.",
  },
  {
    title: "Wide lenses make near things feel closer",
    detail: "When you move in with a wide lens, foreground objects grow in importance and the scene can feel more immersive.",
    prompt: "Give the foreground a job instead of leaving it empty.",
  },
  {
    title: "Manual focus can rescue difficult scenes",
    detail: "Autofocus can hesitate in low contrast, through glass, or on very small subjects. Manual focus gives you the final say.",
    prompt: "Zoom into live view and focus carefully on the detail that matters most.",
  },
  {
    title: "Burst mode is about timing, not volume",
    detail: "A short burst around a gesture or movement can capture the in-between moment without leaving you hundreds of frames to edit.",
    prompt: "Anticipate the peak, then make a small, deliberate burst.",
  },
  {
    title: "Depth of field has three main controls",
    detail: "Aperture, camera-to-subject distance, and focal length all influence how much of the scene appears acceptably sharp.",
    prompt: "Move closer before reaching for the widest aperture.",
  },
  {
    title: "Bokeh is shaped by more than aperture",
    detail: "Background distance, foreground distance, lens design, and highlight shape all affect how out-of-focus areas look.",
    prompt: "Move your subject farther from the background to strengthen separation.",
  },
  {
    title: "Change height before changing gear",
    detail: "Kneeling, climbing a step, or holding the camera just above eye level can transform a familiar scene.",
    prompt: "Make three frames from low, eye level, and high positions.",
  },
  {
    title: "Weather can be the subject",
    detail: "Rain, fog, wind, and harsh sun each simplify or complicate a scene in their own visual language.",
    prompt: "Instead of waiting for perfect weather, photograph what the weather is doing.",
  },
  {
    title: "Colour contrast can direct attention",
    detail: "Opposing colours often separate a subject from its surroundings faster than a detailed background can.",
    prompt: "Look for a small red, yellow, or blue accent against a quieter field.",
  },
  {
    title: "Black and white starts with tone",
    detail: "Without colour, shape, texture, light, and contrast carry the image. Similar tones can blend together even when colours differ.",
    prompt: "Preview in monochrome and look for clear light-to-dark separation.",
  },
  {
    title: "The best lens is often the one you know",
    detail: "Familiarity helps you anticipate framing before raising the camera, which leaves more attention for timing and feeling.",
    prompt: "Use one focal length for a week and notice what you begin to see.",
  },
  {
    title: "The reciprocal rule is only a guide",
    detail: "A shutter speed near one over your focal length is a starting point for handheld sharpness, but stabilization and your technique matter too.",
    prompt: "Test your own steady limit with the same scene at a few shutter speeds.",
  },
  {
    title: "A clean lens changes more than sharpness",
    detail: "Fingerprints and haze lower contrast and can make bright lights bloom in ways that are hard to fix later.",
    prompt: "Give the front element a quick check before an important shoot.",
  },
  {
    title: "One frame can have more than one moment",
    detail: "Layers in foreground, middle ground, and background can turn an ordinary scene into a story with depth.",
    prompt: "Wait until something meaningful happens in two parts of the frame at once.",
  },
  {
    title: "Editing is where you decide what matters",
    detail: "Cropping, contrast, and colour are most useful when they make the original feeling of the photograph clearer.",
    prompt: "Before editing, name the one thing you want the viewer to notice first.",
  },
  {
    title: "Sometimes the better frame is after the moment",
    detail: "People relax, light changes, and a scene settles after the obvious action has passed.",
    prompt: "Keep watching for ten seconds after you think you have the shot.",
  },
] as const;

const LAST_TIP_KEY = "myclick:last-photography-tip";
let refreshTipIndex: number | null = null;

function getTipIndexForThisRefresh() {
  if (refreshTipIndex !== null) return refreshTipIndex;

  const randomIndex = Math.floor(Math.random() * PHOTOGRAPHY_TIPS.length);

  try {
    const previousIndex = Number.parseInt(window.sessionStorage.getItem(LAST_TIP_KEY) ?? "", 10);
    const shouldAvoidPrevious = Number.isInteger(previousIndex) && previousIndex >= 0 && previousIndex < PHOTOGRAPHY_TIPS.length;
    const tipIndex = shouldAvoidPrevious && randomIndex === previousIndex
      ? (randomIndex + 1 + Math.floor(Math.random() * (PHOTOGRAPHY_TIPS.length - 1))) % PHOTOGRAPHY_TIPS.length
      : randomIndex;

    window.sessionStorage.setItem(LAST_TIP_KEY, String(tipIndex));
    refreshTipIndex = tipIndex;
  } catch {
    refreshTipIndex = randomIndex;
  }

  return refreshTipIndex;
}

function subscribeToRefreshTip() {
  return () => {};
}

export function PhotographyTip() {
  const tipIndex = useSyncExternalStore(subscribeToRefreshTip, getTipIndexForThisRefresh, () => 0);

  const tip = PHOTOGRAPHY_TIPS[tipIndex];

  return (
    <aside aria-label="Photography tip" className="relative overflow-hidden rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-500/[0.11] via-orange-500/[0.055] to-transparent px-5 py-5 shadow-[0_20px_50px_-38px_rgba(251,146,60,0.85)] sm:px-6">
      <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full border border-amber-200/10" />
      <div className="absolute -right-1 top-7 h-14 w-14 rounded-full border border-amber-200/[0.07]" />
      <div className="relative flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200/15 bg-amber-300/[0.09]">
          <PolaroidCameraIcon className="h-5 w-5 text-amber-200" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Did you know?</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-white">{tip.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">{tip.detail}</p>
          <p className="mt-3 text-xs leading-5 text-amber-100/70"><span className="font-semibold text-amber-100">Try it:</span> {tip.prompt}</p>
        </div>
      </div>
    </aside>
  );
}
