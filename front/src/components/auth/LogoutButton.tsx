import { Route } from '@/routes/_auth'; // Adjust path if needed

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { auth } = Route.useRouteContext();

  const handleLogout = () => {
    auth.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition ${className}`}
    >
      Log Out
    </button>
  );
}