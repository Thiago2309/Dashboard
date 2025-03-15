'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { login } from '../../../../Services/BD/userService';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        const user = await login(email, password);

        if (user) {
            console.log('Logged in successfully', user);
            router.push('/'); 
        } else {
            alert('A thaigo le gusta el poene');
        }
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center">
            <img src="/layout/images/logo-dark.svg" alt="Logo" className="mb-5 w-6rem flex-shrink-0" />
            <div
                style={{
                    borderRadius: '56px',
                    padding: '0.3rem',
                    background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                }}
            >
                <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                    <div className="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Avatar" height="50" className="mb-3" />
                        <div className="text-900 text-3xl font-medium mb-3">Bienvenido</div>
                        <span className="text-600 font-medium">Inicia sesión para continuar</span>
                    </div>

                    <div>
                        <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">Correo</label>
                        <InputText 
                            id="email1" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="thaigoesgey@gmail.com" 
                            className="w-full md:w-30rem mb-5" 
                            style={{ padding: '1rem' }} 
                        />

                        <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">Contraseña</label>
                        <Password 
                            inputId="password1" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                            toggleMask 
                            className="w-full mb-5" 
                            inputClassName="w-full p-3 md:w-30rem"
                        />

                        <div className="flex align-items-center justify-content-between mb-5 gap-5">
                            <div className="flex align-items-center">
                                <Checkbox 
                                    inputId="rememberme1" 
                                    checked={checked} 
                                    onChange={(e) => setChecked(e.checked ?? false)} 
                                    className="mr-2"
                                />
                                <label htmlFor="rememberme1">Recuérdame</label>
                            </div>
                        </div>

                        <Button 
                            label="Iniciar sesión" 
                            className="w-full p-3 text-xl" 
                            onClick={handleLogin}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
