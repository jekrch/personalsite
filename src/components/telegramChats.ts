// Transcripts for the TelegramChat component, one per project page.

export interface ChatMessage {
  /** "user" is the outgoing side (right, teal); "bot" replies on the left */
  from: "user" | "bot"
  time: string
  text: string
  /** photo sent with the message, rendered above the caption */
  image?: string
  /** faded cost/usage footer line the model-backed replies print */
  meta?: string
}

export interface ChatTranscript {
  /** group name in the header */
  title: string
  /** the header's avatar circle: an emoji, or an image under public/ */
  avatar: { emoji: string } | { image: string }
  userName: string
  botName: string
  /** date chip above the first message */
  date: string
  messages: ChatMessage[]
}

// an /identify -> /pick run followed by an agentic /ask -> /confirm run, on one evening
const plantyjMessages: ChatMessage[] = [
  {
    from: "user",
    time: "9:04 PM",
    image: "/images/telegramExample.png",
    text: "/identify perennial in fy maybe a native huechera",
  },
  {
    from: "bot",
    time: "9:04 PM",
    text: "Identifying — options will arrive shortly.",
  },
  {
    from: "bot",
    time: "9:06 PM",
    text: `The very hairy stems and scalloped, rounded leaf shape are a textbook match for Prairie Alumroot, our local native Heuchera.

Identification options:

1. Prairie Alumroot (Heuchera richardsonii) — high confidence
   new plant. Rounded, shallowly lobed basal leaves and extremely hairy (hirsute) petioles strongly confirm a native Heuchera. Zone set from your note.
   caption: // Heuchera richardsonii // Prairie Alumroot // fy
   → /pick 1

2. Foamflower (Tiarella cordifolia) — low confidence
   existing plant "T cor". Another native woodland plant with hairy stems, but its leaves are typically more deeply cleft (maple-like) than these.
   caption: T cor // // // fy
   → /pick 2

Reply /pick N to save the photo with that identification (committed like a normal upload), or /cancel to discard.`,
    meta: "[$0.0058 | 2,706 in / 242 out]",
  },
  {
    from: "user",
    time: "9:07 PM",
    text: "/pick 1",
  },
  {
    from: "bot",
    time: "9:08 PM",
    text: `Picked option 1: Prairie Alumroot (Heuchera richardsonii) — high confidence

Added pic #93: H ric
  Common: Prairie Alumroot
  Full: Heuchera richardsonii
  Zone: Front Yard (fy)
  → images/H ric/1779156477.jpg`,
  },
  {
    from: "user",
    time: "9:13 PM",
    text: "/ask propose any relevant new relationships for the newer plants and swallowtail caterpillar.",
  },
  {
    from: "bot",
    time: "9:13 PM",
    text: "Queued — reply will arrive shortly.",
  },
  {
    from: "bot",
    time: "9:14 PM",
    text: `I've proposed a few new ecological relationships for your recent additions, avoiding the companion type as requested.

Specifically, I linked the Black Swallowtail to the Golden Alexanders as a host plant (since you found caterpillars on them), added Pearly Everlasting as a host plant for the American Painted Lady, connected the new Prairie Violet to your Carpenter Ants for seed dispersal, and noted Cardinals as frugivores for the Black Chokeberry.

You can review the numbered list below and run /confirm to apply them!

Proposed commands:
  1. /relate host-plant // P pol // Z aur
     Your photo notes several Black Swallowtail caterpillars were found on the Golden Alexanders.
  2. /relate host-plant // V virg // A mar
     Pearly Everlasting is a primary host plant for the American Painted Lady caterpillar.
  3. /relate seed-disperser // C pen // V ped
     Like your other violets, the new Prairie Violet relies on ants for seed dispersal (myrmecochory).
  4. /relate frugivore // c card // A mel
     Cardinals will forage the berries produced by your new Black Chokeberry.

Reply /confirm to run all, /confirm 1 3 to run a subset, or /cancel to drop.`,
    meta: "[$0.0299 | +12,890 cache-create, 25,780 cached, 28,075 in / 281 out]",
  },
  {
    from: "user",
    time: "9:16 PM",
    text: "/confirm",
  },
  {
    from: "bot",
    time: "9:16 PM",
    text: "Queued 4 command(s) — batched in chunks of 25/min (~1 min). Summary will arrive when complete.",
  },
  {
    from: "bot",
    time: "9:17 PM",
    text: `Ran 4 command(s):
1. /relate host-plant // P pol // Z aur
   OK: Related #44: P pol → Z aur (Host Plant)
2. /relate host-plant // V virg // A mar
   OK: Related #45: V virg → A mar (Host Plant)
3. /relate seed-disperser // C pen // V ped
   OK: Related #46: C pen → V ped (Seed Disperser)
4. /relate frugivore // c card // A mel
   OK: Related #47: c card → A mel (Fruit / Nut Consumer)`,
  },
]

export const plantyjChat: ChatTranscript = {
  title: "PlantyJ",
  avatar: { emoji: "🌿" },
  userName: "Jenny Krch",
  botName: "plantyj-bot",
  date: "May 18, 2026",
  messages: plantyjMessages,
}

