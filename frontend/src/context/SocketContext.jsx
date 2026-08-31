import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToasts } from './ToastContext';

const SocketContext = createContext(null);

// En desarrollo la API es absoluta (http://localhost:4000/api) -> socket a :4000
// En Docker la API es relativa (/api) -> nginx hace proxy a /socket.io en la misma origin
function calcularBaseSocket() {
  const api = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  if (api.startsWith('http')) {
    return api.replace(/\/api\/?$/, '');
  }
  return undefined;
}

export function SocketProvider({ children }) {
  const { token, autenticado } = useAuth();
  const toast = useToasts();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!autenticado || !token) return;

    const socket = io(calcularBaseSocket(), {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    const manejarNotificacion = (data) => {
      if (data.tipo === 'aprobado') toast.exito(data.mensaje);
      else if (data.tipo === 'rechazado') toast.error(data.mensaje);
      else toast.info(data.mensaje);
    };

    const manejarSolicitud = (data) => {
      toast.info(data.mensaje);
    };

    socket.on('notificacion', manejarNotificacion);
    socket.on('nueva-solicitud', manejarSolicitud);

    return () => {
      socket.off('notificacion', manejarNotificacion);
      socket.off('nueva-solicitud', manejarSolicitud);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autenticado, token, toast]);

  return <SocketContext.Provider value={socketRef}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
