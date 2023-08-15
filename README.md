# WTM Editor

## Requirements

NodeJS

## Installation

```
npm install
```
create a folder named "packs" inside the Wtmeditor folder. It will contains all the characters folders, you create or edit.

## How to use

```
quasar dev -m electron
```

### Create a pack
Type the name of the model you want to create and press Create.

### Edit a pack
Put your character folder inside the "packs" folder.

### FIle conversion
The WTM Editor handles file conversion. You can see which files need conversion with their outline.
- Red outline means that the file format is incorrect. If you click on ot, the WTMEditor will convert it to the required format. WEBP or WEBM.
- Yellow outline means that the file dimensions are too small for the game. If you click on it, the WTM Editor will upscale it. (But won't improve it's quality)

Don't convert many files at the same time. It will not work.

#### Events
To create a new event, you have to create the folder manually in your file system. Then, the wtmeditor can find it afterwards.

#### Photoshoots
- The "Reset pictures Ids" simply rename all your photos to put a number in front of each photos in the current order.
- You can switch photos positions by drag and drop.


### Informations
- Every change you make is saved instantly
- There is no "Cancel" action

### Known bugs (On the top of the fix list)
- When dragging photos inside photoshoots, sometimes it saves a file with no extension. TO solve it, go in the photoshoot folder and find the corrupted file and add ".webp" at the and of its name.
- When changing the type of a video, it sometimes changes the type of other ones. To avoid that, you need to switch tabs every single time you change a video type.


