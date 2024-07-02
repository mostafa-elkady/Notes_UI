// Constants
const addNoteBtn = document.querySelector(".addNoteBtn");
const noteContainer = document.getElementById("noteContainer");
const noteTitle = document.getElementById("noteTitle");
const noteDescription = document.getElementById("noteDescription");

class NoteManager {
  static baseUrl = "https://localhost:5000/api/Notes";

  static async getAllNotes() {
    const response = await fetch(this.baseUrl);
    const data = await response.json();
    return data;
  }

  static async deleteNote(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log(`Note with ID ${id} deleted successfully.`);
        NoteUIManager.removeNote(id);
      } else {
        console.error(
          `Error deleting note with ID ${id}: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  }

  static async updateNote(id, title, description) {
    if (title && description) {
      const body = { title, description, isVisible: true };
      try {
        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error(error);
        alert("An error occurred while updating the note.");
      }
    } else {
      alert("Both title and description are required.");
    }
    NoteUIManager.displayNotes(await NoteManager.getAllNotes());
    resetNoteForm();
  }

  static async addNote(title, description) {
    if (title && description) {
      const body = { title, description, isVisible: true };
      try {
        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error(error);
        alert("An error occurred while adding the note.");
      }
    } else {
      alert("Both title and description are required.");
    }
    NoteUIManager.displayNotes(await NoteManager.getAllNotes());
    resetNoteForm();
  }
}

class NoteUIManager {
  static displayNotes = async (notes) => {
    let allNotes = "";
    if (notes.length === 0) {
      allNotes = '<h3 class="no-notes">No notes here</h3>';
    } else {
      notes.forEach((note) => {
        const noteElement = `
          <div class="note" data-id="${note.id}">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-description">${note.description}</p>
            <div class="btn-group">
              <button class="delete-btn" data-id="${note.id}">Delete</button>
              <button class="edit-btn" data-id="${note.id}">Edit</button>
            </div>
          </div>
        `;
        allNotes += noteElement;
      });
    }
    noteContainer.innerHTML = allNotes;
    addEventListeners(notes);
  };

  static removeNote(id) {
    const noteElement = document.querySelector(`.note[data-id="${id}"]`);
    if (noteElement) {
      noteElement.remove();
    }
  }

  static populateForm = (note) => {
    addNoteBtn.textContent = "Update";
    addNoteBtn.style.background = "green";
    noteTitle.value = note.title;
    noteDescription.value = note.description;
    addNoteBtn.dataset.id = note.id;
  };
}

async function init() {
  const notes = await NoteManager.getAllNotes();
  NoteUIManager.displayNotes(notes);
}

function addEventListeners(notes) {
  const deleteBtns = document.querySelectorAll(".delete-btn");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      NoteManager.deleteNote(btn.dataset.id);
    });
  });

  const editBtns = document.querySelectorAll(".edit-btn");
  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const note = notes.find((note) => note.id === btn.dataset.id);
      NoteUIManager.populateForm(note);
    });
  });
}

function resetNoteForm() {
  addNoteBtn.textContent = "Add Note";
  addNoteBtn.style.background = "#7aa9bb";
  addNoteBtn.dataset.id = "";
  noteTitle.value = "";
  noteDescription.value = "";
}

addNoteBtn.addEventListener("click", async () => {
  const id = addNoteBtn.dataset.id;
  if (!id) {
    await NoteManager.addNote(noteTitle.value, noteDescription.value);
  } else {
    await NoteManager.updateNote(id, noteTitle.value, noteDescription.value);
  }
});

init();