"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: number;
        purchaseType: string; // Changed from purchaseType?: string to include the type safety or just string
        // Actually Prisma return type might have purchaseType as string if not typed with Enums in newer versions or if we use raw objects.
        // It's defined as String in schema, but typically typed as union in client.
        // Let's use string to be safe.
        interval: string | null;
        image: string | null;
        type: string;
    }
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="flex flex-col h-full border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden group hover:border-brand-yellow/50 transition-colors">
            {product.image ? (
                <div className="relative w-full aspect-video overflow-hidden bg-zinc-900">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center text-zinc-700">
                    No Image
                </div>
            )}
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl text-white">{product.name}</CardTitle>
                    <Badge variant="outline" className="border-brand-yellow text-brand-yellow">
                        {product.purchaseType === 'subscription' ? 'Sub' : 'One-time'}
                    </Badge>
                </div>
                {product.description && <CardDescription className="line-clamp-2 text-zinc-400">{product.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-2xl font-bold text-white">
                    ${product.price}
                    {product.purchaseType === 'subscription' && (
                        <span className="text-sm font-normal text-zinc-400">/{product.interval}</span>
                    )}
                </div>
                <div className="mt-2 text-sm text-zinc-500 capitalize">{product.type}</div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full bg-brand-yellow text-black hover:bg-brand-yellow/90">
                    <Link href={`/checkout/${product.id}`}>
                        Buy Now
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
