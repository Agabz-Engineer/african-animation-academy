import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ dimensions: string[] }> }
) {
  const { dimensions } = await context.params;
  const dimension = dimensions?.[0] || "400x300";
  const [width, height] = dimension.split("x").map(Number);
  
  // Create a simple SVG placeholder with animation theme
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8A020;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#C1440E;stop-opacity:0.2" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)" />
      <rect x="10%" y="10%" width="80%" height="80%" fill="none" stroke="#E8A020" stroke-width="2" rx="8" />
      <text x="50%" y="45%" text-anchor="middle" fill="#E8A020" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
        Animation
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="#C1440E" font-family="Arial, sans-serif" font-size="14">
        ${width} × ${height}
      </text>
      <circle cx="85%" cy="15%" r="8" fill="#E8A020" opacity="0.6" />
      <polygon points="80,25 85,15 90,25" fill="#E8A020" />
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
    },
  });
}
