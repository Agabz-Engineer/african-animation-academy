export type CourseAccess = "free" | "pro";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseVisualTone =
  | "ember"
  | "gold"
  | "lagoon"
  | "violet"
  | "jade"
  | "sunset";

export type CourseRecord = {
  id?: string;
  title: string;
  instructor: string;
  level: CourseLevel;
  durationMinutes: number;
  durationLabel: string;
  desc: string;
  lessons: number;
  access: CourseAccess;
  thumbnailUrl: string | null;
  videoUrl?: string;
  enrollUrl?: string;
  rating: number;
  enrolledCount: number | null;
  visualTone: CourseVisualTone;
};

export type DbCourse = {
  id: string;
  title: string;
  instructor: string;
  level: CourseLevel;
  duration: number;
  lessons: number;
  description: string;
  thumbnail_url?: string | null;
  access_tier?: CourseAccess | null;
  price: number | string;
  rating?: number | null;
  enrolled_count?: number | null;
  video_path?: string | null;
  status: "published" | "draft" | "archived";
};

export type CoursePlaylistItem = {
  id: string;
  order: number;
  title: string;
  synopsis: string;
  durationLabel: string;
  kind: "lesson" | "lab" | "resource";
  isLaunchLesson: boolean;
};

export const COURSE_CREDIT_NAME = "Zenock G.-A.";

export const ACCESSIBLE: Record<string, CourseLevel[]> = {
  beginner: ["Beginner"],
  intermediate: ["Beginner", "Intermediate"],
  advanced: ["Beginner", "Intermediate", "Advanced"],
};

const VISUAL_TONES: CourseVisualTone[] = [
  "ember",
  "gold",
  "lagoon",
  "violet",
  "jade",
  "sunset",
];

const DEFAULT_COURSE_THUMBNAILS: Record<string, string> = {
  "quick poses for strong silhouettes": "/images/courses/quick-poses-web.jpg",
  "expressive walk cycles: the gathering place study": "/images/courses/walk-cycles-web.jpg",
  "bouncing ball with tail - moho tutorial": "/images/courses/bouncing-ball-web.jpg",
  "toon boom fundamentals": "/images/courses/toon-boom-web.jpg",
};

const getDefaultCourseThumbnail = (title: string) =>
  DEFAULT_COURSE_THUMBNAILS[title.trim().toLowerCase()] || null;

export const FALLBACK_COURSES: CourseRecord[] = [
  {
    title: "Quick Poses for Strong Silhouettes",
    instructor: "Zenock G.-A.",
    level: "Beginner",
    durationMinutes: 270,
    durationLabel: "4h 30m",
    desc: "Build clear posing instincts, stronger staging, and silhouette readability that holds up in motion.",
    lessons: 6,
    access: "free",
    thumbnailUrl: getDefaultCourseThumbnail("Quick Poses for Strong Silhouettes"),
    videoUrl:
      "https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10",
    enrollUrl:
      "https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10",
    rating: 0,
    enrolledCount: null,
    visualTone: "ember",
  },
  {
    title: "Expressive Walk Cycles: The Gathering Place Study",
    instructor: "Zenock G.-A.",
    level: "Beginner",
    durationMinutes: 185,
    durationLabel: "3h 5m",
    desc: "Study rhythm, balance, and personality through a warm walk-cycle exercise grounded in everyday movement.",
    lessons: 5,
    access: "free",
    thumbnailUrl: getDefaultCourseThumbnail("Expressive Walk Cycles: The Gathering Place Study"),
    videoUrl:
      "https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0",
    enrollUrl:
      "https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0",
    rating: 0,
    enrolledCount: null,
    visualTone: "gold",
  },
  {
    title: "Bouncing Ball with Tail - Moho Tutorial",
    instructor: "Zenock G.-A.",
    level: "Intermediate",
    durationMinutes: 145,
    durationLabel: "2h 25m",
    desc: "Sharpen your timing, arcs, and overlap by turning a simple mechanics exercise into a polished character motion study.",
    lessons: 4,
    access: "pro",
    thumbnailUrl: getDefaultCourseThumbnail("Bouncing Ball with Tail - Moho Tutorial"),
    videoUrl: "https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4",
    enrollUrl: "https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4",
    rating: 0,
    enrolledCount: null,
    visualTone: "lagoon",
  },
  {
    title: "Toon Boom Fundamentals",
    instructor: "Zenock G.-A.",
    level: "Intermediate",
    durationMinutes: 210,
    durationLabel: "3h 30m",
    desc: "Learn the core tools, timeline habits, and scene-building workflow needed to move with confidence inside Toon Boom.",
    lessons: 7,
    access: "pro",
    thumbnailUrl: getDefaultCourseThumbnail("Toon Boom Fundamentals"),
    videoUrl:
      "https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb",
    enrollUrl:
      "https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb",
    rating: 0,
    enrolledCount: null,
    visualTone: "violet",
  },
];

