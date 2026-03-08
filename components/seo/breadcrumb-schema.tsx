import React from 'react';

interface BreadcrumbItem {
    name: string;
    item: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

/**
 * BreadcrumbSchema component
 * Renders JSON-LD structured data for BreadcrumbList.
 * 
 * Example usage:
 * <BreadcrumbSchema 
 *   items={[
 *     { name: 'Home', item: 'https://example.com' },
 *     { name: 'Products', item: 'https://example.com/products' }
 *   ]} 
 * />
 */
export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
