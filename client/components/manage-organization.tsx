'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { PlusCircle, Check, X, Wallet, ArrowRight } from 'lucide-react'
import { useWeb3 } from '../app/contexts/Web3Context';
import { toast } from "react-hot-toast";

export function ManageOrganization() {
  const { PharmaContract, accounts, connectWallet, isConnected, isCorrectNetwork } = useWeb3();
  const [newMedicineName, setNewMedicineName] = useState('')
  const [newMedicineLocation, setNewMedicineLocation] = useState('')
  const [newMedicineLatitude, setNewMedicineLatitude] = useState('')
  const [newMedicineLongitude, setNewMedicineLongitude] = useState('')
  const [newMedicineExpiryDate, setNewMedicineExpiryDate] = useState('')
  const [newMemberAddress, setNewMemberAddress] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectWallet = async () => {
    try {
      const success = await connectWallet();
      if (success) {
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleCreateOrganization = async () => {
    if (!PharmaContract) {
      toast.error("Smart contract not connected. Please connect your wallet first.");
      return;
    }
    
    if (!organizationName) {
      toast.error("Please enter an organization name");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Creating organization with account:", accounts);
      console.log("Contract exists:", !!PharmaContract);
      
      const tx = await PharmaContract.createOrganization(organizationName);
      await tx.wait(); 
  
      toast.success('Organization created successfully!');
      setOrganizationName('');
    } catch (error) {
      console.error('Error creating Organization:', error);
      toast.error(`Error creating organization: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleLaunchMedicine = async (e) => {
    e.preventDefault();
    
    if (!PharmaContract) {
      toast.error("Smart contract not connected. Please connect your wallet first.");
      return;
    }
    
    // Basic validation
    if (!newMedicineName || !newMedicineLocation || !newMedicineLatitude || 
        !newMedicineLongitude || !newMedicineExpiryDate) {
      toast.error("Please fill in all fields");
      return;
    }
    
    console.log('Launching new medicine:', {
      name: newMedicineName,
      location: newMedicineLocation,
      latitude: newMedicineLatitude,
      longitude: newMedicineLongitude,
      expiryDate: newMedicineExpiryDate,
    });
  
    try {
      setIsLoading(true);
      const organizaitonId = await PharmaContract.getMyOrganizationId();
  
      const date = new Date(newMedicineExpiryDate + 'T00:00:00Z');
      const newDate = Math.floor(date.getTime() / 1000);
  
      const tx = await PharmaContract.manufactureMedicine(
        organizaitonId,
        newMedicineName,
        newDate,
        newMedicineLocation,
        newMedicineLatitude,
        newMedicineLongitude,
        {
          gasLimit: 500000, 
        }
      );
  
      const receipt = await tx.wait();
  
      // Check for the emitted event
      const event = receipt.events.find((event) => event.event === 'medicineLaunched');
      if (event) {
        const emittedMedicineId = event.args[0];
        toast.success(`Medicine Launched with ID: ${emittedMedicineId}`);
        
        // Clear the form
        setNewMedicineName('');
        setNewMedicineLocation('');
        setNewMedicineLatitude('');
        setNewMedicineLongitude('');
        setNewMedicineExpiryDate('');
      }
  
    } catch (error) {
      console.error('Error creating Medicine:', error);
      toast.error(`Error launching medicine: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleApproveMember = async () => {
    if (!PharmaContract) {
      toast.error("Smart contract not connected. Please connect your wallet first.");
      return;
    }
    
    if (!newMemberAddress) {
      toast.error("Please enter a member address");
      return;
    }
    
    console.log('Approving member:', newMemberAddress);
    
    try {
      setIsLoading(true);
      // Get the organization ID
      const organizaitonId = await PharmaContract.getMyOrganizationId();
  
      // Approve the new member
      const tx = await PharmaContract.approveMembers(organizaitonId, newMemberAddress, {
        gasLimit: 300000,
      });
  
      // Wait for the transaction to be confirmed
      await tx.wait();
      toast.success(`Member ${newMemberAddress} approved successfully!`);
      setNewMemberAddress('');
    } catch (error) {
      console.error('Error approving new member:', error);
      toast.error(`Error approving member: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisapproveMember = async () => {
    if (!PharmaContract) {
      toast.error("Smart contract not connected. Please connect your wallet first.");
      return;
    }
    
    if (!newMemberAddress) {
      toast.error("Please enter a member address");
      return;
    }
    
    console.log('Disapproving member:', newMemberAddress);
  
    try {
      setIsLoading(true);
      // Get the organization ID
      const organizaitonId = await PharmaContract.getMyOrganizationId();
  
      // Disapprove the member
      const tx = await PharmaContract.disApproveMembers(organizaitonId, newMemberAddress, {
        gasLimit: 300000,
      });
  
      // Wait for the transaction to be confirmed
      await tx.wait();
      toast.success(`Member ${newMemberAddress} disapproved successfully!`);
      setNewMemberAddress('');
    } catch (error) {
      console.error('Error dis-approving new member:', error);
      toast.error(`Error disapproving member: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show wallet connection UI if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 text-slate-800 flex flex-col items-center justify-center p-4">
        <Card className="bg-white border border-slate-200 shadow-sm w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-teal-800">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-6 text-center text-slate-600">
              Please connect your wallet to manage your pharmaceutical organization.
            </p>
            <button 
              onClick={handleConnectWallet} 
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium group"
            >
              <Wallet className="mr-3 h-5 w-5" /> 
              Connect MetaMask
              <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-300" />
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show network warning if on wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 text-slate-800 flex flex-col items-center justify-center p-4">
        <Card className="bg-white border border-slate-200 shadow-sm w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-amber-700 text-center">Wrong Network</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-6 text-center text-slate-600">
              Please switch to the Ganache network to continue.
            </p>
            <Button 
              onClick={handleConnectWallet} 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
            >
              Switch Network
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 text-slate-800">
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="create-org" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-200 p-1">
            <TabsTrigger 
              value="create-org" 
              className="data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm text-slate-700"
            >
              Create Organization
            </TabsTrigger>
            <TabsTrigger 
              value="launch-medicine" 
              className="data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm text-slate-700"
            >
              Launch Medicine
            </TabsTrigger>
            <TabsTrigger 
              value="manage-members" 
              className="data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm text-slate-700"
            >
              Manage Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-org">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-teal-800">Create New Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Enter Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 mb-4"
                />
                <p className="my-4 text-slate-600">Click the button below to create a new organization on the blockchain.</p>
                <Button 
                  onClick={handleCreateOrganization} 
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white group flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" /> 
                      Create Organization
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launch-medicine">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-teal-800">Launch New Medicine</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLaunchMedicine} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine-name" className="text-slate-700">Medicine Name</Label>
                    <Input
                      id="medicine-name"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                      className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicine-location" className="text-slate-700">Location Name</Label>
                    <Input
                      id="medicine-location"
                      value={newMedicineLocation}
                      onChange={(e) => setNewMedicineLocation(e.target.value)}
                      className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicine-latitude" className="text-slate-700">Latitude</Label>
                      <Input
                        id="medicine-latitude"
                        value={newMedicineLatitude}
                        onChange={(e) => setNewMedicineLatitude(e.target.value)}
                        className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicine-longitude" className="text-slate-700">Longitude</Label>
                      <Input
                        id="medicine-longitude"
                        value={newMedicineLongitude}
                        onChange={(e) => setNewMedicineLongitude(e.target.value)}
                        className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicine-expiry" className="text-slate-700">Expiry Date</Label>
                    <Input
                      id="medicine-expiry"
                      type="date"
                      value={newMedicineExpiryDate}
                      onChange={(e) => setNewMedicineExpiryDate(e.target.value)}
                      className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white mt-2 group flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? "Launching..." : (
                      <>
                        Launch Medicine
                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-members">
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-teal-800">Manage Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-address" className="text-slate-700">Member Wallet Address</Label>
                    <Input
                      id="member-address"
                      value={newMemberAddress}
                      onChange={(e) => setNewMemberAddress(e.target.value)}
                      className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleApproveMember} 
                      className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white group flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? "Approving..." : (
                        <>
                          <Check className="mr-2 h-4 w-4" /> 
                          Approve
                          <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleDisapproveMember} 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Disapproving..." : <><X className="mr-2 h-4 w-4" /> Disapprove</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}