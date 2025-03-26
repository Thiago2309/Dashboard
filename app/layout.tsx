'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import LoginPage from './(full-page)/auth/login/page';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useEffect, useState } from 'react';
import { getsession } from '@/Services/BD/userService';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
       console.log('RootLayout useEffect');
        getsession().then((session) => {
            if (session) {
                console.log("ids", session);
                setIsAuthenticated(true);
            } else {
                console.log("ids", session);
                setIsAuthenticated(false);
            }
        });
        
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                {isAuthenticated ? (
                    <PrimeReactProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </PrimeReactProvider>
                ) : (
                    <LoginPage />
                )}
            </body>
        </html>
    );
}
