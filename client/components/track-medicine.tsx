'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader, Search, Wallet, ExternalLink, ArrowRight } from 'lucide-react'
// import // toast from 'react-hot-// toast'
import { TrackItemMapComponent } from './track-item-map'
import { useWeb3 } from '../app/contexts/Web3Context'
import { toast } from 'react-hot-toast'

export function TrackMedicine() {
  const { PharmaContract, accounts, connectWallet, isConnected, isCorrectNetwork } = useWeb3();
  const [medicineId, setMedicineId] = useState('')
  const [medicineData, setMedicineData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapRefreshData, setMapRefreshData] = useState(0)
  const [newCheckpoint, setNewCheckpoint] = useState({
    location: '',
    latitude: '',
    longitude: '',
    status: 'intransit'
  })

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const handleTrackMedicine = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Reset medicineData to ensure clean state before new fetch and clear map
    setMedicineData(null); 
    setMapRefreshData(prev => prev + 1); 

    try {
      if (!PharmaContract) {
        toast.error("Please connect your wallet first");
        setIsLoading(false); 
        return;
      }
      
      if (!medicineId) {
        toast.error("Please enter a medicine ID");
        setIsLoading(false); 
        return;
      }

      console.log(`Fetching medicine with ID: ${medicineId}`);
      const rawMedicineDetails = await PharmaContract.Medicines(medicineId);
      console.log("Raw medicine details from contract:", rawMedicineDetails);
      
      const contractMedId = rawMedicineDetails.id; 
      const medIdIsEffectivelyZero = typeof contractMedId === 'bigint' 
                                      ? contractMedId.toString() === '0' 
                                      : Number(contractMedId) === 0;

      if (!rawMedicineDetails || medIdIsEffectivelyZero) {
        toast.error(`Medicine with ID ${medicineId} not found or is uninitialized.`);
        console.warn("Medicine not found or uninitialized. Raw details from contract:", rawMedicineDetails, "Parsed ID effectively zero:", medIdIsEffectivelyZero);
        setIsLoading(false);
        return;
      }

      const organization = await PharmaContract.Organizations(rawMedicineDetails.OrganizationId);
      const organizationName = organization.name;

      const expiryDateTimestamp = Number(rawMedicineDetails.expiryDate);
      const manufacturingDateTimestamp = Number(rawMedicineDetails.manufacturingDate);

      const expiryDate = new Date(expiryDateTimestamp * 1000);
      const manufacturingDate = new Date(manufacturingDateTimestamp * 1000);

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const formattedExpiryDate = formatDate(expiryDate);
      const formattedManufacturingDate = formatDate(manufacturingDate);

      const processedMedId = Number(contractMedId); 

      const newMedicineData = {
        name: rawMedicineDetails.name,
        id: processedMedId, 
        organizationName: organizationName,
        manufacturingDate: formattedManufacturingDate,
        expiryDate: formattedExpiryDate
      };
      
      console.log("Processed medicine data to be set:", newMedicineData);
      setMedicineData(newMedicineData);
      toast.success("Medicine data retrieved successfully");

    } catch (error) {
      console.error('Error tracking medicine:', error);
      toast.error("Failed to track medicine. Please check the ID and try again.");
      setMedicineData(null); 
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddCheckpoint = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (medicineData == null) {
        toast.error("Load a medicine first");
        return;
      }

      let transaction;

      if (newCheckpoint.status === 'intransit') {
        transaction = await PharmaContract.addInTransitCheckpoint(
          medicineId,
          newCheckpoint.location,
          newCheckpoint.latitude,
          newCheckpoint.longitude
        );
      } else if (newCheckpoint.status === 'shipped') {
        transaction = await PharmaContract.addShippedCheckpoint(
          medicineId,
          newCheckpoint.location,
          newCheckpoint.latitude,
          newCheckpoint.longitude
        );
      } else if (newCheckpoint.status === 'sold') {
        transaction = await PharmaContract.addSoldCheckpoint(
          medicineId,
          newCheckpoint.location,
          newCheckpoint.latitude,
          newCheckpoint.longitude
        );
      } else {
        throw new Error("Invalid status given");
      }

      // Wait for the transaction to be mined
      await transaction.wait();
      toast.success("Checkpoint added successfully");
      
      // Clear form inputs
      setNewCheckpoint({
        location: '',
        latitude: '',
        longitude: '',
        status: 'intransit'
      });
      
      // Refresh map
      setMapRefreshData(prev => prev + 1);
      
    } catch (error) {
      console.error('Error adding Checkpoint: ', error);
      toast.error("Failed to add checkpoint. Please try again.");
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 text-slate-800">
      {/* <header className="top-0 left-0 right-0 z-10 py-4 bg-gray-800 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Track Medicine</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#about" className="text-white hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#features" className="text-white hover:text-cyan-400 transition-colors">Manage Organization</a></li>
              <li><a href="#track" className="text-white hover:text-cyan-400 transition-colors">Track a Medicine</a></li>
              <li><a href="#team" className="text-white hover:text-cyan-400 transition-colors">Our Team</a></li>
            </ul>
          </nav>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <Card className="bg-white border border-slate-200 shadow-sm mb-8">
            <CardContent className="pt-6 flex justify-center items-center py-12">
              <button onClick={handleConnectWallet} className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium group">
                <Wallet className="mr-3 h-5 w-5" />
                Connect Wallet to Start
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-300" />
              </button>
            </CardContent>
          </Card>
        ) : !isCorrectNetwork ? (
          <Card className="bg-white border border-slate-200 shadow-sm mb-8">
            <CardContent className="pt-6 flex justify-center items-center py-12">
              <button onClick={handleConnectWallet} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium">
                Switch to Ganache Network
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-white border border-slate-200 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="text-teal-800">Enter Medicine ID</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrackMedicine} className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Enter medicine ID"
                    value={medicineId}
                    onChange={(e) => setMedicineId(e.target.value)}
                    className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500"
                  />
                  <Button type="submit" className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Track
                  </Button>
                </form>
              </CardContent>
            </Card>

            {medicineData && (
              <Card className="bg-white border border-slate-200 shadow-sm mb-8">
                <CardHeader>
                  <CardTitle className="text-teal-800">Medicine Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-500">Medicine Name</Label>
                      <p className="text-slate-800 font-medium">{medicineData.name}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Medicine ID</Label>
                      <p className="text-slate-800 font-medium">{medicineData.id}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Organization Name</Label>
                      <p className="text-slate-800 font-medium">{medicineData.organizationName}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Manufacturing Date</Label>
                      <p className="text-slate-800 font-medium">{medicineData.manufacturingDate}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Expiry Date</Label>
                      <p className="text-slate-800 font-medium">{medicineData.expiryDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border border-slate-200 shadow-sm mb-8">
              <CardHeader>
                <CardTitle className="text-teal-800">Supply Chain Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg mb-8">
                  {medicineId && <TrackItemMapComponent medicineId={parseInt(medicineId)} refreshData={mapRefreshData} />}
                </div>

                {/* Log medicineData for debugging */}
                {(() => {
                  console.log("Current medicineData state:", medicineData);
                  return null;
                })()}

                {/* Show Add Checkpoint form only if medicineData is successfully loaded */}
                {medicineData && medicineData.id ? (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-teal-800 mb-4">Add New Checkpoint</h3>
                    <form onSubmit={handleAddCheckpoint} className="space-y-4">
                      <div>
                        <Label htmlFor="location" className="text-slate-700">Location Name</Label>
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Boston Warehouse"
                          value={newCheckpoint.location}
                          onChange={(e) => setNewCheckpoint({ ...newCheckpoint, location: e.target.value })}
                          className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude" className="text-slate-700">Latitude</Label>
                          <Input
                            id="latitude"
                            type="text"
                            placeholder="e.g., 42.3601"
                            value={newCheckpoint.latitude}
                            onChange={(e) => setNewCheckpoint({ ...newCheckpoint, latitude: e.target.value })}
                            className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="longitude" className="text-slate-700">Longitude</Label>
                          <Input
                            id="longitude"
                            type="text"
                            placeholder="e.g., -71.0589"
                            value={newCheckpoint.longitude}
                            onChange={(e) => setNewCheckpoint({ ...newCheckpoint, longitude: e.target.value })}
                            className="bg-slate-50 text-slate-800 border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-700">Status</Label>
                        <RadioGroup
                          value={newCheckpoint.status}
                          onValueChange={(value) => setNewCheckpoint({ ...newCheckpoint, status: value })}
                          className="flex gap-4 mt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="intransit" id="intransit" className="text-teal-600" />
                            <Label htmlFor="intransit" className="text-slate-700">In Transit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="shipped" id="shipped" className="text-teal-600" />
                            <Label htmlFor="shipped" className="text-slate-700">Shipped</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sold" id="sold" className="text-teal-600" />
                            <Label htmlFor="sold" className="text-slate-700">Sold</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <button 
                        type="submit" 
                        className={`w-full md:w-auto px-6 py-3 rounded-md font-medium flex items-center justify-center transition-all duration-300 group ${
                          isLoading 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white cursor-pointer shadow-md hover:shadow-lg'
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <ExternalLink className="mr-2 h-5 w-5" />
                        )}
                        Add Checkpoint
                        {!isLoading && (
                          <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                      <div className="flex-shrink-0 text-amber-500 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Add Checkpoint Unavailable</h3>
                        <div className="mt-1 text-sm text-amber-700">
                          <p>Please enter a valid medicine ID and click "Track" to load medicine data before adding checkpoints.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}