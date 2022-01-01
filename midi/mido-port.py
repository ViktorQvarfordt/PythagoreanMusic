import mido
from time import sleep

with mido.open_output('MIDI', virtual=True) as outport:
    sleep(100)
