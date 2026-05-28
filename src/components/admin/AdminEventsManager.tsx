"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Input, Modal, Space, Table, Tag, message as antMessage } from "antd";
import { DeleteOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type EventSpeaker = {
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
};

type EventItem = {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  date: string | Date;
  timezone: string;
  location: string;
  type: "online" | "physical";
  meetingLink: string | null;
  status: "scheduled" | "updated" | "cancelled";
  speakers: EventSpeaker[];
  recap: string | null;
  recapImageUrl: string | null;
  rsvpCount: number;
};

type Attendee = {
  id: string;
  createdAt: string | Date;
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
};

type ImageUploadTarget = "createCover" | "createRecap" | "editCover" | "editRecap";

function toDateInputValue(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function parseSpeakers(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, title = "", bio = "", imageUrl = ""] = line.split("|").map((part) => part.trim());
      return {
        name,
        ...(title ? { title } : {}),
        ...(bio ? { bio } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      };
    })
    .filter((speaker) => speaker.name);
}

function serializeSpeakers(speakers: EventSpeaker[]) {
  return speakers
    .map((speaker) => [speaker.name, speaker.title ?? "", speaker.bio ?? "", speaker.imageUrl ?? ""].join(" | "))
    .join("\n");
}

function optionalTextField(formData: FormData, name: string, clearable: boolean) {
  const value = String(formData.get(name) ?? "");
  return value || (clearable ? null : undefined);
}

function eventPayload(form: HTMLFormElement, options: { clearable?: boolean } = {}) {
  const formData = new FormData(form);
  const type = String(formData.get("type") ?? "physical") as "online" | "physical";
  const clearable = options.clearable ?? false;

  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    date: new Date(String(formData.get("date") ?? "")).toISOString(),
    timezone: String(formData.get("timezone") ?? "America/New_York"),
    location: type === "online" ? "Online" : String(formData.get("location") ?? ""),
    type,
    coverImageUrl: optionalTextField(formData, "coverImageUrl", clearable),
    meetingLink: optionalTextField(formData, "meetingLink", clearable),
    speakers: parseSpeakers(formData.get("speakers")),
    recap: optionalTextField(formData, "recap", clearable),
    recapImageUrl: optionalTextField(formData, "recapImageUrl", clearable),
  };
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ImageUploadField({
  inputId,
  isUploading,
  label,
  name,
  onChange,
  onUpload,
  value,
}: {
  inputId: string;
  isUploading: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  value: string;
}) {
  return (
    <div className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      <input name={name} type="hidden" value={value} />
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpload(file);
          }
          event.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          icon={<UploadOutlined />}
          loading={isUploading}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {value ? "Replace image" : "Upload image"}
        </Button>
        {value ? (
          <>
            <Button icon={<DeleteOutlined />} onClick={() => onChange("")}>
              Remove
            </Button>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs font-bold !text-[#8c0504]">
              Open image
            </a>
          </>
        ) : null}
      </div>
      {value ? (
        <div
          aria-label={`${label} preview`}
          className="aspect-video w-full max-w-sm rounded-md border border-[#d8d2c5] bg-cover bg-center"
          style={{ backgroundImage: `url("${value}")` }}
        />
      ) : (
        <span className="text-xs font-normal text-[#667085]">JPG, PNG, WebP, or GIF up to 10MB.</span>
      )}
    </div>
  );
}

