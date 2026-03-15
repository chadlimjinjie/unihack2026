"use client"

import { useMqtt } from "@/components/mqtt/MqttProvider"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useMQTTPublish, useMQTTSubscribe } from "@/hooks/use-mqtt";
import { useEffect, useState } from "react";

export default function LiveCount({ count, location_id }: { count: bigint | null | undefined; location_id: string }) {

    const { client, status, error } = useMqtt();
    const [currentCount, setCurrentCount] = useState({
        count: 5
    });
    var test = 0

    const publish = useMQTTPublish(client);
    publish(`scan/ble/${location_id}`, "", { qos: 1 });

    useMQTTSubscribe(client, `scan/ble/${location_id}/response`, setCurrentCount);

    useEffect(() => {
        test = currentCount.count
    }, [test]) // Log MQTT connection status and errors

    return (
        <Card className="w-full bg-primary/10 border-primary">
            <CardContent className="flex items-center justify-center h-32 p-8">
                <div className="text-center">
                    <Label className="text-4xl md:text-5xl font-black text-primary drop-shadow-lg">
                        {currentCount.count}
                    </Label>
                    <p className="text-xl text-muted-foreground mt-2">People on court right now</p>
                </div>
            </CardContent>
        </Card>
    )
}