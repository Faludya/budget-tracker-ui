import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const userId = params.get("userId");

    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", userId);

      // Navigate to the main protected page
      navigate("/budget-tracker");
      window.location.reload(); // force UI to re-render (if auth state is stored in memory)
    } else {
      // Something went wrong
      navigate("/login");
    }
  }, [params, navigate]);

  return <div>Signing you in with Google...</div>;
}
