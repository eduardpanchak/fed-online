import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"; 

export default function ResetPassword() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Валидация
  const passwordsDoNotMatch = confirmPassword !== "" && password !== confirmPassword;
  const isButtonDisabled = loading || !password || !confirmPassword || passwordsDoNotMatch;

  const handleUpdatePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Используем 'password' (так называется твой стейт)
    const { error } = await supabase.auth.updateUser({
      password: password.trim(), // Используем переменную из useState
    });

    if (error) throw error;

    toast({
      title: t("resetPassword.successMessage"),
      description: t("resetPassword.successMessage"),
    });

    // Важно: разлогиниваем, чтобы очистить временную сессию восстановления
    await supabase.auth.signOut();

    navigate("/auth");
  } catch (error: any) {
    toast({
      title: t("resetPassword.errorMessage"),
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{t("resetPassword.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("resetPassword.instruction")}
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* Новый пароль */}
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("resetPassword.newPassword")}</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Подтверждение пароля */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("resetPassword.confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pr-10 ${passwordsDoNotMatch ? "border-destructive" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsDoNotMatch && (
              <p className="text-xs text-destructive mt-1">{t("auth.passwordsMustMatch")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isButtonDisabled}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("resetPassword.submit")}
          </Button>
        </form>
      </Card>
    </div>
  );
}