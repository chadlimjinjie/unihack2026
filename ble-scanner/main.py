import asyncio
import json
from bleak import BleakScanner
import psycopg
import paho.mqtt.client as mqtt
from paho.mqtt.client import Client, MQTTMessage
import time

# Connection settings using a free public broker
BROKER = "broker.emqx.io"
PORT = 1883
LOCATION_ID = "1"  # Example location identifier
TOPIC = f"scan/ble/{LOCATION_ID}"


# Callback for when connected
def on_connect(client: Client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(TOPIC)  # Subscribe on connect to handle reconnections


# Callback for received messages
def on_message(client: Client, userdata, msg: MQTTMessage):
    print(f"Received: {msg.payload} on {msg.topic}")
    topic = msg.topic
    if topic == TOPIC:
        # devices = await BleakScanner.discover(timeout=10.0)  # Scan for 10 seconds
        count = asyncio.run(run_scan(court_id=LOCATION_ID))
        print("count: ", count)

        # Example: Create dict, convert to JSON with json.dumps(), and publish
        payload_dict = {"count": count}
        payload_json = json.dumps(payload_dict)
        client.publish(f"scan/ble/{LOCATION_ID}/response", payload_json)


# Initialize client (API v2 recommended) and assign callbacks
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

client = psycopg.connect(
    host="aws-1-ap-southeast-2.pooler.supabase.com",
    port=6543,
    dbname="postgres",
    user="postgres.bpmushennczzznrxuthk",
    password="kq3hj3WHGjdAwhpg",
)


async def run_scan(court_id=1):
    """
    Scans for BLE devices and prints their address, name, and RSSI.
    """
    print("Scanning for BLE devices...")
    # The 'discover' method returns a list of Device objects
    devices = await BleakScanner.discover(timeout=10.0)  # Scan for 10 seconds

    if not devices:
        print("No devices found.")
        return

    num_devices = int(len(devices)/4)

    # Connect to an existing database
    # with client as conn:

    #     # Pass data to fill a query placeholders and let Psycopg perform
    #     # the correct conversion (no SQL injections!)
    #     conn.execute(
    #         'INSERT INTO "occupancy-log" (court_id, player_ct) VALUES (%s, %s)',
    #         (court_id, num_devices),
    #     )

    return num_devices
    print(f"Found {len(devices)} devices:")



# Run the asynchronous function
if __name__ == "__main__":
    # test = asyncio.run(run_scan(court_id=1))
    # Connect and start network loop in background
    mqtt_client.connect(BROKER, PORT, keepalive=60)
    mqtt_client.loop_forever()
