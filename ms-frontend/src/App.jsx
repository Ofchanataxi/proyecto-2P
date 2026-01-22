import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();

  if (auth.isLoading) return <div>Cargando...</div>;

  if (!auth.isAuthenticated) {
    return (
      <div>
        <h1>Bienvenido a Farmacia Online</h1>
        <button onClick={() => auth.signinRedirect()}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div>
       {/* Tu Router o componentes protegidos van aquí */}
       <h1>Hola {auth.user?.profile.sub}</h1>
       <button onClick={() => auth.removeUser()}>Salir</button>
       {/* Resto de tu app... */}
    </div>
  );
}