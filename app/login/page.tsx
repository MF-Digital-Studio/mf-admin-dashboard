import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getCurrentAdminSession } from '@/lib/auth/session'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  invalid: 'Email veya sifre hatali.',
  missing: 'Email ve sifre zorunludur.',
  server: 'Sunucu hatasi olustu. Lutfen tekrar deneyin.',
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentAdminSession()
  if (session) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const errorMessage = params.error ? errorMessages[params.error] ?? 'Giris basarisiz oldu.' : null

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_420px_at_15%_-10%,oklch(0.65_0.20_250_/_0.20),transparent),radial-gradient(900px_480px_at_95%_15%,oklch(0.70_0.15_160_/_0.10),transparent)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl items-center px-6 py-10 md:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden lg:flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
              Internal System
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
              MF Digital Studio
              <span className="block text-primary">Admin Dashboard</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Bu alan sadece yetkili yoneticiler icindir. Kurumsal admin hesabinizla giris yaparak dashboard ve tum
              dahili verilere guvenli sekilde erisebilirsiniz.
            </p>
          </section>

          <section className="mx-auto w-full max-w-md rounded-none border border-border bg-card/90 p-6 shadow-[0_20px_80px_-40px_oklch(0.65_0.20_250_/_0.45)] backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-none border border-border/80 bg-secondary/60">
                <Image src="/logo.png" alt="MF Digital Studio" fill className="object-contain p-1.5" priority />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">MF Digital Studio</p>
                <p className="text-xs text-muted-foreground">Yonetim Girisi</p>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Guvenli admin girisi</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sadece yetkili dahili admin hesaplari giris yapabilir.</p>
            </div>

            <form method="post" action="/api/auth/login" className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-10 w-full rounded-none border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="admin@mf-digital.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Sifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-10 w-full rounded-none border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="********"
                />
              </div>

              {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}

              <button
                type="submit"
                className="h-10 w-full rounded-none bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Giris Yap
              </button>
            </form>

            <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
              Bu panelde kayit olma veya davet akisi bulunmaz. Hesap olusturma sadece sistem kurulum surecinde yapilir.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

