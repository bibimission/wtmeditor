export default class EventParser {

    static daysOptions = [
        { label: 'Monday', value: '1' },
        { label: 'Tuesday', value: '2' },
        { label: 'Wednesday', value: '3' },
        { label: 'Thursday', value: '4' },
        { label: 'Friday', value: '5' },
        { label: 'Saturday', value: '6' },
        { label: 'Sunday', value: '7' }
    ]


    static placeChoices = [
        { label: 'Home', value: 'home' },
        { label: 'Academy Hall', value: 'academyhall' },
        { label: 'On the way to school', value: 'gotoschool' },
        { label: 'On the way back Home', value: 'lb_academyhall_home' },
    ]
    static elementTypes = [
        'Narration',
        'Image',
        'Image End',
        'Video',
        'Video End',
        'Background',
        'Show Phone',
        'Hide Phone',
        'Dialog',

        // Special
        'Label',
        'Menu',
        'Option',
        'Jump',
        'Raw Code',

        'Event End'
    ]

    static parsePythonToObject(eventTxt) {

        const event = {
            parts: [],
            label: '',
            cooldown: 0,
            hourStart: 0,
            hourEnd: 0,
            girlsNeeded: [],
            place: '',
            chance: 0,
            days: []
        }
        event.label = eventTxt.split(':\n')[0].split('label ')[1]
        var labelParts = eventTxt.split('label')
        labelParts.forEach((lp, index) => {
            if (lp.length == 0) return

            var lines = lp.split('\n')
            var els = [];

            var currentEl = null;

            for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                var l = lines[lineIndex];
                var tokens = l.trim().split(" ");

                // Comments are ignored and will disappear
                if (tokens[0].charAt(0) == "#") {
                    continue;
                }

                // Title of the part. Ignored too
                if (lineIndex == 0) {
                    continue
                }

                // Parse Menu. We admit there is not more than 1 menu per label
                if (l.split('menu(title_text').length > 1) {
                    currentEl = { type: 'Menu', els: [], parent: null, indent: (l.length - l.trim().length), text: l.split('"')[1] }
                    continue;
                }

                // Parse Menu Options
                if (currentEl != null && (currentEl.type == 'Option' || currentEl.type == 'Menu')) {
                    if (l.trim().charAt(l.trim().length - 1) == ':') {
                        if (currentEl.type == 'Option') {
                            var parent = currentEl.parent
                            currentEl.parent = null
                            parent.els.push(currentEl)
                            currentEl = parent
                        }
                        if (currentEl.type == 'Menu') {
                            currentEl = { type: 'Option', text: l.trim().substring(1, l.trim().length - 2), els: [], parent: currentEl, indent: (l.length - l.trim().length) }
                            continue
                        }
                    }

                    // Check for Menu or Option End
                    while (currentEl != null && (l.length - l.trim().length) <= currentEl.indent) {
                        //console.log(currentEl)
                        var parent = currentEl.parent
                        if (parent != null) {
                            parent.els.push(currentEl)
                            currentEl.parent = null
                            currentEl = parent
                        } else {
                            els.push(currentEl);
                            currentEl = null
                        }
                    }
                }

                /// Elements classiques
                var el = {};

                // Show/Hide phone. value == true means vibrate
                if (l.trim() == 'show phone') {
                    el.type = 'Show Phone'
                    el.value = lines[lineIndex + 1].trim() == 'with hpunch'
                } else if (l.trim() == 'hide phone') {
                    el.type = 'Hide Phone'
                }

                // Dialogs
                else if (tokens[0] == "player.character" || tokens[0].split("selected_girl.character").length > 1 || tokens[0] == '"Phone"') {
                    el.type = 'Dialog'
                    var texte = tokens.slice(1, tokens.length).join(" ");
                    el.text = texte.substring(1, texte.length - 1);
                    el.value = tokens[0]
                }

                // Narration
                else if (tokens[0].charAt(0) == '"') {
                    el.type = "Narration";
                    var texte = tokens.slice(0, tokens.length).join(" ");
                    el.value = texte.substring(1, texte.length - 1);
                }

                // Jump
                else if (tokens[0] == "jump") {
                    el.type = 'Jump'
                    el.value = tokens[1]
                }

                // Event end
                else if (l.split("return").length > 1) {
                    el.type = 'Event End'
                }


                /*
                else if (tokens[0] == "$selectedEvent.setImg()") {
                    el.type = "Image End";
                } */
                else if (l.includes("current_event.hide_video()")) {
                    el.type = "Video End";
                }
                else if (l.includes("$current_event.set_background(")) {
                    el.type = "Background";
                    el.value = tokens[0].split('"')[1];
                } else if (l.includes("current_event.show_image(")) {
                    el.type = "Image";
                    el.value = l.trim().split('"')[1];
                } else if (l.includes("current_event.show_video")) {
                    el.type = "Video";
                    el.value = l.trim().split('"')[1];
                }

                else {
                    el.type = 'Raw Code'
                    el.value = l
                }

                if (el.type != undefined) {
                    if (currentEl != null) {
                        currentEl.els.push(el);
                    } else {
                        els.push(el);
                    }
                }
            }
            if (currentEl != null) {
                els.push(currentEl);
            }
            event.parts.push({ name: event.label + (index == 1 ? '' : '_part_' + index), els: els, type: 'Label' })
        })
        return event
    }

    static eventObjectToPython(event) {
        var rpyText = "";

        var recurVar = [rpyText]
        event.parts.forEach((p) => {
            EventParser.elementToPythonRecu(p, recurVar)
        })
        rpyText = recurVar[0]
        return rpyText
    }

    static elementToPythonRecu(el, pythonStr, currentIndent = 0) {
        switch (el.type) {
            case "Label":
                pythonStr[0] += 'label ' + el.name + ':\n'
                el.els.forEach((e) => {
                    EventParser.elementToPythonRecu(e, pythonStr, currentIndent + 1)
                })
                break;
            case "Menu":
                pythonStr[0] += this.getIndent(currentIndent) + 'menu(title_text=f"' + el.text + '"):\n'
                el.els.forEach((e) => {
                    EventParser.elementToPythonRecu(e, pythonStr, currentIndent + 1)
                })
                break;
            case "Option":
                pythonStr[0] += this.getIndent(currentIndent) + '"' + el.text + '":\n'
                el.els.forEach((e) => {
                    EventParser.elementToPythonRecu(e, pythonStr, currentIndent + 1)
                })
                break;
            case "Event End":
                pythonStr[0] += this.getIndent(currentIndent) + "return\n";
                break;
            case "Jump":
                pythonStr[0] += this.getIndent(currentIndent) + "jump " + el.value + "\n";
                break;
            case "Narration":
                pythonStr[0] += this.getIndent(currentIndent) + "\"" + el.value + "\"\n";
                break;
            case "Dialog":
                pythonStr[0] += this.getIndent(currentIndent) + el.value + " \"" + el.text + "\"\n";
                break;
            case "Image":
                pythonStr[0] += this.getIndent(currentIndent) + "$ current_event.show_image(\"" + el.value + "\")\n";
                break;
            case "Image End":
                pythonStr[0] += this.getIndent(currentIndent) + "$ current_event.show_image()\n";
                break;
            case "Video":
                pythonStr[0] += this.getIndent(currentIndent) + "$ current_event.show_video(\"" + el.value + "\")\n";
                break;
            case "Video End":
                pythonStr[0] += this.getIndent(currentIndent) + "$ current_event.hide_video()\n";
                break;
            case "Show Phone":
                pythonStr[0] += this.getIndent(currentIndent) + "show phone\n";
                break;
            case "Hide Phone":
                pythonStr[0] += this.getIndent(currentIndent) + "hide phone\n";
                break;
            case "Background":
                pythonStr[0] += this.getIndent(currentIndent) + "$ current_event.set_background(\"" + el.value + "\")\n";
                break;
            case "Raw Code":
                pythonStr[0] += this.getIndent(currentIndent) + el.value.trim() + '\n'
                break
        }
    }

    static getIndent(indentLvl) {
        var ret = ''
        for (var i = 0; i < indentLvl; i++) {
            ret += "    "
        }
        return ret
    }
}