import type { MetadataRoute } from "next";

import { macroModules } from "@/lib/data/modules";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://macro-regime-dashboard.vercel.app";

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/calendar`,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${baseUrl}/playbook`,
      changeFrequency: "daily",
      priority: 0.8
    },
    ...macroModules.map((module) => ({
      url: `${baseUrl}/${module.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.75
    }))
  ];
}
