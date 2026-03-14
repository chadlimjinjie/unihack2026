import { MqttClient } from "mqtt";
import { useEffect } from "react";

export function useMQTTSubscribe(client: MqttClient | null, topic: string, onMessage: any) {
    useEffect(() => {
        if (!client || !client.connected) return;
        const handleMsg = (receivedTopic: string, message: Buffer) => {
            console.log("Received message on topic %s: %s", receivedTopic, message.toString());
            if (receivedTopic === topic) {
                onMessage(JSON.parse(message.toString()));
            }
        };
        client.subscribe(topic);
        client.on('message', handleMsg);
        return () => {
            try {
                if (client.connected) {
                    client.unsubscribe(topic);
                }
                client.off('message', handleMsg);
            } catch {
                // Client may already be disconnecting; ignore cleanup errors
            }
        };
    }, [client, topic, onMessage]);
}

export function useMQTTPublish(client: MqttClient | null) {
    const publish = (topic: string, message: any, options = {}) => {
        if (client && client.connected) {
            client.publish(topic, message, options);
        }
    };
    return publish;
}
