import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ArrowLeft, Sparkles, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { VisitWizard } from '@/components/VisitWizard'

export default function NewVisitPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-8 p-6 md:p-8 lg:p-10">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              asChild 
              className="gap-2 hover:bg-white/80 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200"
            >
              <Link to="/visits">
                <ArrowLeft className="h-4 w-4" />
                Retour aux visites
              </Link>
            </Button>

            {/* Page Header */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl flex-shrink-0">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      Nouvelle visite
                    </h1>
                    <Sparkles className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Assistant de création de visite médicale en 3 étapes simples
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </div>

            {/* Visit Wizard */}
            <div className="max-w-7xl mx-auto">
              <VisitWizard />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

