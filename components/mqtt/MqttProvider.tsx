import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

// 1. Define types for our Context State
interface MqttContextType {
    client: MqttClient | null;
    status: 'Connecting' | 'Connected' | 'Error' | 'Offline';
    error: string | null;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

interface MqttProviderProps {
    children: ReactNode;
    url: string;
    options?: IClientOptions;
}

export const MqttProvider: React.FC<MqttProviderProps> = ({ children, url, options }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [status, setStatus] = useState<MqttContextType['status']>('Connecting');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Note: Browser MQTT requires ws:// or wss:// protocols
        const mqttClient = mqtt.connect(url, {
            reconnectPeriod: 5000,
            connectTimeout: 30 * 1000,
            ...options,
        });

        mqttClient.on('connect', () => {
            setStatus('Connected');
            setError(null);
            setClient(mqttClient);
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
            setStatus('Error');
            setError(err.message);
        });

        mqttClient.on('offline', () => setStatus('Offline'));

        // Cleanup: gracefully close connection when provider unmounts
        return () => {
            mqttClient.end();
        };
    }, [url, options]);

    return (
        <MqttContext.Provider value={{ client, status, error }}>
            {children}
        </MqttContext.Provider>
    );
};

// 2. Custom hook for easy access with built-in null checking
export const useMqtt = () => {
    const context = useContext(MqttContext);
    if (context === undefined) {
        throw new Error('useMqtt must be used within a MqttProvider');
    }
    return context;
};