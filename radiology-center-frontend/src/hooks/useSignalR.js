import { useCallback, useEffect, useMemo, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel, } from '@microsoft/signalr';
export function useSignalR(hubUrl, enabled = true) {
    const [connection, setConnection] = useState(null);
    const [connectionState, setConnectionState] = useState(enabled ? HubConnectionState.Disconnected : 'Disabled');
    useEffect(() => {
        if (!enabled || !hubUrl) {
            setConnection(null);
            setConnectionState('Disabled');
            return () => undefined;
        }
        const signalRConnection = new HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.None)
            .build();
        let isDisposed = false;
        signalRConnection
            .start()
            .then(() => {
            if (!isDisposed) {
                setConnection(signalRConnection);
                setConnectionState(signalRConnection.state);
            }
        })
            .catch(() => {
            if (!isDisposed) {
                setConnectionState(HubConnectionState.Disconnected);
            }
        });
        signalRConnection.onreconnecting(() => {
            setConnectionState(HubConnectionState.Reconnecting);
        });
        signalRConnection.onreconnected(() => {
            setConnectionState(HubConnectionState.Connected);
        });
        signalRConnection.onclose(() => {
            setConnectionState(HubConnectionState.Disconnected);
        });
        return () => {
            isDisposed = true;
            signalRConnection.stop().catch(() => undefined);
        };
    }, [enabled, hubUrl]);
    const subscribe = useCallback((eventName, handler) => {
        if (!connection) {
            return () => undefined;
        }
        connection.on(eventName, handler);
        return () => {
            connection.off(eventName, handler);
        };
    }, [connection]);
    return useMemo(() => ({
        connection,
        connectionState,
        subscribe,
    }), [connection, connectionState, subscribe]);
}
