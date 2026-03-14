import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CourtCard({
    id,
    image,
    name,
    location,
}: {
    id: bigint
    image: string | null
    name: string | null
    location: string | null
}) {
    return (
        <Card className="relative w-full max-w-sm pt-0 border border-border shadow-md transition-shadow duration-200 hover:shadow-lg">
            {/* <div className="absolute inset-0 z-30 aspect-video bg-black/35" /> */}
            <img
                src={image ?? "https://avatar.vercel.sh/shadcn1"}
                alt="Court cover"
                className="relative z-20 aspect-video w-full object-cover"
                // className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />
            <CardHeader>
                <CardAction>
                    <Badge variant="secondary">Featured</Badge>
                </CardAction>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    {location}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href={`/courts/${id}`}>
                        View Court
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
