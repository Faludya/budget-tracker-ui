export default function GoogleLoginButton() {
    const handleGoogleLogin = () => {
      const backendUrl = "https://localhost:7288"; // Your API base URL
      const returnUrl = "http://localhost:3000/google-auth"; // Your React route to handle callback
      window.location.href = `${backendUrl}/api/users/login-google?returnUrl=${encodeURIComponent(returnUrl)}`;
    };
  
    return (
      <button onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    );
  }
  