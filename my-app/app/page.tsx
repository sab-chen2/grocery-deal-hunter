export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background font-sans text-foreground">
      <header className="border-b border-foreground/10 px-6 py-5">
        <div className="mx-auto max-w-5xl text-xl font-bold">
          Grocery Deal Hunter
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:py-24">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Save more on your everyday groceries.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/70">
          Discover grocery deals, explore stores, and plan your shopping in one
          place.
        </p>

        <section aria-labelledby="deals-heading" className="mt-16">
          <h2 id="deals-heading" className="text-2xl font-semibold">
            Latest deals
          </h2>
          <div className="mt-6 rounded-xl border border-foreground/15 p-8">
            <p className="text-foreground/70">
              No deals to show yet. Check back soon for grocery savings.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 px-6 py-6 text-center text-sm text-foreground/60">
        Grocery Deal Hunter
      </footer>
    </div>
  );
}
