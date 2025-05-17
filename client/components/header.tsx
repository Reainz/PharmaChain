import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TopheaderProps {
    title: string;
}

const Topheader: React.FC<TopheaderProps> = ({ title }) => {
    const pathname = usePathname();
    
    return (
        <header className="sticky top-0 left-0 right-0 z-50 py-4 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-blue-700 mb-3 md:mb-0">{title}</h1>
                <nav className="w-full md:w-auto">
                    <ul className="flex flex-wrap justify-center md:justify-end space-x-3 md:space-x-6 w-full">
                        <li>
                            <Link 
                                href="/" 
                                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                                    pathname === '/' 
                                    ? 'text-teal-700 font-semibold bg-teal-50' 
                                    : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
                                }`}
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/manage-organization" 
                                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                                    pathname === '/manage-organization' 
                                    ? 'text-teal-700 font-semibold bg-teal-50' 
                                    : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
                                }`}
                            >
                                Manage Organization
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/track-medicine" 
                                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                                    pathname === '/track-medicine' 
                                    ? 'text-teal-700 font-semibold bg-teal-50' 
                                    : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
                                }`}
                            >
                                Track a Medicine
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#team" 
                                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                                    pathname === '/#team' 
                                    ? 'text-teal-700 font-semibold bg-teal-50' 
                                    : 'text-slate-700 hover:text-teal-700 hover:bg-slate-100'
                                }`}
                            >
                                Our Team
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Topheader;

