import time
from pynput import mouse
from pynput import keyboard

def on_click(x, y, button, pressed):
    if pressed:
        print(f"({x}, {y})")


if __name__ == "__main__":
    print("Listening for mouse clicks... Press Ctrl+C to stop.")
    try:
        # Collect events until released
        with mouse.Listener(on_click=on_click) as listener:
            listener.join()
    except KeyboardInterrupt:
        print("\nRecording stopped.")
