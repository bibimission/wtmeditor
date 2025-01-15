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

        var labelParts = eventTxt.split('label')
        labelParts.forEach((lp, index) => {
            if (index == 0) { // Le début. C'est soit '' soit c'est le code qui insere dans la BDD des events
                if (lp.split('DB_plannedEvents').length > 1) {
                    var l = lp.split('\n')[0]
                    const params = l.split('Event(')[1].split(', ');
                    console.log(params)
                    event.label = params[0].split('"')[1]
                    event.cooldown = parseInt(params[1], 10);
                    const timeFrame = params[2].split('[')[1].split(']')[0].split(',');
                    event.hourStart = parseInt(timeFrame[0], 10);
                    event.hourEnd = parseInt(timeFrame[1], 10);
                    event.girlsNeeded = params[3].split(',').splice(1).join(',');
                    const eventPlaceVal = params[4].split('"')[1]
                    if (eventPlaceVal != '') {
                        event.place = EventParser.placeChoices.find(p => p.value == eventPlaceVal)
                    }
                    event.chance = parseFloat(params[5].split('=')[1].trim())
                    const dayNumbers = params[6]?.split('[')[1]?.split(']')[0]?.split(',').map((el) => { return el == '' ? -1 : parseInt(el, 10) })
                    dayNumbers.forEach((n) => {
                        if (n >= 0) {
                            event.days.push(EventParser.daysOptions.find(d => d.value == n))
                        }
                    })
                }
            } else {
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
                    if (l.trim() == 'menu:') {
                        currentEl = { type: 'Menu', els: [], parent: null, indent: (l.length - l.trim().length) }
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
                                currentEl = { type: 'Option', text: l.trim().substring(1, l.trim().length - 1), els: [], parent: currentEl, indent: (l.length - l.trim().length) }
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
                    else if (tokens[0] == "player" || tokens[0].split("event_girls[").length > 1 || tokens[0] == "ptaPresident.char" || tokens[0] == '"Phone"') {
                        el.type = 'Dialog'
                        var texte = tokens.slice(1, tokens.length).join(" ");
                        el.text = texte.substring(1, texte.length - 1);
                        el.value = tokens[0]
                    }

                    // Narration
                    else if (tokens[0].charAt(0) == '"') {
                        el.type = "Narration";
                        var texte = tokens.slice(0, tokens.length).join(" ");
                        el.text = texte.substring(1, texte.length - 1);
                    }

                    // Jump
                    else if (tokens[0] == "jump") {
                        el.type = 'Jump'
                        el.value = tokens[1]
                    }

                    // Event end
                    else if (l.split("$ renpy.jump(store.locationFrom)").length > 1) {
                        el.type = 'Event End'
                    }


                    /*
                    else if (tokens[0] == "$selectedEvent.setImg()") {
                        el.type = "Image End";
                    } else if (tokens[0] == "$selectedEvent.setVid()") {
                        el.type = "Video End";
                    } else if (tokens[0].includes("$selectedEvent.setBackground")) {
                        el.type = "Background";
                        el.value = tokens[0].split('"')[1];
                    } else if (tokens[0].includes("$selectedEvent.setImg")) {
                        el.type = "Image";
                        el.value = l.trim().split('"')[1];
                    } else if (tokens[0].includes("$selectedEvent.setVid")) {
                        el.type = "Video";
                        el.value = l.trim().split('"')[1];
                    }
                    else {
                        return;
                    }
                        */

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
                event.parts.push({ name: event.label + (index == 0 ? '' : '_part_' + index), els: els, type: 'Label' })
            }
        })
        return event
    }

    static eventObjectToPython(event) {
        var fourSpaces = "    ";

        var rpyText = "init -1 python:\n";
        rpyText += fourSpaces + 'DB_plannedEvents.append(Event("' + event.label + '", ' + event.cooldown + ', _timeFrame = [' + event.hourStart + ',' + event.hourEnd + '], ' +
            '_girlsNeeded = ["' + (event.girlsNeeded.join(', ')) + '"], ' +
            '_locations = ["' + event.place?.value + '"], ' +
            '_chance = ' + event.chance + ', ' +
            ' _condition = "timeManager.day in [' + event.days.map((d) => { return d.value })?.join(',') + ']"' +
            '))":\n';
        rpyText += "\n";
        rpyText += "label " + event.label + ":\n";
        event.parts.forEach(function(e, i) {
            switch (e.type) {
                case "label":
                    //rpyText += e.value + "\n";
                    break;
                case "Narration":
                    rpyText += fourSpaces + "\"" + e.value + "\"\n";
                    break;
                case "Player Dialog":
                    rpyText += fourSpaces + "player \"" + e.value + "\"\n";
                    break;
                case "Girl Dialog":
                    rpyText += fourSpaces + "event_girl \"" + e.value + "\"\n";
                    break;
                case "Image":
                    rpyText += fourSpaces + "$selectedEvent.setImg(\"" + e.value + "\")\n";
                    break;
                case "Image End":
                    rpyText += fourSpaces + "$selectedEvent.setImg()\n";
                    break;
                case "Video":
                    rpyText += fourSpaces + "$selectedEvent.setVid(\"" + e.value + "\")\n";
                    break;
                case "Video End":
                    rpyText += fourSpaces + "$selectedEvent.setVid()\n";
                    break;
                case "Show Phone":
                    rpyText += fourSpaces + "show phone\n";
                    break;
                case "Hide Phone":
                    rpyText += fourSpaces + "hide phone\n";
                    break;
                case "Background":
                    rpyText += fourSpaces + "$selectedEvent.setBackground(\"" + e.value + "\")\n";
                    break;
            }
        });
        rpyText += fourSpaces + "jump eventend\n";
        return rpyText
    }
}