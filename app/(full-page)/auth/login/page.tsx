import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { login, register, fetchUserData } from '../../../../Services/BD/userService';

const LoginPage = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [sueldo, setSueldo] = useState('');
    const [checked, setChecked] = useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);
    
        try {
            if (isRegistering) {
                const sueldoNumber = parseFloat(sueldo);
                if (isNaN(sueldoNumber)) {
                    alert('El sueldo debe ser un número válido');
                    return;
                }
    
                const user = await register(email, password, { nombre, apellido, ciudad, sueldo: sueldoNumber });
                if (user) {
                    alert('¡Registro exitoso! Por favor inicia sesión');
                    setIsRegistering(false);
                }
            } else {
                const user = await login(email, password);
                if (user) {
                   
                    const userData = await fetchUserData(user.id);
                    if (userData) {
                        console.log('Datos del usuario:', userData);
                        router.push('/');
                    } else {
                        alert('No se encontraron datos adicionales del usuario.');
                    }
                }
            }
        } catch (error: any) {
            if (error.message.includes("over_email_send_rate_limit")) {
                const waitTime = error.message.match(/\d+/)[0];
                alert(`Has enviado demasiadas solicitudes. Por favor, espera ${waitTime} segundos antes de intentar nuevamente.`);
            } else {
                alert('Error: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center">
            <img src="/layout/images/logo-dark.svg" alt="Logo" className="mb-5 w-6rem flex-shrink-0" />
            <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                    <div className="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Avatar" height="50" className="mb-3" />
                        <div className="text-900 text-3xl font-medium mb-3">
                            {isRegistering ? 'Crea tu cuenta' : 'Bienvenido'}
                        </div>
                        <span className="text-600 font-medium">
                            {isRegistering ? 'Completa tus datos' : 'Inicia sesión para continuar'}
                        </span>
                    </div>

                    <div>
                        <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">Correo</label>
                        <InputText 
                            id="email1" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="ejemplo@email.com" 
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
                        {isRegistering && (
                            <>
                                <label htmlFor="nombre" className="block text-900 text-xl font-medium mb-2">Nombre</label>
                                <InputText 
                                    id="nombre" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    className="w-full md:w-30rem mb-5" 
                                    style={{ padding: '1rem' }} 
                                />

                                <label htmlFor="apellido" className="block text-900 text-xl font-medium mb-2">Apellido</label>
                                <InputText 
                                    id="apellido" 
                                    value={apellido} 
                                    onChange={(e) => setApellido(e.target.value)} 
                                    className="w-full md:w-30rem mb-5" 
                                    style={{ padding: '1rem' }} 
                                />

                                <label htmlFor="ciudad" className="block text-900 text-xl font-medium mb-2">Ciudad</label>
                                <InputText 
                                    id="ciudad" 
                                    value={ciudad} 
                                    onChange={(e) => setCiudad(e.target.value)} 
                                    className="w-full md:w-30rem mb-5" 
                                    style={{ padding: '1rem' }} 
                                />

                                <label htmlFor="sueldo" className="block text-900 text-xl font-medium mb-2">Sueldo</label>
                                <InputText 
                                    id="sueldo" 
                                    type="text" // Cambiado a text
                                    value={sueldo} 
                                    onChange={(e) => setSueldo(e.target.value)} 
                                    className="w-full md:w-30rem mb-5" 
                                    style={{ padding: '1rem' }} 
                                />
                            </>
                        )}

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
                            label={isRegistering ? "Registrarse" : "Iniciar sesión"} 
                            className="w-full p-3 text-xl" 
                            onClick={handleSubmit}
                        />

                        <div className="mt-3 text-center">
                            <span className="text-600 cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>
                                {isRegistering 
                                    ? '¿Ya tienes cuenta? Inicia sesión' 
                                    : '¿No tienes cuenta? Regístrate'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;