label a_cole_day_indeed:
    $ selected_girl = current_event.participants[0]

    if "home" in global_current_location_label:
        $ current_event.set_background("images/backgrounds/bg bedroom.webp")  # We give a path outside of the event root directory, the event will still find it.
    elif "office" in global_current_location_label:
        $ current_event.set_background("images/backgrounds/academy/bg office.webp")  # We give a path outside of the event root directory, the event will still find it.

    "You hear a knock on your front door."

    player.character "One second"

    "You open the door and see [selected_girl.full_name]."

    $ current_event.show_image("images/1.webp")  # We give the path to the image, the path should be relative to the event root directory.

    player.character "[selected_girl], what I surprise. Please come inside."

    selected_girl.character "Thanks, [player]. But this is just an example event, so I don't have much to say."

    player.character "E- Example event? [selected_girl] are you feeling ok?"

    selected_girl.character "We don't have time for that..."
    
    player.character "Oka-"

    $ current_event.show_video("vids/1.webm")  # We give the path to the video, the path should be relative to the event root directory.

    "Before you can finish a work [selected_girl] leaps at you pulling out cock in an instant."

    player.character "[selected_girl], what has gotten into you!"

    selected_girl.character "Hopefully you!"

    $ current_event.show_video("strip_upper")  # We don't give a path, it will use webm_helper to find an appropriate video.

    "[selected_girl] starts stripping off her clothing starting with her top."
    
    $ selected_girl.make_topless()  # Remove any clothing covering torso, i.e top and bra.

    $ current_event.show_video("strip_lower")

    $ clothing_name = selected_girl.get_clothing_on_part("lower").name
    "[selected_girl] quickly moves on, taking off her [clothing_name]."

    $ selected_girl.make_nude()  # Removes all clothing making her completely nude.

    $ current_event.show_video("fuck_pussy")
    pause

    $ current_event.hide_video()

    return