export const minutesToLabel = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "TBD";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const getCourseInstructorLabel = (instructor: string) => {
  const normalized = instructor.trim();
  if (!normalized || normalized.toLowerCase() === "tba") {
    return COURSE_CREDIT_NAME;
  }
  return normalized;
};

export const getCourseCreditLabel = (instructor: string) => {
  const normalized = instructor.trim();
  if (!normalized || normalized.toLowerCase() === "tba") {
    return "Course craft by Zenock G.-A.";
  }
  if (normalized.toLowerCase().includes("zenock")) {
    return "Original course craft by Zenock G.-A.";
  }
  return "Course craft with Zenock G.-A.";
};

export const getCourseKey = (course: Pick<CourseRecord, "title" | "instructor">) =>
  `${course.title.trim().toLowerCase()}::${course.instructor.trim().toLowerCase()}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const getCourseSlug = (course: Pick<CourseRecord, "id" | "title">) => {
  const base = slugify(course.title);
  return course.id ? `${base}-${course.id.slice(0, 8)}` : base;
};

export const hasLiveEnrollmentCount = (course: Pick<CourseRecord, "id" | "enrolledCount">) =>
  typeof course.id === "string" && typeof course.enrolledCount === "number";

export const normalizeDbCourse = (course: DbCourse, index: number): CourseRecord => ({
  id: course.id,
  title: course.title,
  instructor: course.instructor,
  level: course.level,
  durationMinutes: course.duration,
  durationLabel: minutesToLabel(course.duration),
  desc: course.description,
  lessons: Math.max(1, course.lessons || 1),
  access:
    course.access_tier === "pro" || Number(course.price || 0) > 0 ? "pro" : "free",
  thumbnailUrl: course.thumbnail_url || getDefaultCourseThumbnail(course.title),
  videoUrl: course.video_path || undefined,
  enrollUrl: course.video_path || undefined,
  rating: Number(course.rating || 0) || 0,
  enrolledCount:
    typeof course.enrolled_count === "number" && Number.isFinite(course.enrolled_count)
      ? course.enrolled_count
      : null,
  visualTone: VISUAL_TONES[index % VISUAL_TONES.length],
});

export const mergeCourseCatalog = (liveCourses: DbCourse[] = []) => {
  const normalizedLive = liveCourses.map(normalizeDbCourse);
  const liveKeys = new Set(normalizedLive.map(getCourseKey));
  return [
    ...normalizedLive,
    ...FALLBACK_COURSES.filter((course) => !liveKeys.has(getCourseKey(course))),
  ];
};

export const findCourseBySlug = (courses: CourseRecord[], courseSlug: string) =>
  courses.find((course) => getCourseSlug(course) === courseSlug) || null;

export const buildCoursePlaylist = (course: CourseRecord): CoursePlaylistItem[] => {
  const totalItems = Math.max(4, Math.min(Math.max(course.lessons, 1), 8));
  const blueprint: Array<Pick<CoursePlaylistItem, "title" | "synopsis" | "kind">> = [
    {
      title: "Course Overview",
      synopsis: "Set the creative direction, tools, and performance goals for the full session.",
      kind: "lesson",
    },
    {
      title: "Primary Breakdown",
      synopsis: "Walk through the core workflow and identify the choices that shape the final result.",
      kind: "lesson",
    },
    {
      title: "Guided Practice Sprint",
      synopsis: "Apply the technique in a shorter exercise while keeping the process structured and repeatable.",
      kind: "lab",
    },
    {
      title: "Polish Pass",
      synopsis: "Tighten timing, spacing, and presentation so the work reads with more confidence.",
      kind: "lesson",
    },
    {
      title: "Reference Pack",
      synopsis: "Review prompts, visual cues, and supporting notes that reinforce the technique after class.",
      kind: "resource",
    },
    {
      title: "Creative Review",
      synopsis: "Reflect on common mistakes, stronger alternatives, and what to practice next.",
      kind: "lab",
    },
  ];

  return Array.from({ length: totalItems }, (_, index) => {
    const beat = blueprint[index % blueprint.length];
    const firstWord = course.title.split(" ").slice(0, 2).join(" ");
    const durationBase = Math.max(8, Math.round(course.durationMinutes / totalItems));
    const minutes = Math.max(6, durationBase + (index % 3) * 4);

    return {
      id: `${getCourseSlug(course)}-lesson-${index + 1}`,
      order: index + 1,
      title: index === 0 ? `${firstWord} Intensive` : beat.title,
      synopsis:
        index === 0
          ? `Open the main guided session for ${course.title.toLowerCase()} and settle into the course rhythm.`
          : beat.synopsis,
      durationLabel: minutesToLabel(minutes),
      kind: beat.kind,
      isLaunchLesson: index === 0,
    };
  });
};
