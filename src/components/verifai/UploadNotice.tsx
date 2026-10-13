export const UPLOAD_NOTICE = "Before uploading: Text and file contents are processed by Verfiai’s search and AI providers to generate results. Do not upload confidential, regulated, unpublished, or personally identifiable material.";
export function UploadNotice() {
  return <p role="note" className="mb-2 border-s-2 border-warning bg-warning-soft p-3 text-xs text-foreground">{UPLOAD_NOTICE}</p>;
}
