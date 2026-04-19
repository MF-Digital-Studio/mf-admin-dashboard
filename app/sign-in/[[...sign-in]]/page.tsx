import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SignIn } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { isAllowedAdminUserId } from '@/lib/auth/admin-access'

export default async function SignInPage() {
  const { userId } = await auth()
  const hasAdminAccess = isAllowedAdminUserId(userId)

  if (userId && hasAdminAccess) {
    redirect('/dashboard')
  }

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
              Bu alan sadece yetkili yoneticiler icindir. Guvenli oturum ile giris yaparak dashboard ve tum dahili
              verilere erisebilirsiniz.
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
              <p className="mt-1 text-sm text-muted-foreground">
                Sadece izinli yonetici hesaplari ile erisim saglanir.
              </p>
            </div>

            <SignIn
              path="/sign-in"
              routing="path"
              forceRedirectUrl="/dashboard"
              signUpUrl="/unauthorized"
              appearance={{
                elements: {
                  card: 'shadow-none border-0 bg-transparent p-0',
                  rootBox: 'w-full',
                  header: 'hidden',
                  footer: 'hidden',
                  socialButtonsBlockButton: 'hidden',
                  dividerRow: 'hidden',
                  formFieldInput:
                    'h-10 border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  formFieldLabel: 'text-muted-foreground text-xs font-medium',
                  formButtonPrimary:
                    'h-10 rounded-none bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90',
                  formResendCodeLink: 'text-primary hover:text-primary/90',
                  identityPreviewText: 'text-foreground',
                  formFieldSuccessText: 'text-emerald-400',
                  formFieldErrorText: 'text-red-400',
                  alertText: 'text-red-300',
                },
              }}
            />

            <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
              Bu ozel panelde kayit olma akisi kapatilmis durumdadir. Erisim yetkisi icin sistem yoneticisi ile
              iletisime gecin.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
