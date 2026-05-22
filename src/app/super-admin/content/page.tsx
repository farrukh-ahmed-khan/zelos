import Link from "next/link";
import {
  SuperAdminChrome,
  SuperAdminMetric,
  SuperAdminPanel,
  SuperAdminRow,
  SuperAdminTable,
} from "@/components/super-admin/SuperAdminChrome";
import { getSuperAdminContentDashboard } from "@/lib/super-admin/dashboard";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

export default async function SuperAdminContentPage() {
  await requireSuperAdminPage();
  const data = await getSuperAdminContentDashboard();

  return (
    <SuperAdminChrome title="Content Control" eyebrow="Super Admin / Content">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.videosByAudience.map((audience) => (
          <SuperAdminMetric key={audience._id ?? "unknown"} label="Audience Library" value={audience.count} detail={audience._id ?? "unknown"} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel
          title="Video Tracks"
          action={<Link href="/admin/videos" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Manage Videos</Link>}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {data.videosByTrack.map((track) => (
              <SuperAdminMetric key={track._id ?? "unknown"} label="Age Track" value={track.count} detail={track._id ?? "unknown"} />
            ))}
          </div>
        </SuperAdminPanel>

        <SuperAdminPanel
          title="Subscriber Downloads"
          action={<Link href="/admin/subscriber-content" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Manage Subscriber Content</Link>}
        >
          <SuperAdminTable>
            {data.subscriberResources.map((resource) => (
              <SuperAdminRow
                key={resource._id.toString()}
                title={`${resource.order}. ${resource.title}`}
                meta={`${resource.resourceType} / ${resource.ageTrack}`}
                value={resource.isActive ? "active" : "inactive"}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>

        <SuperAdminPanel
          title="Categories"
          action={<Link href="/admin/content-categories" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Manage Categories</Link>}
        >
          <SuperAdminTable>
            {data.categories.slice(0, 12).map((category) => (
              <SuperAdminRow
                key={category._id.toString()}
                title={category.name}
                meta={`${category.audience} / ${category.ageTrack}`}
                value={category.isActive ? "active" : "inactive"}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>

      <div className="mt-6">
        <SuperAdminPanel title="Latest Videos">
          <SuperAdminTable>
            {data.latestVideos.map((video) => (
              <SuperAdminRow
                key={video._id.toString()}
                title={`${video.order}. ${video.title}`}
                meta={`${video.audience} / ${video.ageTrack} / ${video.category}`}
                value={video.dripEnabled ? "drip" : "open"}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>
    </SuperAdminChrome>
  );
}
