import time
from pynput import mouse
from pynput import keyboard  # Import keyboard for Listener
from pynput.mouse import Button, Controller as MouseController
from pynput.keyboard import Key, Controller as KeyboardController

# # Initialize controllers
mouse_control = MouseController()
keyboard_control = KeyboardController()


# Global flag to control execution
running = True


def on_press(key):
    global running
    if key == Key.esc:
        print("\nEsc pressed. Stopping...")
        running = False
        return False  # Stop listener


# Start non-blocking listener
listener = keyboard.Listener(on_press=on_press)
listener.start()

print("Script starting in 1 seconds... Switch to your target window.")
print("Press 'Esc' key at any time to stop the script.")
time.sleep(1)

bottom_left = (760.7265625, 854.20703125)
top_left = (760.53125, 244.1640625)
top_right = (1673.9765625, 244.08203125)
hatch = (482.7890625, 106.7265625)
pen = (1196.66796875, 648.0078125)
pen_down = (1177.9140625, 685.203125)
ok_button = (1388.65234375, 522.171875)

click_delay = 0.2
position_delay = 0.1

num_row = 5
num_col = 7

mouse_control.position = (284.7578125, 1252.09375)
mouse_control.click(Button.left, 1)
time.sleep(1)

for i in range(num_row):
    if not running:
        break
    for j in range(num_col):
        if not running:
            break

        delta_x = (top_right[0] - top_left[0]) / (num_col - 1)
        delta_y = (bottom_left[1] - top_left[1]) / (num_row - 1)
        mouse_control.position = (
            bottom_left[0] + j * delta_x,
            bottom_left[1] - i * delta_y,
        )
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay)

        if not running:
            break
        mouse_control.position = hatch
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay + 0.2)

        if not running:
            break
        mouse_control.position = pen
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay + 0.2)

        if not running:
            break
        mouse_control.position = pen_down
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay)

        if not running:
            break
        mouse_control.position = ok_button
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay)
