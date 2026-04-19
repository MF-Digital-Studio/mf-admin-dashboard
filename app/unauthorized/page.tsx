import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="w-full max-w-md rounded-none border border-border bg-card p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">403</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Erisim izni yok</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Bu hesap admin paneline erisim icin yetkili degil. Dogru hesap ile tekrar giris yapin.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <SignOutButton redirectUrl="/sign-in">
            <Button className="rounded-none">Farkli hesapla giris yap</Button>
          </SignOutButton>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/sign-in">Giris sayfasi</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
