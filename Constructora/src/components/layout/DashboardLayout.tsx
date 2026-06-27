import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { DynamicSidebar } from './DynamicSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 w-full">
        <div className="hidden lg:block w-64 shrink-0">
          <DynamicSidebar />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};