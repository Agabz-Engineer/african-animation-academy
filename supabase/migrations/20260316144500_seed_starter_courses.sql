-- Seed starter course catalog into the live courses table so admin can manage them.

update public.courses
set
  description = 'Master the core principles of designing compelling characters for animation.',
  instructor = 'Zenock G.-A.',
  level = 'Beginner',
  duration = 270,
  lessons = 1,
  price = 0,
  access_tier = 'free',
  thumbnail_url = null,
  video_path = 'https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10',
  status = 'published'
where title = 'Quick Poses for Strong Silhouettes';

insert into public.courses (
  title,
  description,
  instructor,
  level,
  duration,
  lessons,
  price,
  access_tier,
  rating,
  enrolled_count,
  thumbnail_url,
  video_path,
  status,
  created_by
)
select
  'Quick Poses for Strong Silhouettes',
  'Master the core principles of designing compelling characters for animation.',
  'Zenock G.-A.',
  'Beginner',
  270,
  1,
  0,
  'free',
  0,
  0,
  null,
  'https://www.canva.com/design/DAHD3nwYBvg/GZo8Ds7IPpm-D8lFgi4oQA/watch?utm_content=DAHD3nwYBvg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6f9a7dbd10',
  'published',
  null
where not exists (
  select 1 from public.courses where title = 'Quick Poses for Strong Silhouettes'
);

update public.courses
set
  description = 'Study rhythm, weight, and personality in walk cycles using a lively gathering-place scene.',
  instructor = 'Zenock G.-A.',
  level = 'Beginner',
  duration = 60,
  lessons = 1,
  price = 0,
  access_tier = 'free',
  thumbnail_url = null,
  video_path = 'https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0',
  status = 'published'
where title = 'Expressive Walk Cycles: The Gathering Place Study';

insert into public.courses (
  title,
  description,
  instructor,
  level,
  duration,
  lessons,
  price,
  access_tier,
  rating,
  enrolled_count,
  thumbnail_url,
  video_path,
  status,
  created_by
)
select
  'Expressive Walk Cycles: The Gathering Place Study',
  'Study rhythm, weight, and personality in walk cycles using a lively gathering-place scene.',
  'Zenock G.-A.',
  'Beginner',
  60,
  1,
  0,
  'free',
  0,
  0,
  null,
  'https://www.canva.com/design/DAHD3m29zmY/lVC08kbRQRHEcrTBgHF8mA/watch?utm_content=DAHD3m29zmY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h685ad4c8f0',
  'published',
  null
where not exists (
  select 1 from public.courses where title = 'Expressive Walk Cycles: The Gathering Place Study'
);

update public.courses
set
  description = 'Practice follow-through and overlap by animating a bouncing ball with a tail in Moho.',
  instructor = 'Zenock G.-A.',
  level = 'Intermediate',
  duration = 55,
  lessons = 1,
  price = 0,
  access_tier = 'pro',
  thumbnail_url = null,
  video_path = 'https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4',
  status = 'published'
where title = 'Bouncing Ball with Tail - Moho Tutorial'
   or title = 'Bouncing Ball with Tail — Moho Tutorial';

insert into public.courses (
  title,
  description,
  instructor,
  level,
  duration,
  lessons,
  price,
  access_tier,
  rating,
  enrolled_count,
  thumbnail_url,
  video_path,
  status,
  created_by
)
select
  'Bouncing Ball with Tail — Moho Tutorial',
  'Practice follow-through and overlap by animating a bouncing ball with a tail in Moho.',
  'Zenock G.-A.',
  'Intermediate',
  55,
  1,
  0,
  'pro',
  0,
  0,
  null,
  'https://drive.google.com/file/d/1CDqHpKXvK2GyXGRsoTtweWRBO5IrD8mH/view?ts=69b01be4',
  'published',
  null
where not exists (
  select 1 from public.courses where title = 'Bouncing Ball with Tail — Moho Tutorial'
);

update public.courses
set
  description = 'Core tools, timelines, and workflows to start animating confidently in Toon Boom.',
  instructor = 'Zenock G.-A.',
  level = 'Intermediate',
  duration = 85,
  lessons = 1,
  price = 0,
  access_tier = 'pro',
  thumbnail_url = null,
  video_path = 'https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb',
  status = 'published'
where title = 'oon Boom Fundamentals'
   or title = 'Toon Boom Fundamentals';

insert into public.courses (
  title,
  description,
  instructor,
  level,
  duration,
  lessons,
  price,
  access_tier,
  rating,
  enrolled_count,
  thumbnail_url,
  video_path,
  status,
  created_by
)
select
  'oon Boom Fundamentals',
  'Core tools, timelines, and workflows to start animating confidently in Toon Boom.',
  'Zenock G.-A.',
  'Intermediate',
  85,
  1,
  0,
  'pro',
  0,
  0,
  null,
  'https://www.canva.com/design/DAHD39i_yZs/hd3HNHIO-T3poAO-1K3DFQ/watch?utm_content=DAHD39i_yZs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h25e241a9eb',
  'published',
  null
where not exists (
  select 1 from public.courses where title = 'oon Boom Fundamentals'
);
