// src/services/playlist.service.js
import { pb } from "@/pb";

const coll = () => pb.collection("playlists");

/* ------------ Helper JSON seguro ------------ */
function toJsonString(v) {
  if (v == null) return "[]";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return "[]";
  }
}

/* ------------ CREATE ------------ */
export async function createPlaylist(data) {
  const owner = pb.authStore.model?.id;
  if (!owner) throw new Error("No autenticado");

  if (data instanceof FormData) {
    if (!data.has("owner")) data.append("owner", owner);
    return coll().create(data, { requestKey: null });
  }

  const {
    title = "",
    tracksCount = 0,
    duration = "",
    cover = null,
    tags = [],
    tracks = [],
  } = data;

  const fd = new FormData();
  fd.append("title", title);
  fd.append("owner", owner);
  fd.append("tracksCount", String(tracksCount));
  fd.append("duration", duration);
  fd.append("tags", toJsonString(tags));
  fd.append("tracks", toJsonString(tracks));
  if (cover) fd.append("cover", cover);

  return coll().create(fd, { requestKey: null });
}

/* ------------ LIST OF MY PLAYLISTS ------------ */
export async function listMyPlaylists({ page = 1, perPage = 50 } = {}) {
  const owner = pb.authStore.model?.id;
  if (!owner) throw new Error("No autenticado");

  return coll().getList(page, perPage, {
    filter: `owner="${owner}"`,
    sort: "-created",
    requestKey: null,
  });
}

/* ------------ GET ONE ------------ */
export async function getPlaylist(id) {
  return coll().getOne(id, { expand: "owner", requestKey: null });
}

/* ------------ UPDATE ------------ */
export async function updatePlaylist(id, data) {
  if (data instanceof FormData) {
    return coll().update(id, data, { requestKey: null });
  }

  const payload = { ...data };

  if (Array.isArray(payload.tracks))
    payload.tracks = toJsonString(payload.tracks);

  if (Array.isArray(payload.tags))
    payload.tags = toJsonString(payload.tags);

  return coll().update(id, payload, { requestKey: null });
}

/* ------------ DELETE ------------ */
export async function deletePlaylist(id) {
  return coll().delete(id, { requestKey: null });
}

/* ------------ SEARCH ------------ */
export async function searchPlaylists({
  text = "",
  page = 1,
  perPage = 10,
} = {}) {
  const filter = text ? `title~"${text}"` : "";

  return coll().getList(page, perPage, {
    filter,
    sort: "-created",
    requestKey: null,
  });
}

/* ------------ GET BY TITLE ------------ */
export async function getPlaylistByTitle(title) {
  const safe = String(title || "").replace(/"/g, '\\"');

  return coll().getFirstListItem(`title="${safe}"`, {
    expand: "owner",
    requestKey: null,
  });
}

