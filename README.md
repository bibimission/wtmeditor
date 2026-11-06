# Brothel King Editor

`bking` branch of the WTM Editor: tags the pictures and videos of a Brothel King girl pack and fills in its `_BK.ini`.

## Installation

```
npm install
```

## How to use

```
npm run dev
```

Packs are folders inside `packsBK`, created automatically next to this file. Copy a finished pack into the game's `game/girls` folder.

### Packs
- Pick a pack in the list, or type a name and press Create.
- A pack name cannot start with `_` or `#`: the game would ignore it.
- The editor warns you when no picture is tagged `profile` or `portrait`, because the game then shows an error for this girl.

### Tags
The game reads the tags from the file names. The Media tab shows the whole pack as a grid:

- Click a media to select it, Ctrl+click or Shift+click to select several, Ctrl+A to select everything on screen.
- With a selection, the tag panel shows each tag as active (every selected media has it), dashed (only some have it) or off. Click a tag to add it to the whole selection, or to remove it if they all have it.
- The left column shows the pack coverage and the number of media per tag, in red when a tag has none. Click a tag to filter the grid.
- Double-click a media, or press Enter, to enlarge it. You then see the tags the game will really detect and the words it will not read.
- A tagged media stays on screen until it is deselected, even when it no longer matches the filter.

Words the editor does not know are kept in the name. Identifiers left by a download (a word with a digit and no tag, such as `48976651_011_aa9a`) are removed.

Keys: left and right arrows change the media, Delete removes the selection, Escape clears it, Ctrl+Z undoes the last action.

The bin button deletes the selection: the media go to the trash and can be restored with Undo.

The "?" button lists the tags with no media in the pack, except the frequency tags.

### File conversion
The game reads jpg, jpeg, png, bmp, webp, avif, webm, mkv, avi, mpg and mpeg as they are. Only these formats get a red outline and can be converted, by clicking them or with "Convert all":

| Source | Result |
|---|---|
| Animated gif, animated webp, mp4, m4v, mov, wmv, flv, 3gp, ogv, mts | webm |
| One-frame gif, jfif, pjpeg, pjp, tif, tiff, tga | webp |

Conversions run one at a time. The original file is only moved to the trash once the new file has been checked.

### Undo and trash
Every rename, conversion, deletion and `_BK.ini` change can be undone, and an action on several media counts as one step, even after a restart. The journal and the trash are in `packsBK/.wtm/<pack>/`, outside the pack, so the game never sees them. The editor never empties the trash: delete this folder yourself when you no longer need it.

### `_BK.ini`
Only the `first_name` and `last_name` lines change; the rest of the file stays as it is. The file is optional: it is created on the first save. If the names have no quotes, the game ignores them, and the Infos tab offers to repair the file.

## Development

```
npm test
```

`src/shared/gameData.generated.js` comes from the game's sources. Regenerate it after a game update, then run the tests: they fail if a new tag has no place in `src/shared/tagSchema.js`.

```
npm run generate:game-data -- "<path to the game folder>"
```