export function AdminEventsManager({ events }: { events: EventItem[] }) {
  const [items, setItems] = useState(events);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [createCoverImageUrl, setCreateCoverImageUrl] = useState("");
  const [createRecapImageUrl, setCreateRecapImageUrl] = useState("");
  const [editCoverImageUrl, setEditCoverImageUrl] = useState("");
  const [editRecapImageUrl, setEditRecapImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState<ImageUploadTarget | null>(null);
  const [savingEventId, setSavingEventId] = useState<string | null>(null);
  const [attendeesEvent, setAttendeesEvent] = useState<EventItem | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((event) =>
      [
        event.title,
        event.description,
        event.location,
        event.type,
        event.status,
        event.timezone,
        ...event.speakers.map((speaker) => `${speaker.name} ${speaker.title ?? ""}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchTerm]);

  async function uploadEventImage(
    file: File,
    target: ImageUploadTarget,
    setUrl: (value: string) => void,
  ) {
    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(target);
    setError("");

    try {
      const response = await api.post("/api/admin/events/images", formData);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to upload image.");
        antMessage.error(result?.error?.message ?? "Unable to upload image.");
        return;
      }

      setUrl(result.data.image.url);
      antMessage.success("Image uploaded.");
    } finally {
      setUploadingImage(null);
    }
  }

  function openEdit(event: EventItem) {
    setEditingEvent(event);
    setEditCoverImageUrl(event.coverImageUrl ?? "");
    setEditRecapImageUrl(event.recapImageUrl ?? "");
  }

  function closeEdit() {
    setEditingEvent(null);
    setEditCoverImageUrl("");
    setEditRecapImageUrl("");
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const response = await api.post("/api/admin/events", eventPayload(form));
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create event.");
        antMessage.error(result?.error?.message ?? "Unable to create event.");
        return;
      }

      setItems((current) => [{ ...result.data.event, rsvpCount: 0 }, ...current]);
      form.reset();
      setCreateCoverImageUrl("");
      setCreateRecapImageUrl("");
      antMessage.success("Event created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEvent) return;

    setSavingEventId(editingEvent.id);
    setError("");

    try {
      const response = await api.patch(`/api/admin/events/${editingEvent.id}`, eventPayload(event.currentTarget, { clearable: true }));
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to update event.");
        antMessage.error(result?.error?.message ?? "Unable to update event.");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === editingEvent.id ? { ...item, ...result.data.event } : item,
        ),
      );
      closeEdit();
      antMessage.success("Event updated.");
    } finally {
      setSavingEventId(null);
    }
  }

  async function cancelEvent(event: EventItem) {
    setSavingEventId(event.id);
    setError("");

    try {
      const response = await api.patch(`/api/admin/events/${event.id}`, { status: "cancelled" });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to cancel event.");
        antMessage.error(result?.error?.message ?? "Unable to cancel event.");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === event.id ? { ...item, status: "cancelled" } : item,
        ),
      );
      antMessage.success("Event cancelled.");
    } finally {
      setSavingEventId(null);
    }
  }

  async function openAttendees(event: EventItem) {
    setAttendeesEvent(event);
    setAttendees([]);
    setAttendeesLoading(true);

    try {
      const response = await api.get(`/api/admin/events/${event.id}/attendees`);
      const result = response.data;
      setAttendees(isApiSuccess(response.status) ? result.data.attendees ?? [] : []);
    } finally {
      setAttendeesLoading(false);
    }
  }

  const columns: TableColumnsType<EventItem> = [
    {
      title: "Event",
      dataIndex: "title",
      key: "title",
      width: 320,
      render: (_: string, event) => (
        <div>
          <div className="font-bold text-[#202020]">{event.title}</div>
          <div className="line-clamp-2 text-xs text-[#667085]">{event.description}</div>
          <a href={`/events/${event.id}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-bold !text-[#8c0504]">
            Open public page
          </a>
        </div>
      ),
    },
    {
      title: "When",
      dataIndex: "date",
      key: "date",
      width: 190,
      render: (_: string, event) => (
        <div>
          <div className="font-bold">{formatDate(event.date)}</div>
          <div className="text-xs text-[#667085]">{event.timezone}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 160,
      render: (_: string, event) => (
        <div>
          <Tag color={event.type === "online" ? "blue" : "green"}>{event.type === "online" ? "ONLINE" : "PHYSICAL"}</Tag>
          <div className="mt-1 text-xs text-[#667085]">{event.type === "online" ? "Link emailed after RSVP" : event.location}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: EventItem["status"]) => (
        <Tag color={status === "cancelled" ? "red" : status === "updated" ? "orange" : "green"}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "RSVPs",
      dataIndex: "rsvpCount",
      key: "rsvpCount",
      width: 110,
      render: (count: number) => <span className="font-bold">{count}</span>,
    },
    {
      title: "Action",
      key: "action",
      width: 250,
      render: (_, event) => (
        <Space size="small" wrap>
          <Button size="small" onClick={() => openEdit(event)}>Edit</Button>
          <Button size="small" loading={attendeesLoading && attendeesEvent?.id === event.id} onClick={() => openAttendees(event)}>Attendees</Button>
          <Button
            danger
            size="small"
            disabled={event.status === "cancelled"}
            loading={savingEventId === event.id}
            onClick={() => {
              Modal.confirm({
                title: "Cancel event?",
                content: "Attendees will be notified that this event was cancelled.",
                okText: "Cancel Event",
                okButtonProps: { danger: true },
                onOk: () => cancelEvent(event),
              });
            }}
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} event${total === 1 ? "" : "s"}`,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
  };

  return (
    <div className="grid gap-6">
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={createEvent} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Event title
          <input name="title" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <ImageUploadField
          inputId="event-create-cover-image"
          isUploading={uploadingImage === "createCover"}
          label="Cover image"
          name="coverImageUrl"
          onChange={setCreateCoverImageUrl}
          onUpload={(file) => uploadEventImage(file, "createCover", setCreateCoverImageUrl)}
          value={createCoverImageUrl}
        />
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Description
          <textarea name="description" required rows={4} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Date and time
          <input name="date" required type="datetime-local" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Timezone
          <input name="timezone" defaultValue="America/New_York" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Event type
          <select name="type" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
            <option value="physical">Physical</option>
            <option value="online">Digital / Online</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Address or location
          <input name="location" placeholder="Full address for physical events" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Zoom / Meet link (optional)
          <input name="meetingLink" type="url" placeholder="Only needed for digital events; physical events can leave this blank" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Speakers
          <textarea name="speakers" rows={3} placeholder="One per line: Name | Title | Bio | Image URL" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <ImageUploadField
          inputId="event-create-recap-image"
          isUploading={uploadingImage === "createRecap"}
          label="Recap image"
          name="recapImageUrl"
          onChange={setCreateRecapImageUrl}
          onUpload={(file) => uploadEventImage(file, "createRecap", setCreateRecapImageUrl)}
          value={createRecapImageUrl}
        />
        <label className="grid gap-2 text-sm font-bold">
          Past event recap
          <textarea name="recap" rows={3} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <button disabled={isSubmitting} className="h-12 w-fit rounded-md bg-[#202020] px-8 text-sm font-bold text-white shadow-[0_3px_0_#111] disabled:opacity-60">
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </form>

      <div className="grid gap-3 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search events by title, type, status, speaker, or location"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="max-w-xl"
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={pagination}
          scroll={{ x: 1170 }}
          bordered
        />
      </div>

      <Modal
        title="Edit event"
        open={Boolean(editingEvent)}
        onCancel={closeEdit}
        footer={null}
        width={820}
      >
        {editingEvent ? (
          <form onSubmit={saveEdit} className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Event title
              <input name="title" required defaultValue={editingEvent.title} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <ImageUploadField
              inputId="event-edit-cover-image"
              isUploading={uploadingImage === "editCover"}
              label="Cover image"
              name="coverImageUrl"
              onChange={setEditCoverImageUrl}
              onUpload={(file) => uploadEventImage(file, "editCover", setEditCoverImageUrl)}
              value={editCoverImageUrl}
            />
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Description
              <textarea name="description" required rows={4} defaultValue={editingEvent.description} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Date and time
              <input name="date" required type="datetime-local" defaultValue={toDateInputValue(editingEvent.date)} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Timezone
              <input name="timezone" defaultValue={editingEvent.timezone} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Event type
              <select name="type" defaultValue={editingEvent.type} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
                <option value="physical">Physical</option>
                <option value="online">Digital / Online</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Address or location
              <input name="location" defaultValue={editingEvent.location} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Zoom / Meet link (optional)
              <input name="meetingLink" type="url" defaultValue={editingEvent.meetingLink ?? ""} placeholder="Only needed for digital events; physical events can leave this blank" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Speakers
              <textarea name="speakers" rows={3} defaultValue={serializeSpeakers(editingEvent.speakers)} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <ImageUploadField
              inputId="event-edit-recap-image"
              isUploading={uploadingImage === "editRecap"}
              label="Recap image"
              name="recapImageUrl"
              onChange={setEditRecapImageUrl}
              onUpload={(file) => uploadEventImage(file, "editRecap", setEditRecapImageUrl)}
              value={editRecapImageUrl}
            />
            <label className="grid gap-2 text-sm font-bold">
              Past event recap
              <textarea name="recap" rows={3} defaultValue={editingEvent.recap ?? ""} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <Button htmlType="submit" type="primary" loading={savingEventId === editingEvent.id} className="w-fit">
              Save Event
            </Button>
          </form>
        ) : null}
      </Modal>

      <Modal
        title={attendeesEvent ? `Attendees: ${attendeesEvent.title}` : "Attendees"}
        open={Boolean(attendeesEvent)}
        onCancel={() => setAttendeesEvent(null)}
        footer={null}
      >
        <div className="grid gap-2">
          {attendeesLoading ? (
            <p className="text-sm text-[#667085]">Loading attendees...</p>
          ) : attendees.length ? (
            attendees.map((attendee) => (
              <div key={attendee.id} className="rounded-md border border-[#d9dde3] p-3 text-sm">
                <p className="font-bold">{attendee.user?.name ?? "Unknown attendee"}</p>
                <p className="text-[#667085]">{attendee.user?.email ?? "No email"} / {attendee.user?.role ?? "unknown"}</p>
                <p className="text-xs text-[#667085]">RSVP: {formatDate(attendee.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#667085]">No RSVPs yet.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
