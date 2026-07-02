"use client";

import { useFileUrl } from "@/hooks/api/authAPIs";
import { cn } from "@/lib/utils";

interface AdminFileImageProps {
  fileId: string | null | undefined;
  alt: string;
  className?: string;
  /** Rendered when there is no file id or the URL could not be resolved. */
  fallback?: React.ReactNode;
}

/**
 * Renders a stored image by resolving its short-lived access URL from the
 * file id (`GET /api/admin/files/{file_id}`). Use anywhere an admin surface
 * needs to display a file it only knows by id.
 */
export function AdminFileImage({
  fileId,
  alt,
  className,
  fallback = null,
}: AdminFileImageProps): React.ReactElement {
  const { data, isLoading, isError } = useFileUrl(fileId);

  if (!fileId || isError) {
    return <>{fallback}</>;
  }

  if (isLoading || !data?.file_url) {
    return <div className={cn("animate-pulse bg-muted", className)} aria-hidden />;
  }

  return <img src={data.file_url} alt={alt} className={className} />;
}
