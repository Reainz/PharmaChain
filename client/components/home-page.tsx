'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Truck, Search, Users, Building2, Microscope, Code, Lightbulb, Wallet, ExternalLink, ArrowRight, Pill, Stethoscope, Beaker } from "lucide-react"
import Image from "next/image"
import { useWeb3 } from "@/app/contexts/Web3Context"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export function HomePageComponent() {
  const { connectWallet, isConnected, accounts, isCorrectNetwork } = useWeb3();
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (accounts) {
      setWalletAddress(typeof accounts === 'string' ? accounts : '');
    }
  }, [accounts]);

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

  // Function to safely format wallet address
  const formatWalletAddress = (address) => {
    if (!address || typeof address !== 'string') return "Connect Wallet";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <header className="sticky top-0 left-0 right-0 z-50 py-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700">PharmaChain</h1>
          <nav className="flex items-center">
            <ul className="hidden md:flex space-x-8 mr-6">
              <li><a href="#about" className="text-slate-700 hover:text-teal-700 transition-colors font-medium">About</a></li>
              <li><a href="/manage-organization" className="text-slate-700 hover:text-teal-700 transition-colors font-medium">Manage Organization</a></li>
              <li><a href="#team" className="text-slate-700 hover:text-teal-700 transition-colors font-medium">Our Team</a></li>
            </ul>
            <Button 
              onClick={handleConnectWallet} 
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium flex items-center shadow-sm"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnected && walletAddress 
                ? formatWalletAddress(walletAddress)
                : "Connect Wallet"
              }
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-teal-800/70 to-blue-900/60 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-[0.8] contrast-[1.1]"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-medical-research-in-a-laboratory-41693-large.mp4" type="video/mp4" />
          </video>
          
          <div className="relative z-20 text-center text-white px-4 max-w-5xl">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm font-medium mb-6 border border-white/20 backdrop-blur-sm">PHARMACEUTICAL INNOVATION</div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-md leading-tight">
              Pharmaceutical Supply Chain<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-blue-200">Secured by Blockchain</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white bg-teal-900/20 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-teal-500/10">
              Revolutionizing pharmaceutical logistics through secure, transparent, and efficient blockchain solutions
            </p>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
              {!isConnected ? (
                <button onClick={handleConnectWallet} className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium group w-full md:w-auto">
                  <Wallet className="mr-3 h-5 w-5" />
                  Connect Wallet to Start
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-300" />
                </button>
              ) : !isCorrectNetwork ? (
                <button onClick={handleConnectWallet} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium w-full md:w-auto">
                  Switch to Ganache Network
                </button>
              ) : (
                <button onClick={() => window.location.href = '/manage-organization'} className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105 flex items-center font-medium group w-full md:w-auto">
                  <ExternalLink className="mr-3 h-5 w-5" />
                  Launch Application
                  <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:ml-3 transition-all duration-300" />
                </button>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-100 to-transparent z-10"></div>
        </section>

        <section id="about" className="py-20 bg-slate-100 text-slate-800 relative">
          <div className="absolute top-0 inset-x-0 h-20 bg-teal-50/50"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-4 border border-teal-200">ABOUT OUR PROJECT</span>
              <h3 className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700">Transforming Pharmaceutical Supply Chains</h3>
              <p className="text-center mx-auto mb-10 text-lg text-slate-700 leading-relaxed">
                Our prototype leverages blockchain technology to transform pharmaceutical supply chain management with transparent, tamper-proof tracking from manufacturing to delivery. It prevents counterfeiting, ensures proper storage conditions, and enables real-time drug verification.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
              <div className="flex items-center group">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mr-4 group-hover:bg-teal-200 transition-all duration-300 border border-teal-200 shadow-sm">
                  <Beaker className="w-7 h-7 text-teal-700" />
                </div>
                <span className="text-lg font-medium text-slate-700 group-hover:text-teal-700 transition-colors duration-300">Blockchain-powered</span>
              </div>
              <div className="flex items-center group">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mr-4 group-hover:bg-teal-200 transition-all duration-300 border border-teal-200 shadow-sm">
                  <Microscope className="w-7 h-7 text-teal-700" />
                </div>
                <span className="text-lg font-medium text-slate-700 group-hover:text-teal-700 transition-colors duration-300">Innovative Solution</span>
              </div>
              <div className="flex items-center group">
                <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mr-4 group-hover:bg-teal-200 transition-all duration-300 border border-teal-200 shadow-sm">
                  <Pill className="w-7 h-7 text-teal-700" />
                </div>
                <span className="text-lg font-medium text-slate-700 group-hover:text-teal-700 transition-colors duration-300">Pharma Security</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gradient-to-b from-slate-200 to-slate-100 text-slate-800 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-4 border border-teal-200">KEY FEATURES</span>
              <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700">What Makes Us Different</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={<ShieldCheck className="w-12 h-12 mb-4 text-teal-600" />}
                title="Enhanced Security"
                description="Implement cryptographic security to ensure data integrity throughout the supply chain, preventing unauthorized modifications."
              />
              <FeatureCard
                icon={<Search className="w-12 h-12 mb-4 text-teal-600" />}
                title="Complete Traceability"
                description="Develop a system to track pharmaceuticals from manufacture to patient, reducing counterfeits and ensuring product authenticity."
              />
              <FeatureCard
                icon={<Truck className="w-12 h-12 mb-4 text-teal-600" />}
                title="Optimized Logistics"
                description="Create smart contracts to streamline operations and reduce delays in the supply chain, improving efficiency and reducing costs."
              />
            </div>
          </div>
        </section>

        <section id="team" className="py-20 bg-gradient-to-b from-slate-200 to-slate-100 text-slate-800 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-4 border border-teal-200">OUR TEAM</span>
              <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700">The People Behind PharmaChain</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <TeamMember name="Reain" role="Member 1" />
              <TeamMember name="Dang" role="Member 2" />
              <TeamMember name="Maung" role="Member 3" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-200 py-8 border-t border-slate-300 text-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 mb-4 md:mb-0">&copy; 2025 Information Security - Pharmaceutical Supply Chain with Blockchain</p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-600 hover:text-teal-700 transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-600 hover:text-teal-700 transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-600 hover:text-teal-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 transition-all duration-300 overflow-hidden group hover:-translate-y-1 hover:shadow-md shadow-sm">
      <div className="absolute h-1 w-full bg-gradient-to-r from-teal-600 to-blue-600 top-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
      <CardHeader className="pb-2">
        <div className="mx-auto">{icon}</div>
        <CardTitle className="text-center text-xl font-bold text-teal-800 mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

function TeamMember({ name, role }) {
  return (
    <Card className="bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 transition-all duration-300 group hover:-translate-y-1 hover:shadow-md shadow-sm overflow-hidden">
      <div className="absolute h-1 w-full bg-gradient-to-r from-teal-600 to-blue-600 top-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
      <CardContent className="text-center pt-8 pb-6">
        <div className="w-24 h-24 bg-teal-100 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden border-2 border-teal-200 group-hover:border-teal-300 transition-colors duration-300">
          <Stethoscope className="w-12 h-12 text-teal-700" />
        </div>
        <h4 className="font-bold text-xl mb-2 text-slate-800 group-hover:text-teal-800 transition-colors duration-300">{name}</h4>
        <p className="text-slate-600">{role}</p>
      </CardContent>
    </Card>
  )
}