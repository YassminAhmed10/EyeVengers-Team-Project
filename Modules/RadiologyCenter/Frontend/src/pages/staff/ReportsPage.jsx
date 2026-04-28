import { jsx as _jsx } from "react/jsx-runtime";
import { useQueryClient } from '@tanstack/react-query';
import { ReportUploadForm } from '../../components/staff/ReportUploadForm';
export function ReportsPage() {
    const queryClient = useQueryClient();
    return (_jsx("section", { className: "space-y-4", children: _jsx(ReportUploadForm, { onUploaded: () => {
                queryClient.invalidateQueries({ queryKey: ['worklist'] });
            } }) }));
}
