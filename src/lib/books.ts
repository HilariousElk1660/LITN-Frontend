import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import cover4 from "@/assets/cover-4.jpg";
import cover5 from "@/assets/cover-5.jpg";
import cover6 from "@/assets/cover-6.jpg";

export type Book = {
  id: string;
  title: string;
  author: string;
  authorId: string;
  cover: string;
  genre: string;
  status: "Serialised" | "Complete";
  chapters: number;
  rating: number;
  synopsis: string;
};

export const books: Book[] = [
  {
    id: "tideglass",
    title: "Tideglass",
    author: "Mira Okafor",
    authorId: "mira-okafor",
    cover: cover1,
    genre: "Literary Fiction",
    status: "Serialised",
    chapters: 14,
    rating: 4.7,
    synopsis:
      "On an island where the sea remembers more than the people who left it, a lighthouse keeper begins receiving letters from a daughter she never had.",
  },
  {
    id: "the-hollow-orange",
    title: "The Hollow Orange",
    author: "Daniel Reyes",
    authorId: "daniel-reyes",
    cover: cover2,
    genre: "Contemporary",
    status: "Complete",
    chapters: 22,
    rating: 4.4,
    synopsis:
      "A street vendor in Lisbon trades secrets for fruit, and slowly the entire neighbourhood begins to vanish into the stories he tells.",
  },
  {
    id: "ember-rite",
    title: "Ember Rite",
    author: "Vera Solenne",
    authorId: "vera-solenne",
    cover: cover3,
    genre: "Thriller",
    status: "Serialised",
    chapters: 9,
    rating: 4.8,
    synopsis:
      "Every seven years the city chooses a witness. This time, the witness is the one who set the fire.",
  },
  {
    id: "soft-orbit",
    title: "Soft Orbit",
    author: "Iris Ang",
    authorId: "iris-ang",
    cover: cover4,
    genre: "Romance",
    status: "Complete",
    chapters: 18,
    rating: 4.5,
    synopsis:
      "Two astronomers, one telescope, and a six-month winter at the edge of the world.",
  },
  {
    id: "field-notes",
    title: "Field Notes for the Vanishing",
    author: "Tomas Brandt",
    authorId: "tomas-brandt",
    cover: cover5,
    genre: "Memoir",
    status: "Complete",
    chapters: 12,
    rating: 4.6,
    synopsis:
      "A botanist returns to the forest of his childhood to catalogue what is left, and finds himself among the entries.",
  },
  {
    id: "constellation-9",
    title: "Constellation 9",
    author: "Adaeze Park",
    authorId: "adaeze-park",
    cover: cover6,
    genre: "Sci-Fi",
    status: "Serialised",
    chapters: 6,
    rating: 4.9,
    synopsis:
      "The ninth probe sent into the dark has come back. Only the navigator remembers what it found there.",
  },
];

export const getBook = (id: string) => books.find((b) => b.id === id);
export const genres = ["All", "Literary Fiction", "Contemporary", "Thriller", "Romance", "Memoir", "Sci-Fi"];

export const sampleChapter = `The lamp had not been lit in seventeen years, and still the gulls came at dusk and circled it as though they remembered.

I climbed the iron steps slowly, the way my mother taught me to climb anything that mattered: as if the building might be listening. The keeper's room at the top was exactly as she had described it, down to the bone-coloured cup on the windowsill and the small brass key tied to the door handle with red thread.

There was a letter on the desk. The handwriting was mine.

"Dear mother," it began, "the tide came again last night and brought back the boy we never had. He is sleeping in the kitchen. Please do not wake him."

I sat down on the floor and listened to the sea forget itself against the rocks. Somewhere below, a kettle began to whistle, although there was no one in the lighthouse but me, and the lamp, and seventeen years of weather waiting to be let back in.`;
