// components/SectionHeader.tsx
import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, className = '' }) => {
    return (
        <div className={`mb-4 ${className}`}>
            <h5 className="text-xl font-bold">{title}</h5>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
    );
};

export default SectionHeader;
