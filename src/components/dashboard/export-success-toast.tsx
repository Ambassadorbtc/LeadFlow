import { CheckCircle } from "lucide-react";
import { Toast, ToastDescription, ToastTitle } from "../ui/toast";

interface ExportSuccessToastProps {
  title: string;
  description?: string;
}

export function ExportSuccessToast({
  title,
  description,
}: ExportSuccessToastProps) {
  return (
    <Toast variant="success">
      <div className="flex items-start gap-2">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
        <div>
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
    </Toast>
  );
}
