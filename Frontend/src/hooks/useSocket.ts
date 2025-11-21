import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export function useSocket(hospitalId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Join hospital room if hospitalId provided
    if (hospitalId) {
      socket.emit('join-hospital', hospitalId);
    }

    // Listen for transfer notifications
    socket.on('new-transfer', (data) => {
      console.log('New transfer notification:', data);
      toast({
        title: 'New Transfer Request',
        description: `Patient transfer from ${data.fromHospital} to ${data.toHospital}`,
        duration: 5000,
      });
    });

    // Listen for transfer status updates
    socket.on('transfer-status-update', (data) => {
      console.log('Transfer status update:', data);
      toast({
        title: 'Transfer Status Update',
        description: `Transfer ${data.transferId} status: ${data.status}`,
        duration: 5000,
      });
    });

    return () => {
      if (socket) {
        if (hospitalId) {
          socket.emit('leave-hospital', hospitalId);
        }
        socket.disconnect();
      }
    };
  }, [hospitalId, toast]);

  return socketRef.current;
}