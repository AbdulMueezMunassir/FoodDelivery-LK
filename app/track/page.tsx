import { Suspense } from 'react';
import TrackOrder from './TrackOrder';

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackOrder />
    </Suspense>
  );
}
