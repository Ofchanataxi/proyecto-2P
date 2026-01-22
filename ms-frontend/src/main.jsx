import { AuthProvider } from "react-oidc-context";

const oidcConfig = {
  authority: "http://localhost:9000", // Navegador ve localhost
  client_id: "farmacia-frontend",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "openid profile read write",
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>
)