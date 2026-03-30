import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, isLoginSuccess } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoginSuccess) navigate({ to: "/" });
  }, [isLoginSuccess, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0B1F33 0%, #153B5F 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card rounded-2xl p-10 w-full max-w-sm shadow-card-lg text-center"
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "oklch(0.52 0.19 255)" }}
        >
          <TrendingUp className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Portfolio Hub
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Track and manage your investments in one place
        </p>
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="w-full h-10 font-semibold"
          style={{ background: "oklch(0.52 0.19 255)" }}
          data-ocid="login.submit_button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {isLoggingIn ? "Connecting..." : "Sign In to Continue"}
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Secured by Internet Identity
        </p>
      </motion.div>
    </div>
  );
}