// a /restore -> /approve run, an /ask that adds further reading to an artist's sources
// without touching his description, and an /ask that fixes series that never matched
// Metron. The restore is that night's real run (2dbee88 in comic-snaps); the two /ask
// exchanges are illustrative, written in the bot's reply formats (the three Mignola
// links are real pages), and the times and cost lines are approximate.
export const comicSnapsChat: ChatTranscript = {
  title: "Comic Snaps",
  // the bird mark from the Comic Snaps header (its favicon)
  avatar: { image: "/images/comicSnapsBird.svg" },
  userName: "Jacob Krch",
  botName: "comic-snaps-bot",
  date: "November 4, 2026",
  messages: [
    {
      from: "user",
      time: "10:05 PM",
      text: "/restore 291",
    },
    {
      from: "bot",
      time: "10:05 PM",
      text: "Restoring #291, Verbatim #1. The before/after comes back here in a few minutes.",
    },
    {
      from: "bot",
      time: "10:12 PM",
      image: "/images/comicSnapsRestore.jpg",
      text: `Restored #291 · Verbatim #1 (Carl Belfast)
Before | after

restore-bw-panel, defaults (round 1 of 1 run).
Deepens the blacks and brings the paper to a clean white, clearing away the photo's warm lighting cast. The delicate line work across the fingers, rings, and facial hatching remains sharp without clogging, and the tiny lettering on the bottom button stays legible. A tighter crop could cleanly remove the slivers of neighboring panels along the left and bottom edges.

/approve 291 puts it on the site
/redo 291 {what to change}
/reject 291 drops it`,
    },
    {
      from: "user",
      time: "10:16 PM",
      text: "/approve 291",
    },
    {
      from: "bot",
      time: "10:16 PM",
      text: "Approved #291, Verbatim #1. It's on main as images/verbatim/issue-1-1789311736-v2.jpg; the site picks it up once the metadata job has re-embedded it, in a few minutes.",
    },
    {
      from: "user",
      time: "10:31 PM",
      text: "/ask find some good interviews or articles on Mike Mignola to add to his sources",
    },
    {
      from: "bot",
      time: "10:31 PM",
      text: "Taking a moment. The reply will arrive shortly.",
    },
    {
      from: "bot",
      time: "10:33 PM",
      text: `Found three interviews worth adding to Mike Mignola's sources. His description isn't touched.

Proposed commands:
  1. Further reading for artist Mike Mignola, to add to its sources. The description isn't changed:
     
     [1] Mental Floss, "Our Interview with Hellboy Creator Mike Mignola"
         https://www.mentalfloss.com/entertainment/comics/our-interview-hellboy-creator-mike-mignola
         Rich Barrett's 2014 interview for Hellboy's 20th anniversary: how the character started, the films, where it goes next.
     [2] Paste Magazine, "Comics Titans Mike Mignola & Geof Darrow in Conversation"
         https://www.pastemagazine.com/comics/mike-mignola-geof-darrow/comics-titans-mike-mignola-geof-darrow-in-conversa
         Steve Foxe's 2018 talk with Geof Darrow about Dark Horse's Legend imprint, breaking in, and the artists who shaped them.
     [3] Dark Horse, "Interview with Mike Mignola 10/5/07"
         https://www.darkhorse.com/interviews/interview-with-mike-mignola-10-5-07/
         A 2007 interview on working with Guillermo del Toro and Ron Perlman on Hellboy II: The Golden Army.
     
     Picked 3 of 7 new page(s) read.
     Every page was fetched and names the subject. The one-line notes are only for you; they aren't saved.

Reply /confirm to run all, /confirm 1 3 to run a subset, or /cancel to drop.`,
      meta: "[$0.0187 | 14,880 cached, 24,610 in / 1,122 out]",
    },
    {
      from: "user",
      time: "10:35 PM",
      text: "/confirm",
    },
    {
      from: "bot",
      time: "10:35 PM",
      text: `Added 3 source(s) to artist Mike Mignola. The description is unchanged.
Started the metadata job.`,
    },
    {
      from: "user",
      time: "10:41 PM",
      text: "/ask which series never matched Metron, and what should they be called?",
    },
    {
      from: "bot",
      time: "10:41 PM",
      text: "Taking a moment. The reply will arrive shortly.",
    },
    {
      from: "bot",
      time: "10:42 PM",
      text: `53 series have never matched Metron. Most are undergrounds and small-press books with no Metron entry under any name, so renaming won't help those. Two are only off by their start year: Metron has both, but ours start later than the issues posted, so the right results were thrown out.

Proposed commands:
  1. /rename_series love-and-rockets // Love and Rockets // 1982
     Metron lists Love and Rockets (1982) from Fantagraphics. The #1 posted is from 1982, but ours starts in 1987.
  2. /rename_series concrete-fragile-creature // Concrete: Fragile Creature // 1991
     Metron lists Concrete: Fragile Creature (1991) from Dark Horse, matching the #1 posted from 1991. Ours starts in 1992.

Reply /confirm to run all, /confirm 1 3 to run a subset, or /cancel to drop.`,
      meta: "[$0.0187 | 9,412 cached, 22,960 in / 1,138 out]",
    },
    {
      from: "user",
      time: "10:44 PM",
      text: "/confirm",
    },
    {
      from: "bot",
      time: "10:44 PM",
      text: `Ran 2 command(s):
1. /rename_series love-and-rockets // Love and Rockets // 1982
   OK: Series love-and-rockets keeps the name "Love and Rockets"
2. /rename_series concrete-fragile-creature // Concrete: Fragile Creature // 1991
   OK: Series concrete-fragile-creature keeps the name "Concrete: Fragile Creature"
Started the metadata job.`,
    },
  ],
}
