import { Topbar } from '@/components/layout/Topbar';
import { CreateProjectScreen } from '@/components/projects/CreateProject';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/createProject')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
 <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <CreateProjectScreen/>
      </div>
    </div>
   
  );
}
