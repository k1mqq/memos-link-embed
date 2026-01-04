// Copy and paste this script into Memos "Additional Script" settings.
// Using microlink.io to fetch metadata and it has usage limit(50req/day).

(() => {
  const BUTTON_ID = "link-embed-btn";

  function findTextarea() {
    return document.querySelector("textarea");
  }

  function findDropdown() {
    return document.querySelector("input[type='file']");
  }

  function insertButton(textarea, dropdown) {
    if (document.getElementById(BUTTON_ID)) return;

    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.textContent = "🔗";
    btn.className = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 border bg-background hover:bg-accent hover:text-accent-foreground shadow-none h-8 px-2";

    btn.onclick = async () => {
      try {
        const url = (await navigator.clipboard.readText()).trim();
        if (!url.startsWith("http")) {
          alert("There is no URL in the clipboard.");
          return;
        }

        let title = "";
        let description = "";

        try {
          const res = await fetch(
            `https://api.microlink.io?url=${encodeURIComponent(url)}`
          );
          const json = await res.json();
          title = json?.data?.title || "";
          description = json?.data?.description || "";
        } catch {
         console.error(e); 
        }

        let text = title ? `[${title}](${url})` : `${url}`;
        if (description) text += `\n> ${description}`;

        textarea.value += text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (e) {
        console.error(e);
        alert("Link insertion failed.");
      }
    };

    dropdown.parentElement.insertBefore(btn, dropdown);
  }

  const textarea = findTextarea();
  if (textarea) {
    insertButton(textarea);
    return;
  }

  const observer = new MutationObserver(() => {
    const textarea = findTextarea();
    const dropdown = findDropdown();
    if (!textarea || !dropdown) return;

    insertButton(textarea, dropdown);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
