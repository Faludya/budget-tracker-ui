export default function GoogleLoginButton() {
  const backendUrl = process.env.REACT_APP_API_BASE_URL?.replace(/\/api$/, "") || "";
  const returnUrl = `${window.location.origin}/google-auth`; 

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/users/login-google?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}
