"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/shared/utils"

interface Notification {
    id: string
    title: string
    content: string
    type: string
    isRead: boolean
    createdAt: string
    link?: string
}

export function NotificationPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err)
        }
    }, [])

    useEffect(() => {
        const initTimeout = setTimeout(() => {
            fetchNotifications()
        }, 0)

        // Poll every 1 minute
        const interval = setInterval(fetchNotifications, 60000)

        return () => {
            clearTimeout(initTimeout)
            clearInterval(interval)
        }
    }, [fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ id })
            })
            fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ all: true })
            })
            fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer relative"
                >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[10px] items-center justify-center text-white font-bold">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-zinc-950 border-white/10" align="end">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] text-blue-400 hover:text-blue-300"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                    className={cn(
                                        "p-4 border-b border-white/5 last:border-0 cursor-pointer transition-colors",
                                        n.isRead ? "opacity-60 grayscale-[0.5]" : "bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-1 p-1 rounded-full",
                                            n.type === "success" ? "bg-emerald-500/10 text-emerald-500" :
                                                n.type === "warning" ? "bg-amber-500/10 text-amber-500" :
                                                    n.type === "error" ? "bg-rose-500/10 text-rose-500" :
                                                        "bg-blue-500/10 text-blue-500"
                                        )}>
                                            <Info className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{n.content}</p>
                                            <p className="text-[10px] text-zinc-500 mt-2">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
