// How the game tags are presented in the editor.
// "word" is what goes in the file name, "tag" what the game reads from it.
// tests/tagCodec.test.mjs checks every entry against the generated dictionary.
import { TAG_DICT } from "./gameData.generated.js";

const option = (tag, label, word = tag, icon = null) => ({ tag, label, word, icon });
const withIcon = (folder) => (tag, label) => option(tag, label, tag, `img/${folder}/${tag}.png`);

const job = withIcon("job");
const mood = withIcon("mood");
const outfit = withIcon("outfit");
const partner = withIcon("partner");

export const TAG_GROUPS = [
  {
    id: "type",
    label: "Picture type",
    side: "left",
    options: [
      option("profile", "Profile"),
      option("portrait", "Portrait (face only)"),
      option("market", "Slave market"),
      option("model", "Advertising", "advertise"),
      option("gallery", "Gallery background"),
    ],
  },
  {
    id: "job",
    label: "Girl job",
    side: "left",
    options: [
      job("waitress", "Waitress"),
      job("dancer", "Dancer"),
      job("masseuse", "Masseuse"),
      job("geisha", "Geisha"),
    ],
  },
  {
    id: "outfit",
    label: "Girl outfit",
    side: "left",
    options: [
      outfit("naked", "Naked"),
      outfit("cosplay", "Cosplay"),
      outfit("maid", "Maid"),
      outfit("bunny", "Bunny"),
      outfit("swim", "Swimsuit"),
      outfit("kimono", "Kimono"),
      outfit("bondage", "Bondage"),
    ],
  },
  {
    id: "mood",
    label: "Girl mood",
    side: "left",
    options: [mood("happy", "Happy"), mood("neutral", "Neutral"), mood("sad", "Sad")],
  },
  {
    id: "place",
    label: "Place",
    side: "left",
    options: [
      option("public", "Public (Exhib)"),
      option("beach", "Beach"),
      option("nature", "Nature"),
      option("town", "Town"),
    ],
  },
  {
    id: "extra",
    label: "Additional tags",
    side: "left",
    options: [
      option("dirty", "Dirty"),
      option("wet", "Wet"),
      option("dom", "Femdom"),
      option("sub", "Submissive"),
      option("virgin", "Virgin"),
      option("hurt", "Hurt"),
      option("refuse", "Refusing"),
      option("date", "Date"),
    ],
  },
  {
    id: "frequency",
    label: "Frequency",
    side: "left",
    optional: true,
    options: [
      option("freq_highest", "Highest"),
      option("freq_high", "High"),
      option("freq_low", "Low"),
      option("freq_lowest", "Lowest"),
    ],
  },
  {
    id: "partner",
    label: "Special partners",
    side: "right",
    options: [
      partner("lesbian", "Lesbian"),
      partner("bisexual", "Bisexual"),
      partner("group", "Group"),
      partner("big", "Big"),
      partner("beast", "Beast"),
      partner("machine", "Machine"),
      partner("monster", "Monster"),
    ],
  },
  {
    id: "act",
    label: "Sex act",
    side: "right",
    options: [
      option("service", "Service"),
      option("sex", "Sex"),
      option("anal", "Anal"),
      option("fetish", "Fetish"),
    ],
  },
  {
    id: "activity",
    label: "Activity",
    side: "right",
    options: [
      option("strip", "Strip"),
      option("sing", "Sing"),
      option("fight", "Fight"),
      option("rest", "Rest"),
      option("libido", "Libido training"),
      option("sensitivity", "Sensitivity training"),
      option("obedience", "Obedience training"),
      option("constitution", "Constitution training"),
      option("watersports", "Watersports"),
    ],
  },
  {
    id: "position",
    label: "Position",
    side: "right",
    options: [
      option("doggy", "Doggy"),
      option("cowgirl", "Cowgirl"),
      option("piledriver", "Piledriver"),
      option("spoon", "Spooning", "spooning"),
    ],
  },
  {
    id: "service",
    label: "Service",
    side: "right",
    options: [
      option("kiss", "Kiss"),
      option("oral", "Oral"),
      option("deep", "Deepthroat"),
      option("69", "Sixty-nine", "sixty-nine"),
      option("rim", "Rimjob", "rimming"),
      option("cunni", "Cunnilingus", "cunnilingus"),
      option("handjob", "Handjob"),
      option("titjob", "Titjob"),
      option("footjob", "Footjob"),
      option("mast", "Masturbate", "masturbate"),
      option("finger", "Fingering"),
      option("fist", "Fisting", "fisting"),
      option("fondle", "Fondle"),
      option("grope", "Grope"),
      option("lactation", "Lactation"),
      option("double", "Double penetration"),
    ],
  },
  {
    id: "toys",
    label: "Toys and fetish",
    side: "right",
    options: [
      option("toy", "Toy"),
      option("dildo", "Dildo"),
      option("vibrator", "Vibrator"),
      option("plug", "Plug"),
      option("beads", "Beads"),
      option("strap-on", "Strap-on"),
      option("gag", "Gag"),
      option("spank", "Spanking", "spanking"),
      option("enema", "Enema"),
    ],
  },
  {
    id: "cum",
    label: "Finish",
    side: "right",
    options: [
      option("cumshot", "Cumshot"),
      option("cof", "On face", "on-face"),
      option("cih", "In hair", "in-hair"),
      option("cim", "In mouth", "in-mouth"),
      option("cob", "On body", "on-body"),
      option("cin", "Inside", "inside"),
      option("creampie", "Creampie"),
      option("buk", "Bukkake", "bukkake"),
      option("cum shower", "Cum shower", "cum-shower"),
      option("orgasm", "Orgasm"),
      option("squirt", "Squirt"),
      option("denied", "Denied orgasm"),
    ],
  },
];

// Secondary tags always added with another one, or reserved to the game's own pictures.
export const HIDDEN_TAGS = ["dance", "swimsuit", "XXX", "hardcore", "unused"];

const KNOWN_TAGS = new Set([...TAG_GROUPS.flatMap((g) => g.options.map((o) => o.tag)), ...HIDDEN_TAGS]);

// A tag added to the game later appears here without any change in the editor.
export const OTHER_TAGS = [...new Set(Object.values(TAG_DICT).flat())].filter((tag) => !KNOWN_TAGS.has(tag));

export function allGroups() {
  if (OTHER_TAGS.length === 0) return TAG_GROUPS;
  const options = OTHER_TAGS.map((tag) => option(tag, tag));
  return [...TAG_GROUPS, { id: "other", label: "Other game tags", side: "right", options }];
}

// Groups of the tags no file provides. Optional groups are left out.
export function missingTags(presentTags) {
  const present = new Set(presentTags);
  return allGroups()
    .filter((group) => !group.optional)
    .map((group) => ({ ...group, options: group.options.filter((o) => !present.has(o.tag)) }))
    .filter((group) => group.options.length > 0);
}
