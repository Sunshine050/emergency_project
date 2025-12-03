import Link from 'next/link';
import { Button } from '@components/ui/button';
import { 
  PhoneCall, 
  AlertTriangle, 
  Hospital, 
  Ambulance,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-950 dark:to-slate-900">
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-bold">Emergency Response System</h1>
          </div>
          <div className="space-x-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Emergency Response Management System
          </h2>
          <p className="text-lg mb-8 text-slate-700 dark:text-slate-300">
            A comprehensive platform for coordinating emergency medical services,
            hospital resources, and rescue teams for efficient emergency response.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login?role=1669">
              <Button className="w-full sm:w-auto" size="lg">
                Enter 1669 Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
              <PhoneCall className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1669 Response Center</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Receive, assess, and prioritize emergency alerts from users.
              Coordinate with hospitals and rescue teams to provide timely assistance.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
              <Hospital className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Hospital Management</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Receive patient alerts from 1669, update patient status, and 
              coordinate with rescue teams for efficient emergency response.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit">
              <Ambulance className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rescue Teams</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Receive mission details, locate patients through precise GPS data, and
              coordinate with hospitals for efficient patient transportation.
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md mb-16">
          <h3 className="text-2xl font-semibold mb-4">About the System</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The Emergency Response System is designed to streamline coordination between
            emergency response centers, hospitals, and rescue teams. The system enables
            efficient handling of emergency cases from initial alert to patient transport
            and treatment.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            With real-time information sharing, GPS location tracking, and intuitive
            interfaces, the system enhances the speed and quality of emergency response,
            potentially saving more lives.
          </p>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="font-semibold">Emergency Response System</p>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Emergency Services. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}