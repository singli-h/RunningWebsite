"use client"

export default function DefaultLayout({ children }) {
  return (
    <>
      <main>
        <div className="pt-16 pb-5 md:pt-16 md:pb-8">{children}</div>
      </main>
    </>
  )
}
