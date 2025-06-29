import { ImgHTMLAttributes } from 'react';

export default function AppLogoImage(props: ImgHTMLAttributes<HTMLImageElement>) {
    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
    
    return (
        <img 
            src="/images/logo.png" 
            alt={appName} 
            {...props} 
            className={`object-contain ${props.className || ''}`}
        />
    );
} 