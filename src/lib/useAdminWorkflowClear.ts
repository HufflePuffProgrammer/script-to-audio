import { useCallback } from "react";
import { clearAdminWorkflowLocalStorage } from "@/lib/adminWorkflowStorage";

export type UseAdminWorkflowClearOptions = {
  setText?: (value: string) => void;
  setStatus?: (value: string) => void;
  setUploadStatus?: (value: string | null) => void;
  afterClear?: () => void;
};

/**
 * Returns a Clear handler: clears shared workflow localStorage, optional script text/status,
 * then runs page-specific resets via afterClear.
 */
export function useAdminWorkflowClear({
  setText,
  setStatus,
  setUploadStatus,
  afterClear,
}: UseAdminWorkflowClearOptions) {
  return useCallback(() => {
    clearAdminWorkflowLocalStorage();
    setText?.("");
    setStatus?.("");
    setUploadStatus?.(null);
    afterClear?.();
  }, [setText, setStatus, setUploadStatus, afterClear]);
}
