'use client';

import { ManageOrganization } from "@/components/manage-organization";
import Topheader from "@/components/header";
// import { Web3Provider } from '../contexts/Web3Context'; // Removed unused import

export default function ManageOrganizationPage() {
  return (
    <>
      <Topheader title="Manage Organization" />
      <ManageOrganization />
    </>
  );
}
