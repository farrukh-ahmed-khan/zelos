"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Modal, Select, Space, Table, Tag, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  ageTrack: string;
  audience: string;
  category: string;
  playlist?: string;
  schoolScope: "global" | "all-schools" | "specific-schools" | "district";
  schoolIds: string[];
  district: string | null;
  order: number;
  releaseDate: string | null;
  dripEnabled: boolean;
  dripDelayMinutes: number;
  isFreePreview: boolean;
  isMissionVideo: boolean;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  attachmentMimeType: string | null;
};

type ContentCategory = {
  id: string;
  name: string;
  playlist: string;
  ageTrack: string;
  audience: string;
};

type School = {
  id: string;
  name: string;
  district: string | null;
};

type SchoolScope = "global" | "all-schools" | "specific-schools" | "district";

const TEACHER_TRACK = "Teachers";
const formLabelClass = "grid gap-2 text-sm font-bold text-[#202020]";
const ageTrackOptions = [
  { value: "all", label: "All Tracks" },
  { value: "child", label: "Children" },
  { value: "teen", label: "Teens" },
  { value: "young-adult", label: "Young Adults" },
  { value: "adult", label: "Adults" },
];

function normalizeAgeTrack(ageTrack: string) {
  const option = ageTrackOptions.find(
    (entry) => entry.value === ageTrack || entry.label === ageTrack,
  );

  return option?.value ?? ageTrack;
}

