'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface DashboardStatCardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    growth?: string;
    className?: string;
}

export default function DashboardStatCard({
    title,
    value,
    icon,
    growth,
    className,
}: DashboardStatCardProps) {
    return (
        <Card className={cn("w-full shadow-sm bg-card text-card-foreground", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {growth && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <ArrowUpRight size={12} className="text-green-500" />
                        {growth} this month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
