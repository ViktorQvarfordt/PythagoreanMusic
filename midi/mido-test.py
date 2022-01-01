import os
import signal
import sys
import tty
import termios
import time
import mido
from collections import deque
from threading import Thread


inport_name = 'ESI MIDIMATE eX Port 2'
outport_name = 'MIDO'
msglog = deque()
echo_delay = 1


# print(mido.get_output_names()) # To list the output ports
# print(mido.get_input_names()) # To list the input ports

send_time_start = None
delay = 0

def getchar():
    fd = sys.stdin.fileno()
    attr = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        return sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSANOW, attr)

def listen_keyboard():
    global send_time_start
    global delay
    while True:
        c = getchar()

        if c == '\x04':  # CTRL+D
            print('exit')
            # os.kill(os.getpid(), signal.SIGINT)
            break

        if c == ' ' and len(msglog) > 0:
            send_time_start = time.time()
            delay = time.time() - msglog[0]['time_start']
            print('send', msglog)

def mido_loop():
    global send_time_start
    with mido.open_input(inport_name) as inport:
        with mido.open_output(outport_name, virtual=True) as outport:
            while True:
                for msg in inport.iter_pending():
                    if msg.type != "clock":
                        msglog.append({ "msg": msg.copy(), "time_start": time.time() })

                # while len(msglog) > 0 and msglog[0]["time_start"] <= time.time() - echo_delay:
                while send_time_start is not None:
                    # print('play')
                    # send_time_start = None
                    if len(msglog) == 0:
                        send_time_start = None
                        print('empty')
                    else:
                        if len(msglog) > 0 and msglog[0]['time_start'] + delay <= time.time():
                            msg = msglog.popleft()["msg"]
                            if hasattr(msg, 'note'):
                                msg.note += 12
                                # print('sending ghost', msg)
                                outport.send(msg)


def live():
    t1 = Thread(target = listen_keyboard)
    t2 = Thread(target = mido_loop)
    t1.start()
    t2.start()
    # t1.join()
    # t2.join()


def circle_of_fifths():
    msgs = deque([])
    δ = 0.5

    # note = 60
    # for i in range(0, 13):
    #     msgs.append({ 'time_start_delta': δ * i, 'msg': mido.Message('note_on', note=note) })
    #     msgs.append({ 'time_start_delta': δ * (i + 1), 'msg': mido.Message('note_off', note=note) })
    #     note += 7
    #     if note > 72:
    #         note -= 12

    def push(Δ, note):
        msgs.append({ 'time_start_delta': Δ, 'msg': mido.Message('note_on', note=note) })
        msgs.append({ 'time_start_delta': Δ + δ, 'msg': mido.Message('note_off', note=note) })

    push(0.5, 67)
    push(1.0, 62)
    push(1.5, 69)
    push(2.0, 64)
    push(2.5, 71)
    push(3.0, 66)
    push(3.5, 61)
    push(4.0, 68)
    push(4.5, 63)
    push(5.0, 70)
    push(5.5, 65)
    push(6.0, 72)
    push(6.5, 60)
    push(7.0, 67)

    return msgs

def fmt(msg):
    return f"{round(msg['time_start_delta'], 1)} {msg['msg'].type.ljust(8)} {msg['msg'].note} {msg['msg'].velocity}"

def play(msgs):
    with mido.open_output(outport_name, virtual=True) as outport:
        time_start = time.time()
        while True:
            if len(msgs) == 0:
                break
            msg = msgs[0]
            if msg['time_start_delta'] + 2 <= time.time() - time_start:
                print(fmt(msg))
                msgs.popleft()
                outport.send(msg['msg'])

def main():
    # play(c())
    play(circle_of_fifths())

main()
