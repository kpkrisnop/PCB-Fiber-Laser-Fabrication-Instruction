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

click_delay = 0.2
position_delay = 0.1

top_pen = (2369.95703125, 210.46875)
control_var_pos = (2524.8359375, 497.75)
dependent_var_pos = (2524.8359375, 497.75)
down = (2546.68359375, 319.13671875)

num_row = 5
num_col = 7

min_control_var = 20
max_control_var = 80
min_dependent_var = 20
max_dependent_var = 80

mouse_control.position = (284.7578125, 1252.09375)
mouse_control.click(Button.left, 1)
time.sleep(1)

for i in range(num_row):
    if not running:
        break
    for j in range(num_col):
        if not running:
            break
        mouse_control.position = down
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay)

        if not running:
            break
        mouse_control.position = top_pen
        time.sleep(position_delay)
        mouse_control.click(Button.left, 1)
        time.sleep(click_delay)

        if not running:
            break
        mouse_control.position = control_var_pos
        time.sleep(position_delay)
        mouse_control.click(Button.left, 2)
        time.sleep(click_delay)
        keyboard_control.type(f"{int(min_control_var + (max_control_var - min_control_var) * j / (num_col - 1))}")

        # if not running:
        #     break
        # mouse_control.position = dependent_var_pos
        # time.sleep(position_delay)
        # mouse_control.click(Button.left, 2)
        # time.sleep(click_delay)
        # keyboard_control.type(f"{int(min_dependent_var + (max_dependent_var - min_dependent_var) * i / (num_row - 1))}")
