import AppLogoIcon from './app-logo-icon';
import React from 'react';
export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-border text-sidebar-primary-foreground flex aspect-square  items-center justify-center rounded-md">
                <AppLogoIcon className="size-10 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Web SiPantau</span>
            </div>
        </>
    );
}