function formatAgeTrack(ageTrack: string) {
  const option = ageTrackOptions.find(
    (entry) => entry.value === ageTrack || entry.label === ageTrack,
  );

  return option?.label ?? ageTrack;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDelay(minutes: number) {
  if (!minutes) {
    return "No delay";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr${hours === 1 ? "" : "s"}` : `${minutes} min`;
}

export function AdminVideosManager({
  videos,
  categories,
  schools,
  playlistContext,
}: {
  videos: Video[];
  categories: ContentCategory[];
  schools: School[];
  playlistContext?: ContentCategory;
}) {
  const initialAudience = playlistContext?.audience ?? "subscriber";
  const initialAgeTrack =
    playlistContext && playlistContext.audience !== "teacher"
      ? normalizeAgeTrack(playlistContext.ageTrack)
      : "";
  const initialCategoryId = playlistContext?.id ?? "";
  const initialSchoolScope: SchoolScope =
    initialAudience === "teacher" || initialAudience === "student" ? "all-schools" : "global";
  const isPlaylistLocked = Boolean(playlistContext);
  const [items, setItems] = useState(videos);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedAgeTrack, setSelectedAgeTrack] = useState(initialAgeTrack);
  const [selectedAudience, setSelectedAudience] = useState(initialAudience);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedSchoolScope, setSelectedSchoolScope] = useState<SchoolScope>(initialSchoolScope);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isTeacherAudience = selectedAudience === "teacher";
  const isSchoolAudience = selectedAudience === "teacher" || selectedAudience === "student";

  const districtOptions = useMemo(
    () => Array.from(new Set(schools.map((school) => school.district).filter(Boolean))) as string[],
    [schools],
  );

  const matchingCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.audience === selectedAudience &&
          (selectedAudience === "teacher" ||
            normalizeAgeTrack(category.ageTrack) === selectedAgeTrack),
      ),
    [categories, selectedAgeTrack, selectedAudience],
  );

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((video) =>
      [
        video.title,
        video.description,
        video.url ?? "",
        formatAgeTrack(video.ageTrack),
        video.audience,
        video.schoolScope,
        video.district ?? "",
        video.category,
        video.playlist ?? "General",
        video.dripEnabled ? "drip locked" : "open order",
        video.dripEnabled ? formatDelay(video.dripDelayMinutes) : "",
        video.attachmentFileName ?? "",
        video.attachmentMimeType ?? "",
        video.isFreePreview ? "free preview" : "",
        video.isMissionVideo ? "mission video" : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedCategory = categories.find(
      (category) => category.id === selectedCategoryId,
    );

    if (!selectedCategory) {
      setError("Choose a category playlist before uploading.");
      antMessage.error("Choose a category playlist before uploading.");
      return;
    }

    formData.set("category", selectedCategory.name);
    formData.set("playlist", selectedCategory.playlist);
    formData.set("ageTrack", selectedCategory.ageTrack || TEACHER_TRACK);
    formData.set("schoolScope", isSchoolAudience ? selectedSchoolScope : "global");
    formData.set("schoolIds", selectedSchoolScope === "specific-schools" ? selectedSchoolIds.join(",") : "");
    formData.set("district", selectedSchoolScope === "district" ? selectedDistrict : "");

    if (selectedSchoolScope === "specific-schools" && !selectedSchoolIds.length) {
      setError("Choose at least one school for specific-school videos.");
      antMessage.error("Choose at least one school for specific-school videos.");
      return;
    }

    if (selectedSchoolScope === "district" && !selectedDistrict) {
      setError("Choose a district for district-scoped videos.");
      antMessage.error("Choose a district for district-scoped videos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/admin/videos", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to upload video.");
        antMessage.error(result?.error?.message ?? "Unable to upload video.");
        return;
      }

      setItems((current) => [result.data.video, ...current]);
      setMessage("Video uploaded.");
      antMessage.success("Video uploaded successfully.");
      form.reset();
      setSelectedAgeTrack(isPlaylistLocked ? initialAgeTrack : "");
      setSelectedAudience(isPlaylistLocked ? initialAudience : "subscriber");
      setSelectedCategoryId(isPlaylistLocked ? initialCategoryId : "");
      setSelectedSchoolScope(isPlaylistLocked ? initialSchoolScope : "global");
      setSelectedSchoolIds([]);
      setSelectedDistrict("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeVideo(videoId: string) {
    setDeletingVideoId(videoId);
    try {
      const response = await api.delete(`/api/admin/videos/${videoId}`);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to delete video.");
        antMessage.error(result?.error?.message ?? "Unable to delete video.");
        return;
      }

      setItems((current) => current.filter((video) => video.id !== videoId));
      antMessage.success("Video deleted successfully.");
    } finally {
      setDeletingVideoId(null);
    }
  }

  function confirmRemoveVideo(videoId: string) {
    Modal.confirm({
      title: "Delete video?",
      content: "This removes the uploaded video record from the library.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => removeVideo(videoId),
    });
  }

  const columns: TableColumnsType<Video> = [
    {
      title: "Video",
      dataIndex: "title",
      key: "title",
      width: 320,
      render: (title: string, record: Video) => (
        <div>
          <div className="font-bold text-[#202020]">{record.order}. {title}</div>
          <div className="line-clamp-2 text-xs text-[#667085]">{record.description}</div>
          {record.url ? (
            <a
              href={record.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex text-xs font-bold !text-[#8c0504]"
            >
              Open uploaded file
            </a>
          ) : (
            <div className="mt-1 text-xs font-bold text-[#8c0504]">No uploaded file URL</div>
          )}
        </div>
      ),
    },
    {
      title: "Preview",
      key: "preview",
      width: 240,
      render: (_, record: Video) =>
        record.url ? (
          <video
            className="aspect-video w-[200px] rounded-md bg-black"
            controls
            preload="metadata"
          >
            <source src={record.url} />
          </video>
        ) : (
          <div className="grid aspect-video w-[200px] place-items-center rounded-md bg-[#f8fafc] text-xs font-bold text-[#667085]">
            No video
          </div>
        ),
    },
    {
      title: "Library",
      dataIndex: "audience",
      key: "audience",
      width: 150,
      render: (audience: string) => <span className="capitalize">{audience.replace("-", " ")}</span>,
    },
    {
      title: "Schedule",
      dataIndex: "releaseDate",
      key: "releaseDate",
      width: 190,
      render: (releaseDate: string | null) => (
        <div>
          <div className="font-bold text-[#202020]">{releaseDate ? "Scheduled" : "Available now"}</div>
          <div className="text-xs text-[#667085]">{formatDateTime(releaseDate)}</div>
        </div>
      ),
    },
    {
      title: "Age Track",
      dataIndex: "ageTrack",
      key: "ageTrack",
      width: 130,
      render: (ageTrack: string, record: Video) => (
        <Tag color="blue">{record.audience === "teacher" ? "Not needed" : formatAgeTrack(ageTrack)}</Tag>
      ),
    },
    {
      title: "Category / Playlist",
      dataIndex: "category",
      key: "category",
      width: 220,
      render: (_: string, record: Video) => (
        <div>
          <div className="font-bold text-[#202020]">{record.category}</div>
          <div className="text-xs text-[#667085]">{record.playlist ?? "General"}</div>
        </div>
      ),
    },
    {
      title: "School Scope",
      key: "schoolScope",
      width: 220,
      render: (_, record: Video) => {
        if (!["teacher", "student"].includes(record.audience)) {
          return <span className="text-[#999]">Global</span>;
        }

        return (
          <div>
            <div className="font-bold capitalize text-[#202020]">{record.schoolScope.replace("-", " ")}</div>
            <div className="text-xs text-[#667085]">
              {record.schoolScope === "specific-schools"
                ? `${record.schoolIds.length} school${record.schoolIds.length === 1 ? "" : "s"}`
                : record.schoolScope === "district"
                  ? record.district ?? "No district"
                  : "All schools"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Flags",
      key: "flags",
      width: 230,
      render: (_, record: Video) => (
        <Space size="small" wrap>
          <Tag color={record.dripEnabled ? "orange" : "default"}>
            {record.dripEnabled ? "DRIP LOCKED" : "OPEN"}
          </Tag>
          {record.dripEnabled && record.dripDelayMinutes > 0 ? (
            <Tag color="gold">UNLOCK AFTER {formatDelay(record.dripDelayMinutes).toUpperCase()}</Tag>
          ) : null}
          {record.isFreePreview ? <Tag color="green">FREE PREVIEW</Tag> : null}
          {record.isMissionVideo ? <Tag color="purple">MISSION</Tag> : null}
          {record.attachmentUrl ? <Tag color="cyan">ATTACHMENT</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      render: (_, record: Video) => (
        <Button
          danger
          size="small"
          loading={deletingVideoId === record.id}
          onClick={() => confirmRemoveVideo(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} video${total !== 1 ? "s" : ""}`,
  };

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        {playlistContext ? (
          <div className="rounded-md border border-[#d9dde3] bg-[#f8fafc] p-4 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wide text-[#8c0504]">Uploading Into Playlist</div>
            <div className="mt-2 grid gap-3 text-sm md:grid-cols-4">
              <div>
                <div className="font-bold text-[#202020]">Category</div>
                <div className="text-[#667085]">{playlistContext.name}</div>
              </div>
              <div>
                <div className="font-bold text-[#202020]">Playlist</div>
                <div className="text-[#667085]">{playlistContext.playlist}</div>
              </div>
              <div>
                <div className="font-bold text-[#202020]">Audience</div>
                <div className="capitalize text-[#667085]">{playlistContext.audience.replace("-", " ")}</div>
              </div>
              <div>
                <div className="font-bold text-[#202020]">Age Track</div>
                <div className="text-[#667085]">
                  {playlistContext.audience === "teacher" ? "Not needed" : formatAgeTrack(playlistContext.ageTrack)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <label className={formLabelClass}>
          Title
          <input name="title" placeholder="Title" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className={`${formLabelClass} md:col-span-2`}>
          Description
          <textarea name="description" placeholder="Description" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        {!isPlaylistLocked && !isTeacherAudience ? (
          <label className={formLabelClass}>
            Age track
            <select
              name="ageTrack"
              required
              value={selectedAgeTrack}
              onChange={(event) => {
                setSelectedAgeTrack(event.target.value);
                setSelectedCategoryId("");
              }}
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
            >
              <option value="">Select age track</option>
              {ageTrackOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!isPlaylistLocked ? (
          <label className={formLabelClass}>
            Library
            <select
              name="audience"
              value={selectedAudience}
              onChange={(event) => {
                setSelectedAudience(event.target.value);
                if (event.target.value === "teacher") {
                  setSelectedAgeTrack("");
                }
                const nextIsSchoolAudience = event.target.value === "teacher" || event.target.value === "student";
                setSelectedSchoolScope(nextIsSchoolAudience ? "all-schools" : "global");
                setSelectedSchoolIds([]);
                setSelectedDistrict("");
                setSelectedCategoryId("");
              }}
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
            >
              <option value="subscriber">Subscriber Library</option>
              <option value="teacher">Teacher Library</option>
              <option value="student">Student Library</option>
              <option value="public-preview">Free Preview</option>
            </select>
          </label>
        ) : null}
        {isSchoolAudience ? (
          <>
            <label className={formLabelClass}>
              School scope
              <select
                value={selectedSchoolScope}
                onChange={(event) => {
                  setSelectedSchoolScope(event.target.value as "all-schools" | "specific-schools" | "district");
                  setSelectedSchoolIds([]);
                  setSelectedDistrict("");
                }}
                className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
              >
                <option value="all-schools">All Schools</option>
                <option value="specific-schools">Specific Schools</option>
                <option value="district">District</option>
              </select>
            </label>
            {selectedSchoolScope === "specific-schools" ? (
              <label className={formLabelClass}>
                Schools
                <Select
                  mode="multiple"
                  placeholder="Select schools"
                  value={selectedSchoolIds}
                  onChange={setSelectedSchoolIds}
                  options={schools.map((school) => ({
                    value: school.id,
                    label: `${school.name}${school.district ? ` / ${school.district}` : ""}`,
                  }))}
                  className="min-h-[48px] font-normal"
                />
              </label>
            ) : null}
            {selectedSchoolScope === "district" ? (
              <label className={formLabelClass}>
                District
                <select
                  value={selectedDistrict}
                  onChange={(event) => setSelectedDistrict(event.target.value)}
                  className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
                >
                  <option value="">Select district</option>
                  {districtOptions.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </>
        ) : null}
        {!isPlaylistLocked ? (
          <label className={formLabelClass}>
            Category playlist
            <select
              name="categoryPlaylist"
              required
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              disabled={!isTeacherAudience && !selectedAgeTrack}
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal disabled:bg-[#f5f5f5] disabled:text-[#999]"
            >
              <option value="">
                {isTeacherAudience || selectedAgeTrack ? "Select category playlist" : "Select age track first"}
              </option>
              {matchingCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} / {category.playlist}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className={formLabelClass}>
          Sequence order
          <input name="order" type="number" min={1} placeholder="Sequence order" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className={formLabelClass}>
          Release date
          <input name="releaseDate" type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className={`${formLabelClass} md:col-span-2`}>
          Video file
          <input name="video" type="file" accept="video/*" required className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Optional lesson file
          <input
            name="attachment"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="rounded-md border border-[#d8d2c5] bg-white px-3 py-3 font-normal"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="dripEnabled" type="checkbox" value="true" defaultChecked />
          Sequential drip lock
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Drip unlock delay in minutes
          <input
            name="dripDelayMinutes"
            type="number"
            min={0}
            max={10080}
            step={1}
            list="drip-delay-options"
            defaultValue={0}
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          />
          <datalist id="drip-delay-options">
            <option value="0" label="Immediately" />
            <option value="10" label="10 minutes" />
            <option value="30" label="30 minutes" />
            <option value="120" label="2 hours" />
            <option value="1440" label="1 day" />
          </datalist>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isFreePreview" type="checkbox" value="true" />
          Free preview
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isMissionVideo" type="checkbox" value="true" />
          Homepage mission video
        </label>
        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Upload Video
          </Button>
        </Space>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          placeholder="Search videos by title, category, playlist, age track..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
          size="large"
          className="mb-2"
        />
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={pagination}
          scroll={{ x: 1600 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="grid gap-3 lg:grid-cols-[360px_1fr]">
                {record.url ? (
                  <video
                    className="aspect-video w-full rounded-md bg-black"
                    controls
                    preload="metadata"
                  >
                    <source src={record.url} />
                  </video>
                ) : (
                  <div className="grid aspect-video w-full place-items-center rounded-md bg-[#f8fafc] text-sm font-bold text-[#667085]">
                    No uploaded video URL found
                  </div>
                )}
                <div className="grid content-start gap-2 text-sm">
                  <div>
                    <div className="font-bold text-[#202020]">Description</div>
                    <div className="text-[#667085]">{record.description}</div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="font-bold text-[#202020]">Category</div>
                      <div className="text-[#667085]">{record.category} / {record.playlist ?? "General"}</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#202020]">Release</div>
                      <div className="text-[#667085]">{formatDateTime(record.releaseDate)}</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#202020]">Library</div>
                      <div className="capitalize text-[#667085]">{record.audience.replace("-", " ")}</div>
                    </div>
                    <div>
                      <div className="font-bold text-[#202020]">Video URL</div>
                      {record.url ? (
                        <a href={record.url} target="_blank" rel="noreferrer" className="break-all !text-[#8c0504]">
                          {record.url}
                        </a>
                      ) : (
                        <span className="text-[#667085]">Not available</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#202020]">Attachment</div>
                      {record.attachmentUrl ? (
                        <a href={record.attachmentUrl} target="_blank" rel="noreferrer" className="break-all !text-[#8c0504]">
                          {record.attachmentFileName ?? record.attachmentUrl}
                        </a>
                      ) : (
                        <span className="text-[#667085]">No attachment</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ),
          }}
          locale={{
            emptyText: "No videos found",
          }}
        />
      </div>
    </div>
  );
}
