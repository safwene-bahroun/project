from mfrc522 import MFRC522
import time
from machine import RTC, Pin, PWM
import urequests

# Initialize RFID reader
rdr = MFRC522(sck=18, mosi=23, miso=19, rst=4, cs=5)

# Define a mapping from tag type to tag names
tag_type_to_name = {
    0x11: "Salle A",
    0x10: "Salle B",
}

# Servo Setup
SERVO_PIN = 26
PWM_FREQ = 50
servo_pwm = PWM(Pin(SERVO_PIN), freq=PWM_FREQ)
DUTY_0_DEG = 40  # Adjust this for your servo's closed position
DUTY_90_DEG = 115  # Adjust this for your servo's open position

def set_servo_angle(angle):
    duty = int(DUTY_0_DEG + (DUTY_90_DEG - DUTY_0_DEG) * angle / 180)
    servo_pwm.duty(duty)
    time.sleep(0.5)

def detect_rfid():
    rtc = RTC()
    try:
        (stat, tag_type) = rdr.request(rdr.REQIDL)
        if stat == rdr.OK:
            (stat, raw_uid) = rdr.anticoll()
            if stat == rdr.OK:
                # Ensure raw_uid is in byte format
                if isinstance(raw_uid, list):
                    raw_uid = bytes(raw_uid)
                # Convert bytes to integer manually
                uid_decimal = 0
                for byte in raw_uid:
                    uid_decimal = (uid_decimal << 8) | byte
                
                tag_name = tag_type_to_name.get(tag_type, "Unknown Tag")
                a = rtc.datetime()
                timestamp = "%04d-%02d-%02d %02d:%02d:%02d" % (a[0], a[1], a[2], a[4], a[5], a[6])
                print("Time of detection:", timestamp)
                print("Card detected!")
                print("  - Tag Type: 0x%02x" % tag_type)
                print("  - UID: %d" % uid_decimal)
                print("  - Salle: Name: %s" % tag_name)
                return uid_decimal, timestamp, tag_name
        
    except Exception as e:
        print("Error in RFID detection:", e)
    
    # Return (None, None, None) if no valid RFID data is detected
    return None, None, None

def send_rfid_data(uid_decimal, timestamp, tag_name):
    url = "http://192.168.137.1:5000/absences/rfid"  # Update to your server's IP address
    data = {
        "uid": uid_decimal,
        "timestamp": timestamp,
        "salle_name": tag_name
    }
    headers = {'Content-Type': 'application/json'}
    try:
        response = urequests.post(url, json=data, headers=headers)
        print("Server response:", response.text)
    except Exception as e:
        print("Failed to send data:", e)
