import time
from machine import Pin
import network
from main import detect_rfid, send_rfid_data, set_servo_angle

# Wi-Fi connection details
SSID = 'wifi'
PASSWORD = 'safsaf123'

def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while not wlan.isconnected():
        time.sleep(1)  # Add delay to avoid rapid polling
    print('Connected to Wi-Fi:', wlan.ifconfig())

def ensure_wifi_connection():
    wlan = network.WLAN(network.STA_IF)
    if not wlan.isconnected():
        print("Wi-Fi disconnected. Reconnecting...")
        connect_wifi(SSID, PASSWORD)

def main():
    connect_wifi(SSID, PASSWORD)
    set_servo_angle(0)  # Initial Closed Position
    current_state = 'CLOSED'

    while True:
        ensure_wifi_connection()  # Ensure Wi-Fi is connected
        try:
            result = detect_rfid()  # Get RFID data
            
            if result:
                uid, timestamp, tag_name = result
                
                if uid is not None:
                    if current_state != 'OPEN':
                        print("Opening Door")
                        set_servo_angle(90)
                        current_state = 'OPEN'
                        send_rfid_data(uid, timestamp, tag_name)  # Send RFID data
                    time.sleep(5)  # Keep door open for 5 seconds
                    print("Closing Door")
                    set_servo_angle(0)
                    current_state = 'CLOSED'
            else:
                if current_state == 'OPEN':
                    set_servo_angle(0)
                    current_state = 'CLOSED'
        
        except Exception as e:
            print("An error occurred:", e)
        
        time.sleep(1)  # Check every second
if __name__ == "__main__":
    main()
