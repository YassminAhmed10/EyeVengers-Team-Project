import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo, } from 'react';
import { useSignalR } from '../hooks/useSignalR';
const SignalRContext = createContext(undefined);
export function SignalRProvider({ children }) {
    const signalrEnabled = (import.meta.env.VITE_ENABLE_SIGNALR ?? 'false') === 'true';
    const hubUrl = import.meta.env.VITE_RADIOLOGY_HUB_URL ?? 'http://localhost:5201/hubs/radiology';
    const { connectionState, subscribe } = useSignalR(hubUrl, signalrEnabled);
    const value = useMemo(() => ({
        connectionState,
        subscribeToEvent: subscribe,
    }), [connectionState, subscribe]);
    return _jsx(SignalRContext.Provider, { value: value, children: children });
}
export function useSignalRContext() {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalRContext must be used within a SignalRProvider');
    }
    return context;
}
