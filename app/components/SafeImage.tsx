'use client';

import Image, { ImageProps } from 'next/image';
import { ReactNode, useState } from 'react';

type SafeImageProps = ImageProps & { fallback: ReactNode };

/** next/image that shows `fallback` when the image is missing or fails to load. */
export default function SafeImage({ fallback, ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !props.src) {
    return <>{fallback}</>;
  }

  return <Image {...props} onError={() => setFailed(true)} />;
}