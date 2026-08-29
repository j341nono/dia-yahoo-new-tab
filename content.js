(async () => {
  if (location.hash !== "#dia-newtab") {
    return;
  }

  history.replaceState(
    null,
    "",
    location.pathname + location.search
  );

  const response = await chrome.runtime.sendMessage({
    type: "getTopBookmarks"
  });

  const items = response?.items || [];

  if (items.length === 0) {
    return;
  }

  if (document.getElementById("dia-bookmark-bar")) {
    return;
  }

  function getFaviconURL(pageUrl) {
    const url = new URL(
      chrome.runtime.getURL("/_favicon/")
    );

    url.searchParams.set("pageUrl", pageUrl);
    url.searchParams.set("size", "32");

    return url.toString();
  }

  const bar = document.createElement("div");
  bar.id = "dia-bookmark-bar";

  Object.assign(bar.style, {
    position: "fixed",
    top: "18px",
    left: "50%",
    transform: "translateX(-50%)",

    display: "flex",
    alignItems: "center",
    gap: "6px",

    maxWidth: "80vw",
    padding: "6px 9px",

    background: "rgba(245,245,245,0.78)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",

    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "14px",
    boxShadow: "0 6px 25px rgba(0,0,0,0.12)",

    zIndex: "2147483647"
  });

  function createFolderIcon() {
    const icon = document.createElement("div");

    icon.innerHTML = `
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7.5C3 6.12 4.12 5 5.5 5H10L12 7H18.5C19.88 7 21 8.12 21 9.5V17.5C21 18.88 19.88 20 18.5 20H5.5C4.12 20 3 18.88 3 17.5V7.5Z"
          fill="currentColor"
        />
      </svg>
    `;

    Object.assign(icon.style, {
      width: "22px",
      height: "22px",
      color: "#6f7378"
    });

    return icon;
  }

  function createButton(item) {
    const button = document.createElement(
      item.url ? "a" : "button"
    );

    button.title = item.title || "";

    if (item.url) {
      button.href = item.url;
    }

    Object.assign(button.style, {
      width: "36px",
      height: "36px",
      border: "none",
      outline: "none",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      borderRadius: "9px",

      background: "transparent",
      cursor: "pointer",
      padding: "0",

      textDecoration: "none",
      transition:
        "background 0.12s ease, transform 0.12s ease"
    });

    button.addEventListener("mouseenter", () => {
      button.style.background =
        "rgba(0,0,0,0.07)";
      button.style.transform = "scale(1.06)";
    });

    button.addEventListener("mouseleave", () => {
      button.style.background = "transparent";
      button.style.transform = "scale(1)";
    });

    if (item.url) {
      const img = document.createElement("img");

      img.src = getFaviconURL(item.url);
      img.alt = item.title;

      Object.assign(img.style, {
        width: "22px",
        height: "22px",
        objectFit: "contain"
      });

      button.appendChild(img);
    } else {
      button.appendChild(createFolderIcon());

      button.addEventListener("click", async (event) => {
        event.stopPropagation();

        document
          .querySelectorAll(".dia-folder-menu")
          .forEach((menu) => menu.remove());

        const result =
          await chrome.runtime.sendMessage({
            type: "getFolderChildren",
            folderId: item.id
          });

        showFolderMenu(
          button,
          item.title,
          result?.items || []
        );
      });
    }

    return button;
  }

  function showFolderMenu(anchor, title, children) {
    const menu = document.createElement("div");
    menu.className = "dia-folder-menu";

    Object.assign(menu.style, {
      position: "fixed",
      minWidth: "230px",
      maxWidth: "320px",
      maxHeight: "420px",

      overflowY: "auto",

      padding: "8px",

      background: "rgba(248,248,248,0.94)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",

      border: "1px solid rgba(0,0,0,0.10)",
      borderRadius: "13px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.20)",

      zIndex: "2147483647"
    });

    const rect = anchor.getBoundingClientRect();

    menu.style.top = `${rect.bottom + 7}px`;
    menu.style.left = `${rect.left}px`;

    if (title) {
      const heading = document.createElement("div");
      heading.textContent = title;

      Object.assign(heading.style, {
        padding: "5px 8px 8px 8px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#777"
      });

      menu.appendChild(heading);
    }

    for (const child of children) {
      const row = document.createElement(
        child.url ? "a" : "div"
      );

      if (child.url) {
        row.href = child.url;
      }

      Object.assign(row.style, {
        height: "34px",
        padding: "0 8px",

        display: "flex",
        alignItems: "center",
        gap: "9px",

        borderRadius: "8px",

        color: "#222",
        textDecoration: "none",
        fontSize: "13px",
        whiteSpace: "nowrap",

        cursor: "pointer"
      });

      row.addEventListener("mouseenter", () => {
        row.style.background =
          "rgba(0,0,0,0.07)";
      });

      row.addEventListener("mouseleave", () => {
        row.style.background =
          "transparent";
      });

      if (child.url) {
        const icon = document.createElement("img");

        icon.src = getFaviconURL(child.url);

        Object.assign(icon.style, {
          width: "18px",
          height: "18px",
          objectFit: "contain"
        });

        row.appendChild(icon);
      } else {
        const folderIcon = createFolderIcon();

        folderIcon.style.width = "18px";
        folderIcon.style.height = "18px";

        row.appendChild(folderIcon);
      }

      const label = document.createElement("span");

      label.textContent =
        child.title ||
        child.url ||
        "Untitled";

      row.appendChild(label);
      menu.appendChild(row);
    }

    document.body.appendChild(menu);
  }

  for (const item of items) {
    bar.appendChild(createButton(item));
  }

  document.body.appendChild(bar);

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dia-folder-menu")
      .forEach((menu) => menu.remove());
  });
})();
