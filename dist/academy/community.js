// ============================================================
// VIVID IELTS — Community page
// REAL, shared data via Supabase (see db.js: getCommunityPosts,
// createCommunityPost, toggleCommunityLike, addCommunityComment,
// getCommunityMemberCount, getCommunityTopContributors).
// Nothing here is faked or per-browser-only — every signed-in
// user reads and writes the same rows.
// ============================================================

(function () {
  'use strict';

  const CHANNELS = [
    { id: 'all',            label: 'All posts',       emoji: '🌐', color: '#7C5CFC' },
    { id: 'general',        label: 'General',         emoji: '💬', color: '#7C5CFC' },
    { id: 'reading',        label: 'Reading',         emoji: '📖', color: '#ffb067' },
    { id: 'listening',      label: 'Listening',       emoji: '🎧', color: '#67a6ff' },
    { id: 'writing',        label: 'Writing',         emoji: '✍️', color: '#ff5a5f' },
    { id: 'speaking',       label: 'Speaking',        emoji: '🗣️', color: '#ffc759' },
    { id: 'study-partners', label: 'Study Partners',  emoji: '🤝', color: '#22c1b4' },
  ];

  const AVATAR_COLORS = ['#7C5CFC', '#FF5A5F', '#00C2D1', '#ffb067', '#22c1b4', '#ff8fc4'];

  function colorFor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function initials(name) {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  function timeAgo(ts) {
    const diff = Math.max(0, Date.now() - ts);
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : str;
    return div.innerHTML;
  }

  const hasBackend = typeof VividDB !== 'undefined' && VividDB.isConfigured;

  let posts = [];
  let currentUserId = null;
  let activeChannel = 'all';
  let searchQuery = '';

  const feedEl = document.getElementById('cmFeed');
  const channelsEl = document.getElementById('cmChannels');
  const leaderboardEl = document.getElementById('cmLeaderboard');
  const searchInput = document.getElementById('cmSearchInput');
  const composerText = document.getElementById('cmComposerText');
  const composerChannel = document.getElementById('cmComposerChannel');
  const postBtn = document.getElementById('cmPostBtn');
  const memberCountEl = document.getElementById('cmMemberCount');

  function renderChannels() {
    channelsEl.innerHTML = CHANNELS.map(ch => `
      <button class="cm-chip${ch.id === activeChannel ? ' active' : ''}" data-channel="${ch.id}">
        <span>${ch.emoji}</span> ${escapeHtml(ch.label)}
      </button>
    `).join('');
    channelsEl.querySelectorAll('.cm-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChannel = btn.dataset.channel;
        renderChannels();
        renderFeed();
      });
    });
  }

  function channelMeta(id) {
    return CHANNELS.find(c => c.id === id) || CHANNELS[1];
  }

  function renderFeed() {
    if (!hasBackend) {
      feedEl.innerHTML = `<div class="cm-empty">Community faqat internetga ulangan (Supabase sozlangan) holatda ishlaydi.</div>`;
      return;
    }

    let visible = posts.slice();

    if (activeChannel !== 'all') {
      visible = visible.filter(p => p.channel === activeChannel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      visible = visible.filter(p =>
        p.text.toLowerCase().includes(q) || (p.author || '').toLowerCase().includes(q)
      );
    }

    if (visible.length === 0) {
      feedEl.innerHTML = `<div class="cm-empty">Bu yerda hali post yo'q — birinchi bo'lib yozing! 💬</div>`;
      return;
    }

    feedEl.innerHTML = visible.map(post => renderPost(post)).join('');
    attachPostHandlers();
  }

  function renderPost(post) {
    const ch = channelMeta(post.channel);
    const avColor = colorFor(post.author);
    const isMine = currentUserId && post.userId === currentUserId;
    const commentsHtml = (post.comments || []).map(c => `
      <div class="cm-comment">
        <span class="cm-comment-avatar" style="background:${colorFor(c.author)}">${initials(c.author)}</span>
        <div class="cm-comment-body"><strong>${escapeHtml(c.author)}</strong> ${escapeHtml(c.text)}</div>
      </div>
    `).join('');

    return `
      <article class="cm-post" data-id="${post.id}">
        <div class="cm-post-head">
          <span class="cm-post-avatar" style="background:${avColor}">${initials(post.author)}</span>
          <div class="cm-post-meta">
            <div class="cm-post-name">${escapeHtml(post.author)}</div>
            <div class="cm-post-sub">${timeAgo(post.ts)}</div>
          </div>
          <span class="cm-post-channel" style="color:${ch.color}; background:${ch.color}22">${ch.emoji} ${escapeHtml(ch.label)}</span>
        </div>
        <p class="cm-post-text">${escapeHtml(post.text)}</p>
        <div class="cm-post-actions">
          <button class="cm-action like-btn${post.likedByMe ? ' liked' : ''}" data-action="like">
            <svg viewBox="0 0 24 24" fill="${post.likedByMe ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.8-9.2C.8 7.8 2.6 4.5 6 4.2c2-.2 3.6.8 6 3.2 2.4-2.4 4-3.4 6-3.2 3.4.3 5.2 3.6 3.8 7.1C19.5 15.9 12 20.5 12 20.5z"/></svg>
            <span>${post.likes} Like${post.likes === 1 ? '' : 's'}</span>
          </button>
          <button class="cm-action" data-action="comment">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 20.5l1.6-4.2a8.3 8.3 0 0 1-1.1-4.2A8.4 8.4 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8"/></svg>
            <span>${(post.comments || []).length} Comment${(post.comments || []).length === 1 ? '' : 's'}</span>
          </button>
          ${isMine ? `<button class="cm-action cm-delete" data-action="delete">🗑 Delete</button>` : ''}
        </div>
        <div class="cm-comments" data-comments hidden>
          ${commentsHtml}
          <div class="cm-comment-form">
            <input type="text" placeholder="Write a reply..." data-comment-input>
            <button data-action="submit-comment">Reply</button>
          </div>
        </div>
      </article>
    `;
  }

  function attachPostHandlers() {
    feedEl.querySelectorAll('.cm-post').forEach(postEl => {
      const id = Number(postEl.dataset.id);

      const likeBtn = postEl.querySelector('[data-action="like"]');
      likeBtn.addEventListener('click', async () => {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        likeBtn.disabled = true;
        const wasLiked = post.likedByMe;
        await VividDB.toggleCommunityLike(id, wasLiked);
        await refreshPosts();
      });

      const commentBtn = postEl.querySelector('[data-action="comment"]');
      const commentsBox = postEl.querySelector('[data-comments]');
      commentBtn.addEventListener('click', () => {
        commentsBox.hidden = !commentsBox.hidden;
      });

      const deleteBtn = postEl.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (!confirm('Delete this post?')) return;
          await VividDB.deleteCommunityPost(id);
          await refreshPosts();
        });
      }

      const submitBtn = postEl.querySelector('[data-action="submit-comment"]');
      const commentInput = postEl.querySelector('[data-comment-input]');
      async function submitComment() {
        const text = commentInput.value.trim();
        if (!text) return;
        submitBtn.disabled = true;
        await VividDB.addCommunityComment(id, text);
        await refreshPosts();
      }
      submitBtn.addEventListener('click', submitComment);
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submitComment();
      });
    });
  }

  async function renderLeaderboard() {
    if (!hasBackend) { leaderboardEl.innerHTML = ''; return; }
    const top = await VividDB.getCommunityTopContributors(5);
    if (top.length === 0) {
      leaderboardEl.innerHTML = `<p style="color:var(--ink-soft); font-size:0.84rem; margin:0;">Hali postlar yo'q.</p>`;
      return;
    }
    leaderboardEl.innerHTML = top.map((u, i) => `
      <div class="cm-leader-row">
        <span class="cm-leader-rank">${i + 1}</span>
        <span class="cm-leader-avatar" style="background:${colorFor(u.name)}">${initials(u.name)}</span>
        <span class="cm-leader-name">${escapeHtml(u.name)}</span>
        <span class="cm-leader-streak">${u.count} post${u.count === 1 ? '' : 's'}</span>
      </div>
    `).join('');
  }

  async function refreshMemberCount() {
    if (!hasBackend) { memberCountEl.textContent = '👥 0 learners'; return; }
    const count = await VividDB.getCommunityMemberCount();
    memberCountEl.textContent = `👥 ${count} learner${count === 1 ? '' : 's'} joined`;
  }

  async function refreshPosts() {
    if (!hasBackend) return;
    posts = await VividDB.getCommunityPosts();
    renderFeed();
    renderLeaderboard();
  }

  async function createPost() {
    const text = composerText.value.trim();
    if (!text) { composerText.focus(); return; }
    if (!hasBackend) return;
    postBtn.disabled = true;
    const { error } = await VividDB.createCommunityPost(text, composerChannel.value);
    postBtn.disabled = false;
    if (error) {
      alert("Post yuborilmadi. Iltimos qayta urinib ko'ring.");
      return;
    }
    composerText.value = '';
    activeChannel = 'all';
    renderChannels();
    await refreshPosts();
    await refreshMemberCount();
  }

  postBtn.addEventListener('click', createPost);
  composerText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) createPost();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFeed();
  });

  // ---------- mobile sidebar toggle (shared pattern, wired here since no other page wires it) ----------
  const burger = document.getElementById('dashBurger');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  function closeSidebar() {
    sidebar && sidebar.classList.remove('open');
    overlay && overlay.classList.remove('show');
  }
  if (burger && sidebar) {
    burger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('show');
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // ============================================================
  // LIVE BROADCAST — powered by LiveKit (SFU), not raw browser-to-
  // browser WebRTC. Only an admin can start the camera; once started,
  // it's visible to everyone on the site. The admin can invite a
  // specific viewer to turn their camera on too — that viewer's
  // client asks our Supabase Edge Function ("livekit-token") for a
  // new, publish-capable token, which is only granted because the
  // admin first registered an invite via the "live-invite" Edge
  // Function. Neither the LiveKit secret nor the decision of "who
  // may publish" ever lives in the browser.
  // ============================================================

  const FUNCTIONS_URL = (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL)
    ? SUPABASE_URL.replace(/\/+$/, '') + '/functions/v1'
    : null;

  const videoState = {
    myId: null,
    myName: 'You',
    isAdmin: false,
    isHost: false,       // true only for the admin who started this broadcast
    roomId: null,
    room: null,           // LivekitClient.Room instance
    liveChannel: null,    // Supabase Realtime presence channel — just for the "🔴 X efir boshladi" banner
    micOn: true,
    camOn: true,
    inCall: false,
  };

  const startCallBtn = document.getElementById('cmStartCallBtn');
  const videoCta = document.getElementById('cmVideoCta');
  const liveBanner = document.getElementById('cmLiveBanner');
  const liveText = document.getElementById('cmLiveText');
  const joinCallBtn = document.getElementById('cmJoinCallBtn');
  const videoModal = document.getElementById('cmVideoModal');
  const videoGrid = document.getElementById('cmVideoGrid');
  const videoStatus = document.getElementById('cmVideoStatus');
  const toggleMicBtn = document.getElementById('cmToggleMicBtn');
  const toggleCamBtn = document.getElementById('cmToggleCamBtn');
  const endCallBtn = document.getElementById('cmEndCallBtn');
  const participantsPanel = document.getElementById('cmParticipantsPanel');
  const participantsList = document.getElementById('cmParticipantsList');

  function getClient() {
    return hasBackend && typeof VividDB.getClient === 'function' ? VividDB.getClient() : null;
  }

  // ---------- calling our Edge Functions ----------

  async function authHeaders() {
    const headers = { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY };
    const client = getClient();
    let accessToken = SUPABASE_ANON_KEY;
    if (client) {
      const { data } = await client.auth.getSession();
      if (data && data.session && data.session.access_token) accessToken = data.session.access_token;
    }
    headers.Authorization = 'Bearer ' + accessToken;
    return headers;
  }

  async function fetchLiveKitToken(roomName, wantPublish) {
    if (!FUNCTIONS_URL) throw new Error('Supabase is not configured.');
    const headers = await authHeaders();
    const res = await fetch(FUNCTIONS_URL + '/livekit-token', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roomName,
        wantPublish: !!wantPublish,
        identity: videoState.myId,
        name: videoState.myName,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not get a LiveKit token.');
    return data; // { token, url, identity, name, isAdmin, canPublish }
  }

  async function sendInviteToSpeak(roomName, inviteeIdentity) {
    const headers = await authHeaders();
    const res = await fetch(FUNCTIONS_URL + '/live-invite', {
      method: 'POST',
      headers,
      body: JSON.stringify({ roomName, inviteeIdentity }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not send the invite.');
    return data;
  }

  // ---------- video tiles ----------

  function videoTileId(identity) {
    return 'cm-video-tile-' + identity;
  }

  function ensureTile(identity, name, isLocal) {
    let tile = document.getElementById(videoTileId(identity));
    if (tile) return tile.querySelector('video');
    tile = document.createElement('div');
    tile.className = 'cm-video-tile';
    tile.id = videoTileId(identity);
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    if (isLocal) video.muted = true;
    const label = document.createElement('span');
    label.className = 'cm-video-tile-name';
    label.textContent = isLocal ? `${name} (siz)` : name;
    tile.appendChild(video);
    tile.appendChild(label);
    videoGrid.appendChild(tile);
    return video;
  }

  function removeTile(identity) {
    const tile = document.getElementById(videoTileId(identity));
    if (tile) tile.remove();
  }

  // ---------- participants panel (host only) ----------

  function renderParticipants() {
    if (!videoState.isHost || !videoState.room) { participantsPanel.style.display = 'none'; return; }
    participantsPanel.style.display = 'block';
    const remotes = Array.from(videoState.room.remoteParticipants.values());
    if (remotes.length === 0) {
      participantsList.innerHTML = `<p style="color:var(--ink-soft); font-size:0.82rem; margin:4px 0;">Hali tomoshabin yo'q.</p>`;
      return;
    }
    participantsList.innerHTML = remotes.map((p) => `
      <div class="cm-participant-row">
        <span>${escapeHtml(p.name || p.identity || 'Guest')}</span>
        <button class="cm-invite-btn" data-invite="${p.identity}">🎤 Taklif qilish</button>
      </div>
    `).join('');
    participantsList.querySelectorAll('[data-invite]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        try {
          await sendInviteToSpeak(videoState.roomId, btn.dataset.invite);
          // Also nudge the invitee immediately over LiveKit's own data
          // channel, so they see the prompt right away instead of only
          // finding out next time their client polls anything.
          const payload = new TextEncoder().encode(JSON.stringify({
            type: 'speak-invite',
            fromName: videoState.myName,
          }));
          await videoState.room.localParticipant.publishData(payload, {
            reliable: true,
            destinationIdentities: [btn.dataset.invite],
          });
          btn.textContent = 'Taklif yuborildi';
        } catch (e) {
          btn.disabled = false;
          alert(e.message || 'Taklif yuborilmadi.');
        }
      });
    });
  }

  // ---------- "someone is live" banner (unchanged: cheap Supabase presence, no LiveKit connection needed to see it) ----------

  function updateLiveBanner(state) {
    const entries = Object.values(state).flat();
    if (entries.length === 0 || videoState.inCall) {
      liveBanner.classList.remove('show');
      return;
    }
    const host = entries[0];
    liveText.innerHTML = `${escapeHtml(host.name)} <span>efir boshladi</span>`;
    liveBanner.dataset.roomId = host.roomId;
    liveBanner.classList.add('show');
  }

  function setupLiveChannel() {
    const client = getClient();
    if (!client || !videoState.myId) return;
    const liveChannel = client.channel('community-live', { config: { presence: { key: videoState.myId } } });
    liveChannel.on('presence', { event: 'sync' }, () => {
      updateLiveBanner(liveChannel.presenceState());
    });
    liveChannel.subscribe();
    videoState.liveChannel = liveChannel;
  }

  // ---------- wiring a connected LiveKit room ----------

  function wireRoomEvents(room) {
    const LK = window.LivekitClient;

    room.on(LK.RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (track.kind === 'video') {
        const el = ensureTile(participant.identity, participant.name || 'Guest', false);
        track.attach(el);
      } else if (track.kind === 'audio') {
        track.attach(); // plays automatically via a hidden <audio> element LiveKit manages
      }
    });

    room.on(LK.RoomEvent.TrackUnsubscribed, (track) => {
      track.detach().forEach((el) => el.remove());
    });

    room.on(LK.RoomEvent.ParticipantConnected, () => {
      if (videoState.isHost) {
        videoStatus.textContent = `${room.remoteParticipants.size} kishi tomosha qilmoqda`;
        renderParticipants();
      }
    });

    room.on(LK.RoomEvent.ParticipantDisconnected, (participant) => {
      removeTile(participant.identity);
      if (videoState.isHost) {
        videoStatus.textContent = room.remoteParticipants.size === 0
          ? 'Efir boshlandi — tomoshabinlar kutilmoqda…'
          : `${room.remoteParticipants.size} kishi tomosha qilmoqda`;
        renderParticipants();
      }
    });

    room.on(LK.RoomEvent.DataReceived, async (payload, participant) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === 'speak-invite' && !videoState.isHost) {
          const accept = confirm(`${msg.fromName} sizni kamerangizni yoqishga taklif qildi. Roziligiz bormi?`);
          if (!accept) return;
          await becomeSpeaker();
        }
      } catch (e) { /* ignore malformed data packets */ }
    });

    room.on(LK.RoomEvent.Disconnected, () => {
      if (videoState.inCall) endCall();
    });
  }

  // A viewer who accepted an invite: reconnect with a publish-capable token
  // and turn their camera/mic on. (LiveKit tokens can't be upgraded in place,
  // so we do a quick disconnect + reconnect.)
  async function becomeSpeaker() {
    try {
      const roomName = videoState.roomId;
      await videoState.room.disconnect();
      const { token, url } = await fetchLiveKitToken(roomName, true);
      const LK = window.LivekitClient;
      const room = new LK.Room({ adaptiveStream: true, dynacast: true });
      videoState.room = room;
      wireRoomEvents(room);
      await room.connect(url, token);
      await room.localParticipant.enableCameraAndMicrophone();
      ensureTile(videoState.myId, videoState.myName, true).srcObject = null;
      const camPub = room.localParticipant.videoTrackPublications.values().next().value;
      if (camPub && camPub.track) camPub.track.attach(ensureTile(videoState.myId, videoState.myName, true));
      videoStatus.textContent = 'Kamerangiz yoqildi — hammaga ko\u2019rinmoqda';
    } catch (e) {
      alert(e.message || 'Kamera/mikrofonga ruxsat berilmadi.');
    }
  }

  // ---------- start / join / leave ----------

  async function openRoomAsHost(roomId) {
    videoState.isHost = true;
    videoState.roomId = roomId;
    videoState.inCall = true;
    videoGrid.innerHTML = '';
    participantsPanel.style.display = 'block';
    videoModal.classList.add('show');
    videoStatus.textContent = 'Ulanmoqda…';
    liveBanner.classList.remove('show');

    try {
      const { token, url } = await fetchLiveKitToken(roomId, true);
      const LK = window.LivekitClient;
      const room = new LK.Room({ adaptiveStream: true, dynacast: true });
      videoState.room = room;
      wireRoomEvents(room);
      await room.connect(url, token);
      await room.localParticipant.enableCameraAndMicrophone();
      const camPub = room.localParticipant.videoTrackPublications.values().next().value;
      const el = ensureTile(videoState.myId, videoState.myName, true);
      if (camPub && camPub.track) camPub.track.attach(el);
      videoStatus.textContent = 'Efir boshlandi — tomoshabinlar kutilmoqda…';
    } catch (e) {
      alert(e.message || "Kamera yoki mikrofonga ruxsat berilmadi. Iltimos brauzer sozlamalaridan ruxsat bering.");
      videoModal.classList.remove('show');
      videoState.inCall = false;
      videoState.isHost = false;
      return;
    }

    if (videoState.liveChannel) {
      await videoState.liveChannel.track({ name: videoState.myName, roomId });
    }
    renderParticipants();
  }

  async function openRoomAsViewer(roomId) {
    videoState.isHost = false;
    videoState.roomId = roomId;
    videoState.inCall = true;
    videoGrid.innerHTML = '';
    participantsPanel.style.display = 'none';
    videoModal.classList.add('show');
    videoStatus.textContent = 'Ulanmoqda…';
    liveBanner.classList.remove('show');

    try {
      const { token, url } = await fetchLiveKitToken(roomId, false);
      const LK = window.LivekitClient;
      const room = new LK.Room({ adaptiveStream: true, dynacast: true });
      videoState.room = room;
      wireRoomEvents(room);
      await room.connect(url, token);
      videoStatus.textContent = 'Efirga ulandingiz';
    } catch (e) {
      alert(e.message || "Efirga ulanib bo'lmadi.");
      videoModal.classList.remove('show');
      videoState.inCall = false;
      return;
    }
  }

  async function startBroadcast() {
    if (!hasBackend || !videoState.isAdmin) return;
    startCallBtn.disabled = true;
    const roomId = 'live-' + Date.now();
    await openRoomAsHost(roomId);
    startCallBtn.disabled = false;
  }

  async function watchBroadcast() {
    const roomId = liveBanner.dataset.roomId;
    if (!roomId) return;
    await openRoomAsViewer(roomId);
  }

  function endCall() {
    if (videoState.room) {
      videoState.room.disconnect();
      videoState.room = null;
    }
    if (videoState.liveChannel && videoState.isHost) {
      videoState.liveChannel.untrack();
    }
    videoGrid.innerHTML = '';
    participantsPanel.style.display = 'none';
    videoModal.classList.remove('show');
    videoState.inCall = false;
    videoState.isHost = false;
    videoState.roomId = null;
    videoState.micOn = true;
    videoState.camOn = true;
    toggleMicBtn.classList.remove('active-off');
    toggleCamBtn.classList.remove('active-off');
  }

  startCallBtn.addEventListener('click', startBroadcast);
  joinCallBtn.addEventListener('click', watchBroadcast);
  endCallBtn.addEventListener('click', endCall);

  toggleMicBtn.addEventListener('click', () => {
    if (!videoState.room) return;
    videoState.micOn = !videoState.micOn;
    videoState.room.localParticipant.setMicrophoneEnabled(videoState.micOn);
    toggleMicBtn.classList.toggle('active-off', !videoState.micOn);
  });

  toggleCamBtn.addEventListener('click', () => {
    if (!videoState.room) return;
    videoState.camOn = !videoState.camOn;
    videoState.room.localParticipant.setCameraEnabled(videoState.camOn);
    toggleCamBtn.classList.toggle('active-off', !videoState.camOn);
  });

  window.addEventListener('beforeunload', () => {
    if (videoState.inCall) endCall();
  });

  async function init() {
    renderChannels();
    if (!hasBackend) {
      renderFeed();
      memberCountEl.textContent = '👥 0 learners';
      return;
    }
    const user = await VividDB.getUser();
    currentUserId = user ? user.id : null;
    videoState.myId = currentUserId || ('guest-' + Math.random().toString(36).slice(2));
    const profile = await VividDB.getProfile();
    videoState.myName = (profile && profile.full_name) || 'IELTS Student';
    videoState.isAdmin = !!(profile && profile.is_admin);
    videoCta.style.display = videoState.isAdmin ? 'flex' : 'none';
    await refreshMemberCount();
    await refreshPosts();
    setupLiveChannel();
  }

  init();
})();
