(() => {
  const WIDGET_ID = "ntu-course-search-widget";
  const WIDGET_ANCHOR_ID = "ntu-course-search-anchor";

  if (document.getElementById(WIDGET_ID)) {
    return;
  }

  const isOldCoursePage = () =>
    location.hostname.includes("nol.ntu.edu.tw") &&
    location.pathname.includes("/coursesearch/print_table.php");

  const isNewCoursePage = () =>
    location.hostname.includes("course.ntu.edu.tw") &&
    /\/courses\//.test(location.pathname);

  const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

  const getOldCourseInfo = () => {
    const rows = Array.from(document.querySelectorAll("table tr"));
    let courseName = "";
    let teacherName = "";

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 2) {
        return;
      }

      const label = normalizeText(cells[0].innerText || "").replace(/\s/g, "");
      const valueCell = cells[1];

      if (label === "課程名稱") {
        const raw = normalizeText(valueCell.innerText || "");
        courseName = raw.split(" ")[0] || raw;
      }

      if (label === "授課教師") {
        const links = Array.from(valueCell.querySelectorAll("a"));
        if (links.length > 0) {
          teacherName = links.map((link) => normalizeText(link.innerText)).join(" / ");
        } else {
          teacherName = normalizeText(valueCell.innerText || "");
        }
      }
    });

    return {
      courseName,
      teacherName,
    };
  };

  const getNewCourseInfo = () => {
    let courseName = "";
    let teacherName = "";

    const header = document.querySelector("h2");
    if (header) {
      courseName = normalizeText(header.textContent || "");
    }

    if (!courseName) {
      const title = document.title || "";
      courseName = normalizeText(title.split("｜")[0] || "");
    }

    const teacherLink = document.querySelector('a[href*="/search/quick?k="]');
    if (teacherLink) {
      try {
        const url = new URL(teacherLink.getAttribute("href"), location.origin);
        teacherName = normalizeText(url.searchParams.get("k") || "");
      } catch (error) {
        teacherName = normalizeText(teacherLink.textContent || "");
      }
    }

    return {
      courseName,
      teacherName,
    };
  };

  const getCourseInfo = () => {
    if (isOldCoursePage()) {
      return getOldCourseInfo();
    }

    if (isNewCoursePage()) {
      return getNewCourseInfo();
    }

    return { courseName: "", teacherName: "" };
  };

  const buildSearchUrls = (query, sources) => {
    const trimmed = normalizeText(query);
    if (!trimmed) {
      return [];
    }

    const urls = [];
    const base = "https://www.google.com/search?q=";

    if (sources.google) {
      urls.push(`${base}${encodeURIComponent(trimmed)}`);
    }

    if (sources.dcard) {
      urls.push(`${base}${encodeURIComponent(`${trimmed} site:dcard.tw`)}`);
    }

    if (sources.opass) {
      urls.push(`${base}${encodeURIComponent(`${trimmed} 歐趴糖`)}`);
    }

    if (sources.ptt) {
      urls.push(`${base}${encodeURIComponent(`${trimmed} site:ptt.cc`)}`);
    }

    return urls;
  };

  const createWidget = () => {
    const anchor = document.createElement("div");
    anchor.id = WIDGET_ANCHOR_ID;
    document.body.appendChild(anchor);

    const root = document.createElement("div");
    root.id = WIDGET_ID;
    root.setAttribute("role", "dialog");

    const shadow = root.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 99999;
        }

        .frame {
          --ink: #0b0a07;
          --muted: rgba(11, 10, 7, 0.62);
          --paper: #f7f1e7;
          --accent: #f15a29;
          --accent-dark: #b93b12;
          --border: rgba(11, 10, 7, 0.18);
          --shadow: rgba(11, 10, 7, 0.18);
          font-family: "Noto Serif TC", "Baskerville", "Times New Roman", serif;
          color: var(--ink);
          width: 280px;
          background: var(--paper);
          border: 1px solid var(--border);
          box-shadow: 0 18px 40px var(--shadow);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          transform: translateY(24px);
          opacity: 0;
          animation: lift 420ms ease forwards;
        }

        .frame::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 8% 0%, rgba(241, 90, 41, 0.24), transparent 55%),
            radial-gradient(circle at 90% 12%, rgba(15, 52, 96, 0.15), transparent 55%),
            repeating-linear-gradient(135deg, rgba(11, 10, 7, 0.03) 0px, rgba(11, 10, 7, 0.03) 2px, transparent 2px, transparent 6px);
          pointer-events: none;
          opacity: 0.8;
        }

        .header {
          position: relative;
          padding: 14px 16px 12px;
          background: rgba(255, 255, 255, 0.6);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .badge {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .toggle {
          border: 1px solid var(--border);
          border-radius: 999px;
          background: #fff;
          color: var(--ink);
          font-size: 12px;
          padding: 4px 10px;
          cursor: pointer;
        }

        .body {
          position: relative;
          padding: 14px 16px 16px;
          display: grid;
          gap: 10px;
        }

        label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        select,
        input[type="text"] {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.85);
          color: var(--ink);
        }

        .sources {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px 8px;
        }

        .source {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
        }

        .source input {
          accent-color: var(--accent);
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .button {
          flex: 1;
          border: none;
          background: var(--accent);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 12px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 8px 16px rgba(241, 90, 41, 0.28);
          transition: transform 150ms ease, box-shadow 150ms ease;
        }

        .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 18px rgba(241, 90, 41, 0.32);
        }

        .button.secondary {
          background: #111;
          box-shadow: none;
        }

        .status {
          font-size: 11px;
          color: var(--muted);
        }

        .collapsed .body {
          display: none;
        }

        @keyframes lift {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .frame {
            animation: none;
            transform: none;
            opacity: 1;
          }
        }
      </style>
      <div class="frame">
        <div class="header">
          <span class="badge">NTU Course Radar</span>
          <button class="toggle" type="button">收起</button>
        </div>
        <div class="body">
          <div>
            <label for="ntu-target">搜尋對象</label>
            <select id="ntu-target">
              <option value="course">課程名稱</option>
              <option value="teacher">授課教師</option>
              <option value="both">老師 + 課程</option>
            </select>
          </div>
          <div>
            <label for="ntu-query">關鍵字</label>
            <input id="ntu-query" type="text" placeholder="輸入課程或老師" />
          </div>
          <div>
            <label>搜尋來源</label>
            <div class="sources">
              <label class="source"><input type="checkbox" id="src-google" checked />Google</label>
              <label class="source"><input type="checkbox" id="src-dcard" checked />Dcard</label>
              <label class="source"><input type="checkbox" id="src-opass" checked />歐趴糖</label>
              <label class="source"><input type="checkbox" id="src-ptt" checked />PTT</label>
            </div>
          </div>
          <div class="actions">
            <button class="button" id="ntu-search" type="button">開啟搜尋</button>
            <button class="button secondary" id="ntu-refresh" type="button">重抓</button>
          </div>
          <div class="status" id="ntu-status">等待擷取課程資訊。</div>
        </div>
      </div>
    `;

    anchor.appendChild(root);

    const frame = shadow.querySelector(".frame");
    const toggle = shadow.querySelector(".toggle");
    const target = shadow.querySelector("#ntu-target");
    const query = shadow.querySelector("#ntu-query");
    const searchButton = shadow.querySelector("#ntu-search");
    const refreshButton = shadow.querySelector("#ntu-refresh");
    const status = shadow.querySelector("#ntu-status");

    const sourceInputs = {
      google: shadow.querySelector("#src-google"),
      dcard: shadow.querySelector("#src-dcard"),
      opass: shadow.querySelector("#src-opass"),
      ptt: shadow.querySelector("#src-ptt"),
    };

    const state = {
      courseName: "",
      teacherName: "",
    };

    const updateStatus = (text) => {
      status.textContent = text;
    };

    const buildCombinedQuery = () => {
      const parts = [state.teacherName, state.courseName].filter(Boolean);
      return parts.join(" ");
    };

    const syncQuery = () => {
      if (target.value === "teacher") {
        query.value = state.teacherName || query.value;
        return;
      }

      if (target.value === "both") {
        query.value = buildCombinedQuery() || query.value;
        return;
      }

      query.value = state.courseName || query.value;
    };

    const refresh = () => {
      const info = getCourseInfo();
      state.courseName = info.courseName;
      state.teacherName = info.teacherName;

      if (state.courseName || state.teacherName) {
        updateStatus(`已擷取：${state.courseName || ""} ${state.teacherName ? "· " + state.teacherName : ""}`.trim());
        syncQuery();
      } else {
        updateStatus("尚未擷取到課程資訊，可手動輸入。");
      }
    };

    toggle.addEventListener("click", () => {
      frame.classList.toggle("collapsed");
      toggle.textContent = frame.classList.contains("collapsed") ? "展開" : "收起";
    });

    target.addEventListener("change", () => {
      syncQuery();
    });

    refreshButton.addEventListener("click", () => {
      refresh();
    });

    searchButton.addEventListener("click", () => {
      const sources = {
        google: sourceInputs.google.checked,
        dcard: sourceInputs.dcard.checked,
        opass: sourceInputs.opass.checked,
        ptt: sourceInputs.ptt.checked,
      };

      const urls = buildSearchUrls(query.value, sources);
      if (urls.length === 0) {
        updateStatus("請先輸入課程或老師名稱。");
        return;
      }

      chrome.runtime.sendMessage({
        type: "openSearchTabs",
        urls,
      });

      updateStatus(`已開啟 ${urls.length} 個搜尋頁面。`);
    });

    refresh();

    const observer = new MutationObserver(() => {
      if (!state.courseName || !state.teacherName) {
        refresh();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  const bootstrap = () => {
    if (!document.body) {
      return;
    }

    createWidget();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
