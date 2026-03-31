'use client';

import { useEffect, useState } from "react";
import { fallbackPhotos } from "@/lib/mockData";
import { useViewer } from "@/lib/useViewer";
import { formatDate, sortByDate } from "@/lib/utils";

export function PhotoArchive() {
  const viewer = useViewer();
  const client = viewer.client;
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [photoForm, setPhotoForm] = useState({ title: "", caption: "", event_date: "" });
  const [files, setFiles] = useState({ image_file: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  function canDeleteItem(item) {
    if (viewer.isAdmin) return true;
    if (!viewer.user) return false;
    return item?.created_by === viewer.user.id;
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      if (!client) {
        if (active) {
          setPhotos(sortByDate(fallbackPhotos, "event_date", false));
          setLoading(false);
        }
        return;
      }

      const { data: photoRows } = await client.from("photos").select("*").order("event_date", { ascending: false });

      if (active) {
        setPhotos(photoRows ?? []);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [client]);

  async function addPhoto(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!viewer.user) {
      setError("로그인 후에 사진을 올릴 수 있어요.");
      return;
    }

    if (!photoForm.title.trim()) {
      setError("사진 제목을 입력해 주세요.");
      return;
    }

    if (!files.image_file) {
      setError("이미지 파일을 선택해 주세요.");
      return;
    }

    if (!client) {
      const photo = {
        id: crypto.randomUUID(),
        ...photoForm,
        image_url: "",
        created_at: new Date().toISOString(),
        created_by: viewer.user?.id ?? null,
      };
      setPhotos((current) => sortByDate([photo, ...current], "event_date", false));
      setPhotoForm({ title: "", caption: "", event_date: "" });
      setFiles({ image_file: null });
      setMessage("사진이 추가됐어요.");
      return;
    }

    let imageUrl = "";
    const file = files.image_file;
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await client.storage.from("photos").upload(path, file, { contentType: file.type });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    imageUrl = client.storage.from("photos").getPublicUrl(path).data.publicUrl;

    const { data, error: insertError } = await client
      .from("photos")
      .insert([
        {
          ...photoForm,
          album_id: null,
          image_url: imageUrl,
          created_by: viewer.user?.id ?? null,
        },
      ])
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setMessage("사진이 추가됐어요.");
    setPhotoForm({ title: "", caption: "", event_date: "" });
    setFiles({ image_file: null });

    if (data) {
      setPhotos((current) => sortByDate([data, ...current], "event_date", false));
    }
  }

  async function deletePhoto(photoId) {
    setBusyKey(`photo:${photoId}`);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/content/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetType: "photo", targetId: photoId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setPhotos((current) => current.filter((item) => item.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
      setMessage("삭제가 완료됐어요.");
    } catch (deleteError) {
      setError(deleteError.message || "삭제에 실패했습니다.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2 className="section-title" style={{ fontSize: 26 }}>
            사진 아카이브
          </h2>
          <p className="section-description">사진만 간단하게 올리고 모아봅니다.</p>
        </div>
        <span className="tag">{loading ? "불러오는 중" : `${photos.length}장`}</span>
      </div>

      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="notice" style={{ background: "#fef2f2", color: "#b91c1c" }}>{error}</div> : null}

      <form className="panel" onSubmit={addPhoto}>
        <h3 className="section-title" style={{ fontSize: 20 }}>사진 추가</h3>
        <div className="field-grid">
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

      <div className="divider" />

      <div className="photo-grid photo-gallery-grid">
        {photos.length === 0 ? <div className="empty">아직 사진이 없습니다.</div> : null}
        {photos.map((photo) => (
          <article key={photo.id} className="photo-card photo-gallery-card">
            <button className="photo-open-button" type="button" onClick={() => photo.image_url && setSelectedPhoto(photo)}>
              <div className="cover photo-gallery-cover">
                {photo.image_url ? <img className="photo-image" src={photo.image_url} alt={photo.title} /> : "Photo"}
              </div>
            </button>
            <h4 className="card-title" style={{ fontSize: 16 }}>{photo.title}</h4>
            <p className="photo-caption">{photo.caption}</p>
            <div className="card-footer" style={{ marginTop: 10 }}>
              <p className="helper">{formatDate(photo.event_date)}</p>
              {canDeleteItem(photo) ? (
                <button className="danger" type="button" disabled={busyKey === `photo:${photo.id}`} onClick={() => deletePhoto(photo.id)}>
                  {busyKey === `photo:${photo.id}` ? "삭제 중..." : "삭제"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {selectedPhoto ? (
        <div className="photo-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="photo-modal-title" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="photo-modal-head">
              <div>
                <h3 id="photo-modal-title" className="section-title" style={{ fontSize: 24 }}>
                  {selectedPhoto.title}
                </h3>
                <p className="section-description">{formatDate(selectedPhoto.event_date)}</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setSelectedPhoto(null)}>
                닫기
              </button>
            </div>
            <div className="photo-modal-image-wrap">
              <img className="photo-modal-image" src={selectedPhoto.image_url} alt={selectedPhoto.title} />
            </div>
            {selectedPhoto.caption ? <p className="photo-caption">{selectedPhoto.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
