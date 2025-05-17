'use client';

import { TrackMedicine } from "@/components/track-medicine";
import Topheader from "@/components/header";
// import { Web3Provider } from '../contexts/Web3Context'; // Removed unused import

export default function TrackMedicinePage() {
  return (
    <>
      <Topheader title="Track Medicine" />
      <TrackMedicine />
    </>
  );
}
