'use client';

import { useEffect, useState } from "react";
import { fallbackAlbums, fallbackPhotos } from "@/lib/mockData";
import { useViewer } from "@/lib/useViewer";
import { formatDate, sortByDate } from "@/lib/utils";

export function PhotoArchive() {
  const viewer = useViewer();
  const client = viewer.client;
  const [albums, setAlbums] = useState(fallbackAlbums);
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [albumForm, setAlbumForm] = useState({ title: "", description: "" });
  const [photoForm, setPhotoForm] = useState({ album_id: "", title: "", caption: "", event_date: "" });
  const [files, setFiles] = useState({ image_file: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  function canDeleteItem(item, ownerField) {
    if (viewer.isAdmin) return true;
    if (!viewer.user || !ownerField) return false;
    return item?.[ownerField] === viewer.user.id;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      if (!client) {
        if (active) {
          setAlbums(sortByDate(fallbackAlbums, "created_at", false));
          setPhotos(sortByDate(fallbackPhotos, "event_date", false));
          setLoading(false);
        }
        return;
      }

      const [{ data: albumRows }, { data: photoRows }] = await Promise.all([
        client.from("photo_albums").select("*").order("created_at", { ascending: false }),
        client.from("photos").select("*").order("event_date", { ascending: false }),
      ]);

      if (active) {
        setAlbums(albumRows ?? []);
        setPhotos(photoRows ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [client]);

  async function addAlbum(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!albumForm.title.trim()) return;

    if (!client) {
      const album = { id: crypto.randomUUID(), ...albumForm, created_at: new Date().toISOString(), created_by: viewer.user?.id ?? null };
      setAlbums((current) => [album, ...current]);
      setAlbumForm({ title: "", description: "" });
      setMessage("앨범이 추가됐어요.");
      return;
    }

    const { data, error: insertError } = await client.from("photo_albums").insert([
      {
        ...albumForm,
        cover_url: "",
        created_by: viewer.user?.id ?? null,
      },
    ]).select("*").single();
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("앨범이 추가됐어요.");
    setAlbumForm({ title: "", description: "" });
    if (data) {
      setAlbums((current) => [data, ...current]);
    }
  }

  async function addPhoto(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!photoForm.album_id || !photoForm.title.trim()) return;

    if (!client) {
      const photo = {
        id: crypto.randomUUID(),
        ...photoForm,
        image_url: "",
        created_at: new Date().toISOString(),
        created_by: viewer.user?.id ?? null,
      };
      setPhotos((current) => [photo, ...current]);
      setPhotoForm({ album_id: photoForm.album_id, title: "", caption: "", event_date: "" });
      setFiles({ image_file: null });
      setMessage("사진이 추가됐어요.");
      return;
    }

    let imageUrl = "";
    const file = files.image_file;
    if (file) {
      const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await client.storage.from("photos").upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      imageUrl = client.storage.from("photos").getPublicUrl(path).data.publicUrl;
    }

    const { data, error: insertError } = await client.from("photos").insert([
      {
        ...photoForm,
        image_url: imageUrl,
        created_by: viewer.user?.id ?? null,
      },
    ]).select("*").single();
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("사진이 추가됐어요.");
    setPhotoForm({ album_id: photoForm.album_id, title: "", caption: "", event_date: "" });
    setFiles({ image_file: null });
    if (data) {
      setPhotos((current) => [data, ...current]);
    }
  }

  async function deleteItem(targetType, targetId, table) {
    if (!client) return;
    setBusyKey(`${targetType}:${targetId}`);
    setError("");
    setMessage("");

    try {
      if (viewer.isAdmin) {
        const response = await fetch("/api/admin/content", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetType, targetId }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "삭제에 실패했습니다.");
        }
      } else {
        const { error: deleteError } = await client.from(table).delete().eq("id", targetId);
        if (deleteError) throw deleteError;
      }

      if (table === "photo_albums") {
        setAlbums((current) => current.filter((item) => item.id !== targetId));
        setPhotos((current) => current.map((item) => (item.album_id === targetId ? { ...item, album_id: null } : item)));
      }

      if (table === "photos") {
        setPhotos((current) => current.filter((item) => item.id !== targetId));
      }

      setMessage("삭제가 완료됐어요.");
    } catch (deleteError) {
      setError(deleteError.message || "삭제에 실패했습니다.");
    } finally {
      setBusyKey("");
    }
  }

  const photosByAlbum = albums.map((album) => ({
    ...album,
    photos: photos.filter((photo) => photo.album_id === album.id),
  }));

  const ungroupedPhotos = photos.filter((photo) => !photo.album_id || !albums.some((album) => album.id === photo.album_id));

  if (ungroupedPhotos.length > 0) {
    photosByAlbum.push({
      id: "ungrouped-photos",
      title: "기타 사진",
      description: "앨범 없이 남아 있는 사진들",
      created_at: null,
      created_by: null,
      photos: ungroupedPhotos,
    });
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            사진 아카이브
          </h2>
          <p className="section-description">앨범과 사진을 함께 보관하는 공간입니다. Google 로그인 후 올린 사진과 앨범은 직접 삭제할 수 있어요.</p>
        </div>
        <span className="tag">{loading ? "불러오는 중" : `${photos.length}장`}</span>
      </div>

      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="notice" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div> : null}

      <div className="section-grid">
        <form className="panel" onSubmit={addAlbum}>
          <h3 className="section-title" style={{ fontSize: 20 }}>앨범 추가</h3>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="album-title">앨범 제목</label>
              <input id="album-title" value={albumForm.title} onChange={(event) => setAlbumForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="album-desc">설명</label>
              <textarea id="album-desc" value={albumForm.description} onChange={(event) => setAlbumForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
          </div>
          <button className="primary" type="submit" style={{ marginTop: 16 }}>앨범 저장</button>
        </form>

        <form className="panel" onSubmit={addPhoto}>
          <h3 className="section-title" style={{ fontSize: 20 }}>사진 추가</h3>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="photo-album">앨범</label>
              <select id="photo-album" value={photoForm.album_id} onChange={(event) => setPhotoForm((current) => ({ ...current, album_id: event.target.value }))}>
                <option value="">선택하세요</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>{album.title}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="photo-title">제목</label>
              <input id="photo-title" value={photoForm.title} onChange={(event) => setPhotoForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="photo-date">날짜</label>
              <input id="photo-date" type="date" value={photoForm.event_date} onChange={(event) => setPhotoForm((current) => ({ ...current, event_date: event.target.value }))} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="photo-caption">캡션</label>
              <textarea id="photo-caption" value={photoForm.caption} onChange={(event) => setPhotoForm((current) => ({ ...current, caption: event.target.value }))} />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="photo-file">이미지 파일</label>
              <input id="photo-file" type="file" accept="image/*" onChange={(event) => setFiles({ image_file: event.target.files?.[0] ?? null })} />
              <span className="helper">{files.image_file?.name ?? "선택되지 않음"}</span>
            </div>
          </div>
          <button className="primary" type="submit" style={{ marginTop: 16 }}>사진 저장</button>
        </form>
      </div>

      <div className="divider" />

      <div className="album-list">
        {photosByAlbum.map((album) => (
          <article key={album.id} className="album-card">
            <div className="cover">{album.cover_url ? <img className="photo-image" src={album.cover_url} alt={album.title} /> : "Album"}</div>
            <h3 className="album-title">{album.title}</h3>
            <p className="album-desc">{album.description}</p>
            <div className="card-footer" style={{ marginTop: 10 }}>
              <p className="helper">사진 {album.photos.length}장 · {formatDate(album.created_at)}</p>
               {album.id !== "ungrouped-photos" && canDeleteItem(album, "created_by") ? (
                 <button className="danger" type="button" disabled={busyKey === `album:${album.id}`} onClick={() => deleteItem("album", album.id, "photo_albums")}>
                   {busyKey === `album:${album.id}` ? "삭제 중..." : "앨범 삭제"}
                 </button>
               ) : null}
            </div>
            <div className="photo-grid" style={{ marginTop: 14 }}>
              {album.photos.map((photo) => (
                <article key={photo.id} className="photo-card">
                  <div className="cover">{photo.image_url ? <img className="photo-image" src={photo.image_url} alt={photo.title} /> : "Photo"}</div>
                  <h4 className="card-title" style={{ fontSize: 16 }}>{photo.title}</h4>
                  <p className="photo-caption">{photo.caption}</p>
                  <div className="card-footer" style={{ marginTop: 10 }}>
                    <p className="helper">{formatDate(photo.event_date)}</p>
                    {canDeleteItem(photo, "created_by") ? (
                      <button className="danger" type="button" disabled={busyKey === `photo:${photo.id}`} onClick={() => deleteItem("photo", photo.id, "photos")}>
                        {busyKey === `photo:${photo.id}` ? "삭제 중..." : "삭제"}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
