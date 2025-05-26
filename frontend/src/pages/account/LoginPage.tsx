import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "../../components/login-form"

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100 dark:bg-slate-900 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          蓝鲸时代
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage 