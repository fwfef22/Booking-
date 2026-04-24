import { Activity } from "../data/activities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, MapPin } from "lucide-react";

interface ActivityCardProps {
    activity: Activity;
    onSelect: () => void;
}

export function ActivityCard({ activity, onSelect }: ActivityCardProps) {
    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col"
            onClick={onSelect}
        >
            <div className={`h-2 bg-gradient-to-r ${activity.gradient}`} />
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {activity.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        od {activity.pricePerHour} zł/h
                    </Badge>
                </div>
                <CardTitle>{activity.name}</CardTitle>
                <CardDescription>{activity.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Domyślny czas: {activity.duration} minut</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <div>Dostępne obiekty ({activity.facilities.length}):</div>
                            <ul className="mt-1 space-y-0.5">
                                {activity.facilities.slice(0, 2).map((facility, index) => (
                                    <li key={index} className="text-xs">
                                        • {facility}
                                    </li>
                                ))}
                                {activity.facilities.length > 2 && (
                                    <li className="text-xs">• i więcej...</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <Button
                    className={`w-full bg-gradient-to-r ${activity.gradient} hover:opacity-90`}
                >
                    Zarezerwuj teraz
                </Button>
            </CardContent>
        </Card>
    );
}
