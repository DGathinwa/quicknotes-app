// ---------- 1. Select DOM Elements ----------
const form = document.querySelector("#note-form");
const input = document.querySelector("#note-input");
const categorySelect = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const list = document.querySelector("#notes-list");
const countDisplay = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

const STORAGE_KEY = "quicknotes_app_data";

// ---------- 2. Load and Save Data ----------
let notes = loadNotes();

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ---------- 3. Render Function ----------
function render(notesToDisplay = notes) {
  list.innerHTML = "";

  // Update count message based on total notes
  if (notes.length === 0) {
    countDisplay.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    countDisplay.textContent = "You have 1 note.";
  } else {
    countDisplay.textContent = `You have ${notes.length} notes.`;
  }

  // Handle empty search results
  if (notesToDisplay.length === 0 && notes.length > 0) {
    const li = document.createElement("li");
    li.textContent = "No notes match your search.";
    li.style.padding = "12px";
    li.style.color = "#666";
    list.appendChild(li);
    return;
  }

  notesToDisplay.forEach((note) => {
    const li = document.createElement("li");
    li.classList.add("note", `category-${note.category}`);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("note-content");

    const textSpan = document.createElement("span");
    textSpan.classList.add("note-text-span");
    textSpan.textContent = note.text; // Safe from XSS

    const metaDiv = document.createElement("div");
    metaDiv.classList.add("note-meta");

    const categoryTag = document.createElement("span");
    categoryTag.classList.add("category-tag");
    categoryTag.textContent = note.category;

    const dateSpan = document.createElement("span");
    dateSpan.textContent = note.createdAt;

    metaDiv.appendChild(categoryTag);
    metaDiv.appendChild(dateSpan);

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(metaDiv);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// ---------- 4. Add, Validate, and Delete ----------
function addNote(text, category) {
  const cleaned = text.trim();

  // Validation
  if (cleaned === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }
  if (cleaned.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  // Clear error on success
  errorMessage.textContent = "";

  const newNote = {
    id: Date.now(),
    text: cleaned,
    category: category,
    createdAt: new Date().toLocaleString(),
  };

  notes.push(newNote);
  saveNotes();
  render();

  input.value = "";
  input.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  // Re-run search filter if user is actively searching
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    handleSearch();
  } else {
    render();
  }
}

// ---------- 5. Search Functionality ----------
function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );
  render(filtered);
}

// ---------- 6. Event Listeners ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();
  addNote(input.value, categorySelect.value);
});

searchInput.addEventListener("input", handleSearch);

// Initial render on load
render();