export interface PageProps<T> {
  params: Promise<T>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
