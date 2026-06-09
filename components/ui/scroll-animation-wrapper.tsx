"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollAnimationWrapperProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function ScrollAnimationWrapper({ children, className, delay = 0 }: ScrollAnimationWrapperProps) {
    return (
        <motion.div
            // Set opacity awal ke 1 untuk memastikan konten langsung terlihat sebelum hidrasi JS di client
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
