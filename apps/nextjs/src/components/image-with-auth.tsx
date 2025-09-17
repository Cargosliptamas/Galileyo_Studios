"use client";

import { Skeleton } from '@galileyo/ui/skeleton';
import { useEffect, useState } from 'react';
import { authClient } from '~/auth/client';

export type ImageWithAuthProps = {
  className?: HTMLElement['className'];
  alt?: string;
  url: string;
};

export default function ImageWithAuth({ url, className, alt }: ImageWithAuthProps) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const session = await authClient.getSession();
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.data?.session.token}`,
        },
      });
     
      const data = await response.blob();
      setData(URL.createObjectURL(data));
    };

    try {
      fetchData();
    } catch (error) {
      console.log(error);
    }

    return () => {
      if (data) {
        URL.revokeObjectURL(data);
      }
      setData(null);
    };
  }, [url]);

  return (
    <>
      {!data ? (
        <Skeleton className="w-64 h-64" />
      ) : (
        <img className={className ?? 'max-h-full'} src={data} alt={alt} />
      )}
    </>
  );
}
