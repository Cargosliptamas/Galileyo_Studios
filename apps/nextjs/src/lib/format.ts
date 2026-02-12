function formatCompact(value: number): string {
  const rounded = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
  return rounded.replace(/\.0$/, "");
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return `${formatCompact(count / 1_000_000)}M`;
  }
  if (count >= 1_000) {
    return `${formatCompact(count / 1_000)}K`;
  }
  return count.toString();
}

export function formatViewCount(count: number): string {
  return `${formatCount(count)} views`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
