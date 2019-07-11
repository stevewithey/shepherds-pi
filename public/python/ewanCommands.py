import gpiozero
import time

# Constants
SLEEP_TIME = 1
TRIGGER_DURATION = 0.5
SWITCH_OFF_HOLD_SECONDS = 3
EWAN_PLAYBACK_DURATION = 15

# Assign the pins
RELAY_1_PIN = 18
RELAY_2_PIN = 23
RELAY_3_PIN = 24
RELAY_4_PIN = 25

# Create the relay 'switches'
sound1 = gpiozero.OutputDevice(RELAY_1_PIN, active_high=False, initial_value=False)
sound2 = gpiozero.OutputDevice(RELAY_2_PIN, active_high=False, initial_value=False)
sound3 = gpiozero.OutputDevice(RELAY_3_PIN, active_high=False, initial_value=False)
sound4 = gpiozero.OutputDevice(RELAY_4_PIN, active_high=False, initial_value=False)

def trigger_sound(soundRelay):
    soundRelay.on()
    time.sleep(TRIGGER_DURATION)
    soundRelay.off()

def reset_relays():
    print("Turning off relay 1")
    sound1.off()
    print("Turning off relay 2")
    sound2.off()
    print("Turning off relay 3")
    sound3.off()
    print("Turning off relay 4")
    sound4.off()

def stop_playback():
    sound1.on()
    time.sleep(SWITCH_OFF_HOLD_SECONDS)
    sound1.off()

def trigger_sound_for_time(soundRelay, timeInMinutes = 0):
    if timeInMinutes <= EWAN_PLAYBACK_DURATION:
        trigger_sound(soundRelay)
        return
    
    timeRemaining = timeInMinutes
    while (timeRemaining > 0):
        trigger_sound(soundRelay)
        timeRemaining = timeRemaining - EWAN_PLAYBACK_DURATION
        time.sleep(EWAN_PLAYBACK_DURATION*60)

reset_relays()