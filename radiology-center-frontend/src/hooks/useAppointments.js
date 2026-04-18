import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookAppointment, fetchAvailableSlots, fetchPatientAppointments, } from '../api/appointments.api';
export function useAvailableSlots(date) {
    return useQuery({
        queryKey: ['appointment-slots', date],
        queryFn: () => fetchAvailableSlots(date),
        enabled: Boolean(date),
    });
}
export function usePatientAppointments(patientId) {
    return useQuery({
        queryKey: ['patient-appointments', patientId],
        queryFn: () => fetchPatientAppointments(patientId),
        enabled: Boolean(patientId),
    });
}
export function useBookAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => bookAppointment(payload),
        onSuccess: (appointment) => {
            queryClient.invalidateQueries({
                queryKey: ['patient-appointments', appointment.patientId],
            });
        },
    });
}
