import { Loader2, Store } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLogin } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate({ email: email.trim(), password })
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <Store className="size-5" />
            Iubebe SMS
          </div>
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
          <CardDescription>Dùng tài khoản nhân viên của cửa hàng.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                required
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={login.isError}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={login.isError}
              />
            </div>
            {login.isError && (
              <p role="alert" className="text-sm text-destructive">
                {login.error.message}
              </p>
            )}
            <Button
              type="submit"
              className="min-h-11 w-full"
              disabled={login.isPending || !email.trim() || !password}
            >
              {login.isPending && <Loader2 className="animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
