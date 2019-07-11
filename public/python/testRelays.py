#! /usr/bin/python3
import gpiozero
import time
import ewanCommands

# Constants
SLEEP_TIME = 5

def test_loop():
    ewanCommands.reset_relays()
    while 1:
        print("Triggering relay 1")
        ewanCommands.trigger_sound(ewanCommands.sound1)
        time.sleep(SLEEP_TIME)

        print("Triggering relay 2")
        ewanCommands.trigger_sound(ewanCommands.sound2)
        time.sleep(SLEEP_TIME)

        print("Triggering relay 3")
        ewanCommands.trigger_sound(ewanCommands.sound3)
        time.sleep(SLEEP_TIME)

        print("Triggering relay 4")
        ewanCommands.trigger_sound(ewanCommands.sound4)
        time.sleep(SLEEP_TIME)

if __name__ == "__main__":
    try:
        ewanCommands.stop_playback()
        test_loop()
    except KeyboardInterrupt:
        ewanCommands.stop_playback()
        ewanCommands.reset_relays()