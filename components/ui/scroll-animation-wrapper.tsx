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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
